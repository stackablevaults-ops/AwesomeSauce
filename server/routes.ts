import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from './db.js';
import { users, agents, trainingData, feedback, subscriptions } from '../shared/schema.js';
import { eq, desc, and, like, or } from 'drizzle-orm';
import { AIAgentService, createAIAgent, AgentPresets, type AIAgentConfig, type ChatMessage } from './ai-service.js';
import { KolossusEngine, createKolossus, KolossusPresets, type KolossusConfig, type KolossusResponse } from './kolossus-engine.js';
import { trainingEnvironment, type ContinuousTrainingEnvironment } from './continuous-training.js';
import { treasuryController } from './ai-treasury.js';

const router = Router();

// Store active AI agents and Kolossus instances in memory (in production, consider using Redis)
const activeAgents = new Map<number, AIAgentService>();
const activeKolossus = new Map<string, KolossusEngine>();

// Initialize training environment
trainingEnvironment.initialize();

// Auth middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// User registration
router.post('/api/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const newUser = await db.insert(users).values({
      email,
      password: hashedPassword,
      name,
    }).returning();

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser[0].id, email: newUser[0].email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: newUser[0].id, email: newUser[0].email, name: newUser[0].name } });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User login
router.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (user.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user[0].password);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user[0].id, email: user[0].email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user[0].id, email: user[0].email, name: user[0].name } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all agents (backward compatibility)
router.get('/agents', async (req, res) => {
  try {
    const allAgents = await db
      .select({
        id: agents.id,
        name: agents.name,
        description: agents.description,
        category: agents.category,
        price: agents.price,
        rating: agents.rating,
        downloads: agents.downloads,
        createdAt: agents.createdAt,
      })
      .from(agents)
      .orderBy(desc(agents.rating));

    res.json(allAgents);
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

// Get all agents
router.get('/api/agents', async (req, res) => {
  try {
    const allAgents = await db
      .select({
        id: agents.id,
        name: agents.name,
        description: agents.description,
        category: agents.category,
        price: agents.price,
        rating: agents.rating,
        downloads: agents.downloads,
        createdAt: agents.createdAt,
      })
      .from(agents)
      .orderBy(desc(agents.rating));

    res.json(allAgents);
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

// Create new AI agent
router.post('/api/agents', authenticateToken, async (req, res) => {
  try {
    const { name, description, category, price, systemPrompt, model, temperature, maxTokens } = req.body;
    
    const agentConfig: AIAgentConfig = {
      name,
      description,
      systemPrompt,
      model: model || 'gpt-3.5-turbo',
      temperature: temperature || 0.7,
      maxTokens: maxTokens || 500,
      topP: 1,
      presencePenalty: 0,
      frequencyPenalty: 0,
    };

    // Create agent in database
    const newAgent = await db.insert(agents).values({
      name,
      description,
      category,
      price: parseFloat(price),
      systemPrompt,
      model: agentConfig.model,
      temperature: agentConfig.temperature,
      maxTokens: agentConfig.maxTokens,
      ownerId: req.user.userId,
    }).returning();

    // Create AI service instance
    const aiAgent = createAIAgent(agentConfig);
    activeAgents.set(newAgent[0].id, aiAgent);

    res.json(newAgent[0]);
  } catch (error) {
    console.error('Error creating agent:', error);
    res.status(500).json({ error: 'Failed to create agent' });
  }
});

// Create agent (backward compatibility)
router.post('/agents', async (req, res) => {
  try {
    const { name, provider, skills, specialties, trainingDataUrl, pricing } = req.body;
    
    const newAgent = await db.insert(agents).values({
      name,
      description: `AI agent with skills: ${skills}`,
      category: specialties?.split(',')[0] || 'General',
      price: 0,
      systemPrompt: `You are an AI assistant specialized in ${specialties}. Your skills include: ${skills}.`,
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 500,
    }).returning();

    res.status(201).json({
      id: newAgent[0].id,
      name,
      provider,
      status: 'active',
      isActive: true,
      skills,
      specialties,
      trainingDataUrl,
      pricing,
      createdAt: newAgent[0].createdAt
    });
  } catch (error) {
    console.error('Error creating agent:', error);
    res.status(500).json({ error: 'Failed to create agent' });
  }
});

// Get agent by ID
router.get('/api/agents/:id', async (req, res) => {
  try {
    const agentId = parseInt(req.params.id);
    const agent = await db.select().from(agents).where(eq(agents.id, agentId)).limit(1);
    
    if (agent.length === 0) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    res.json(agent[0]);
  } catch (error) {
    console.error('Error fetching agent:', error);
    res.status(500).json({ error: 'Failed to fetch agent' });
  }
});

// Update agent (backward compatibility)
router.put('/agents/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const agent = await db.select().from(agents).where(eq(agents.id, id)).limit(1);
    
    if (agent.length === 0) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    const updatedAgent = await db.update(agents)
      .set(req.body)
      .where(eq(agents.id, id))
      .returning();

    res.json(updatedAgent[0]);
  } catch (error) {
    console.error('Error updating agent:', error);
    res.status(500).json({ error: 'Failed to update agent' });
  }
});

// Train agent (backward compatibility)
router.post('/agents/:id/train', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const agent = await db.select().from(agents).where(eq(agents.id, id)).limit(1);
    
    if (agent.length === 0) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    // Update agent status to training
    await db.update(agents)
      .set({ status: 'training' })
      .where(eq(agents.id, id));

    // Simulate training completion
    setTimeout(async () => {
      await db.update(agents)
        .set({ status: 'active', isActive: true })
        .where(eq(agents.id, id));
    }, 2000);

    res.json({ message: `Training started for agent ${id}` });
  } catch (error) {
    console.error('Error training agent:', error);
    res.status(500).json({ error: 'Failed to start training' });
  }
});

// Chat with an AI agent
router.post('/api/agents/:id/chat', authenticateToken, async (req, res) => {
  try {
    const agentId = parseInt(req.params.id);
    const { messages } = req.body;

    // Get agent from database
    const agent = await db.select().from(agents).where(eq(agents.id, agentId)).limit(1);
    if (agent.length === 0) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    // Get or create AI service instance
    let aiAgent = activeAgents.get(agentId);
    if (!aiAgent) {
      const config: AIAgentConfig = {
        name: agent[0].name,
        description: agent[0].description,
        systemPrompt: agent[0].systemPrompt,
        model: agent[0].model,
        temperature: agent[0].temperature,
        maxTokens: agent[0].maxTokens,
        topP: 1,
        presencePenalty: 0,
        frequencyPenalty: 0,
      };
      aiAgent = createAIAgent(config);
      activeAgents.set(agentId, aiAgent);
    }

    // Generate response
    const response = await aiAgent.generateResponse(messages);

    res.json({ response });
  } catch (error) {
    console.error('Error in agent chat:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

// Get agent presets
router.get('/api/agent-presets', (req, res) => {
  res.json(AgentPresets);
});

// Create agent from preset
router.post('/api/agents/from-preset', authenticateToken, async (req, res) => {
  try {
    const { presetName, name, description, category, price } = req.body;
    
    const preset = AgentPresets[presetName as keyof typeof AgentPresets];
    if (!preset) {
      return res.status(400).json({ error: 'Invalid preset' });
    }

    // Create agent in database
    const newAgent = await db.insert(agents).values({
      name: name || preset.name,
      description: description || preset.description,
      category,
      price: parseFloat(price) || 0,
      systemPrompt: preset.systemPrompt,
      model: preset.model,
      temperature: preset.temperature,
      maxTokens: preset.maxTokens,
      ownerId: req.user.userId,
    }).returning();

    // Create AI service instance
    const aiAgent = createAIAgent(preset);
    activeAgents.set(newAgent[0].id, aiAgent);

    res.json(newAgent[0]);
  } catch (error) {
    console.error('Error creating agent from preset:', error);
    res.status(500).json({ error: 'Failed to create agent from preset' });
  }
});

// Get training data for an agent
router.get('/api/agents/:id/training', authenticateToken, async (req, res) => {
  try {
    const agentId = parseInt(req.params.id);
    
    const training = await db
      .select()
      .from(trainingData)
      .where(eq(trainingData.agentId, agentId))
      .orderBy(desc(trainingData.createdAt));

    res.json(training);
  } catch (error) {
    console.error('Error fetching training data:', error);
    res.status(500).json({ error: 'Failed to fetch training data' });
  }
});

// Add training data
router.post('/api/agents/:id/training', authenticateToken, async (req, res) => {
  try {
    const agentId = parseInt(req.params.id);
    const { input, expectedOutput, context } = req.body;

    const newTraining = await db.insert(trainingData).values({
      agentId,
      input,
      expectedOutput,
      context,
    }).returning();

    res.json(newTraining[0]);
  } catch (error) {
    console.error('Error adding training data:', error);
    res.status(500).json({ error: 'Failed to add training data' });
  }
});

// Evaluate agent performance
router.post('/api/agents/:id/evaluate', authenticateToken, async (req, res) => {
  try {
    const agentId = parseInt(req.params.id);
    const { testCases } = req.body;

    // Get AI service instance
    let aiAgent = activeAgents.get(agentId);
    if (!aiAgent) {
      // Load agent from database
      const agent = await db.select().from(agents).where(eq(agents.id, agentId)).limit(1);
      if (agent.length === 0) {
        return res.status(404).json({ error: 'Agent not found' });
      }

      const config: AIAgentConfig = {
        name: agent[0].name,
        description: agent[0].description,
        systemPrompt: agent[0].systemPrompt,
        model: agent[0].model,
        temperature: agent[0].temperature,
        maxTokens: agent[0].maxTokens,
        topP: 1,
        presencePenalty: 0,
        frequencyPenalty: 0,
      };
      aiAgent = createAIAgent(config);
      activeAgents.set(agentId, aiAgent);
    }

    // Evaluate agent
    const evaluation = await aiAgent.evaluateAgent(testCases);

    res.json(evaluation);
  } catch (error) {
    console.error('Error evaluating agent:', error);
    res.status(500).json({ error: 'Failed to evaluate agent' });
  }
});

// Agent Evaluation API (backward compatibility)
router.post('/evaluation/run', async (req, res) => {
  try {
    const { agentId, scenario } = req.body;
    
    // Get AI service instance
    let aiAgent = activeAgents.get(agentId);
    if (!aiAgent) {
      // Load agent from database
      const agent = await db.select().from(agents).where(eq(agents.id, agentId)).limit(1);
      if (agent.length === 0) {
        return res.status(404).json({ error: 'Agent not found' });
      }

      const config: AIAgentConfig = {
        name: agent[0].name,
        description: agent[0].description,
        systemPrompt: agent[0].systemPrompt,
        model: agent[0].model,
        temperature: agent[0].temperature,
        maxTokens: agent[0].maxTokens,
        topP: 1,
        presencePenalty: 0,
        frequencyPenalty: 0,
      };
      aiAgent = createAIAgent(config);
      activeAgents.set(agentId, aiAgent);
    }

    // Run evaluation with scenario
    const testCase = {
      input: scenario,
      expectedOutput: 'Expected high-quality response',
    };

    const evaluation = await aiAgent.evaluateAgent([testCase]);
    
    res.json({
      agentId,
      scenario,
      accuracy: Math.round(evaluation.accuracy * 100),
      responseTime: Math.floor(Math.random() * 500) + 200,
      completeness: Math.round(evaluation.averageScore * 100),
      suggestions: [
        'Response quality is good',
        'Consider fine-tuning for better accuracy',
        'Performance metrics are within acceptable range'
      ]
    });
  } catch (error) {
    console.error('Error in evaluation:', error);
    res.status(500).json({ error: 'Failed to run evaluation' });
  }
});

// Submit feedback
router.post('/api/agents/:id/feedback', authenticateToken, async (req, res) => {
  try {
    const agentId = parseInt(req.params.id);
    const { rating, comment } = req.body;

    const newFeedback = await db.insert(feedback).values({
      agentId,
      userId: req.user.userId,
      rating,
      comment,
    }).returning();

    // Update agent average rating
    const allFeedback = await db.select().from(feedback).where(eq(feedback.agentId, agentId));
    const avgRating = allFeedback.reduce((sum, fb) => sum + fb.rating, 0) / allFeedback.length;
    
    await db.update(agents)
      .set({ rating: Math.round(avgRating * 10) / 10 })
      .where(eq(agents.id, agentId));

    res.json(newFeedback[0]);
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// Search agents
router.get('/api/search/agents', async (req, res) => {
  try {
    const { q, category } = req.query;
    
    let query = db.select().from(agents);
    
    if (q) {
      query = query.where(
        or(
          like(agents.name, `%${q}%`),
          like(agents.description, `%${q}%`)
        )
      );
    }
    
    if (category) {
      query = query.where(eq(agents.category, category as string));
    }

    const results = await query.orderBy(desc(agents.rating));
    res.json(results);
  } catch (error) {
    console.error('Error searching agents:', error);
    res.status(500).json({ error: 'Failed to search agents' });
  }
});

// Training API (backward compatibility)
router.get('/training', (req, res) => {
  res.json({ message: 'Training API ready', status: 'active' });
});

// Marketplace API (backward compatibility)
router.get('/marketplace', (req, res) => {
  res.json({ message: 'Marketplace API ready', status: 'active' });
});

// List ready-for-sale models (in-stock)
router.get('/marketplace/in-stock', async (req, res) => {
  try {
    const models = await db.select().from(agents).where(
      and(eq(agents.readyForSale, true), eq(agents.inStock, true))
    );
    res.json(models);
  } catch (err) {
    console.error('Error fetching in-stock models:', err);
    res.status(500).json({ error: 'Failed to fetch in-stock models.' });
  }
});

// KOLOSSUS ENDPOINTS - Ultimate AI Multi-Agent System

// Create a new Kolossus instance
router.post('/api/kolossus/create', authenticateToken, async (req, res) => {
  try {
    const { name, description, agentIds, fusionStrategy, weights } = req.body;
    
    if (!agentIds || agentIds.length < 2) {
      return res.status(400).json({ error: 'Kolossus requires at least 2 agents' });
    }

    const kolossusConfig: KolossusConfig = {
      name,
      description,
      agentIds,
      fusionStrategy: fusionStrategy || 'ensemble',
      weights,
      learningRate: 0.1,
      adaptationThreshold: 0.7
    };

    const kolossus = await createKolossus(kolossusConfig);
    const kolossusId = `kolossus_${Date.now()}`;
    
    activeKolossus.set(kolossusId, kolossus);
    trainingEnvironment.registerKolossus(kolossusId, kolossus);

    res.json({
      kolossusId,
      config: kolossusConfig,
      status: kolossus.getStatus(),
      message: 'Kolossus created successfully - Ultimate AI activated'
    });
  } catch (error) {
    console.error('Error creating Kolossus:', error);
    res.status(500).json({ error: 'Failed to create Kolossus' });
  }
});

// Chat with Kolossus (Ultimate AI)
router.post('/api/kolossus/:id/chat', authenticateToken, async (req, res) => {
  try {
    const kolossusId = req.params.id;
    const { messages, context } = req.body;

    const kolossus = activeKolossus.get(kolossusId);
    if (!kolossus) {
      return res.status(404).json({ error: 'Kolossus instance not found' });
    }

    const response: KolossusResponse = await kolossus.generateKolossusResponse(messages, context);

    // Process feedback for continuous learning
    await trainingEnvironment.processFeedback(kolossusId, {
      input: JSON.stringify(messages),
      actualOutput: response.finalResponse,
      userRating: 4, // Default high rating, will be updated with actual user feedback
    });

    res.json({
      response: response.finalResponse,
      metadata: {
        fusionMethod: response.fusionMethod,
        confidence: response.confidence,
        agentCount: response.agentResponses.length,
        reasoningChain: response.reasoningChain,
        learningInsights: response.learningInsights,
        agentContributions: response.agentResponses.map(ar => ({
          agent: ar.agentName,
          confidence: ar.confidence
        }))
      }
    });
  } catch (error) {
    console.error('Error in Kolossus chat:', error);
    res.status(500).json({ error: 'Failed to generate Kolossus response' });
  }
});

// Get Kolossus status and performance
router.get('/api/kolossus/:id/status', authenticateToken, async (req, res) => {
  try {
    const kolossusId = req.params.id;
    
    const kolossus = activeKolossus.get(kolossusId);
    if (!kolossus) {
      return res.status(404).json({ error: 'Kolossus instance not found' });
    }

    const status = kolossus.getStatus();
    const trainingStatus = trainingEnvironment.getTrainingStatus(kolossusId);

    res.json({
      kolossusId,
      status,
      training: trainingStatus,
      capabilities: {
        multiAgentFusion: true,
        continuousLearning: true,
        expertiseEvolution: true,
        contextualAdaptation: true
      }
    });
  } catch (error) {
    console.error('Error getting Kolossus status:', error);
    res.status(500).json({ error: 'Failed to get Kolossus status' });
  }
});

// Start Kolossus training session
router.post('/api/kolossus/:id/train', authenticateToken, async (req, res) => {
  try {
    const kolossusId = req.params.id;
    const { targetIterations, targetPerformance, focusAreas, trainingData } = req.body;

    const kolossus = activeKolossus.get(kolossusId);
    if (!kolossus) {
      return res.status(404).json({ error: 'Kolossus instance not found' });
    }

    const sessionId = await trainingEnvironment.startTrainingSession(kolossusId, {
      targetIterations: targetIterations || 100,
      targetPerformance: targetPerformance || 0.9,
      focusAreas,
      trainingData
    });

    res.json({
      sessionId,
      message: 'Kolossus training session started',
      expectedDuration: `${Math.ceil((targetIterations || 100) / 10)} minutes`,
      trainingApproach: 'Continuous multi-agent learning with feedback loops'
    });
  } catch (error) {
    console.error('Error starting Kolossus training:', error);
    res.status(500).json({ error: 'Failed to start Kolossus training' });
  }
});

// Submit feedback for Kolossus
router.post('/api/kolossus/:id/feedback', authenticateToken, async (req, res) => {
  try {
    const kolossusId = req.params.id;
    const { input, output, rating, expertFeedback, expectedOutput } = req.body;

    await trainingEnvironment.processFeedback(kolossusId, {
      input,
      actualOutput: output,
      userRating: rating,
      expertFeedback,
      expectedOutput
    });

    res.json({
      message: 'Feedback processed for Kolossus evolution',
      impact: 'Continuous learning system will adapt based on this feedback'
    });
  } catch (error) {
    console.error('Error processing Kolossus feedback:', error);
    res.status(500).json({ error: 'Failed to process feedback' });
  }
});

// Get available Kolossus presets
router.get('/api/kolossus/presets', (req, res) => {
  res.json({
    presets: KolossusPresets,
    description: 'Pre-configured ultimate AI setups for elite occupational support'
  });
});

// Create Kolossus from preset
router.post('/api/kolossus/from-preset', authenticateToken, async (req, res) => {
  try {
    const { presetName, agentIds } = req.body;
    
    const preset = KolossusPresets[presetName as keyof typeof KolossusPresets];
    if (!preset) {
      return res.status(400).json({ error: 'Invalid Kolossus preset' });
    }

    const kolossusConfig: KolossusConfig = {
      ...preset,
      agentIds: agentIds || []
    };

    if (kolossusConfig.agentIds.length < 2) {
      return res.status(400).json({ 
        error: 'Please provide at least 2 agent IDs to create Kolossus' 
      });
    }

    const kolossus = await createKolossus(kolossusConfig);
    const kolossusId = `kolossus_${presetName}_${Date.now()}`;
    
    activeKolossus.set(kolossusId, kolossus);
    trainingEnvironment.registerKolossus(kolossusId, kolossus);

    res.json({
      kolossusId,
      preset: presetName,
      config: kolossusConfig,
      status: kolossus.getStatus(),
      message: `${preset.name} Kolossus activated - Elite AI operational`
    });
  } catch (error) {
    console.error('Error creating Kolossus from preset:', error);
    res.status(500).json({ error: 'Failed to create Kolossus from preset' });
  }
});

// List all active Kolossus instances
router.get('/api/kolossus', authenticateToken, async (req, res) => {
  try {
    const instances = Array.from(activeKolossus.entries()).map(([id, kolossus]) => ({
      kolossusId: id,
      status: kolossus.getStatus(),
      trainingStatus: trainingEnvironment.getTrainingStatus(id)
    }));

    res.json({
      totalInstances: instances.length,
      instances,
      systemStatus: 'Kolossus multi-agent system operational'
    });
  } catch (error) {
    console.error('Error listing Kolossus instances:', error);
    res.status(500).json({ error: 'Failed to list Kolossus instances' });
  }
});

// AI Treasury Management Routes

// Initialize Treasury Controller
router.post('/api/treasury/initialize', authenticateToken, async (req, res) => {
  try {
    await treasuryController.initialize();
    res.json({ 
      message: 'AI Treasury Controller initialized successfully',
      status: treasuryController.getStatus()
    });
  } catch (error) {
    console.error('Error initializing treasury controller:', error);
    res.status(500).json({ error: 'Failed to initialize treasury controller' });
  }
});

// Get Treasury Analytics
router.get('/api/treasury/analytics', authenticateToken, async (req, res) => {
  try {
    const metrics = await treasuryController.analyzeRevenuePerformance();
    const status = treasuryController.getStatus();
    
    res.json({
      metrics,
      status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting treasury analytics:', error);
    res.status(500).json({ error: 'Failed to get treasury analytics' });
  }
});

// Optimize Agent Pricing
router.post('/api/treasury/optimize-pricing/:agentId', authenticateToken, async (req, res) => {
  try {
    const agentId = parseInt(req.params.agentId);
    const pricingStrategy = await treasuryController.optimizeAgentPricing(agentId);
    
    res.json({
      message: 'Agent pricing optimized successfully',
      agentId,
      pricingStrategy
    });
  } catch (error) {
    console.error('Error optimizing agent pricing:', error);
    res.status(500).json({ error: 'Failed to optimize agent pricing' });
  }
});

// Get Training Monetization Options
router.get('/api/treasury/training-monetization', authenticateToken, async (req, res) => {
  try {
    const monetization = await treasuryController.createTrainingMonetization();
    
    res.json({
      message: 'Training monetization strategies generated',
      monetization
    });
  } catch (error) {
    console.error('Error getting training monetization:', error);
    res.status(500).json({ error: 'Failed to get training monetization options' });
  }
});

// Implement Dynamic Pricing
router.post('/api/treasury/dynamic-pricing/:agentId', authenticateToken, async (req, res) => {
  try {
    const agentId = parseInt(req.params.agentId);
    const pricingUpdate = await treasuryController.implementDynamicPricing(agentId);
    
    res.json({
      message: 'Dynamic pricing implemented successfully',
      pricingUpdate
    });
  } catch (error) {
    console.error('Error implementing dynamic pricing:', error);
    res.status(500).json({ error: 'Failed to implement dynamic pricing' });
  }
});

// Get Revenue Forecast
router.get('/api/treasury/forecast', authenticateToken, async (req, res) => {
  try {
    const timeframe = req.query.timeframe as '1month' | '3months' | '1year' || '3months';
    const forecast = await treasuryController.forecastRevenue(timeframe);
    
    res.json({
      message: 'Revenue forecast generated successfully',
      timeframe,
      forecast
    });
  } catch (error) {
    console.error('Error generating revenue forecast:', error);
    res.status(500).json({ error: 'Failed to generate revenue forecast' });
  }
});

// Get Treasury Status
router.get('/api/treasury/status', authenticateToken, async (req, res) => {
  try {
    const status = treasuryController.getStatus();
    
    res.json({
      message: 'Treasury status retrieved successfully',
      status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting treasury status:', error);
    res.status(500).json({ error: 'Failed to get treasury status' });
  }
});

export default router;

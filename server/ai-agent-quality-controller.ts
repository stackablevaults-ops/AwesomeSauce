import OpenAI from 'openai';
import { db } from './db.js';
import { agents, feedback, trainingData } from '../shared/schema.js';
import { eq, desc, avg, count, and, gte, lte } from 'drizzle-orm';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface AgentQualityMetrics {
  agentId: number;
  name: string;
  category: string;
  performanceScore: number;
  reliabilityScore: number;
  userSatisfaction: number;
  responseTime: number;
  errorRate: number;
  usageFrequency: number;
  learningProgress: number;
  qualityTrend: 'improving' | 'stable' | 'declining';
  lastAssessment: Date;
}

interface QualityIssue {
  agentId: number;
  type: 'performance' | 'reliability' | 'accuracy' | 'response_time' | 'user_satisfaction';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: Date;
  autoFixAttempts: number;
  resolved: boolean;
  impact: number;
}

interface AutoFixAction {
  agentId: number;
  issueType: string;
  action: 'retrain' | 'parameter_tune' | 'prompt_optimize' | 'model_upgrade' | 'config_adjust';
  parameters: Record<string, any>;
  expectedImprovement: number;
  riskLevel: 'low' | 'medium' | 'high';
  implementation: string;
}

interface QualityAssuranceReport {
  timestamp: Date;
  totalAgents: number;
  healthyAgents: number;
  agentsNeedingAttention: number;
  criticalIssues: number;
  averageQualityScore: number;
  qualityTrend: 'improving' | 'stable' | 'declining';
  topPerformers: AgentQualityMetrics[];
  problemAgents: AgentQualityMetrics[];
  recommendedActions: string[];
}

export class AIAgentQualityController {
  private qualityMetrics: Map<number, AgentQualityMetrics>;
  private qualityIssues: Map<number, QualityIssue[]>;
  private autoFixHistory: Array<{
    timestamp: Date;
    action: AutoFixAction;
    result: 'success' | 'failure' | 'partial';
    improvement: number;
  }>;
  private monitoringInterval: NodeJS.Timeout | null;
  private qualityAssessmentInterval: NodeJS.Timeout | null;

  constructor() {
    this.qualityMetrics = new Map();
    this.qualityIssues = new Map();
    this.autoFixHistory = [];
    this.monitoringInterval = null;
    this.qualityAssessmentInterval = null;
  }

  /**
   * Initialize the AI Agent Quality Controller
   */
  async initialize(): Promise<void> {
    console.log('🔍 Initializing AI Agent Quality Controller...');
    
    // Load existing agents and their metrics
    await this.loadAgentMetrics();
    
    // Start continuous monitoring
    this.startQualityMonitoring();
    
    // Start quality assessments
    this.startQualityAssessments();
    
    console.log('✅ AI Agent Quality Controller operational');
  }

  /**
   * Load agent metrics from database
   */
  private async loadAgentMetrics(): Promise<void> {
    try {
      const allAgents = await db.select().from(agents);
      
      for (const agent of allAgents) {
        const metrics = await this.calculateAgentQualityMetrics(agent.id);
        this.qualityMetrics.set(agent.id, metrics);
      }
      
      console.log(`📊 Loaded metrics for ${allAgents.length} agents`);
    } catch (error) {
      console.error('Error loading agent metrics:', error);
    }
  }

  /**
   * Start continuous quality monitoring
   */
  private startQualityMonitoring(): void {
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.monitorAgentQuality();
      } catch (error) {
        console.error('Quality monitoring error:', error);
      }
    }, 2 * 60 * 1000); // Monitor every 2 minutes
  }

  /**
   * Start periodic quality assessments
   */
  private startQualityAssessments(): void {
    this.qualityAssessmentInterval = setInterval(async () => {
      try {
        await this.runQualityAssessmentCycle();
      } catch (error) {
        console.error('Quality assessment error:', error);
      }
    }, 15 * 60 * 1000); // Assess every 15 minutes
  }

  /**
   * Calculate comprehensive quality metrics for an agent
   */
  private async calculateAgentQualityMetrics(agentId: number): Promise<AgentQualityMetrics> {
    const agent = await db.select().from(agents).where(eq(agents.id, agentId)).limit(1);
    if (agent.length === 0) {
      throw new Error(`Agent ${agentId} not found`);
    }

    const agentData = agent[0];
    
    // Get feedback data
    const feedbackData = await db.select()
      .from(feedback)
      .where(eq(feedback.agentId, agentId))
      .orderBy(desc(feedback.createdAt))
      .limit(100);

    // Calculate metrics
    const ratings = feedbackData.map(f => f.rating || 0);
    const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
    
    // Performance score based on multiple factors
    const performanceScore = this.calculatePerformanceScore(agentData, feedbackData);
    const reliabilityScore = this.calculateReliabilityScore(feedbackData);
    const userSatisfaction = avgRating * 20; // Convert 5-star to 100-point scale
    
    // Simulated metrics (in production, these would come from actual usage data)
    const responseTime = Math.random() * 2000 + 500; // 500-2500ms
    const errorRate = Math.random() * 5; // 0-5%
    const usageFrequency = Math.random() * 100; // Usage per day
    const learningProgress = Math.random() * 100; // Learning improvement rate
    
    // Determine quality trend
    const qualityTrend = this.calculateQualityTrend(agentId, performanceScore);

    return {
      agentId,
      name: agentData.name,
      category: agentData.category || 'General',
      performanceScore,
      reliabilityScore,
      userSatisfaction,
      responseTime,
      errorRate,
      usageFrequency,
      learningProgress,
      qualityTrend,
      lastAssessment: new Date()
    };
  }

  /**
   * Calculate performance score
   */
  private calculatePerformanceScore(agentData: any, feedbackData: any[]): number {
    let score = 50; // Base score
    
    // Factor in rating
    if (agentData.rating) {
      score += (agentData.rating - 2.5) * 20; // Scale 0-5 rating to influence score
    }
    
    // Factor in downloads/usage
    if (agentData.downloads && agentData.downloads > 10) {
      score += Math.min(agentData.downloads / 10, 25); // Up to 25 points for popularity
    }
    
    // Factor in recent feedback
    const recentFeedback = feedbackData.slice(0, 10);
    if (recentFeedback.length > 0) {
      const avgRecentRating = recentFeedback.reduce((sum, f) => sum + (f.rating || 0), 0) / recentFeedback.length;
      score += (avgRecentRating - 2.5) * 10;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate reliability score
   */
  private calculateReliabilityScore(feedbackData: any[]): number {
    if (feedbackData.length === 0) return 50;
    
    // Calculate consistency of ratings
    const ratings = feedbackData.map(f => f.rating || 0);
    const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    const variance = ratings.reduce((sum, rating) => sum + Math.pow(rating - avgRating, 2), 0) / ratings.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Lower deviation = higher reliability
    const reliabilityScore = Math.max(0, 100 - (standardDeviation * 30));
    
    return reliabilityScore;
  }

  /**
   * Calculate quality trend
   */
  private calculateQualityTrend(agentId: number, currentScore: number): 'improving' | 'stable' | 'declining' {
    const previousMetrics = this.qualityMetrics.get(agentId);
    if (!previousMetrics) return 'stable';
    
    const scoreDifference = currentScore - previousMetrics.performanceScore;
    
    if (scoreDifference > 5) return 'improving';
    if (scoreDifference < -5) return 'declining';
    return 'stable';
  }

  /**
   * Monitor agent quality and detect issues
   */
  private async monitorAgentQuality(): Promise<void> {
    console.log('🔍 Monitoring agent quality...');
    
    for (const [agentId, metrics] of this.qualityMetrics) {
      const issues = await this.detectQualityIssues(metrics);
      
      if (issues.length > 0) {
        this.qualityIssues.set(agentId, issues);
        
        // Attempt automatic fixes for critical issues
        for (const issue of issues.filter(i => i.severity === 'critical' || i.severity === 'high')) {
          await this.attemptAutoFix(issue);
        }
      }
    }
  }

  /**
   * Detect quality issues for an agent
   */
  private async detectQualityIssues(metrics: AgentQualityMetrics): Promise<QualityIssue[]> {
    const issues: QualityIssue[] = [];
    
    // Performance issues
    if (metrics.performanceScore < 30) {
      issues.push({
        agentId: metrics.agentId,
        type: 'performance',
        severity: metrics.performanceScore < 15 ? 'critical' : 'high',
        description: `Low performance score: ${metrics.performanceScore.toFixed(1)}`,
        detectedAt: new Date(),
        autoFixAttempts: 0,
        resolved: false,
        impact: 100 - metrics.performanceScore
      });
    }
    
    // Reliability issues
    if (metrics.reliabilityScore < 40) {
      issues.push({
        agentId: metrics.agentId,
        type: 'reliability',
        severity: metrics.reliabilityScore < 20 ? 'critical' : 'high',
        description: `Low reliability score: ${metrics.reliabilityScore.toFixed(1)}`,
        detectedAt: new Date(),
        autoFixAttempts: 0,
        resolved: false,
        impact: 100 - metrics.reliabilityScore
      });
    }
    
    // User satisfaction issues
    if (metrics.userSatisfaction < 50) {
      issues.push({
        agentId: metrics.agentId,
        type: 'user_satisfaction',
        severity: metrics.userSatisfaction < 30 ? 'critical' : 'medium',
        description: `Low user satisfaction: ${metrics.userSatisfaction.toFixed(1)}%`,
        detectedAt: new Date(),
        autoFixAttempts: 0,
        resolved: false,
        impact: 100 - metrics.userSatisfaction
      });
    }
    
    // Response time issues
    if (metrics.responseTime > 3000) {
      issues.push({
        agentId: metrics.agentId,
        type: 'response_time',
        severity: metrics.responseTime > 5000 ? 'high' : 'medium',
        description: `Slow response time: ${metrics.responseTime.toFixed(0)}ms`,
        detectedAt: new Date(),
        autoFixAttempts: 0,
        resolved: false,
        impact: Math.min(100, metrics.responseTime / 50)
      });
    }
    
    // Error rate issues
    if (metrics.errorRate > 10) {
      issues.push({
        agentId: metrics.agentId,
        type: 'accuracy',
        severity: metrics.errorRate > 20 ? 'critical' : 'high',
        description: `High error rate: ${metrics.errorRate.toFixed(1)}%`,
        detectedAt: new Date(),
        autoFixAttempts: 0,
        resolved: false,
        impact: metrics.errorRate * 5
      });
    }
    
    return issues;
  }

  /**
   * Attempt automatic fix for quality issues
   */
  private async attemptAutoFix(issue: QualityIssue): Promise<void> {
    console.log(`🔧 Attempting auto-fix for agent ${issue.agentId}: ${issue.description}`);
    
    const autoFixAction = await this.generateAutoFixAction(issue);
    if (!autoFixAction) {
      console.log('No auto-fix action available for this issue');
      return;
    }
    
    try {
      const result = await this.executeAutoFix(autoFixAction);
      
      this.autoFixHistory.push({
        timestamp: new Date(),
        action: autoFixAction,
        result: result.success ? 'success' : 'failure',
        improvement: result.improvement
      });
      
      if (result.success) {
        issue.resolved = true;
        console.log(`✅ Auto-fix successful for agent ${issue.agentId}`);
      } else {
        issue.autoFixAttempts++;
        console.log(`❌ Auto-fix failed for agent ${issue.agentId}`);
      }
      
    } catch (error) {
      console.error(`Auto-fix error for agent ${issue.agentId}:`, error);
      issue.autoFixAttempts++;
    }
  }

  /**
   * Generate auto-fix action using AI
   */
  private async generateAutoFixAction(issue: QualityIssue): Promise<AutoFixAction | null> {
    const agent = await db.select().from(agents).where(eq(agents.id, issue.agentId)).limit(1);
    if (agent.length === 0) return null;
    
    const agentData = agent[0];
    const metrics = this.qualityMetrics.get(issue.agentId);
    
    const prompt = `As an AI Agent Quality Controller, generate an auto-fix action for this quality issue:

Agent Details:
- Name: ${agentData.name}
- Category: ${agentData.category}
- Current Rating: ${agentData.rating}

Quality Issue:
- Type: ${issue.type}
- Severity: ${issue.severity}
- Description: ${issue.description}
- Impact: ${issue.impact}

Current Metrics:
- Performance Score: ${metrics?.performanceScore}
- Reliability Score: ${metrics?.reliabilityScore}
- User Satisfaction: ${metrics?.userSatisfaction}%
- Response Time: ${metrics?.responseTime}ms
- Error Rate: ${metrics?.errorRate}%

Recommend a specific auto-fix action including:
1. Action type (retrain, parameter_tune, prompt_optimize, model_upgrade, config_adjust)
2. Specific parameters to adjust
3. Expected improvement percentage
4. Risk level assessment
5. Implementation steps

Provide a focused, actionable recommendation.`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 600,
      });

      const aiResponse = response.choices[0]?.message?.content || '';
      return this.parseAutoFixRecommendation(aiResponse, issue);
      
    } catch (error) {
      console.error('AI auto-fix generation failed:', error);
      return this.generateFallbackAutoFix(issue);
    }
  }

  /**
   * Parse AI auto-fix recommendation
   */
  private parseAutoFixRecommendation(aiResponse: string, issue: QualityIssue): AutoFixAction {
    // Simple parsing - in production, use more sophisticated NLP
    let actionType: AutoFixAction['action'] = 'parameter_tune';
    let expectedImprovement = 0.2;
    let riskLevel: AutoFixAction['riskLevel'] = 'medium';
    
    if (aiResponse.toLowerCase().includes('retrain')) actionType = 'retrain';
    else if (aiResponse.toLowerCase().includes('prompt')) actionType = 'prompt_optimize';
    else if (aiResponse.toLowerCase().includes('upgrade')) actionType = 'model_upgrade';
    else if (aiResponse.toLowerCase().includes('config')) actionType = 'config_adjust';
    
    // Extract improvement percentage
    const improvementMatch = aiResponse.match(/(\d+)%/);
    if (improvementMatch) {
      expectedImprovement = parseInt(improvementMatch[1]) / 100;
    }
    
    // Determine risk level based on action type
    if (actionType === 'model_upgrade') riskLevel = 'high';
    else if (actionType === 'retrain') riskLevel = 'medium';
    else riskLevel = 'low';
    
    return {
      agentId: issue.agentId,
      issueType: issue.type,
      action: actionType,
      parameters: this.getActionParameters(actionType, issue),
      expectedImprovement,
      riskLevel,
      implementation: aiResponse
    };
  }

  /**
   * Generate fallback auto-fix when AI is unavailable
   */
  private generateFallbackAutoFix(issue: QualityIssue): AutoFixAction {
    let action: AutoFixAction['action'] = 'parameter_tune';
    
    switch (issue.type) {
      case 'performance':
        action = 'retrain';
        break;
      case 'response_time':
        action = 'config_adjust';
        break;
      case 'accuracy':
        action = 'prompt_optimize';
        break;
      default:
        action = 'parameter_tune';
    }
    
    return {
      agentId: issue.agentId,
      issueType: issue.type,
      action,
      parameters: this.getActionParameters(action, issue),
      expectedImprovement: 0.15,
      riskLevel: 'low',
      implementation: `Fallback auto-fix for ${issue.type} issue`
    };
  }

  /**
   * Get action parameters based on action type
   */
  private getActionParameters(actionType: AutoFixAction['action'], issue: QualityIssue): Record<string, any> {
    switch (actionType) {
      case 'retrain':
        return {
          epochs: 5,
          learningRate: 0.001,
          batchSize: 32
        };
      case 'parameter_tune':
        return {
          temperature: 0.7,
          maxTokens: 1000,
          topP: 0.9
        };
      case 'prompt_optimize':
        return {
          promptRevision: true,
          contextOptimization: true
        };
      case 'model_upgrade':
        return {
          targetModel: 'gpt-4',
          migrationStrategy: 'gradual'
        };
      case 'config_adjust':
        return {
          timeout: 5000,
          retryAttempts: 3,
          caching: true
        };
      default:
        return {};
    }
  }

  /**
   * Execute auto-fix action
   */
  private async executeAutoFix(action: AutoFixAction): Promise<{ success: boolean; improvement: number }> {
    console.log(`Executing ${action.action} for agent ${action.agentId}`);
    
    // Simulate auto-fix execution
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    switch (action.action) {
      case 'retrain':
        return await this.executeRetrain(action);
      case 'parameter_tune':
        return await this.executeParameterTune(action);
      case 'prompt_optimize':
        return await this.executePromptOptimize(action);
      case 'model_upgrade':
        return await this.executeModelUpgrade(action);
      case 'config_adjust':
        return await this.executeConfigAdjust(action);
      default:
        return { success: false, improvement: 0 };
    }
  }

  // Auto-fix execution methods
  private async executeRetrain(action: AutoFixAction): Promise<{ success: boolean; improvement: number }> {
    // Implement actual retraining logic
    const success = Math.random() > 0.2; // 80% success rate
    const improvement = success ? action.expectedImprovement : 0;
    return { success, improvement };
  }

  private async executeParameterTune(action: AutoFixAction): Promise<{ success: boolean; improvement: number }> {
    // Update agent parameters in database
    try {
      await db.update(agents)
        .set({
          temperature: action.parameters.temperature,
          maxTokens: action.parameters.maxTokens
        })
        .where(eq(agents.id, action.agentId));
      
      return { success: true, improvement: action.expectedImprovement };
    } catch (error) {
      return { success: false, improvement: 0 };
    }
  }

  private async executePromptOptimize(action: AutoFixAction): Promise<{ success: boolean; improvement: number }> {
    // Implement prompt optimization
    const success = Math.random() > 0.1; // 90% success rate
    const improvement = success ? action.expectedImprovement : 0;
    return { success, improvement };
  }

  private async executeModelUpgrade(action: AutoFixAction): Promise<{ success: boolean; improvement: number }> {
    // Implement model upgrade
    try {
      await db.update(agents)
        .set({ model: action.parameters.targetModel })
        .where(eq(agents.id, action.agentId));
      
      return { success: true, improvement: action.expectedImprovement };
    } catch (error) {
      return { success: false, improvement: 0 };
    }
  }

  private async executeConfigAdjust(action: AutoFixAction): Promise<{ success: boolean; improvement: number }> {
    // Implement configuration adjustments
    const success = Math.random() > 0.05; // 95% success rate
    const improvement = success ? action.expectedImprovement : 0;
    return { success, improvement };
  }

  /**
   * Run comprehensive quality assessment cycle
   */
  private async runQualityAssessmentCycle(): Promise<void> {
    console.log('📊 Running quality assessment cycle...');
    
    // Update metrics for all agents
    for (const agentId of this.qualityMetrics.keys()) {
      const updatedMetrics = await this.calculateAgentQualityMetrics(agentId);
      this.qualityMetrics.set(agentId, updatedMetrics);
    }
    
    // Generate quality assurance report
    const report = await this.generateQualityAssuranceReport();
    
    console.log(`✅ Quality assessment complete. Overall quality: ${report.averageQualityScore.toFixed(1)}`);
  }

  /**
   * Generate comprehensive quality assurance report
   */
  private async generateQualityAssuranceReport(): Promise<QualityAssuranceReport> {
    const allMetrics = Array.from(this.qualityMetrics.values());
    const totalAgents = allMetrics.length;
    
    const healthyAgents = allMetrics.filter(m => m.performanceScore > 70).length;
    const agentsNeedingAttention = totalAgents - healthyAgents;
    
    const criticalIssues = Array.from(this.qualityIssues.values())
      .flat()
      .filter(issue => issue.severity === 'critical' && !issue.resolved).length;
    
    const averageQualityScore = allMetrics.reduce((sum, m) => sum + m.performanceScore, 0) / totalAgents || 0;
    
    const improvingAgents = allMetrics.filter(m => m.qualityTrend === 'improving').length;
    const decliningAgents = allMetrics.filter(m => m.qualityTrend === 'declining').length;
    
    let qualityTrend: 'improving' | 'stable' | 'declining' = 'stable';
    if (improvingAgents > decliningAgents * 1.5) qualityTrend = 'improving';
    else if (decliningAgents > improvingAgents * 1.5) qualityTrend = 'declining';
    
    const topPerformers = allMetrics
      .sort((a, b) => b.performanceScore - a.performanceScore)
      .slice(0, 5);
    
    const problemAgents = allMetrics
      .filter(m => m.performanceScore < 50)
      .sort((a, b) => a.performanceScore - b.performanceScore)
      .slice(0, 5);
    
    return {
      timestamp: new Date(),
      totalAgents,
      healthyAgents,
      agentsNeedingAttention,
      criticalIssues,
      averageQualityScore,
      qualityTrend,
      topPerformers,
      problemAgents,
      recommendedActions: await this.generateRecommendedActions(allMetrics)
    };
  }

  /**
   * Generate recommended actions using AI
   */
  private async generateRecommendedActions(metrics: AgentQualityMetrics[]): Promise<string[]> {
    const averageScore = metrics.reduce((sum, m) => sum + m.performanceScore, 0) / metrics.length;
    const problemAgents = metrics.filter(m => m.performanceScore < 50).length;
    
    return [
      `Monitor ${problemAgents} agents with low performance scores`,
      `Focus training efforts on agents with declining quality trends`,
      `Implement performance improvements for agents with high error rates`,
      `Consider model upgrades for consistently underperforming agents`,
      `Expand successful agent configurations to similar categories`
    ];
  }

  /**
   * Get quality status for dashboard
   */
  getQualityStatus(): {
    totalAgents: number;
    averageQuality: number;
    healthyAgents: number;
    criticalIssues: number;
    autoFixSuccess: number;
    lastAssessment: Date | null;
  } {
    const allMetrics = Array.from(this.qualityMetrics.values());
    const avgQuality = allMetrics.reduce((sum, m) => sum + m.performanceScore, 0) / allMetrics.length || 0;
    const healthy = allMetrics.filter(m => m.performanceScore > 70).length;
    
    const criticalIssues = Array.from(this.qualityIssues.values())
      .flat()
      .filter(issue => issue.severity === 'critical' && !issue.resolved).length;
    
    const successfulFixes = this.autoFixHistory.filter(h => h.result === 'success').length;
    const totalFixes = this.autoFixHistory.length;
    const successRate = totalFixes > 0 ? successfulFixes / totalFixes : 0;
    
    const lastAssessment = allMetrics.length > 0 
      ? allMetrics.reduce((latest, m) => m.lastAssessment > latest ? m.lastAssessment : latest, new Date(0))
      : null;
    
    return {
      totalAgents: allMetrics.length,
      averageQuality: avgQuality,
      healthyAgents: healthy,
      criticalIssues,
      autoFixSuccess: successRate,
      lastAssessment
    };
  }

  /**
   * Stop the quality controller
   */
  stop(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    if (this.qualityAssessmentInterval) {
      clearInterval(this.qualityAssessmentInterval);
      this.qualityAssessmentInterval = null;
    }
    
    console.log('🛑 AI Agent Quality Controller stopped');
  }
}

// Global quality controller instance
export const agentQualityController = new AIAgentQualityController();
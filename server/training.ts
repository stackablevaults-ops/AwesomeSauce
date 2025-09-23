import { Router } from 'express';
import { db } from './db';
import { trainingData, feedback as feedbackTable } from '../shared/schema';
import { eq } from 'drizzle-orm';

const trainingRouter = Router();

// Persistent training data and feedback via Drizzle ORM

// Upload training data
trainingRouter.post('/data', async (req, res) => {
  const { agentId, data, version } = req.body;
  try {
    await db.insert(trainingData).values({ agentId, data, version });
    res.status(201).json({ message: 'Training data uploaded.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to upload training data.' });
  }
});

// Submit feedback
trainingRouter.post('/feedback', async (req, res) => {
  const { agentId, feedback: fb, score } = req.body;
  try {
    await db.insert(feedbackTable).values({ agentId, feedback: fb, score });
    res.status(201).json({ message: 'Feedback submitted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit feedback.' });
  }
});

// Trigger retraining
trainingRouter.post('/retrain/:agentId', async (req, res) => {
  const agentId = Number(req.params.agentId);
  // Simulate retraining (could update agent status in DB)
  res.json({ message: `Retraining started for agent ${agentId}` });
});

// Get training analytics
trainingRouter.get('/analytics/:agentId', async (req, res) => {
  const agentId = Number(req.params.agentId);
  try {
    const agentFeedback = await db.select().from(feedbackTable).where(eq(feedbackTable.agentId, agentId));
    const avgScore = agentFeedback.length
      ? agentFeedback.reduce((sum, f) => sum + (f.score || 0), 0) / agentFeedback.length
      : null;
    res.json({ feedback: agentFeedback, avgScore });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analytics.' });
  }
});

export default trainingRouter;

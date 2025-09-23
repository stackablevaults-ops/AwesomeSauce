import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import router from './routes';
import trainingRouter from './training';
import paymentRouter from './payments';
import { seedOccupationalModels } from './db';
import { globalErrorHandler, requestLogger, createRateLimit } from './middleware/errorHandler';
import { treasuryController } from './ai-treasury';

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(requestLogger);

// Rate limiting
const generalRateLimit = createRateLimit(15 * 60 * 1000, 100); // 100 requests per 15 minutes
const paymentRateLimit = createRateLimit(15 * 60 * 1000, 10); // 10 payment requests per 15 minutes

app.use(generalRateLimit);
app.use('/api/payments', paymentRateLimit);

app.get('/', (req, res) => {
  res.send('AI Agent Training Hub backend is running!');
});

app.use('/api', router);
app.use('/api/training', trainingRouter);
app.use('/api/payments', paymentRouter);

// Global error handler (must be last)
app.use(globalErrorHandler);


const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  console.log(`Server listening on port ${PORT}`);
  try {
    await seedOccupationalModels();
    console.log('Occupational models seeded.');
    
    // Initialize AI Treasury Controller
    await treasuryController.initialize();
    console.log('AI Treasury Controller initialized.');
  } catch (err) {
    console.error('Error during startup:', err);
  }
});

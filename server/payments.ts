import { Router } from 'express';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_default', {
  apiVersion: '2024-06-20',
});

const paymentRouter = Router();

// Create payment intent
paymentRouter.post('/create-payment-intent', async (req, res) => {
  try {
    const { agentId, amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: 'usd',
      metadata: {
        agentId: agentId.toString(),
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Confirm payment and process purchase
paymentRouter.post('/confirm-purchase', async (req, res) => {
  try {
    const { paymentIntentId, agentId } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Process the purchase - could save to database
      res.json({
        success: true,
        message: 'Agent purchased successfully!',
        agentId,
      });
    } else {
      res.status(400).json({ error: 'Payment not completed' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get published pricing for agents
paymentRouter.get('/pricing/:agentId', async (req, res) => {
  const agentId = req.params.agentId;
  
  // Mock pricing data - in real app, fetch from database
  const pricingData = {
    1: { price: 199, currency: 'USD', name: 'Legal Advisor AI' },
    2: { price: 299, currency: 'USD', name: 'Medical Consultant AI' },
    3: { price: 249, currency: 'USD', name: 'Financial Analyst AI' },
    4: { price: 99, currency: 'USD', name: 'Education Tutor AI' },
    5: { price: 149, currency: 'USD', name: 'Real Estate Advisor AI' },
  };

  const pricing = pricingData[agentId];
  if (pricing) {
    res.json(pricing);
  } else {
    res.status(404).json({ error: 'Agent not found' });
  }
});

export default paymentRouter;
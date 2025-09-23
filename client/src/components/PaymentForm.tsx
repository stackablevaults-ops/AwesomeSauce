import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_default');

interface PaymentFormProps {
  agentId: number;
  agentName: string;
  price: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PaymentForm({ agentId, agentName, price, onSuccess, onCancel }: PaymentFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      // Create payment intent
      const response = await fetch('/api/payments/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, amount: price }),
      });

      const { clientSecret } = await response.json();
      const stripe = await stripePromise;

      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      // Simulate payment completion for demo
      // In real app, would use Stripe Elements for card input
      setTimeout(async () => {
        const confirmResponse = await fetch('/api/payments/confirm-purchase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            paymentIntentId: 'pi_demo_' + Date.now(), 
            agentId 
          }),
        });

        if (confirmResponse.ok) {
          onSuccess();
        } else {
          setError('Payment failed');
        }
        setLoading(false);
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">Purchase {agentName}</h3>
        
        <div className="mb-4">
          <div className="text-gray-600 mb-2">Price: ${price}</div>
          <div className="text-sm text-gray-500">
            One-time purchase with lifetime access to this AI agent.
          </div>
        </div>

        {error && (
          <div className="text-red-600 text-sm mb-4">{error}</div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handlePayment}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Processing...' : `Pay $${price}`}
          </button>
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 border border-gray-300 py-2 px-4 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>

        <div className="text-xs text-gray-500 mt-3 text-center">
          Demo mode - no real payment will be processed
        </div>
      </div>
    </div>
  );
}
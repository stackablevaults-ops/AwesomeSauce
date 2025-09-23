
import React, { useEffect, useState } from 'react';
import PaymentForm from '../components/PaymentForm';

export default function Marketplace() {
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [purchasedAgents, setPurchasedAgents] = useState<number[]>([]);

  useEffect(() => {
    fetch('/api/marketplace/in-stock')
      .then(res => res.json())
      .then(data => {
        setModels(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load models');
        setLoading(false);
      });
  }, []);

  const handleBuyClick = (agent: any) => {
    setSelectedAgent(agent);
    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    setPurchasedAgents([...purchasedAgents, selectedAgent.id]);
    setShowPayment(false);
    setSelectedAgent(null);
    alert(`Successfully purchased ${selectedAgent.name}!`);
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
    setSelectedAgent(null);
  };

  const extractPrice = (priceString: string) => {
    return parseInt(priceString.replace('$', '')) || 0;
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6">AI Agent Marketplace</h2>
      
      {loading && <div className="text-center py-8">Loading agents...</div>}
      {error && <div className="text-red-600 text-center py-8">{error}</div>}
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {models.map(model => {
          const price = extractPrice(model.pricing);
          const isPurchased = purchasedAgents.includes(model.id);
          
          return (
            <div key={model.id} className="border rounded-lg p-6 shadow-md hover:shadow-lg transition">
              <h3 className="text-xl font-bold mb-3">{model.name}</h3>
              
              <div className="space-y-2 mb-4">
                <div><span className="font-medium">Specialties:</span> {model.specialties}</div>
                <div><span className="font-medium">Skills:</span> {model.skills}</div>
                <div><span className="font-medium">Provider:</span> {model.provider}</div>
                <div><span className="font-medium">Status:</span> 
                  <span className={`ml-2 px-2 py-1 rounded text-sm ${
                    model.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {model.status}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-blue-600">
                  {model.pricing}
                </div>
                
                {isPurchased ? (
                  <div className="bg-green-100 text-green-800 px-4 py-2 rounded font-medium">
                    Purchased ✓
                  </div>
                ) : (
                  <button
                    onClick={() => handleBuyClick(model)}
                    disabled={!model.inStock || !model.readyForSale}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {model.inStock && model.readyForSale ? 'Buy Now' : 'Unavailable'}
                  </button>
                )}
              </div>

              <div className="mt-3 text-sm text-gray-600">
                {model.inStock ? '✓ In Stock' : '✗ Out of Stock'} • 
                {model.readyForSale ? ' Ready for Sale' : ' Not for Sale'}
              </div>
            </div>
          );
        })}
      </div>

      {models.length === 0 && !loading && !error && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">No agents available at the moment.</div>
          <div className="text-sm text-gray-400">Check back later for new professional AI agents.</div>
        </div>
      )}

      {showPayment && selectedAgent && (
        <PaymentForm
          agentId={selectedAgent.id}
          agentName={selectedAgent.name}
          price={extractPrice(selectedAgent.pricing)}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
        />
      )}
    </div>
  );
}

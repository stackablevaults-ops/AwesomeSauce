import React, { useState } from 'react';

export default function AgentEvaluation() {
  const [selectedAgent, setSelectedAgent] = useState('');
  const [testScenario, setTestScenario] = useState('');
  const [evaluation, setEvaluation] = useState<any>(null);
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState('');
  const [loading, setLoading] = useState(false);

  const agents = [
    { id: 1, name: 'Legal Advisor AI' },
    { id: 2, name: 'Medical Consultant AI' },
    { id: 3, name: 'Financial Analyst AI' },
    { id: 4, name: 'Education Tutor AI' },
    { id: 5, name: 'Real Estate Advisor AI' }
  ];

  const testScenarios = [
    'Contract review and legal advice',
    'Medical diagnosis assistance',
    'Financial planning consultation', 
    'Educational tutoring session',
    'Property valuation analysis'
  ];

  const runEvaluation = async () => {
    if (!selectedAgent || !testScenario) return;
    
    setLoading(true);
    // Simulate evaluation process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockEvaluation = {
      agentId: selectedAgent,
      scenario: testScenario,
      accuracy: Math.floor(Math.random() * 20) + 80, // 80-100%
      responseTime: Math.floor(Math.random() * 500) + 200, // 200-700ms
      completeness: Math.floor(Math.random() * 15) + 85, // 85-100%
      suggestions: [
        'Response could be more detailed',
        'Consider adding examples',
        'Excellent factual accuracy'
      ]
    };
    
    setEvaluation(mockEvaluation);
    setLoading(false);
  };

  const submitFeedback = async () => {
    if (!selectedAgent || !feedback || !score) return;
    
    const res = await fetch('/api/training/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        agentId: Number(selectedAgent), 
        feedback, 
        score: Number(score) 
      }),
    });
    
    if (res.ok) {
      alert('Feedback submitted successfully!');
      setFeedback('');
      setScore('');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Agent Evaluation & Feedback</h2>
      
      {/* Agent Selection */}
      <div className="mb-6">
        <label className="block font-semibold mb-2">Select Agent:</label>
        <select 
          value={selectedAgent} 
          onChange={e => setSelectedAgent(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">Choose an agent...</option>
          {agents.map(agent => (
            <option key={agent.id} value={agent.id}>{agent.name}</option>
          ))}
        </select>
      </div>

      {/* Test Scenario */}
      <div className="mb-6">
        <label className="block font-semibold mb-2">Test Scenario:</label>
        <select 
          value={testScenario} 
          onChange={e => setTestScenario(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">Choose a scenario...</option>
          {testScenarios.map(scenario => (
            <option key={scenario} value={scenario}>{scenario}</option>
          ))}
        </select>
      </div>

      {/* Run Evaluation */}
      <button 
        onClick={runEvaluation}
        disabled={!selectedAgent || !testScenario || loading}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 mb-6"
      >
        {loading ? 'Evaluating...' : 'Run Evaluation'}
      </button>

      {/* Evaluation Results */}
      {evaluation && (
        <div className="bg-gray-50 p-4 rounded mb-6">
          <h3 className="font-semibold mb-3">Evaluation Results</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <div className="text-sm text-gray-600">Accuracy</div>
              <div className="text-xl font-bold">{evaluation.accuracy}%</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Response Time</div>
              <div className="text-xl font-bold">{evaluation.responseTime}ms</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Completeness</div>
              <div className="text-xl font-bold">{evaluation.completeness}%</div>
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-2">Suggestions for Improvement:</div>
            <ul className="list-disc list-inside">
              {evaluation.suggestions.map((suggestion: string, idx: number) => (
                <li key={idx} className="text-sm">{suggestion}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Feedback Form */}
      <div className="border-t pt-6">
        <h3 className="font-semibold mb-4">Submit Feedback</h3>
        <div className="mb-4">
          <label className="block font-medium mb-2">Feedback:</label>
          <textarea 
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            className="w-full p-2 border rounded h-24"
            placeholder="Provide detailed feedback about the agent's performance..."
          />
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-2">Score (1-10):</label>
          <input 
            type="number" 
            min="1" 
            max="10"
            value={score}
            onChange={e => setScore(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <button 
          onClick={submitFeedback}
          disabled={!selectedAgent || !feedback || !score}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          Submit Feedback
        </button>
      </div>
    </div>
  );
}
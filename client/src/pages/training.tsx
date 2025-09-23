
import React, { useState } from 'react';

export default function Training() {
  const [agentId, setAgentId] = useState('');
  const [data, setData] = useState('');
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState('');
  const [message, setMessage] = useState('');
  const [analytics, setAnalytics] = useState<any>(null);

  const uploadData = async () => {
    setMessage('');
    const res = await fetch('/api/training/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId: Number(agentId), data, version: 1 }),
    });
    setMessage(res.ok ? 'Training data uploaded.' : 'Error uploading data.');
  };

  const submitFeedback = async () => {
    setMessage('');
    const res = await fetch('/api/training/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId: Number(agentId), feedback, score: Number(score) }),
    });
    setMessage(res.ok ? 'Feedback submitted.' : 'Error submitting feedback.');
  };

  const retrainAgent = async () => {
    setMessage('');
    const res = await fetch(`/api/training/retrain/${agentId}`, { method: 'POST' });
    setMessage(res.ok ? 'Retraining started.' : 'Error starting retraining.');
  };

  const getAnalytics = async () => {
    const res = await fetch(`/api/training/analytics/${agentId}`);
    if (res.ok) {
      setAnalytics(await res.json());
    } else {
      setMessage('Error fetching analytics.');
    }
  };

  return (
    <div>
      <h2>AI Training Environment</h2>
      <input placeholder="Agent ID" value={agentId} onChange={e => setAgentId(e.target.value)} />
      <div>
        <textarea placeholder="Training Data" value={data} onChange={e => setData(e.target.value)} />
        <button onClick={uploadData}>Upload Training Data</button>
      </div>
      <div>
        <textarea placeholder="Feedback" value={feedback} onChange={e => setFeedback(e.target.value)} />
        <input placeholder="Score (1-10)" value={score} onChange={e => setScore(e.target.value)} />
        <button onClick={submitFeedback}>Submit Feedback</button>
      </div>
      <div>
        <button onClick={retrainAgent}>Retrain Agent</button>
        <button onClick={getAnalytics}>Get Analytics</button>
      </div>
      {message && <div>{message}</div>}
      {analytics && (
        <div>
          <h3>Analytics</h3>
          <pre>{JSON.stringify(analytics, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';

export default function TrainAgent() {
  const [agentId, setAgentId] = useState('');
  const [message, setMessage] = useState('');

  const handleTrain = async () => {
    setMessage('');
    const res = await fetch(`/api/agents/${agentId}/train`, { method: 'POST' });
    if (res.ok) {
      setMessage('Training started!');
    } else {
      setMessage('Error starting training.');
    }
  };

  return (
    <div>
      <h2>Train AI Agent</h2>
      <input
        type="text"
        placeholder="Agent ID"
        value={agentId}
        onChange={e => setAgentId(e.target.value)}
      />
      <button onClick={handleTrain}>Start Training</button>
      {message && <div>{message}</div>}
    </div>
  );
}

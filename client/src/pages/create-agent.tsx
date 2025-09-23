import React, { useState } from 'react';
import { queryClient } from '../lib/queryClient';

export default function CreateAgent() {
  const [form, setForm] = useState({
    name: '',
    provider: 'custom',
    skills: '',
    specialties: '',
    trainingDataUrl: '',
    pricing: '',
  });
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    const res = await fetch('/api/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setMessage('Agent created successfully!');
      queryClient.invalidateQueries(['agents']);
    } else {
      setMessage('Error creating agent.');
    }
  };

  return (
    <div>
      <h2>Create New AI Agent</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
        <input name="skills" placeholder="Skills (comma separated)" value={form.skills} onChange={handleChange} />
        <input name="specialties" placeholder="Specialties (comma separated)" value={form.specialties} onChange={handleChange} />
        <input name="trainingDataUrl" placeholder="Training Data URL" value={form.trainingDataUrl} onChange={handleChange} />
        <input name="pricing" placeholder="Pricing" value={form.pricing} onChange={handleChange} />
        <button type="submit">Create Agent</button>
      </form>
      {message && <div>{message}</div>}
    </div>
  );
}

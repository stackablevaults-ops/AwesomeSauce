import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { createApiClient } from '../lib/env-config';
import { demoUtils } from '../lib/demo-config';

interface KolossusInstance {
  kolossusId: string;
  config: {
    name: string;
    description: string;
    agentIds: number[];
    fusionStrategy: string;
  };
  status: {
    activeAgents: number;
    totalInteractions: number;
    averageConfidence: number;
  };
  trainingStatus: {
    activeSessions: any[];
    improvementTrend: 'improving' | 'stable' | 'declining';
  };
}

export default function KolossusForge() {
  const [, setLocation] = useLocation();
  const [selectedAgents, setSelectedAgents] = useState<number[]>([]);
  const [fusionStrategy, setFusionStrategy] = useState('ensemble');
  const [kolossusName, setKolossusName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [activeKolossus, setActiveKolossus] = useState<KolossusInstance[]>([]);
  const [chatMode, setChatMode] = useState(false);
  const [selectedKolossus, setSelectedKolossus] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<{role: string; content: string}>>([]);
  const [currentMessage, setCurrentMessage] = useState('');

  // Mock available agents for demo
  const availableAgents = [
    { id: 1, name: 'Legal Expert', specialty: 'Legal Analysis', confidence: 0.92 },
    { id: 2, name: 'Medical Advisor', specialty: 'Healthcare', confidence: 0.89 },
    { id: 3, name: 'Financial Analyst', specialty: 'Finance', confidence: 0.94 },
    { id: 4, name: 'Code Assistant', specialty: 'Programming', confidence: 0.87 },
    { id: 5, name: 'Research Scholar', specialty: 'Academic Research', confidence: 0.91 },
    { id: 6, name: 'Creative Writer', specialty: 'Content Creation', confidence: 0.86 }
  ];

  const presets = [
    {
      name: 'ELITE_LEGAL',
      title: 'Legal Elite',
      description: 'Ultimate AI for legal professionals',
      agentTypes: ['Legal Expert', 'Research Scholar'],
      fusionStrategy: 'hierarchical'
    },
    {
      name: 'MEDICAL_SUPREME',
      title: 'Medical Supreme',
      description: 'Supreme medical AI for healthcare',
      agentTypes: ['Medical Advisor', 'Research Scholar'],
      fusionStrategy: 'consensus'
    },
    {
      name: 'FINANCIAL_TITAN',
      title: 'Financial Titan',
      description: 'Ultimate financial intelligence',
      agentTypes: ['Financial Analyst', 'Code Assistant'],
      fusionStrategy: 'weighted'
    }
  ];

  const createKolossus = async () => {
    if (selectedAgents.length < 2) {
      alert('Please select at least 2 agents to create Kolossus');
      return;
    }

    setIsCreating(true);
    
    // Simulate API call
    setTimeout(() => {
      const newKolossus: KolossusInstance = {
        kolossusId: `kolossus_${Date.now()}`,
        config: {
          name: kolossusName || 'Unnamed Kolossus',
          description: 'Custom Kolossus instance',
          agentIds: selectedAgents,
          fusionStrategy
        },
        status: {
          activeAgents: selectedAgents.length,
          totalInteractions: 0,
          averageConfidence: 0.85
        },
        trainingStatus: {
          activeSessions: [],
          improvementTrend: 'stable'
        }
      };
      
      setActiveKolossus(prev => [...prev, newKolossus]);
      setIsCreating(false);
      setSelectedAgents([]);
      setKolossusName('');
      alert('Kolossus created successfully! Ultimate AI is now operational.');
    }, 2000);
  };

  const createFromPreset = async (presetName: string) => {
    setIsCreating(true);
    
    // Find agents matching the preset
    const preset = presets.find(p => p.name === presetName);
    if (!preset) return;
    
    const matchingAgents = availableAgents.filter(agent => 
      preset.agentTypes.includes(agent.name)
    );
    
    setTimeout(() => {
      const newKolossus: KolossusInstance = {
        kolossusId: `kolossus_${presetName}_${Date.now()}`,
        config: {
          name: preset.title,
          description: preset.description,
          agentIds: matchingAgents.map(a => a.id),
          fusionStrategy: preset.fusionStrategy
        },
        status: {
          activeAgents: matchingAgents.length,
          totalInteractions: 0,
          averageConfidence: 0.90
        },
        trainingStatus: {
          activeSessions: [],
          improvementTrend: 'improving'
        }
      };
      
      setActiveKolossus(prev => [...prev, newKolossus]);
      setIsCreating(false);
      alert(`${preset.title} Kolossus activated! Elite AI operational.`);
    }, 2000);
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || !selectedKolossus) return;

    const newMessage = { role: 'user', content: currentMessage };
    setMessages(prev => [...prev, newMessage]);
    setCurrentMessage('');

    // Simulate Kolossus response
    setTimeout(() => {
      const kolossus = activeKolossus.find(k => k.kolossusId === selectedKolossus);
      const response = {
        role: 'assistant',
        content: `[KOLOSSUS ${kolossus?.config.name.toUpperCase()}] Analyzing your request using ${kolossus?.status.activeAgents} expert agents with ${kolossus?.config.fusionStrategy} fusion strategy...

Based on the collective intelligence of my constituent agents, here's the ultimate response: This demonstrates the power of multi-agent AI fusion, where specialized knowledge from different domains combines to create superior insights. 

Confidence: ${(Math.random() * 0.2 + 0.8).toFixed(2)} | Fusion: ${kolossus?.config.fusionStrategy} | Agents: ${kolossus?.status.activeAgents}`
      };
      setMessages(prev => [...prev, response]);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4">
            KOLOSSUS FORGE
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            Create Ultimate AI by Combining Multiple Expert Agents
          </p>
          
          <div className="flex gap-4 justify-center mb-8">
            <button 
              onClick={() => setChatMode(false)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                !chatMode 
                  ? 'bg-purple-600 text-white' 
                  : 'border-2 border-purple-400 text-purple-300'
              }`}
            >
              Forge Kolossus
            </button>
            <button 
              onClick={() => setChatMode(true)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                chatMode 
                  ? 'bg-purple-600 text-white' 
                  : 'border-2 border-purple-400 text-purple-300'
              }`}
            >
              Chat with Kolossus
            </button>
          </div>
        </div>

        {!chatMode ? (
          <>
            {/* Creation Interface */}
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              {/* Custom Creation */}
              <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-purple-500/30">
                <h2 className="text-2xl font-bold text-white mb-6">Custom Kolossus Creation</h2>
                
                <div className="mb-6">
                  <label className="block text-white font-semibold mb-2">Kolossus Name</label>
                  <input
                    type="text"
                    value={kolossusName}
                    onChange={(e) => setKolossusName(e.target.value)}
                    placeholder="Enter your Kolossus name..."
                    className="w-full p-3 rounded-lg bg-white/20 border border-purple-500/50 text-white placeholder-gray-300"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-white font-semibold mb-2">Select Agents (Min 2)</label>
                  <div className="grid md:grid-cols-2 gap-3">
                    {availableAgents.map(agent => (
                      <div
                        key={agent.id}
                        onClick={() => {
                          if (selectedAgents.includes(agent.id)) {
                            setSelectedAgents(prev => prev.filter(id => id !== agent.id));
                          } else {
                            setSelectedAgents(prev => [...prev, agent.id]);
                          }
                        }}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedAgents.includes(agent.id)
                            ? 'bg-purple-600 border-purple-400 text-white'
                            : 'bg-white/10 border-purple-500/30 text-gray-300 hover:bg-white/20'
                        }`}
                      >
                        <div className="font-semibold">{agent.name}</div>
                        <div className="text-sm opacity-80">{agent.specialty}</div>
                        <div className="text-xs">Confidence: {(agent.confidence * 100).toFixed(0)}%</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-white font-semibold mb-2">Fusion Strategy</label>
                  <select
                    value={fusionStrategy}
                    onChange={(e) => setFusionStrategy(e.target.value)}
                    className="w-full p-3 rounded-lg bg-white/20 border border-purple-500/50 text-white"
                  >
                    <option value="ensemble">Ensemble - Advanced multi-stage synthesis</option>
                    <option value="consensus">Consensus - Find common themes</option>
                    <option value="weighted">Weighted - Based on confidence scores</option>
                    <option value="hierarchical">Hierarchical - Expert-based priority</option>
                  </select>
                </div>

                <button
                  onClick={createKolossus}
                  disabled={selectedAgents.length < 2 || isCreating}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? 'Forging Ultimate AI...' : 'Create Kolossus'}
                </button>
              </div>

              {/* Preset Creation */}
              <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-blue-500/30">
                <h2 className="text-2xl font-bold text-white mb-6">Elite Presets</h2>
                
                <div className="space-y-4">
                  {presets.map(preset => (
                    <div
                      key={preset.name}
                      className="bg-white/10 p-4 rounded-lg border border-blue-500/20 hover:border-blue-400/50 transition-all"
                    >
                      <h3 className="text-xl font-bold text-white mb-2">{preset.title}</h3>
                      <p className="text-gray-300 mb-3">{preset.description}</p>
                      <div className="text-sm text-blue-300 mb-3">
                        Agents: {preset.agentTypes.join(', ')}
                      </div>
                      <div className="text-sm text-blue-300 mb-4">
                        Strategy: {preset.fusionStrategy}
                      </div>
                      <button
                        onClick={() => createFromPreset(preset.name)}
                        disabled={isCreating}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
                      >
                        {isCreating ? 'Activating...' : `Activate ${preset.title}`}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Active Kolossus Instances */}
            {activeKolossus.length > 0 && (
              <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-green-500/30">
                <h2 className="text-2xl font-bold text-white mb-6">Active Kolossus Instances</h2>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeKolossus.map(kolossus => (
                    <div
                      key={kolossus.kolossusId}
                      className="bg-white/10 p-4 rounded-lg border border-green-500/20"
                    >
                      <h3 className="text-lg font-bold text-white mb-2">{kolossus.config.name}</h3>
                      <div className="text-sm text-gray-300 space-y-1">
                        <div>Agents: {kolossus.status.activeAgents}</div>
                        <div>Interactions: {kolossus.status.totalInteractions}</div>
                        <div>Confidence: {(kolossus.status.averageConfidence * 100).toFixed(0)}%</div>
                        <div>Strategy: {kolossus.config.fusionStrategy}</div>
                        <div className={`font-semibold ${
                          kolossus.trainingStatus.improvementTrend === 'improving' ? 'text-green-400' :
                          kolossus.trainingStatus.improvementTrend === 'declining' ? 'text-red-400' :
                          'text-yellow-400'
                        }`}>
                          Status: {kolossus.trainingStatus.improvementTrend}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedKolossus(kolossus.kolossusId);
                          setChatMode(true);
                        }}
                        className="w-full mt-3 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-all"
                      >
                        Chat with Kolossus
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Chat Interface */
          <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-purple-500/30">
            <div className="mb-6">
              <label className="block text-white font-semibold mb-2">Select Kolossus to Chat With</label>
              <select
                value={selectedKolossus || ''}
                onChange={(e) => setSelectedKolossus(e.target.value)}
                className="w-full p-3 rounded-lg bg-white/20 border border-purple-500/50 text-white"
              >
                <option value="">Choose a Kolossus instance...</option>
                {activeKolossus.map(kolossus => (
                  <option key={kolossus.kolossusId} value={kolossus.kolossusId}>
                    {kolossus.config.name} ({kolossus.status.activeAgents} agents)
                  </option>
                ))}
              </select>
            </div>

            {selectedKolossus && (
              <>
                <div className="bg-black/30 rounded-lg p-4 h-96 overflow-y-auto mb-4">
                  {messages.length === 0 ? (
                    <div className="text-gray-400 text-center">
                      Start a conversation with your Kolossus...
                    </div>
                  ) : (
                    messages.map((message, index) => (
                      <div
                        key={index}
                        className={`mb-4 ${
                          message.role === 'user' ? 'text-right' : 'text-left'
                        }`}
                      >
                        <div
                          className={`inline-block p-3 rounded-lg max-w-3xl ${
                            message.role === 'user'
                              ? 'bg-purple-600 text-white'
                              : 'bg-blue-600 text-white'
                          }`}
                        >
                          <div className="whitespace-pre-wrap">{message.content}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex gap-3">
                  <input
                    type="text"
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Ask your Kolossus anything..."
                    className="flex-1 p-3 rounded-lg bg-white/20 border border-purple-500/50 text-white placeholder-gray-300"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!currentMessage.trim()}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
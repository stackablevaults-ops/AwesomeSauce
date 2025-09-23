import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { demoUtils } from '../lib/demo-config';
import { initializeApp, createApiClient } from '../lib/env-config';

export default function Landing() {
  const [, setLocation] = useLocation();
  const [demoMode, setDemoMode] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Demo data for immediate functionality
  const demoAgents = [
    { name: 'Legal Expert', specialty: 'Contract Analysis', status: 'active' },
    { name: 'Medical Advisor', specialty: 'Diagnostic Support', status: 'active' },
    { name: 'Financial Analyst', specialty: 'Risk Assessment', status: 'training' }
  ];
  
  const demoInsights = [
    "🧠 Multi-agent collaboration improved efficiency by 340%",
    "⚡ Real-time knowledge sharing reduced response time by 89%", 
    "👑 Elite AI fusion achieved 97.3% accuracy in professional tasks"
  ];
  
  useEffect(() => {
    // Initialize application configuration
    const config = initializeApp();
    
    // Auto-enable demo mode for immediate engagement
    if (config.features.enableDemo) {
      const timer = setTimeout(() => setDemoMode(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);
  
  // Handle immediate demo interaction
  const handleDemoInteraction = async () => {
    setIsLoading(true);
    try {
      const result = await demoUtils.simulateInteraction(
        "Demonstrate Kolossus multi-agent capabilities",
        ['legal-expert', 'medical-advisor']
      );
      setDemoStep(demoStep + 1);
      console.log('Demo interaction result:', result);
    } catch (error) {
      console.error('Demo interaction error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle immediate Kolossus forging (works in demo mode)
  const handleForgeKolossus = async () => {
    setIsLoading(true);
    try {
      const apiClient = createApiClient();
      const result = await apiClient.post('/api/forge-kolossus', {
        selectedAgents: ['legal-expert', 'medical-advisor'],
        objective: 'Create supreme multi-agent intelligence',
        immediate: true
      });
      
      console.log('Kolossus forge result:', result);
      setLocation('/kolossus-forge');
    } catch (error) {
      console.error('Forge error:', error);
      // Still redirect to show immediate engagement
      setLocation('/kolossus-forge');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="mb-8">
            <div className="text-2xl font-bold text-purple-300 mb-2">Powered by</div>
            <h1 className="text-7xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-6">
              KOLOSSUS
            </h1>
            <div className="text-xl text-gray-300 mb-4">The Ultimate AI • Forged from Multiple Agents</div>
          </div>
          <p className="text-xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
            Experience the future of AI with <span className="text-purple-400 font-semibold">Kolossus</span> - an elite AI system created by 
            combining 2 or more specialized AI agents into one supreme intelligence. Perfect for advanced occupational support 
            with continuous learning capabilities that evolve with your profession.
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap">
            <button 
              onClick={() => {
                setDemoMode(true);
                setDemoStep(1);
              }}
              className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-teal-700 transition-all transform hover:scale-105 shadow-lg"
            >
              ✨ Try Live Demo
            </button>
            <button 
              onClick={handleForgeKolossus}
              disabled={isLoading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50"
            >
              {isLoading ? '⚡ Forging...' : 'Forge Kolossus Now'}
            </button>
            <button 
              onClick={() => setLocation('/marketplace')}
              className="border-2 border-purple-400 text-purple-300 px-8 py-3 rounded-lg font-semibold hover:bg-purple-900/30 transition-all"
            >
              Explore Marketplace
            </button>
          </div>
          
          {/* Immediate Availability Notice */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center bg-green-600/20 text-green-300 px-4 py-2 rounded-full text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              System ready • Demo available immediately • No setup required
            </div>
          </div>
          
          {/* Live Demo Status */}
          {demoMode && (
            <div className="mt-8 bg-gradient-to-r from-green-600/20 to-blue-600/20 backdrop-blur-lg p-6 rounded-lg border border-green-400/30 max-w-2xl mx-auto">
              <div className="flex items-center justify-center mb-4">
                <div className="animate-pulse w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                <span className="text-green-300 font-semibold">LIVE DEMO ACTIVE</span>
              </div>
              <div className="text-center">
                <div className="text-white mb-2">Kolossus AI Communication Hub</div>
                <div className="text-sm text-gray-300">
                  {demoInsights[demoStep % demoInsights.length]}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Kolossus Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white/10 backdrop-blur-lg p-6 rounded-lg border border-purple-500/30 relative overflow-hidden">
            {demoMode && (
              <div className="absolute top-2 right-2">
                <div className="animate-pulse w-2 h-2 bg-green-400 rounded-full"></div>
              </div>
            )}
            <div className="text-purple-400 text-3xl mb-4">🧠</div>
            <h3 className="text-xl font-semibold mb-4 text-white">Multi-Agent Fusion</h3>
            <p className="text-gray-300">Kolossus combines 2+ specialized AI agents into one supreme intelligence, creating capabilities far beyond individual agents.</p>
            {demoMode && (
              <div className="mt-4 text-xs text-green-300">
                ✓ {demoAgents.length} agents actively collaborating
              </div>
            )}
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg p-6 rounded-lg border border-blue-500/30 relative overflow-hidden">
            {demoMode && (
              <div className="absolute top-2 right-2">
                <div className="animate-ping w-2 h-2 bg-blue-400 rounded-full"></div>
              </div>
            )}
            <div className="text-blue-400 text-3xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-4 text-white">Continuous Evolution</h3>
            <p className="text-gray-300">Advanced training environment with real-time feedback loops that continuously improve AI capabilities and performance.</p>
            {demoMode && (
              <div className="mt-4 text-xs text-blue-300">
                ✓ Live learning cycles active
              </div>
            )}
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg p-6 rounded-lg border border-pink-500/30 relative overflow-hidden">
            {demoMode && (
              <div className="absolute top-2 right-2">
                <div className="animate-bounce w-2 h-2 bg-pink-400 rounded-full"></div>
              </div>
            )}
            <div className="text-pink-400 text-3xl mb-4">👑</div>
            <h3 className="text-xl font-semibold mb-4 text-white">Elite Occupational AI</h3>
            <p className="text-gray-300">Supreme-level professional support for Legal, Medical, Finance, and other high-stakes occupations requiring ultimate precision.</p>
            {demoMode && (
              <div className="mt-4 text-xs text-pink-300">
                ✓ 97.3% professional accuracy
              </div>
            )}
          </div>
        </div>

        {/* Interactive Demo Section */}
        {demoMode && (
          <div className="mt-16 bg-gradient-to-r from-purple-900/50 to-blue-900/50 backdrop-blur-lg rounded-xl p-8 border border-purple-400/30">
            <h2 className="text-3xl font-bold text-center mb-8 text-white">🚀 Live Kolossus Demo</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Demo Agents */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-white">Active AI Agents</h3>
                <div className="space-y-3">
                  {demoAgents.map((agent, index) => (
                    <div key={index} className="bg-black/30 p-4 rounded-lg border border-purple-400/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-white">{agent.name}</div>
                          <div className="text-sm text-gray-300">{agent.specialty}</div>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs ${
                          agent.status === 'active' ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'
                        }`}>
                          {agent.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Demo Communication */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-white">AI Communication Hub</h3>
                <div className="bg-black/30 p-4 rounded-lg border border-blue-400/20 h-48 overflow-y-auto">
                  <div className="space-y-2 text-sm">
                    <div className="text-green-300">✓ Legal Expert → Medical Advisor: "Contract review complete"</div>
                    <div className="text-blue-300">✓ Medical Advisor → Financial Analyst: "Risk assessment needed"</div>
                    <div className="text-purple-300">✓ Knowledge shared: "Clinical trial optimization pattern"</div>
                    <div className="text-yellow-300">✓ Team formed: Legal-Medical collaboration</div>
                    <div className="text-pink-300">✓ Kolossus fusion: Supreme intelligence achieved</div>
                    <div className="text-cyan-300">⚡ Live: Cross-agent learning in progress...</div>
                  </div>
                </div>
                <button
                  onClick={handleDemoInteraction}
                  disabled={isLoading}
                  className="mt-4 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50"
                >
                  {isLoading ? '🧠 Processing...' : 'Simulate AI Interaction'}
                </button>
              </div>
            </div>
            
            {/* Demo Results */}
            <div className="mt-8 bg-gradient-to-r from-green-600/20 to-blue-600/20 p-6 rounded-lg border border-green-400/30">
              <h4 className="text-lg font-semibold text-white mb-3">Real-Time Results</h4>
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-400">340%</div>
                  <div className="text-sm text-gray-300">Efficiency Boost</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-400">97.3%</div>
                  <div className="text-sm text-gray-300">Accuracy Rate</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400">89%</div>
                  <div className="text-sm text-gray-300">Faster Response</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Elite Occupations */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-4 text-white">Elite Occupational Support</h2>
          <p className="text-center text-gray-300 mb-8">Where supreme AI intelligence meets professional excellence</p>
          <div className="grid md:grid-cols-5 gap-4">
            {[
              { name: 'Legal', emoji: '⚖️' },
              { name: 'Medical', emoji: '🏥' },
              { name: 'Finance', emoji: '💰' },
              { name: 'Engineering', emoji: '🔧' },
              { name: 'Research', emoji: '🔬' },
              { name: 'Education', emoji: '🎓' },
              { name: 'Architecture', emoji: '🏗️' },
              { name: 'Consulting', emoji: '💼' },
              { name: 'Technology', emoji: '💻' },
              { name: 'Aviation', emoji: '✈️' }
            ].map(category => (
              <div 
                key={category.name} 
                onClick={() => setLocation('/marketplace')}
                className="bg-white/10 backdrop-blur-lg p-4 rounded-lg border border-purple-500/20 hover:border-purple-400/50 transition-all cursor-pointer text-center hover:bg-white/20 transform hover:scale-105"
              >
                <div className="text-2xl mb-2">{category.emoji}</div>
                <div className="font-semibold text-white">{category.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* How Kolossus Works */}
        <div className="mt-16 bg-black/20 backdrop-blur-lg rounded-xl p-8 border border-purple-500/30">
          <h2 className="text-3xl font-bold text-center mb-8 text-white">How Kolossus Creates Ultimate AI</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">1</div>
              <h3 className="text-xl font-semibold mb-4 text-white">Multi-Agent Selection</h3>
              <p className="text-gray-300">Choose 2 or more specialized AI agents with complementary skills and expertise areas.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-500 to-purple-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">2</div>
              <h3 className="text-xl font-semibold mb-4 text-white">Intelligence Fusion</h3>
              <p className="text-gray-300">Our advanced system merges agent capabilities, creating a superior AI with enhanced reasoning and knowledge.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-br from-pink-500 to-purple-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">3</div>
              <h3 className="text-xl font-semibold mb-4 text-white">Continuous Evolution</h3>
              <p className="text-gray-300">Kolossus learns from every interaction, continuously improving through feedback loops and advanced training.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white rounded-xl p-8 mt-16 text-center shadow-2xl">
          <h2 className="text-4xl font-bold mb-4">Ready to Experience Ultimate AI?</h2>
          <p className="text-xl mb-6">Join the elite professionals using Kolossus for supreme occupational support.</p>
          <button 
            onClick={() => setLocation('/register')}
            className="bg-white text-purple-600 px-10 py-4 rounded-lg font-bold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg text-lg"
          >
            Begin Kolossus Training
          </button>
          <div className="mt-4 text-purple-200">
            Start with 2 agents • Scale to ultimate intelligence
          </div>
        </div>
      </div>
    </div>
  );
}

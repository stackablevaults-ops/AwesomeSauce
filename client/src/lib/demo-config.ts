/**
 * Demo Configuration for Kolossus.org
 * Ensures immediate functionality without backend dependencies
 */

// Extend window interface for demo mode
declare global {
  interface Window {
    KOLOSSUS_DEMO?: boolean;
  }
}

export const DEMO_CONFIG = {
  // Enable demo mode by default for immediate engagement
  enableDemo: true,
  
  // Demo environment detection
  isDemoMode: () => {
    return (
      process.env.NODE_ENV === 'development' ||
      (typeof window !== 'undefined' && (
        window?.location?.hostname === 'localhost' ||
        window?.location?.hostname?.includes('netlify') ||
        window?.location?.hostname?.includes('kolossus.org')
      )) ||
      !process.env.REACT_APP_API_URL
    );
  },
  
  // Demo data that works immediately
  demoData: {
    agents: [
      {
        id: 'legal-expert',
        name: 'Legal Expert',
        specialty: 'Contract Analysis & Compliance',
        capabilities: ['contract_review', 'legal_research', 'compliance_check'],
        status: 'active',
        performance: 97.3,
        collaborations: 23
      },
      {
        id: 'medical-advisor',
        name: 'Medical Advisor', 
        specialty: 'Diagnostic Support & Research',
        capabilities: ['diagnostic_analysis', 'medical_research', 'treatment_planning'],
        status: 'active',
        performance: 96.8,
        collaborations: 31
      },
      {
        id: 'financial-analyst',
        name: 'Financial Analyst',
        specialty: 'Risk Assessment & Strategy',
        capabilities: ['risk_analysis', 'financial_modeling', 'investment_strategy'],
        status: 'training',
        performance: 94.2,
        collaborations: 18
      },
      {
        id: 'tech-architect',
        name: 'Tech Architect',
        specialty: 'System Design & Optimization',
        capabilities: ['system_design', 'performance_optimization', 'security_analysis'],
        status: 'active',
        performance: 98.1,
        collaborations: 42
      }
    ],
    
    collaborations: [
      {
        id: 'collab-1',
        title: 'Legal-Medical Compliance Review',
        participants: ['legal-expert', 'medical-advisor'],
        status: 'active',
        progress: 85,
        insights: 'Cross-domain compliance patterns identified'
      },
      {
        id: 'collab-2', 
        title: 'Financial Risk Assessment',
        participants: ['financial-analyst', 'tech-architect'],
        status: 'completed',
        progress: 100,
        insights: 'Technology investment risk model optimized'
      }
    ],
    
    knowledge: [
      {
        id: 'knowledge-1',
        title: 'Multi-Agent Optimization Pattern',
        category: 'optimization',
        confidence: 0.97,
        applicability: ['legal-expert', 'medical-advisor', 'financial-analyst'],
        description: 'Discovered optimal collaboration patterns for professional AI agents'
      },
      {
        id: 'knowledge-2',
        title: 'Cross-Domain Learning Strategy',
        category: 'learning',
        confidence: 0.94,
        applicability: ['all'],
        description: 'Enhanced learning through inter-agent knowledge transfer'
      }
    ],
    
    metrics: {
      totalAgents: 4,
      activeCollaborations: 12,
      knowledgeShared: 47,
      averagePerformance: 96.6,
      efficiencyGain: 340,
      accuracyRate: 97.3,
      responseTimeImprovement: 89
    }
  },
  
  // Demo API responses for immediate functionality
  demoResponses: {
    '/api/agents': (params: any) => ({
      success: true,
      data: DEMO_CONFIG.demoData.agents,
      message: 'Demo agents loaded successfully'
    }),
    
    '/api/collaborations': (params: any) => ({
      success: true,
      data: DEMO_CONFIG.demoData.collaborations,
      message: 'Demo collaborations loaded successfully'
    }),
    
    '/api/forge-kolossus': (params: any) => ({
      success: true,
      data: {
        kolosssusId: `kolossus_${Date.now()}`,
        agents: params.selectedAgents || ['legal-expert', 'medical-advisor'],
        status: 'forging',
        estimatedCompletion: new Date(Date.now() + 30000), // 30 seconds
        capabilities: 'Supreme multi-agent intelligence with enhanced collaboration'
      },
      message: 'Kolossus forge initiated successfully'
    }),
    
    '/api/demo/interact': (params: any) => ({
      success: true,
      data: {
        response: `Kolossus processes your request with ${params.agents?.length || 2} fused agents`,
        insights: [
          'Multi-agent analysis reveals optimal approach',
          'Cross-domain knowledge patterns applied',
          'Supreme intelligence synthesis complete'
        ],
        confidence: 0.973,
        processingTime: '1.2s'
      },
      message: 'Demo interaction completed'
    })
  } as Record<string, (params: any) => any>,
  
  // Fallback functions for when backend is unavailable
  fallbacks: {
    api: (endpoint: string, params: any) => {
      console.log(`🎭 Demo mode: Simulating API call to ${endpoint}`);
      
      const response = (DEMO_CONFIG.demoResponses as any)[endpoint];
      if (response) {
        return Promise.resolve(response(params));
      }
      
      return Promise.resolve({
        success: true,
        data: { demo: true, message: 'Demo mode active' },
        message: 'Demo response for ' + endpoint
      });
    },
    
    storage: {
      get: (key: string) => {
        const stored = localStorage.getItem(`kolossus_demo_${key}`);
        return stored ? JSON.parse(stored) : null;
      },
      
      set: (key: string, value: any) => {
        localStorage.setItem(`kolossus_demo_${key}`, JSON.stringify(value));
      }
    }
  }
};

// Demo utility functions
export const demoUtils = {
  // Initialize demo environment
  initDemo: () => {
    console.log('🚀 Kolossus Demo Mode Initialized');
    
    // Set demo flag
    window.KOLOSSUS_DEMO = true;
    
    // Store demo data locally for immediate access
    DEMO_CONFIG.fallbacks.storage.set('agents', DEMO_CONFIG.demoData.agents);
    DEMO_CONFIG.fallbacks.storage.set('metrics', DEMO_CONFIG.demoData.metrics);
    
    return true;
  },
  
  // Simulate AI interaction
  simulateInteraction: async (prompt: string, selectedAgents: any[] = []) => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing
    
    return {
      success: true,
      response: `Kolossus Supreme Intelligence Response: ${prompt}`,
      agents: selectedAgents.length || 2,
      confidence: 0.97,
      insights: [
        'Multi-agent fusion analysis complete',
        'Cross-domain knowledge synthesis applied',
        'Supreme-level accuracy achieved'
      ]
    };
  },
  
  // Check if system should run in demo mode
  shouldUseDemoMode: () => {
    return DEMO_CONFIG.isDemoMode() || (typeof window !== 'undefined' && window.KOLOSSUS_DEMO === true);
  }
};

export default DEMO_CONFIG;
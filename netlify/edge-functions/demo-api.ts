// Netlify Edge Function for Demo API
// Provides immediate API responses when backend is unavailable

export default async (request: Request, context: any) => {
  const url = new URL(request.url);
  const path = url.pathname;
  
  console.log(`Demo API called: ${path}`);
  
  // Demo responses for immediate functionality
  const demoResponses: Record<string, any> = {
    '/api/agents': {
      success: true,
      data: [
        {
          id: 'legal-expert',
          name: 'Legal Expert',
          specialty: 'Contract Analysis & Compliance',
          status: 'active',
          performance: 97.3
        },
        {
          id: 'medical-advisor',
          name: 'Medical Advisor',
          specialty: 'Diagnostic Support & Research',
          status: 'active',
          performance: 96.8
        },
        {
          id: 'financial-analyst',
          name: 'Financial Analyst',
          specialty: 'Risk Assessment & Strategy',
          status: 'active',
          performance: 94.2
        },
        {
          id: 'tech-architect',
          name: 'Tech Architect',
          specialty: 'System Design & Optimization',
          status: 'active',
          performance: 98.1
        }
      ],
      message: 'Demo agents loaded successfully'
    },
    
    '/api/forge-kolossus': {
      success: true,
      data: {
        kolosssusId: `kolossus_${Date.now()}`,
        status: 'forging',
        estimatedCompletion: new Date(Date.now() + 30000),
        capabilities: 'Supreme multi-agent intelligence with enhanced collaboration',
        performance: 98.7
      },
      message: 'Kolossus forge initiated successfully'
    },
    
    '/api/demo/interact': {
      success: true,
      data: {
        response: 'Kolossus Supreme Intelligence activated. Multi-agent collaboration in progress.',
        insights: [
          'Multi-agent fusion analysis complete',
          'Cross-domain knowledge synthesis applied',
          'Supreme-level accuracy achieved'
        ],
        confidence: 0.973,
        processingTime: '1.2s'
      },
      message: 'Demo interaction completed'
    }
  };
  
  // Handle POST requests
  if (request.method === 'POST') {
    const body = await request.json().catch(() => ({}));
    
    if (path === '/api/forge-kolossus') {
      const response = {
        ...demoResponses[path],
        data: {
          ...demoResponses[path].data,
          agents: body.selectedAgents || ['legal-expert', 'medical-advisor'],
          objective: body.objective || 'Supreme intelligence creation'
        }
      };
      
      return new Response(JSON.stringify(response), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }
  }
  
  // Handle GET requests
  const response = demoResponses[path] || {
    success: true,
    data: { demo: true, path },
    message: `Demo response for ${path}`
  };
  
  return new Response(JSON.stringify(response), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
};
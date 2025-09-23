/**
 * Environment Configuration for Kolossus.org
 * Ensures immediate functionality across all environments
 */

// Environment detection utilities
export const ENV_CONFIG = {
  // Detect current environment
  getEnvironment: () => {
    if (typeof window === 'undefined') return 'ssr';
    
    const hostname = window.location.hostname;
    const isDev = hostname === 'localhost' || hostname === '127.0.0.1';
    const isNetlify = hostname.includes('.netlify.app') || hostname.includes('netlify');
    const isProduction = hostname === 'kolossus.org' || hostname === 'www.kolossus.org';
    
    if (isDev) return 'development';
    if (isNetlify) return 'staging';
    if (isProduction) return 'production';
    return 'unknown';
  },
  
  // Feature flags based on environment
  features: {
    development: {
      enableDemo: true,
      enableFullBackend: false,
      enableAnalytics: false,
      enableErrorReporting: false,
      showDebugInfo: true
    },
    staging: {
      enableDemo: true,
      enableFullBackend: false,
      enableAnalytics: true,
      enableErrorReporting: true,
      showDebugInfo: false
    },
    production: {
      enableDemo: true, // Keep demo enabled for immediate engagement
      enableFullBackend: true,
      enableAnalytics: true,
      enableErrorReporting: true,
      showDebugInfo: false
    },
    unknown: {
      enableDemo: true,
      enableFullBackend: false,
      enableAnalytics: false,
      enableErrorReporting: false,
      showDebugInfo: true
    }
  },
  
  // API configuration
  api: {
    development: {
      baseUrl: 'http://localhost:3001',
      timeout: 5000,
      retries: 2
    },
    staging: {
      baseUrl: process.env.REACT_APP_API_URL || '/api',
      timeout: 10000,
      retries: 3
    },
    production: {
      baseUrl: process.env.REACT_APP_API_URL || 'https://api.kolossus.org',
      timeout: 15000,
      retries: 3
    },
    unknown: {
      baseUrl: '/api',
      timeout: 5000,
      retries: 1
    }
  }
};

// Get current environment configuration
export const getCurrentConfig = () => {
  const env = ENV_CONFIG.getEnvironment();
  return {
    environment: env,
    features: ENV_CONFIG.features[env as keyof typeof ENV_CONFIG.features],
    api: ENV_CONFIG.api[env as keyof typeof ENV_CONFIG.api]
  };
};

// API client with automatic fallback to demo mode
export const createApiClient = () => {
  const config = getCurrentConfig();
  
  const makeRequest = async (endpoint: string, options: RequestInit = {}) => {
    // If demo mode is enabled or backend is not available, use demo responses
    if (config.features.enableDemo && !config.features.enableFullBackend) {
      console.log(`🎭 Demo mode: API call to ${endpoint}`);
      
      // Import demo config and return demo response
      const { DEMO_CONFIG } = await import('./demo-config');
      return DEMO_CONFIG.fallbacks.api(endpoint, options.body ? JSON.parse(options.body as string) : {});
    }
    
    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.api.timeout);
      
      const response = await fetch(`${config.api.baseUrl}${endpoint}`, {
        signal: controller.signal,
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.warn(`API request failed, falling back to demo mode:`, error);
      
      // Fallback to demo mode on API failure
      const { DEMO_CONFIG } = await import('./demo-config');
      return DEMO_CONFIG.fallbacks.api(endpoint, options.body ? JSON.parse(options.body as string) : {});
    }
  };
  
  return {
    get: (endpoint: string) => makeRequest(endpoint, { method: 'GET' }),
    post: (endpoint: string, data: any) => makeRequest(endpoint, { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),
    put: (endpoint: string, data: any) => makeRequest(endpoint, { 
      method: 'PUT', 
      body: JSON.stringify(data) 
    }),
    delete: (endpoint: string) => makeRequest(endpoint, { method: 'DELETE' })
  };
};

// Initialize application with appropriate configuration
export const initializeApp = () => {
  const config = getCurrentConfig();
  
  console.log(`🚀 Kolossus.org initializing in ${config.environment} mode`);
  
  // Set global configuration
  if (typeof window !== 'undefined') {
    (window as any).KOLOSSUS_CONFIG = config;
    
    // Initialize demo mode if enabled
    if (config.features.enableDemo) {
      import('./demo-config').then(({ demoUtils }) => {
        demoUtils.initDemo();
      });
    }
    
    // Initialize analytics if enabled
    if (config.features.enableAnalytics) {
      console.log('📊 Analytics enabled');
      // Initialize analytics here (Google Analytics, Mixpanel, etc.)
    }
    
    // Initialize error reporting if enabled
    if (config.features.enableErrorReporting) {
      console.log('🚨 Error reporting enabled');
      // Initialize error reporting here (Sentry, LogRocket, etc.)
    }
  }
  
  return config;
};

export default ENV_CONFIG;
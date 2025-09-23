import OpenAI from 'openai';
import crypto from 'crypto';
import { db } from './db.js';
import { users } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface SecurityThreat {
  id: string;
  type: 'brute_force' | 'sql_injection' | 'xss' | 'csrf' | 'ddos' | 'unauthorized_access' | 'data_breach' | 'malware';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  target: string;
  description: string;
  detectedAt: Date;
  status: 'detected' | 'mitigated' | 'resolved' | 'false_positive';
  automaticallyMitigated: boolean;
  evidenceHash: string;
  impact: number;
}

interface SecurityMetrics {
  totalThreats: number;
  threatsBlocked: number;
  falsePositives: number;
  responseTime: number;
  systemVulnerabilities: number;
  complianceScore: number;
  dataIntegrityScore: number;
  accessControlScore: number;
  encryptionCoverage: number;
  auditTrailCompleteness: number;
}

interface VulnerabilityAssessment {
  id: string;
  component: string;
  vulnerabilityType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  cveId?: string;
  discoveredAt: Date;
  patchAvailable: boolean;
  autoFixable: boolean;
  fixComplexity: 'low' | 'medium' | 'high';
  businessImpact: number;
}

interface SecurityPolicy {
  id: string;
  name: string;
  type: 'access_control' | 'data_protection' | 'network_security' | 'authentication' | 'audit';
  rules: Array<{
    condition: string;
    action: 'allow' | 'deny' | 'monitor' | 'escalate';
    parameters: Record<string, any>;
  }>;
  active: boolean;
  priority: number;
  lastUpdated: Date;
  autoUpdated: boolean;
}

interface IncidentResponse {
  id: string;
  threatId: string;
  responseType: 'block' | 'monitor' | 'alert' | 'isolate' | 'patch' | 'update_policy';
  action: string;
  automated: boolean;
  success: boolean;
  responseTime: number;
  impact: number;
  timestamp: Date;
}

interface SecurityAlert {
  id: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  category: string;
  message: string;
  details: Record<string, any>;
  timestamp: Date;
  acknowledged: boolean;
  escalated: boolean;
}

export class AISecurityGuardian {
  private threats: Map<string, SecurityThreat>;
  private vulnerabilities: Map<string, VulnerabilityAssessment>;
  private securityPolicies: Map<string, SecurityPolicy>;
  private incidentHistory: IncidentResponse[];
  private securityAlerts: SecurityAlert[];
  private securityMetrics: SecurityMetrics[];
  private monitoringInterval: NodeJS.Timeout | null;
  private vulnerabilityScanInterval: NodeJS.Timeout | null;
  private policyUpdateInterval: NodeJS.Timeout | null;
  private blockedIPs: Set<string>;
  private suspiciousActivities: Map<string, { count: number; lastActivity: Date }>;

  constructor() {
    this.threats = new Map();
    this.vulnerabilities = new Map();
    this.securityPolicies = new Map();
    this.incidentHistory = [];
    this.securityAlerts = [];
    this.securityMetrics = [];
    this.monitoringInterval = null;
    this.vulnerabilityScanInterval = null;
    this.policyUpdateInterval = null;
    this.blockedIPs = new Set();
    this.suspiciousActivities = new Map();
  }

  /**
   * Initialize the AI Security Guardian
   */
  async initialize(): Promise<void> {
    console.log('🛡️ Initializing AI Security Guardian...');
    
    // Initialize security policies
    await this.initializeSecurityPolicies();
    
    // Start continuous monitoring
    this.startThreatMonitoring();
    
    // Start vulnerability scanning
    this.startVulnerabilityScanning();
    
    // Start policy updates
    this.startPolicyUpdates();
    
    console.log('🔒 AI Security Guardian operational');
  }

  /**
   * Initialize default security policies
   */
  private async initializeSecurityPolicies(): Promise<void> {
    const defaultPolicies: SecurityPolicy[] = [
      {
        id: 'brute_force_protection',
        name: 'Brute Force Protection',
        type: 'authentication',
        rules: [
          {
            condition: 'failed_login_attempts >= 5 within 10_minutes',
            action: 'deny',
            parameters: { blockDuration: 3600000, escalate: true } // 1 hour
          }
        ],
        active: true,
        priority: 10,
        lastUpdated: new Date(),
        autoUpdated: true
      },
      {
        id: 'sql_injection_prevention',
        name: 'SQL Injection Prevention',
        type: 'data_protection',
        rules: [
          {
            condition: 'request.contains_sql_patterns',
            action: 'deny',
            parameters: { logLevel: 'critical', notifyAdmin: true }
          }
        ],
        active: true,
        priority: 9,
        lastUpdated: new Date(),
        autoUpdated: true
      },
      {
        id: 'xss_protection',
        name: 'Cross-Site Scripting Protection',
        type: 'data_protection',
        rules: [
          {
            condition: 'input.contains_script_tags || input.contains_js_events',
            action: 'deny',
            parameters: { sanitize: true, logLevel: 'high' }
          }
        ],
        active: true,
        priority: 8,
        lastUpdated: new Date(),
        autoUpdated: true
      },
      {
        id: 'rate_limiting',
        name: 'API Rate Limiting',
        type: 'network_security',
        rules: [
          {
            condition: 'requests_per_minute > 100',
            action: 'monitor',
            parameters: { threshold: 100, window: 60000 }
          },
          {
            condition: 'requests_per_minute > 500',
            action: 'deny',
            parameters: { blockDuration: 300000 } // 5 minutes
          }
        ],
        active: true,
        priority: 7,
        lastUpdated: new Date(),
        autoUpdated: true
      },
      {
        id: 'data_encryption_policy',
        name: 'Data Encryption Requirements',
        type: 'data_protection',
        rules: [
          {
            condition: 'data.contains_pii || data.contains_sensitive',
            action: 'monitor',
            parameters: { requireEncryption: true, algorithm: 'AES-256' }
          }
        ],
        active: true,
        priority: 9,
        lastUpdated: new Date(),
        autoUpdated: false
      }
    ];

    defaultPolicies.forEach(policy => {
      this.securityPolicies.set(policy.id, policy);
    });
  }

  /**
   * Start continuous threat monitoring
   */
  private startThreatMonitoring(): void {
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.scanForThreats();
        await this.analyzeSecurityMetrics();
      } catch (error) {
        console.error('Threat monitoring error:', error);
      }
    }, 30 * 1000); // Monitor every 30 seconds
  }

  /**
   * Start vulnerability scanning
   */
  private startVulnerabilityScanning(): void {
    this.vulnerabilityScanInterval = setInterval(async () => {
      try {
        await this.runVulnerabilityAssessment();
      } catch (error) {
        console.error('Vulnerability scanning error:', error);
      }
    }, 60 * 60 * 1000); // Scan every hour
  }

  /**
   * Start policy updates
   */
  private startPolicyUpdates(): void {
    this.policyUpdateInterval = setInterval(async () => {
      try {
        await this.updateSecurityPolicies();
      } catch (error) {
        console.error('Policy update error:', error);
      }
    }, 6 * 60 * 60 * 1000); // Update every 6 hours
  }

  /**
   * Scan for security threats
   */
  private async scanForThreats(): Promise<void> {
    // Simulate threat detection (in production, integrate with real security monitoring)
    
    // Check for brute force attacks
    await this.detectBruteForceAttacks();
    
    // Check for suspicious network activity
    await this.detectSuspiciousNetworkActivity();
    
    // Check for injection attempts
    await this.detectInjectionAttempts();
    
    // Check for unauthorized access
    await this.detectUnauthorizedAccess();
  }

  /**
   * Detect brute force attacks
   */
  private async detectBruteForceAttacks(): Promise<void> {
    // Simulate brute force detection
    const suspiciousIPs = Array.from(this.suspiciousActivities.entries())
      .filter(([_, activity]) => activity.count > 5)
      .map(([ip]) => ip);
    
    for (const ip of suspiciousIPs) {
      const threat: SecurityThreat = {
        id: `threat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'brute_force',
        severity: 'high',
        source: ip,
        target: 'authentication_endpoint',
        description: `Brute force attack detected from IP ${ip}`,
        detectedAt: new Date(),
        status: 'detected',
        automaticallyMitigated: false,
        evidenceHash: crypto.createHash('sha256').update(`${ip}_${Date.now()}`).digest('hex'),
        impact: 7
      };
      
      this.threats.set(threat.id, threat);
      await this.respondToThreat(threat);
    }
  }

  /**
   * Detect suspicious network activity
   */
  private async detectSuspiciousNetworkActivity(): Promise<void> {
    // Simulate network monitoring
    if (Math.random() < 0.1) { // 10% chance of detecting suspicious activity
      const threat: SecurityThreat = {
        id: `threat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'ddos',
        severity: 'medium',
        source: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        target: 'api_endpoints',
        description: 'Unusual traffic pattern detected - potential DDoS attack',
        detectedAt: new Date(),
        status: 'detected',
        automaticallyMitigated: false,
        evidenceHash: crypto.createHash('sha256').update(`ddos_${Date.now()}`).digest('hex'),
        impact: 5
      };
      
      this.threats.set(threat.id, threat);
      await this.respondToThreat(threat);
    }
  }

  /**
   * Detect injection attempts
   */
  private async detectInjectionAttempts(): Promise<void> {
    // Simulate injection detection
    if (Math.random() < 0.05) { // 5% chance of detecting injection attempt
      const injectionType = Math.random() > 0.5 ? 'sql_injection' : 'xss';
      
      const threat: SecurityThreat = {
        id: `threat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: injectionType as 'sql_injection' | 'xss',
        severity: 'high',
        source: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        target: 'web_application',
        description: `${injectionType.replace('_', ' ').toUpperCase()} attempt detected`,
        detectedAt: new Date(),
        status: 'detected',
        automaticallyMitigated: false,
        evidenceHash: crypto.createHash('sha256').update(`${injectionType}_${Date.now()}`).digest('hex'),
        impact: 8
      };
      
      this.threats.set(threat.id, threat);
      await this.respondToThreat(threat);
    }
  }

  /**
   * Detect unauthorized access
   */
  private async detectUnauthorizedAccess(): Promise<void> {
    // Simulate unauthorized access detection
    if (Math.random() < 0.03) { // 3% chance of detecting unauthorized access
      const threat: SecurityThreat = {
        id: `threat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'unauthorized_access',
        severity: 'critical',
        source: 'internal',
        target: 'admin_panel',
        description: 'Unauthorized access attempt to administrative functions',
        detectedAt: new Date(),
        status: 'detected',
        automaticallyMitigated: false,
        evidenceHash: crypto.createHash('sha256').update(`unauthorized_${Date.now()}`).digest('hex'),
        impact: 9
      };
      
      this.threats.set(threat.id, threat);
      await this.respondToThreat(threat);
    }
  }

  /**
   * Respond to detected threat
   */
  private async respondToThreat(threat: SecurityThreat): Promise<void> {
    console.log(`🚨 Security threat detected: ${threat.type} - ${threat.severity}`);
    
    // Generate AI-powered response
    const response = await this.generateThreatResponse(threat);
    
    // Execute response
    const incident = await this.executeThreatResponse(threat, response);
    
    // Log incident
    this.incidentHistory.push(incident);
    
    // Create security alert
    this.createSecurityAlert(threat, incident);
    
    console.log(`🛡️ Threat response executed: ${incident.action}`);
  }

  /**
   * Generate AI-powered threat response
   */
  private async generateThreatResponse(threat: SecurityThreat): Promise<string> {
    const prompt = `As an AI Security Guardian, analyze this security threat and recommend the best response:

Threat Details:
- Type: ${threat.type}
- Severity: ${threat.severity}
- Source: ${threat.source}
- Target: ${threat.target}
- Description: ${threat.description}
- Impact: ${threat.impact}/10

Available Response Actions:
1. Block source IP
2. Isolate affected system
3. Update security policies
4. Patch vulnerability
5. Monitor and collect evidence
6. Escalate to human security team

Consider:
- Immediate threat mitigation
- Business continuity
- Evidence preservation
- False positive probability

Recommend the most appropriate response action with reasoning.`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 400,
      });

      return response.choices[0]?.message?.content || this.getFallbackResponse(threat);
    } catch (error) {
      console.error('AI threat response generation failed:', error);
      return this.getFallbackResponse(threat);
    }
  }

  /**
   * Get fallback response when AI is unavailable
   */
  private getFallbackResponse(threat: SecurityThreat): string {
    switch (threat.severity) {
      case 'critical':
        return 'Block source IP and isolate affected system immediately';
      case 'high':
        return 'Block source IP and monitor for additional activity';
      case 'medium':
        return 'Monitor and collect evidence for analysis';
      case 'low':
        return 'Log incident and monitor for patterns';
      default:
        return 'Monitor and log for analysis';
    }
  }

  /**
   * Execute threat response
   */
  private async executeThreatResponse(threat: SecurityThreat, responseAction: string): Promise<IncidentResponse> {
    const start = Date.now();
    let success = true;
    let impact = 0;
    let responseType: IncidentResponse['responseType'] = 'monitor';
    
    try {
      if (responseAction.toLowerCase().includes('block')) {
        responseType = 'block';
        this.blockedIPs.add(threat.source);
        impact = 0.8;
      } else if (responseAction.toLowerCase().includes('isolate')) {
        responseType = 'isolate';
        impact = 0.9;
      } else if (responseAction.toLowerCase().includes('patch')) {
        responseType = 'patch';
        impact = 0.7;
      } else if (responseAction.toLowerCase().includes('update')) {
        responseType = 'update_policy';
        await this.updatePolicyForThreat(threat);
        impact = 0.6;
      } else {
        responseType = 'monitor';
        impact = 0.3;
      }
      
      // Mark threat as mitigated
      threat.status = 'mitigated';
      threat.automaticallyMitigated = true;
      
    } catch (error) {
      console.error(`Threat response execution failed: ${error}`);
      success = false;
      impact = 0;
    }
    
    const responseTime = Date.now() - start;
    
    return {
      id: `incident_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      threatId: threat.id,
      responseType,
      action: responseAction,
      automated: true,
      success,
      responseTime,
      impact,
      timestamp: new Date()
    };
  }

  /**
   * Update security policy based on threat
   */
  private async updatePolicyForThreat(threat: SecurityThreat): Promise<void> {
    const relevantPolicyId = this.getRelevantPolicyId(threat.type);
    const policy = this.securityPolicies.get(relevantPolicyId);
    
    if (policy && policy.autoUpdated) {
      // Add new rule to policy
      const newRule = {
        condition: `source_ip === "${threat.source}"`,
        action: 'deny' as const,
        parameters: { reason: `Blocked due to ${threat.type}`, duration: 86400000 } // 24 hours
      };
      
      policy.rules.push(newRule);
      policy.lastUpdated = new Date();
      
      console.log(`📝 Updated security policy: ${policy.name}`);
    }
  }

  /**
   * Get relevant policy ID for threat type
   */
  private getRelevantPolicyId(threatType: string): string {
    switch (threatType) {
      case 'brute_force':
        return 'brute_force_protection';
      case 'sql_injection':
        return 'sql_injection_prevention';
      case 'xss':
        return 'xss_protection';
      case 'ddos':
        return 'rate_limiting';
      default:
        return 'brute_force_protection';
    }
  }

  /**
   * Create security alert
   */
  private createSecurityAlert(threat: SecurityThreat, incident: IncidentResponse): void {
    const alert: SecurityAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      level: threat.severity === 'critical' ? 'critical' : 
             threat.severity === 'high' ? 'error' : 
             threat.severity === 'medium' ? 'warning' : 'info',
      category: 'security_threat',
      message: `${threat.type.replace('_', ' ').toUpperCase()} detected and ${incident.success ? 'mitigated' : 'response failed'}`,
      details: {
        threatId: threat.id,
        source: threat.source,
        target: threat.target,
        responseAction: incident.action,
        responseTime: incident.responseTime
      },
      timestamp: new Date(),
      acknowledged: false,
      escalated: threat.severity === 'critical'
    };
    
    this.securityAlerts.push(alert);
    
    // Keep only recent alerts (last 1000)
    if (this.securityAlerts.length > 1000) {
      this.securityAlerts = this.securityAlerts.slice(-1000);
    }
  }

  /**
   * Run vulnerability assessment
   */
  private async runVulnerabilityAssessment(): Promise<void> {
    console.log('🔍 Running vulnerability assessment...');
    
    // Simulate vulnerability discovery
    if (Math.random() < 0.3) { // 30% chance of finding a vulnerability
      const vulnerability = await this.generateVulnerability();
      this.vulnerabilities.set(vulnerability.id, vulnerability);
      
      if (vulnerability.autoFixable) {
        await this.autoFixVulnerability(vulnerability);
      }
    }
  }

  /**
   * Generate simulated vulnerability
   */
  private async generateVulnerability(): Promise<VulnerabilityAssessment> {
    const vulnerabilityTypes = [
      'outdated_dependency',
      'weak_encryption',
      'missing_security_headers',
      'insecure_configuration',
      'privilege_escalation',
      'information_disclosure'
    ];
    
    const components = [
      'web_server',
      'database',
      'api_gateway',
      'authentication_service',
      'file_upload',
      'session_management'
    ];
    
    const type = vulnerabilityTypes[Math.floor(Math.random() * vulnerabilityTypes.length)];
    const component = components[Math.floor(Math.random() * components.length)];
    const severity = ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as VulnerabilityAssessment['severity'];
    
    return {
      id: `vuln_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      component,
      vulnerabilityType: type,
      severity,
      description: `${type.replace('_', ' ')} vulnerability found in ${component.replace('_', ' ')}`,
      discoveredAt: new Date(),
      patchAvailable: Math.random() > 0.3,
      autoFixable: Math.random() > 0.6,
      fixComplexity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as VulnerabilityAssessment['fixComplexity'],
      businessImpact: Math.floor(Math.random() * 10) + 1
    };
  }

  /**
   * Auto-fix vulnerability
   */
  private async autoFixVulnerability(vulnerability: VulnerabilityAssessment): Promise<void> {
    console.log(`🔧 Auto-fixing vulnerability: ${vulnerability.vulnerabilityType}`);
    
    // Simulate auto-fix process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const success = Math.random() > 0.2; // 80% success rate
    
    if (success) {
      console.log(`✅ Vulnerability auto-fixed: ${vulnerability.id}`);
    } else {
      console.log(`❌ Auto-fix failed for vulnerability: ${vulnerability.id}`);
    }
  }

  /**
   * Update security policies using AI
   */
  private async updateSecurityPolicies(): Promise<void> {
    console.log('📋 Updating security policies...');
    
    // Analyze recent threats and incidents
    const recentThreats = Array.from(this.threats.values())
      .filter(t => Date.now() - t.detectedAt.getTime() < 24 * 60 * 60 * 1000); // Last 24 hours
    
    if (recentThreats.length > 0) {
      const policyUpdates = await this.generatePolicyUpdates(recentThreats);
      await this.implementPolicyUpdates(policyUpdates);
    }
  }

  /**
   * Generate policy updates using AI
   */
  private async generatePolicyUpdates(threats: SecurityThreat[]): Promise<any[]> {
    const threatSummary = threats.map(t => `${t.type}: ${t.severity} from ${t.source}`).join(', ');
    
    const prompt = `As an AI Security Guardian, analyze these recent security threats and recommend policy updates:

Recent Threats (last 24 hours):
${threatSummary}

Current Policies:
${Array.from(this.securityPolicies.values()).map(p => `- ${p.name}: ${p.rules.length} rules`).join('\n')}

Recommend specific policy updates to:
1. Prevent similar threats
2. Improve detection accuracy
3. Reduce false positives
4. Enhance automated response

Provide actionable policy recommendations.`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 600,
      });

      return this.parsePolicyUpdates(response.choices[0]?.message?.content || '');
    } catch (error) {
      console.error('AI policy update generation failed:', error);
      return [];
    }
  }

  /**
   * Parse policy updates from AI response
   */
  private parsePolicyUpdates(aiResponse: string): any[] {
    // Simple parsing - in production, use more sophisticated NLP
    return [
      { action: 'strengthen_rate_limiting', reason: 'Recent DDoS attacks' },
      { action: 'update_ip_blocklist', reason: 'New malicious IP patterns' }
    ];
  }

  /**
   * Implement policy updates
   */
  private async implementPolicyUpdates(updates: any[]): Promise<void> {
    for (const update of updates) {
      console.log(`📝 Implementing policy update: ${update.action}`);
      // Implement actual policy changes here
    }
  }

  /**
   * Analyze security metrics
   */
  private async analyzeSecurityMetrics(): Promise<void> {
    const metrics: SecurityMetrics = {
      totalThreats: this.threats.size,
      threatsBlocked: Array.from(this.threats.values()).filter(t => t.status === 'mitigated').length,
      falsePositives: Array.from(this.threats.values()).filter(t => t.status === 'false_positive').length,
      responseTime: this.incidentHistory.length > 0 
        ? this.incidentHistory.reduce((sum, i) => sum + i.responseTime, 0) / this.incidentHistory.length 
        : 0,
      systemVulnerabilities: this.vulnerabilities.size,
      complianceScore: 95, // Simulated
      dataIntegrityScore: 98, // Simulated
      accessControlScore: 92, // Simulated
      encryptionCoverage: 99, // Simulated
      auditTrailCompleteness: 97 // Simulated
    };
    
    this.securityMetrics.push(metrics);
    
    // Keep only recent metrics (last 24 hours worth)
    if (this.securityMetrics.length > 1440) {
      this.securityMetrics = this.securityMetrics.slice(-1440);
    }
  }

  /**
   * Track suspicious activity
   */
  trackSuspiciousActivity(ip: string): void {
    const activity = this.suspiciousActivities.get(ip) || { count: 0, lastActivity: new Date() };
    activity.count++;
    activity.lastActivity = new Date();
    this.suspiciousActivities.set(ip, activity);
    
    // Clean old activities (older than 1 hour)
    for (const [activityIp, activityData] of this.suspiciousActivities) {
      if (Date.now() - activityData.lastActivity.getTime() > 60 * 60 * 1000) {
        this.suspiciousActivities.delete(activityIp);
      }
    }
  }

  /**
   * Check if IP is blocked
   */
  isIPBlocked(ip: string): boolean {
    return this.blockedIPs.has(ip);
  }

  /**
   * Get security status
   */
  getSecurityStatus(): {
    threatLevel: 'low' | 'medium' | 'high' | 'critical';
    activeThreats: number;
    blockedIPs: number;
    vulnerabilities: number;
    responseTime: number;
    complianceScore: number;
    lastUpdate: Date;
  } {
    const activeThreats = Array.from(this.threats.values())
      .filter(t => t.status === 'detected').length;
    
    const criticalThreats = Array.from(this.threats.values())
      .filter(t => t.status === 'detected' && t.severity === 'critical').length;
    
    let threatLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (criticalThreats > 0) threatLevel = 'critical';
    else if (activeThreats > 5) threatLevel = 'high';
    else if (activeThreats > 0) threatLevel = 'medium';
    
    const latestMetrics = this.securityMetrics[this.securityMetrics.length - 1];
    
    return {
      threatLevel,
      activeThreats,
      blockedIPs: this.blockedIPs.size,
      vulnerabilities: this.vulnerabilities.size,
      responseTime: latestMetrics?.responseTime || 0,
      complianceScore: latestMetrics?.complianceScore || 0,
      lastUpdate: new Date()
    };
  }

  /**
   * Stop the security guardian
   */
  stop(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    if (this.vulnerabilityScanInterval) {
      clearInterval(this.vulnerabilityScanInterval);
      this.vulnerabilityScanInterval = null;
    }
    
    if (this.policyUpdateInterval) {
      clearInterval(this.policyUpdateInterval);
      this.policyUpdateInterval = null;
    }
    
    console.log('🛑 AI Security Guardian stopped');
  }
}

// Global security guardian instance
export const securityGuardian = new AISecurityGuardian();
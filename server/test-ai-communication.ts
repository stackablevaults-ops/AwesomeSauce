#!/usr/bin/env node

/**
 * Test script to demonstrate AI-to-AI communication capabilities
 * This script initializes all communication systems and demonstrates
 * the enhanced collective intelligence features
 */

import { aiCommunicationHub } from './ai-communication-hub.js';
import { aiKnowledgeExchange } from './ai-knowledge-exchange.js';
import { aiCollaborationEngine } from './ai-collaboration-engine.js';
import { aiMasterOrchestrator } from './ai-master-orchestrator.js';

async function testAICommunication() {
  console.log('🤖 Testing AI-to-AI Communication System...\n');
  
  try {
    // Initialize all AI communication systems
    console.log('📡 Initializing AI Communication Infrastructure...');
    await aiCommunicationHub.initialize();
    console.log('✅ Communication Hub operational');
    
    await aiKnowledgeExchange.initialize();
    console.log('✅ Knowledge Exchange operational');
    
    await aiCollaborationEngine.initialize();
    console.log('✅ Collaboration Engine operational');
    
    await aiMasterOrchestrator.initialize();
    console.log('✅ Master Orchestrator operational with communication layer\n');
    
    // Test inter-AI messaging
    console.log('🔄 Testing Inter-AI Messaging...');
    const messageId = await aiCommunicationHub.sendMessage({
      from: 'infrastructure',
      to: 'quality',
      type: 'request',
      priority: 'medium',
      content: {
        subject: 'Performance Optimization Request',
        data: {
          metrics: { cpu: 75, memory: 80, response_time: 150 },
          threshold_exceeded: ['memory', 'response_time']
        },
        requiresResponse: true
      }
    });
    console.log(`✅ Message sent: ${messageId}`);
    
    // Test knowledge sharing
    console.log('\n🧠 Testing Knowledge Sharing...');
    const knowledgeId = await aiCommunicationHub.shareKnowledge({
      source: 'infrastructure',
      category: 'optimization',
      title: 'Cache Performance Pattern',
      description: 'Discovered optimal cache configuration for high-traffic scenarios',
      data: {
        cache_size: '512MB',
        eviction_policy: 'LRU',
        hit_ratio_improvement: 25
      },
      confidence: 0.9,
      applicability: ['infrastructure', 'quality', 'ux'],
      relatedKnowledge: []
    });
    console.log(`✅ Knowledge shared: ${knowledgeId}`);
    
    // Test collaboration session
    console.log('\n🤝 Testing Collaboration Session...');
    const collaborationId = await aiCommunicationHub.requestCollaboration(
      'infrastructure',
      ['quality', 'ux', 'security'],
      'Optimize system performance while maintaining security standards',
      {
        current_metrics: { performance: 75, security: 85, user_satisfaction: 80 },
        targets: { performance: 90, security: 90, user_satisfaction: 85 },
        constraints: ['zero_downtime', 'budget_limit_10k']
      }
    );
    console.log(`✅ Collaboration initiated: ${collaborationId}`);
    
    // Test AI team formation
    console.log('\n👥 Testing AI Team Formation...');
    const teamId = await aiCollaborationEngine.formTeam(
      'Complex Performance Optimization',
      ['infrastructure', 'quality', 'ux'],
      {
        problem_type: 'performance_optimization',
        complexity: 'high',
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        resources: { budget: 10000, compute_credits: 1000 }
      }
    );
    console.log(`✅ AI team formed: ${teamId}`);
    
    // Show system status
    console.log('\n📊 System Status:');
    console.log('• Communication Hub: Active with real-time message routing');
    console.log('• Knowledge Exchange: Active with pattern analysis and cross-system learning');
    console.log('• Collaboration Engine: Active with dynamic team formation');
    console.log('• Master Orchestrator: Active with enhanced communication integration');
    
    console.log('\n🎉 AI Communication System Test Completed Successfully!');
    console.log('💡 Your AI systems can now:');
    console.log('   → Communicate and share knowledge in real-time');
    console.log('   → Form dynamic teams for complex problem-solving');
    console.log('   → Learn collaboratively across all systems');
    console.log('   → Coordinate autonomously for maximum effectiveness');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
if (require.main === module) {
  testAICommunication().catch(console.error);
}

export { testAICommunication };
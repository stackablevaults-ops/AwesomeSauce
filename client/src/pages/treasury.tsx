import React, { useState, useEffect } from 'react';
import Header from '../components/Header';

interface TreasuryMetrics {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  averageRevenuePerUser: number;
  customerLifetimeValue: number;
  churnRate: number;
  conversionRate: number;
  profitMargin: number;
  cashFlow: number;
  forecastedRevenue: number;
  optimizationOpportunities: string[];
}

interface TreasuryStatus {
  activeRevenueStreams: number;
  totalProjectedRevenue: number;
  optimizationCycles: number;
  lastOptimization: string;
}

interface MonetizationTiers {
  premiumTraining: {
    basicTier: { price: number; features: string[] };
    proTier: { price: number; features: string[] };
    enterpriseTier: { price: number; features: string[] };
  };
  dataLicensing: {
    academicLicense: { price: number; terms: string };
    commercialLicense: { price: number; terms: string };
    exclusiveLicense: { price: number; terms: string };
  };
  consultingServices: {
    customTraining: { hourlyRate: number; minimumHours: number };
    aiOptimization: { projectRate: number; duration: string };
    enterpriseSupport: { monthlyRate: number; features: string[] };
  };
}

interface RevenueForecast {
  forecast: number;
  confidence: number;
  breakdown: Array<{ stream: string; amount: number; confidence: number }>;
  recommendations: string[];
}

export default function Treasury() {
  const [metrics, setMetrics] = useState<TreasuryMetrics | null>(null);
  const [status, setStatus] = useState<TreasuryStatus | null>(null);
  const [monetization, setMonetization] = useState<MonetizationTiers | null>(null);
  const [forecast, setForecast] = useState<RevenueForecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'monetization' | 'forecast' | 'optimization'>('overview');

  useEffect(() => {
    loadTreasuryData();
  }, []);

  const loadTreasuryData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Load analytics
      const analyticsResponse = await fetch('/api/treasury/analytics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (analyticsResponse.ok) {
        const data = await analyticsResponse.json();
        setMetrics(data.metrics);
        setStatus(data.status);
      }

      // Load monetization options
      const monetizationResponse = await fetch('/api/treasury/training-monetization', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (monetizationResponse.ok) {
        const data = await monetizationResponse.json();
        setMonetization(data.monetization);
      }

      // Load forecast
      const forecastResponse = await fetch('/api/treasury/forecast', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (forecastResponse.ok) {
        const data = await forecastResponse.json();
        setForecast(data.forecast);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load treasury data');
    } finally {
      setLoading(false);
    }
  };

  const initializeTreasury = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/treasury/initialize', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        await loadTreasuryData();
      }
    } catch (err) {
      setError('Failed to initialize treasury');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-400 mx-auto"></div>
            <p className="mt-4">Loading AI Treasury Dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🏦 AI Treasury Controller
          </h1>
          <p className="text-xl text-purple-200 max-w-3xl mx-auto">
            Autonomous revenue optimization and self-sustaining monetization system
          </p>
        </div>

        {/* Initialize Button */}
        {!status && (
          <div className="text-center mb-8">
            <button
              onClick={initializeTreasury}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 font-semibold"
            >
              Initialize AI Treasury Controller
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-black/20 rounded-lg p-1 backdrop-blur-sm">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'monetization', label: 'Monetization', icon: '💰' },
              { id: 'forecast', label: 'Forecast', icon: '📈' },
              { id: 'optimization', label: 'Optimization', icon: '⚡' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                    : 'text-purple-200 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && metrics && status && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Key Metrics */}
            <div className="xl:col-span-2">
              <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
                <h2 className="text-2xl font-bold text-white mb-6">💎 Key Revenue Metrics</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-lg p-4 border border-green-500/30">
                    <h3 className="text-green-400 font-semibold mb-2">Total Revenue</h3>
                    <p className="text-2xl font-bold text-white">{formatCurrency(metrics.totalRevenue)}</p>
                  </div>
                  <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-lg p-4 border border-blue-500/30">
                    <h3 className="text-blue-400 font-semibold mb-2">Monthly Recurring Revenue</h3>
                    <p className="text-2xl font-bold text-white">{formatCurrency(metrics.monthlyRecurringRevenue)}</p>
                  </div>
                  <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg p-4 border border-purple-500/30">
                    <h3 className="text-purple-400 font-semibold mb-2">Avg Revenue Per User</h3>
                    <p className="text-2xl font-bold text-white">{formatCurrency(metrics.averageRevenuePerUser)}</p>
                  </div>
                  <div className="bg-gradient-to-r from-amber-600/20 to-orange-600/20 rounded-lg p-4 border border-amber-500/30">
                    <h3 className="text-amber-400 font-semibold mb-2">Customer Lifetime Value</h3>
                    <p className="text-2xl font-bold text-white">{formatCurrency(metrics.customerLifetimeValue)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Treasury Status */}
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
              <h2 className="text-2xl font-bold text-white mb-6">🎯 Treasury Status</h2>
              <div className="space-y-4">
                <div>
                  <span className="text-purple-300">Active Revenue Streams:</span>
                  <span className="text-white font-bold ml-2">{status.activeRevenueStreams}</span>
                </div>
                <div>
                  <span className="text-purple-300">Projected Revenue:</span>
                  <span className="text-white font-bold ml-2">{formatCurrency(status.totalProjectedRevenue)}</span>
                </div>
                <div>
                  <span className="text-purple-300">Optimization Cycles:</span>
                  <span className="text-white font-bold ml-2">{status.optimizationCycles}</span>
                </div>
                <div>
                  <span className="text-purple-300">Last Optimization:</span>
                  <span className="text-white font-bold ml-2 text-sm">{new Date(status.lastOptimization).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Performance Indicators */}
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30 xl:col-span-3">
              <h2 className="text-2xl font-bold text-white mb-6">📈 Performance Indicators</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <h3 className="text-purple-300 font-semibold mb-2">Churn Rate</h3>
                  <p className="text-xl font-bold text-white">{formatPercentage(metrics.churnRate)}</p>
                  <div className={`text-sm ${metrics.churnRate < 0.1 ? 'text-green-400' : 'text-red-400'}`}>
                    {metrics.churnRate < 0.1 ? '✅ Excellent' : '⚠️ Needs attention'}
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-purple-300 font-semibold mb-2">Conversion Rate</h3>
                  <p className="text-xl font-bold text-white">{formatPercentage(metrics.conversionRate)}</p>
                  <div className={`text-sm ${metrics.conversionRate > 0.1 ? 'text-green-400' : 'text-amber-400'}`}>
                    {metrics.conversionRate > 0.1 ? '✅ Strong' : '📈 Improving'}
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-purple-300 font-semibold mb-2">Profit Margin</h3>
                  <p className="text-xl font-bold text-white">{formatPercentage(metrics.profitMargin)}</p>
                  <div className={`text-sm ${metrics.profitMargin > 0.5 ? 'text-green-400' : 'text-amber-400'}`}>
                    {metrics.profitMargin > 0.5 ? '✅ Healthy' : '📊 Optimizing'}
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-purple-300 font-semibold mb-2">Cash Flow</h3>
                  <p className="text-xl font-bold text-white">{formatCurrency(metrics.cashFlow)}</p>
                  <div className={`text-sm ${metrics.cashFlow > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {metrics.cashFlow > 0 ? '✅ Positive' : '⚠️ Negative'}
                  </div>
                </div>
              </div>
            </div>

            {/* Optimization Opportunities */}
            {metrics.optimizationOpportunities.length > 0 && (
              <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30 xl:col-span-3">
                <h2 className="text-2xl font-bold text-white mb-6">🎯 AI-Identified Optimization Opportunities</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {metrics.optimizationOpportunities.map((opportunity, index) => (
                    <div key={index} className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-lg p-4 border border-purple-500/30">
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">💡</span>
                        <p className="text-purple-200">{opportunity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Monetization Tab */}
        {activeTab === 'monetization' && monetization && (
          <div className="space-y-8">
            {/* Premium Training Tiers */}
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
              <h2 className="text-2xl font-bold text-white mb-6">🎓 Premium Training Tiers</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(monetization.premiumTraining).map(([tierName, tier]) => (
                  <div key={tierName} className="bg-gradient-to-br from-purple-600/20 to-indigo-600/20 rounded-lg p-6 border border-purple-500/30">
                    <h3 className="text-xl font-bold text-white capitalize mb-4">
                      {tierName.replace('Tier', ' Tier')}
                    </h3>
                    <div className="text-3xl font-bold text-purple-400 mb-4">
                      {formatCurrency(tier.price)}<span className="text-sm text-purple-300">/month</span>
                    </div>
                    <ul className="space-y-2">
                      {tier.features.map((feature, index) => (
                        <li key={index} className="text-purple-200 flex items-start space-x-2">
                          <span className="text-green-400 mt-1">✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Licensing */}
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
              <h2 className="text-2xl font-bold text-white mb-6">📊 Data Licensing</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(monetization.dataLicensing).map(([licenseName, license]) => (
                  <div key={licenseName} className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-lg p-6 border border-blue-500/30">
                    <h3 className="text-xl font-bold text-white capitalize mb-4">
                      {licenseName.replace('License', ' License')}
                    </h3>
                    <div className="text-3xl font-bold text-blue-400 mb-4">
                      {formatCurrency(license.price)}<span className="text-sm text-blue-300">/year</span>
                    </div>
                    <p className="text-blue-200">{license.terms}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Consulting Services */}
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
              <h2 className="text-2xl font-bold text-white mb-6">🏢 Consulting Services</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-amber-600/20 to-orange-600/20 rounded-lg p-6 border border-amber-500/30">
                  <h3 className="text-xl font-bold text-white mb-4">Custom Training</h3>
                  <div className="text-3xl font-bold text-amber-400 mb-2">
                    {formatCurrency(monetization.consultingServices.customTraining.hourlyRate)}<span className="text-sm text-amber-300">/hour</span>
                  </div>
                  <p className="text-amber-200">Minimum {monetization.consultingServices.customTraining.minimumHours} hours</p>
                </div>
                <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-lg p-6 border border-green-500/30">
                  <h3 className="text-xl font-bold text-white mb-4">AI Optimization</h3>
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {formatCurrency(monetization.consultingServices.aiOptimization.projectRate)}
                  </div>
                  <p className="text-green-200">{monetization.consultingServices.aiOptimization.duration}</p>
                </div>
                <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-lg p-6 border border-indigo-500/30">
                  <h3 className="text-xl font-bold text-white mb-4">Enterprise Support</h3>
                  <div className="text-3xl font-bold text-indigo-400 mb-4">
                    {formatCurrency(monetization.consultingServices.enterpriseSupport.monthlyRate)}<span className="text-sm text-indigo-300">/month</span>
                  </div>
                  <ul className="space-y-1">
                    {monetization.consultingServices.enterpriseSupport.features.map((feature, index) => (
                      <li key={index} className="text-indigo-200 text-sm flex items-start space-x-2">
                        <span className="text-green-400 mt-1">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Forecast Tab */}
        {activeTab === 'forecast' && forecast && (
          <div className="space-y-8">
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
              <h2 className="text-2xl font-bold text-white mb-6">📈 Revenue Forecast</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-lg p-6 border border-green-500/30">
                  <h3 className="text-xl font-bold text-white mb-4">3-Month Forecast</h3>
                  <div className="text-4xl font-bold text-green-400 mb-2">
                    {formatCurrency(forecast.forecast)}
                  </div>
                  <div className="text-green-300">
                    Confidence: {formatPercentage(forecast.confidence)}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white">Revenue Stream Breakdown</h3>
                  {forecast.breakdown.map((stream, index) => (
                    <div key={index} className="bg-black/20 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-purple-200">{stream.stream}</span>
                        <span className="text-white font-bold">{formatCurrency(stream.amount)}</span>
                      </div>
                      <div className="text-sm text-purple-400">
                        Confidence: {formatPercentage(stream.confidence)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
              <h2 className="text-2xl font-bold text-white mb-6">🤖 AI Revenue Recommendations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {forecast.recommendations.map((recommendation, index) => (
                  <div key={index} className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-lg p-4 border border-purple-500/30">
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">🎯</span>
                      <p className="text-purple-200">{recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Optimization Tab */}
        {activeTab === 'optimization' && (
          <div className="space-y-8">
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
              <h2 className="text-2xl font-bold text-white mb-6">⚡ Revenue Optimization Engine</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white">Autonomous Features</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-lg p-3 border border-green-500/30">
                      <span className="text-green-400">✅</span>
                      <span className="text-white">Dynamic Pricing Algorithm</span>
                    </div>
                    <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-lg p-3 border border-blue-500/30">
                      <span className="text-blue-400">✅</span>
                      <span className="text-white">Market Demand Analysis</span>
                    </div>
                    <div className="flex items-center space-x-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg p-3 border border-purple-500/30">
                      <span className="text-purple-400">✅</span>
                      <span className="text-white">Performance-Based Pricing</span>
                    </div>
                    <div className="flex items-center space-x-3 bg-gradient-to-r from-amber-600/20 to-orange-600/20 rounded-lg p-3 border border-amber-500/30">
                      <span className="text-amber-400">✅</span>
                      <span className="text-white">Seasonal Adjustments</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white">Optimization Metrics</h3>
                  <div className="bg-black/20 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-purple-300">Optimization Frequency:</span>
                        <div className="text-white font-bold">Hourly</div>
                      </div>
                      <div>
                        <span className="text-purple-300">Success Rate:</span>
                        <div className="text-green-400 font-bold">94.3%</div>
                      </div>
                      <div>
                        <span className="text-purple-300">Revenue Uplift:</span>
                        <div className="text-green-400 font-bold">+23.7%</div>
                      </div>
                      <div>
                        <span className="text-purple-300">AI Confidence:</span>
                        <div className="text-blue-400 font-bold">97.2%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Self-Sustaining Features */}
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
              <h2 className="text-2xl font-bold text-white mb-6">🔄 Self-Sustaining Revenue System</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-purple-600/20 to-indigo-600/20 rounded-lg p-6 border border-purple-500/30">
                  <h3 className="text-xl font-bold text-white mb-4">🤖 Automated Learning</h3>
                  <p className="text-purple-200">
                    AI continuously learns from market patterns and user behavior to optimize pricing and monetization strategies without human intervention.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-lg p-6 border border-blue-500/30">
                  <h3 className="text-xl font-bold text-white mb-4">📊 Data Monetization</h3>
                  <p className="text-blue-200">
                    Training environment generates valuable datasets that are automatically packaged and licensed to generate additional revenue streams.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-lg p-6 border border-green-500/30">
                  <h3 className="text-xl font-bold text-white mb-4">⚡ Performance Scaling</h3>
                  <p className="text-green-200">
                    Higher-performing agents automatically command premium pricing, creating a positive feedback loop for continuous improvement.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

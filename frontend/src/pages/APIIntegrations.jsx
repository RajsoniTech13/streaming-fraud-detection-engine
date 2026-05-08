import { useState } from 'react';
import {
  Key, Plus, Copy, Trash2, Eye, EyeOff, Webhook, UploadCloud, FileText,
  CheckCircle, AlertTriangle, ExternalLink, RefreshCw, Shield, Globe, Clock,
  ChevronDown, X, Download, ArrowRight
} from 'lucide-react';

const INITIAL_API_KEYS = [
  { id: 1, name: 'Production Key', key: 'sk_live_4f8e9d2c1a3b5e7f', prefix: 'sk_live_...7f', created: '2026-04-15', lastUsed: '2 min ago', status: 'active', requests: 14829 },
  { id: 2, name: 'Staging Key', key: 'sk_test_a1b2c3d4e5f6g7h8', prefix: 'sk_test_...h8', created: '2026-04-20', lastUsed: '1 hour ago', status: 'active', requests: 3201 },
  { id: 3, name: 'Development Key', key: 'sk_dev_z9y8x7w6v5u4t3s2', prefix: 'sk_dev_...s2', created: '2026-05-01', lastUsed: 'Never', status: 'revoked', requests: 0 },
];

const WEBHOOKS = [
  { id: 1, url: 'https://api.merchant.com/fraud-webhook', events: ['transaction.blocked', 'case.resolved'], status: 'active', lastDelivery: '5 min ago', successRate: 99.8 },
  { id: 2, url: 'https://hooks.slack.com/services/T01/B02/xyz', events: ['transaction.blocked'], status: 'active', lastDelivery: '12 min ago', successRate: 100 },
];

const SAMPLE_PAYLOAD = `{
  "transaction_id": "txn_unique_id",
  "user_id": "usr_12345",
  "amount": 4500.00,
  "currency": "USD",
  "timestamp": "2026-05-08T12:00:00Z",
  "country": "US",
  "device_type": "mobile",
  "payment_method": "credit_card",
  "ip_address": "73.189.11.45",
  "is_international": false,
  "is_new_device": false
}`;

const CURL_EXAMPLE = `curl -X POST https://api.sentinelai.io/v1/transactions/score \\
  -H "Authorization: Bearer sk_live_4f8e9d2c1a3b5e7f" \\
  -H "Content-Type: application/json" \\
  -d '${SAMPLE_PAYLOAD}'`;

export default function APIIntegrations() {
  const [apiKeys, setApiKeys] = useState(INITIAL_API_KEYS);
  const [webhooks] = useState(WEBHOOKS);
  const [revealedKey, setRevealedKey] = useState(null);
  const [activeTab, setActiveTab] = useState('keys');
  const [showCreateKey, setShowCreateKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [copied, setCopied] = useState(null);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const revokeKey = (id) => {
    setApiKeys(apiKeys.map(k => k.id === id ? { ...k, status: 'revoked' } : k));
  };

  const createKey = () => {
    if (!newKeyName.trim()) return;
    const newKey = `sk_live_${Math.random().toString(36).slice(2, 18)}`;
    setApiKeys([...apiKeys, {
      id: Date.now(),
      name: newKeyName,
      key: newKey,
      prefix: `sk_live_...${newKey.slice(-2)}`,
      created: new Date().toISOString().split('T')[0],
      lastUsed: 'Never',
      status: 'active',
      requests: 0,
    }]);
    setShowCreateKey(false);
    setNewKeyName('');
  };

  const tabs = [
    { id: 'keys', label: 'API Keys', icon: Key },
    { id: 'webhooks', label: 'Webhooks', icon: Webhook },
    { id: 'docs', label: 'Quick Start', icon: FileText },
    { id: 'upload', label: 'CSV Upload', icon: UploadCloud },
  ];

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="mb-2 animate-fade-in">
        <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
          API <span className="gradient-text">Integrations</span>
        </h1>
        <p className="text-slate-500 text-sm">Manage API keys, webhooks, and data ingestion for your fraud detection pipeline.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-900/80 p-1 rounded-xl border border-dark-700/30 w-fit animate-fade-in fill-both stagger-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                : 'text-slate-500 hover:text-slate-300 border border-transparent'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* API Keys Tab */}
      {activeTab === 'keys' && (
        <div className="space-y-5 animate-fade-in">
          {/* Create Key */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowCreateKey(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-cyan-500 text-white rounded-xl hover:shadow-lg hover:shadow-primary-500/20 transition-all text-sm font-medium"
            >
              <Plus className="w-4 h-4" /> Generate New Key
            </button>
          </div>

          {/* Keys List */}
          <div className="pro-card overflow-hidden">
            <div className="p-5 border-b border-dark-700/30 bg-dark-900/60">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-primary-400" />
                API Keys
              </h3>
            </div>
            <div className="divide-y divide-dark-700/20">
              {apiKeys.map(k => (
                <div key={k.id} className="p-5 hover:bg-dark-800/30 transition-colors group flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`p-2 rounded-lg border ${k.status === 'active' ? 'bg-safe-500/5 border-safe-500/15' : 'bg-dark-800 border-dark-700/30'}`}>
                      <Key className={`w-4 h-4 ${k.status === 'active' ? 'text-safe-400' : 'text-slate-600'}`} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-white">{k.name}</h4>
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          k.status === 'active' ? 'bg-safe-500/10 text-safe-400 border border-safe-500/20' : 'bg-dark-800 text-slate-600 border border-dark-700/30'
                        }`}>{k.status}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono text-slate-400">
                          {revealedKey === k.id ? k.key : k.prefix}
                        </code>
                        <button onClick={() => setRevealedKey(revealedKey === k.id ? null : k.id)} className="text-slate-600 hover:text-slate-400 transition-colors">
                          {revealedKey === k.id ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                        <button onClick={() => handleCopy(k.key, k.id)} className="text-slate-600 hover:text-primary-400 transition-colors">
                          {copied === k.id ? <CheckCircle className="w-3 h-3 text-safe-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                      <div className="flex items-center gap-4 mt-1.5 text-[10px] text-slate-500">
                        <span>Created: {k.created}</span>
                        <span>Last used: {k.lastUsed}</span>
                        <span>Requests: <b className="text-slate-300">{k.requests.toLocaleString()}</b></span>
                      </div>
                    </div>
                  </div>
                  {k.status === 'active' && (
                    <button
                      onClick={() => revokeKey(k.id)}
                      className="p-2 text-slate-600 hover:text-danger-400 hover:bg-danger-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Revoke Key"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Create Key Modal */}
          {showCreateKey && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreateKey(false)} />
              <div className="relative bg-dark-900 border border-dark-700/30 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fade-in">
                <h3 className="text-base font-semibold text-white mb-4">Generate New API Key</h3>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="Key name (e.g., Production Key)"
                  className="w-full bg-dark-850 border border-dark-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50 mb-4"
                />
                <div className="flex justify-end gap-3">
                  <button onClick={() => setShowCreateKey(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">Cancel</button>
                  <button onClick={createKey} className="px-5 py-2 bg-gradient-to-r from-primary-500 to-cyan-500 text-white rounded-xl text-sm font-medium">Generate</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Webhooks Tab */}
      {activeTab === 'webhooks' && (
        <div className="space-y-5 animate-fade-in">
          <div className="pro-card overflow-hidden">
            <div className="p-5 border-b border-dark-700/30 bg-dark-900/60 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Webhook className="w-4 h-4 text-cyan-400" />
                Configured Webhooks
              </h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-dark-800 border border-dark-700/30 text-xs text-slate-300 rounded-lg hover:border-dark-600/50 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Add Webhook
              </button>
            </div>
            <div className="divide-y divide-dark-700/20">
              {webhooks.map(wh => (
                <div key={wh.id} className="p-5 hover:bg-dark-800/30 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <code className="text-xs font-mono text-primary-400 bg-primary-500/5 px-2 py-1 rounded border border-primary-500/10">{wh.url}</code>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-safe-500/10 text-safe-400 px-2 py-0.5 rounded-full border border-safe-500/20">{wh.status}</span>
                        <span className="text-[10px] text-slate-500">Success: <b className="text-safe-400">{wh.successRate}%</b></span>
                        <span className="text-[10px] text-slate-500">Last: {wh.lastDelivery}</span>
                      </div>
                    </div>
                    <button className="p-2 text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors" title="Test Webhook">
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {wh.events.map(ev => (
                      <span key={ev} className="text-[10px] font-mono bg-dark-800 text-slate-400 px-2 py-0.5 rounded border border-dark-700/30">{ev}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Start Docs */}
      {activeTab === 'docs' && (
        <div className="space-y-5 animate-fade-in">
          {/* Ingestion Flow */}
          <div className="pro-card p-6">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
              <Globe className="w-4 h-4 text-cyan-400" />
              Integration Flow
            </h3>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="bg-dark-800 px-3 py-2 rounded-lg border border-dark-700/30 text-slate-300 font-medium">Your App</span>
              <ArrowRight className="w-4 h-4 text-primary-400" />
              <span className="bg-primary-500/10 px-3 py-2 rounded-lg border border-primary-500/20 text-primary-400 font-medium">POST /v1/transactions</span>
              <ArrowRight className="w-4 h-4 text-primary-400" />
              <span className="bg-dark-800 px-3 py-2 rounded-lg border border-dark-700/30 text-cyan-400 font-medium">Kafka → Spark</span>
              <ArrowRight className="w-4 h-4 text-primary-400" />
              <span className="bg-danger-500/10 px-3 py-2 rounded-lg border border-danger-500/20 text-danger-400 font-medium">Risk Score</span>
              <ArrowRight className="w-4 h-4 text-primary-400" />
              <span className="bg-dark-800 px-3 py-2 rounded-lg border border-dark-700/30 text-safe-400 font-medium">Webhook</span>
            </div>
          </div>

          {/* cURL Example */}
          <div className="pro-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary-400" />
                cURL Example
              </h3>
              <button
                onClick={() => handleCopy(CURL_EXAMPLE, 'curl')}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary-400 transition-colors"
              >
                {copied === 'curl' ? <CheckCircle className="w-3.5 h-3.5 text-safe-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied === 'curl' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="bg-dark-950 rounded-xl p-4 text-xs font-mono text-slate-300 overflow-x-auto border border-dark-700/30 leading-relaxed">
              {CURL_EXAMPLE}
            </pre>
          </div>

          {/* Sample Payload */}
          <div className="pro-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                Request Body Schema
              </h3>
              <button
                onClick={() => handleCopy(SAMPLE_PAYLOAD, 'payload')}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary-400 transition-colors"
              >
                {copied === 'payload' ? <CheckCircle className="w-3.5 h-3.5 text-safe-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied === 'payload' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="bg-dark-950 rounded-xl p-4 text-xs font-mono text-cyan-400 overflow-x-auto border border-dark-700/30 leading-relaxed">
              {SAMPLE_PAYLOAD}
            </pre>
          </div>
        </div>
      )}

      {/* CSV Upload Tab */}
      {activeTab === 'upload' && (
        <div className="space-y-5 animate-fade-in">
          <div className="pro-card p-8">
            <div className="border-2 border-dashed border-dark-600/50 rounded-2xl p-12 text-center hover:border-primary-500/30 transition-colors cursor-pointer group">
              <UploadCloud className="w-12 h-12 text-slate-600 mx-auto mb-4 group-hover:text-primary-400 transition-colors" />
              <h3 className="text-base font-semibold text-white mb-2">Upload Transaction Data</h3>
              <p className="text-xs text-slate-500 mb-4 max-w-md mx-auto">
                Drag and drop a CSV file with historical transactions for batch processing and backtesting against your current rule set.
              </p>
              <button className="px-5 py-2.5 bg-gradient-to-r from-primary-500 to-cyan-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-primary-500/20 transition-all">
                Select File
              </button>
              <p className="text-[10px] text-slate-600 mt-3">Supports CSV up to 500MB. Max 10M rows.</p>
            </div>
          </div>

          {/* Download Template */}
          <div className="pro-card p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-dark-800 rounded-lg border border-dark-700/30">
                <Download className="w-4 h-4 text-primary-400" />
              </div>
              <div>
                <p className="text-sm text-white font-medium">Download CSV Template</p>
                <p className="text-[10px] text-slate-500">Pre-formatted with all required columns</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-dark-800 text-xs text-slate-300 rounded-lg border border-dark-700/30 hover:border-dark-600/50 transition-colors">
              Download .csv
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

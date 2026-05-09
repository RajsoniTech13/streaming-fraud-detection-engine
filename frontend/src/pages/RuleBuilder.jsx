import { useState } from 'react';
import {
  Plus, Trash2, Edit2, ToggleLeft, ToggleRight, GitBranch, X,
  AlertTriangle, Shield, Zap, Eye, EyeOff, GripVertical
} from 'lucide-react';

const CONDITION_FIELDS = ['amount', 'country', 'device_type', 'payment_method', 'is_international', 'is_new_device', 'transactions_last_1min', 'account_age_days', 'ip_address'];
const CONDITION_OPS = ['>', '<', '>=', '<=', '==', '!=', 'IN', 'NOT IN'];
const ACTIONS = ['Flag (High Risk)', 'Block', 'Require 2FA', 'Flag (Medium)', 'Allow', 'Send Alert'];

const INITIAL_RULES = [
  {
    id: 1, name: 'High Value International', priority: 1, status: 'active',
    conditions: [
      { field: 'amount', op: '>', value: '10000' },
      { field: 'is_international', op: '==', value: 'true' },
    ],
    action: 'Flag (High Risk)', scoreModifier: '+5',
    triggered: 1842, blocked: 412, lastTriggered: '2 min ago',
  },
  {
    id: 2, name: 'Velocity Burst', priority: 2, status: 'active',
    conditions: [
      { field: 'transactions_last_1min', op: '>', value: '5' },
    ],
    action: 'Block', scoreModifier: '+8',
    triggered: 923, blocked: 891, lastTriggered: '8 min ago',
  },
  {
    id: 3, name: 'New Device + New Account', priority: 3, status: 'shadow',
    conditions: [
      { field: 'is_new_device', op: '==', value: 'true' },
      { field: 'account_age_days', op: '<', value: '7' },
    ],
    action: 'Require 2FA', scoreModifier: '+3',
    triggered: 567, blocked: 0, lastTriggered: '15 min ago',
  },
  {
    id: 4, name: 'Crypto High Amount', priority: 4, status: 'active',
    conditions: [
      { field: 'payment_method', op: '==', value: 'crypto' },
      { field: 'amount', op: '>', value: '5000' },
    ],
    action: 'Flag (High Risk)', scoreModifier: '+6',
    triggered: 344, blocked: 201, lastTriggered: '30 min ago',
  },
  {
    id: 5, name: 'Blacklisted Region', priority: 5, status: 'active',
    conditions: [
      { field: 'country', op: 'IN', value: 'NG, RU, VN, CN' },
      { field: 'amount', op: '>', value: '2000' },
    ],
    action: 'Block', scoreModifier: '+7',
    triggered: 2105, blocked: 1890, lastTriggered: '1 min ago',
  },
];

export default function RuleBuilder() {
  const [rules, setRules] = useState(INITIAL_RULES);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);

  const toggleStatus = (id) => {
    setRules(rules.map(r => r.id === id ? { ...r, status: r.status === 'active' ? 'shadow' : 'active' } : r));
  };

  const deleteRule = (id) => {
    setRules(rules.filter(r => r.id !== id));
  };

  const handleSaveRule = (rule) => {
    if (editingRule) {
      setRules(rules.map(r => r.id === rule.id ? rule : r));
    } else {
      setRules([...rules, { ...rule, id: Date.now(), priority: rules.length + 1, triggered: 0, blocked: 0, lastTriggered: 'Never' }]);
    }
    setShowCreateModal(false);
    setEditingRule(null);
  };

  const activeCount = rules.filter(r => r.status === 'active').length;
  const shadowCount = rules.filter(r => r.status === 'shadow').length;
  const totalTriggered = rules.reduce((a, r) => a + r.triggered, 0);
  const totalBlocked = rules.reduce((a, r) => a + r.blocked, 0);

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="mb-2 animate-fade-in flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
            Rules <span className="gradient-text">Engine</span>
          </h1>
          <p className="text-slate-500 text-sm">Configure dynamic fraud detection rules with real-time shadow testing.</p>
        </div>
        <button
          onClick={() => { setEditingRule(null); setShowCreateModal(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-cyan-500 text-white rounded-xl hover:shadow-lg hover:shadow-primary-500/20 transition-all text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Create Rule
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in fill-both stagger-1">
        <StatCard icon={<Shield className="w-4 h-4 text-safe-400" />} label="Active Rules" value={activeCount} accent="safe" />
        <StatCard icon={<EyeOff className="w-4 h-4 text-slate-400" />} label="Shadow Mode" value={shadowCount} accent="slate" />
        <StatCard icon={<Zap className="w-4 h-4 text-warning-400" />} label="Total Triggered" value={totalTriggered.toLocaleString()} accent="warning" />
        <StatCard icon={<AlertTriangle className="w-4 h-4 text-danger-400" />} label="Total Blocked" value={totalBlocked.toLocaleString()} accent="danger" />
      </div>

      {/* Rules List */}
      <div className="pro-card overflow-hidden animate-fade-in fill-both stagger-2">
        <div className="p-5 border-b border-dark-700/30 flex justify-between items-center bg-dark-900/60">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-primary-400" />
            Configured Rules
          </h3>
          <span className="text-[10px] font-mono text-slate-500 bg-dark-800 px-3 py-1 rounded-full border border-dark-700/30">
            PRIORITY: TOP → BOTTOM
          </span>
        </div>

        <div className="divide-y divide-dark-700/20">
          {rules.map((rule) => (
            <div key={rule.id} className="p-5 hover:bg-dark-800/30 transition-colors group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 pt-0.5 text-slate-600 cursor-grab">
                    <GripVertical className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-mono text-slate-600 bg-dark-800 px-1.5 py-0.5 rounded border border-dark-700/30">#{rule.priority}</span>
                      <h4 className="text-sm font-semibold text-white truncate">{rule.name}</h4>
                      {rule.status === 'shadow' && (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 bg-dark-800 px-2 py-0.5 rounded-full border border-dark-700/30 flex items-center gap-1">
                          <Eye className="w-2.5 h-2.5" /> Shadow
                        </span>
                      )}
                    </div>

                    {/* Conditions */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-3">
                      {rule.conditions.map((cond, i) => (
                        <div key={i} className="flex items-center gap-1">
                          {i > 0 && <span className="text-[9px] font-bold text-primary-400">AND</span>}
                          <span className="font-mono text-[10px] bg-dark-800 text-cyan-400 px-2 py-0.5 rounded border border-dark-700/30">{cond.field}</span>
                          <span className="text-[10px] font-bold text-slate-500">{cond.op}</span>
                          <span className="font-mono text-[10px] bg-primary-500/5 text-primary-300 px-2 py-0.5 rounded border border-primary-500/10">{cond.value}</span>
                        </div>
                      ))}
                      <span className="text-[9px] font-bold text-safe-400 mx-1">→</span>
                      <span className="text-[10px] font-semibold text-white bg-dark-800 px-2 py-0.5 rounded border border-dark-700/30">{rule.action}</span>
                      <span className="text-[10px] font-mono text-danger-400 ml-1">({rule.scoreModifier})</span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-[10px] text-slate-500">
                      <span>Triggered: <b className="text-slate-300">{rule.triggered.toLocaleString()}</b></span>
                      <span>Blocked: <b className="text-danger-400">{rule.blocked.toLocaleString()}</b></span>
                      <span>Last: <b className="text-slate-400">{rule.lastTriggered}</b></span>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    onClick={() => toggleStatus(rule.id)}
                    className={`p-2 rounded-lg transition-colors ${rule.status === 'active' ? 'text-safe-400 hover:bg-safe-500/10' : 'text-slate-500 hover:bg-dark-800'}`}
                    title={rule.status === 'active' ? 'Switch to Shadow' : 'Activate'}
                  >
                    {rule.status === 'active' ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => { setEditingRule(rule); setShowCreateModal(true); }}
                    className="p-2 text-slate-500 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteRule(rule.id)}
                    className="p-2 text-slate-500 hover:text-danger-400 hover:bg-danger-500/10 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <RuleModal
          rule={editingRule}
          onSave={handleSaveRule}
          onClose={() => { setShowCreateModal(false); setEditingRule(null); }}
        />
      )}
    </div>
  );
}

function RuleModal({ rule, onSave, onClose }) {
  const [name, setName] = useState(rule?.name || '');
  const [conditions, setConditions] = useState(rule?.conditions || [{ field: 'amount', op: '>', value: '' }]);
  const [action, setAction] = useState(rule?.action || ACTIONS[0]);
  const [scoreModifier, setScoreModifier] = useState(rule?.scoreModifier || '+5');
  const [status, setStatus] = useState(rule?.status || 'shadow');

  const addCondition = () => setConditions([...conditions, { field: 'amount', op: '>', value: '' }]);
  const removeCondition = (idx) => setConditions(conditions.filter((_, i) => i !== idx));
  const updateCondition = (idx, key, val) => setConditions(conditions.map((c, i) => i === idx ? { ...c, [key]: val } : c));

  const handleSubmit = () => {
    if (!name.trim() || conditions.some(c => !c.value.trim())) return;
    onSave({
      ...(rule || {}),
      name,
      conditions,
      action,
      scoreModifier,
      status,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-dark-900 border border-dark-700/30 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-dark-700/30 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">{rule ? 'Edit Rule' : 'Create New Rule'}</h2>
          <button onClick={onClose} className="p-1.5 text-slate-500 hover:text-white hover:bg-dark-800 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Name */}
          <div>
            <label className="section-header block mb-2">Rule Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., High Value International Transfer"
              className="w-full bg-dark-850 border border-dark-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50"
            />
          </div>

          {/* Conditions */}
          <div>
            <label className="section-header block mb-2">Conditions (IF)</label>
            <div className="space-y-2">
              {conditions.map((cond, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  {idx > 0 && <span className="text-[10px] font-bold text-primary-400 w-8 text-center">AND</span>}
                  {idx === 0 && <span className="text-[10px] font-bold text-slate-600 w-8 text-center">IF</span>}
                  <select value={cond.field} onChange={(e) => updateCondition(idx, 'field', e.target.value)}
                    className="bg-dark-850 border border-dark-700/50 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-primary-500/30 flex-1"
                  >
                    {CONDITION_FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                  <select value={cond.op} onChange={(e) => updateCondition(idx, 'op', e.target.value)}
                    className="bg-dark-850 border border-dark-700/50 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-primary-500/30 w-20"
                  >
                    {CONDITION_OPS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <input
                    type="text"
                    value={cond.value}
                    onChange={(e) => updateCondition(idx, 'value', e.target.value)}
                    placeholder="value"
                    className="bg-dark-850 border border-dark-700/50 rounded-lg px-3 py-2 text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-primary-500/30 flex-1"
                  />
                  {conditions.length > 1 && (
                    <button onClick={() => removeCondition(idx)} className="p-1.5 text-slate-600 hover:text-danger-400 rounded-lg transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button onClick={addCondition} className="mt-2 text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors">
              <Plus className="w-3 h-3" /> Add Condition
            </button>
          </div>

          {/* Action + Score */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="section-header block mb-2">Action (THEN)</label>
              <select value={action} onChange={(e) => setAction(e.target.value)}
                className="w-full bg-dark-850 border border-dark-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-primary-500/30"
              >
                {ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="section-header block mb-2">Score Modifier</label>
              <input
                type="text"
                value={scoreModifier}
                onChange={(e) => setScoreModifier(e.target.value)}
                placeholder="+5"
                className="w-full bg-dark-850 border border-dark-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-primary-500/30 font-mono"
              />
            </div>
          </div>

          {/* Deploy Mode */}
          <div>
            <label className="section-header block mb-2">Deploy Mode</label>
            <div className="flex gap-3">
              <button
                onClick={() => setStatus('active')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${status === 'active' ? 'bg-safe-500/10 text-safe-400 border-safe-500/20' : 'bg-dark-850 text-slate-500 border-dark-700/30 hover:border-dark-600/50'}`}
              >
                <Shield className="w-4 h-4 inline mr-1.5" />Active
              </button>
              <button
                onClick={() => setStatus('shadow')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${status === 'shadow' ? 'bg-primary-500/10 text-primary-400 border-primary-500/20' : 'bg-dark-850 text-slate-500 border-dark-700/30 hover:border-dark-600/50'}`}
              >
                <Eye className="w-4 h-4 inline mr-1.5" />Shadow Mode
              </button>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">
              {status === 'shadow' ? 'Shadow mode logs what would happen without blocking real transactions.' : 'Active rules will block/flag real transactions in real-time.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-dark-700/30 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">Cancel</button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-gradient-to-r from-primary-500 to-cyan-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-primary-500/20 transition-all"
          >
            {rule ? 'Save Changes' : 'Create Rule'}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, accent }) {
  const accents = {
    safe: 'border-safe-500/15',
    warning: 'border-warning-500/15',
    danger: 'border-danger-500/15',
    slate: 'border-dark-700/30',
  };
  return (
    <div className={`pro-card p-4 flex items-center gap-3 ${accents[accent]}`}>
      <div className="p-2 bg-dark-800 rounded-lg border border-dark-700/30">{icon}</div>
      <div>
        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">{label}</p>
        <p className="text-lg font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

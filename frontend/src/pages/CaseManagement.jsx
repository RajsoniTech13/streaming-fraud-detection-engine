import { useState } from 'react';
import {
  ShieldCheck, ShieldX, Clock, CheckCircle, XCircle, Search,
  ChevronDown, Eye, ArrowUpRight, AlertTriangle,
  DollarSign, User, MapPin, X
} from 'lucide-react';

// Mock case data with richer detail
const INITIAL_CASES = [
  {
    id: 'CAS-4821', txnId: 'txn_9f8e7d6c', user: 'sarah.chen@acme.io', userId: 'USR_4821',
    amount: 24500, currency: 'USD', riskScore: 96, status: 'pending', createdAt: '2 min ago',
    reason: 'High velocity + new device + international', country: 'Nigeria', device: 'mobile',
    paymentMethod: 'bank_transfer', ipAddress: '102.89.33.14', flags: ['velocity', 'new_device', 'international'],
  },
  {
    id: 'CAS-4820', txnId: 'txn_a1b2c3d4', user: 'bob.johnson@corp.com', userId: 'USR_1029',
    amount: 8900, currency: 'USD', riskScore: 88, status: 'pending', createdAt: '8 min ago',
    reason: 'Known fraud ring IP range', country: 'Russia', device: 'desktop',
    paymentMethod: 'crypto', ipAddress: '195.201.44.91', flags: ['ip_blacklist', 'crypto'],
  },
  {
    id: 'CAS-4819', txnId: 'txn_e5f6g7h8', user: 'alice.wong@startup.co', userId: 'USR_7720',
    amount: 45000, currency: 'USD', riskScore: 99, status: 'blocked', createdAt: '22 min ago',
    reason: 'Amount > $20k + new account + international', country: 'China', device: 'desktop',
    paymentMethod: 'bank_transfer', ipAddress: '223.5.5.5', flags: ['high_amount', 'new_account', 'international'],
    resolvedBy: 'System (Auto-block)', resolvedAt: '20 min ago',
  },
  {
    id: 'CAS-4818', txnId: 'txn_i9j0k1l2', user: 'david.miller@mail.com', userId: 'USR_3301',
    amount: 150, currency: 'USD', riskScore: 72, status: 'approved', createdAt: '1 hour ago',
    reason: 'New device login from unusual location', country: 'UK', device: 'mobile',
    paymentMethod: 'credit_card', ipAddress: '82.132.228.1', flags: ['new_device', 'geo_anomaly'],
    resolvedBy: 'analyst@defendx.io', resolvedAt: '45 min ago', note: 'User confirmed traveling to UK for business.',
  },
  {
    id: 'CAS-4817', txnId: 'txn_m3n4o5p6', user: 'emma.garcia@shop.co', userId: 'USR_5501',
    amount: 3200, currency: 'USD', riskScore: 81, status: 'pending', createdAt: '35 min ago',
    reason: 'Velocity burst: 7 txns in 60 seconds', country: 'USA', device: 'tablet',
    paymentMethod: 'credit_card', ipAddress: '73.189.11.45', flags: ['velocity'],
  },
  {
    id: 'CAS-4816', txnId: 'txn_q7r8s9t0', user: 'frank.zhao@enterprise.cn', userId: 'USR_8802',
    amount: 67000, currency: 'USD', riskScore: 98, status: 'escalated', createdAt: '1 hour ago',
    reason: 'Multi-signal: velocity + amount + device + geo', country: 'Vietnam', device: 'mobile',
    paymentMethod: 'bank_transfer', ipAddress: '14.225.0.1', flags: ['velocity', 'high_amount', 'new_device', 'international'],
    resolvedBy: 'risk_team@defendx.io',
  },
];

function getRiskLevel(score) {
  if (score >= 90) return { label: 'CRITICAL', badge: 'badge-critical', color: 'text-danger-400', bg: 'bg-danger-500' };
  if (score >= 75) return { label: 'HIGH', badge: 'badge-warning', color: 'text-warning-400', bg: 'bg-warning-500' };
  return { label: 'MODERATE', badge: 'badge-safe', color: 'text-cyan-400', bg: 'bg-cyan-500' };
}

function getStatusConfig(status) {
  switch (status) {
    case 'pending': return { label: 'Pending Review', icon: Clock, color: 'text-warning-400', bg: 'bg-warning-500/10', border: 'border-warning-500/20' };
    case 'approved': return { label: 'Approved', icon: CheckCircle, color: 'text-safe-400', bg: 'bg-safe-500/10', border: 'border-safe-500/20' };
    case 'blocked': return { label: 'Blocked', icon: XCircle, color: 'text-danger-400', bg: 'bg-danger-500/10', border: 'border-danger-500/20' };
    case 'escalated': return { label: 'Escalated', icon: ArrowUpRight, color: 'text-primary-400', bg: 'bg-primary-500/10', border: 'border-primary-500/20' };
    default: return { label: status, icon: Clock, color: 'text-slate-400', bg: 'bg-dark-800', border: 'border-dark-700/30' };
  }
}

export default function CaseManagement() {
  const [cases, setCases] = useState(INITIAL_CASES);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCase, setSelectedCase] = useState(null);

  const handleAction = (id, action) => {
    setCases(prev => prev.map(c => c.id === id ? {
      ...c,
      status: action,
      resolvedBy: 'analyst@defendx.io',
      resolvedAt: 'Just now',
    } : c));
    if (selectedCase?.id === id) {
      setSelectedCase(prev => ({ ...prev, status: action, resolvedBy: 'analyst@defendx.io', resolvedAt: 'Just now' }));
    }
  };

  const filtered = cases
    .filter(c => filterStatus === 'all' || c.status === filterStatus)
    .filter(c => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return c.id.toLowerCase().includes(q) || c.user.toLowerCase().includes(q) || c.reason.toLowerCase().includes(q);
    });

  const pendingCount = cases.filter(c => c.status === 'pending').length;
  const blockedCount = cases.filter(c => c.status === 'blocked').length;
  const approvedCount = cases.filter(c => c.status === 'approved').length;
  const escalatedCount = cases.filter(c => c.status === 'escalated').length;

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-12 relative">
      {/* Header */}
      <div className="mb-2 animate-fade-in">
        <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
          Case <span className="gradient-text-danger">Management</span>
        </h1>
        <p className="text-slate-500 text-sm">Review, action, and resolve flagged transactions from the detection engine.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in fill-both stagger-1">
        <StatMini icon={<Clock className="w-4 h-4 text-warning-400" />} label="Pending" value={pendingCount} accent="warning" />
        <StatMini icon={<XCircle className="w-4 h-4 text-danger-400" />} label="Blocked" value={blockedCount} accent="danger" />
        <StatMini icon={<CheckCircle className="w-4 h-4 text-safe-400" />} label="Approved" value={approvedCount} accent="safe" />
        <StatMini icon={<ArrowUpRight className="w-4 h-4 text-primary-400" />} label="Escalated" value={escalatedCount} accent="primary" />
      </div>

      {/* Table Card */}
      <div className="pro-card overflow-hidden flex flex-col animate-fade-in fill-both stagger-2">
        {/* Toolbar */}
        <div className="p-5 border-b border-dark-700/30 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-dark-900/60">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-warning-500 animate-pulse" />
            Active Case Queue
          </h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-dark-800 px-3 py-1.5 rounded-lg border border-dark-700/30 w-56">
              <Search className="w-3.5 h-3.5 text-slate-500 mr-2" />
              <input
                type="text"
                placeholder="Search cases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs text-slate-300 outline-none w-full placeholder:text-slate-600"
              />
            </div>
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="appearance-none bg-dark-800 border border-dark-700/50 text-xs text-slate-300 px-3 py-1.5 pr-7 rounded-lg focus:outline-none focus:border-primary-500/30 cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="blocked">Blocked</option>
                <option value="approved">Approved</option>
                <option value="escalated">Escalated</option>
              </select>
              <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-slate-500 uppercase text-[10px] tracking-[0.15em] border-b border-dark-700/30 bg-dark-900/40">
              <tr>
                <th className="px-6 py-4 font-medium">Case</th>
                <th className="px-6 py-4 font-medium"><User className="w-3 h-3 inline mr-1 -mt-0.5" />User</th>
                <th className="px-6 py-4 font-medium"><DollarSign className="w-3 h-3 inline mr-1 -mt-0.5" />Amount</th>
                <th className="px-6 py-4 font-medium"><MapPin className="w-3 h-3 inline mr-1 -mt-0.5" />Origin</th>
                <th className="px-6 py-4 font-medium">Risk</th>
                <th className="px-6 py-4 font-medium">Reason</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700/20">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <ShieldCheck className="w-8 h-8 text-slate-600" />
                      <p className="text-slate-500 text-sm">No cases match the current filter</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((c, idx) => {
                  const risk = getRiskLevel(c.riskScore);
                  const statusConf = getStatusConfig(c.status);
                  const StatusIcon = statusConf.icon;
                  return (
                    <tr
                      key={c.id}
                      className="pro-table-row cursor-pointer group"
                      style={{ animationDelay: `${idx * 40}ms` }}
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-primary-400 bg-primary-500/5 px-2 py-1 rounded-md border border-primary-500/10">
                          {c.id}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-medium text-slate-200">{c.user}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{c.createdAt}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-semibold text-white">${c.amount.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-slate-300 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                          {c.country}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 min-w-[100px]">
                          <span className={`font-mono font-bold text-sm ${risk.color}`}>{c.riskScore}</span>
                          <div className="flex-1 risk-bar">
                            <div
                              className={`risk-bar__fill ${risk.bg}`}
                              style={{ width: `${Math.min(c.riskScore, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-[200px]">
                        <span className="text-xs text-slate-400 truncate block">{c.reason}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold ${statusConf.bg} ${statusConf.color} border ${statusConf.border}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConf.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-1">
                          <button
                            onClick={() => setSelectedCase(c)}
                            className="p-2 text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {c.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleAction(c.id, 'approved')}
                                className="p-2 text-slate-500 hover:text-safe-400 hover:bg-safe-500/10 rounded-lg transition-colors"
                                title="Approve"
                              >
                                <ShieldCheck className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleAction(c.id, 'blocked')}
                                className="p-2 text-slate-500 hover:text-danger-400 hover:bg-danger-500/10 rounded-lg transition-colors"
                                title="Block"
                              >
                                <ShieldX className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleAction(c.id, 'escalated')}
                                className="p-2 text-slate-500 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-colors"
                                title="Escalate"
                              >
                                <ArrowUpRight className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-dark-700/30 flex items-center justify-between text-xs text-slate-500 bg-dark-900/40">
          <span>Showing {filtered.length} of {cases.length} cases</span>
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-3 h-3" />
            <span>{pendingCount} require attention</span>
          </div>
        </div>
      </div>

      {/* Detail Drawer */}
      {selectedCase && (
        <CaseDetailDrawer
          caseData={selectedCase}
          onClose={() => setSelectedCase(null)}
          onAction={handleAction}
        />
      )}
    </div>
  );
}

function CaseDetailDrawer({ caseData, onClose, onAction }) {
  const risk = getRiskLevel(caseData.riskScore);
  const statusConf = getStatusConfig(caseData.status);
  const StatusIcon = statusConf.icon;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-dark-900 border-l border-dark-700/30 h-full overflow-y-auto animate-slide-in-right">
        {/* Drawer Header */}
        <div className="sticky top-0 z-10 bg-dark-900/95 backdrop-blur-xl border-b border-dark-700/30 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">{caseData.id}</h2>
            <p className="text-[10px] text-slate-500 mt-0.5">Case opened {caseData.createdAt}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white hover:bg-dark-800 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status + Risk */}
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${statusConf.bg} ${statusConf.color} border ${statusConf.border}`}>
              <StatusIcon className="w-3.5 h-3.5 mr-1.5" />
              {statusConf.label}
            </span>
            <span className={risk.badge}>
              <span className={`w-1.5 h-1.5 rounded-full ${risk.bg} mr-1.5`} />
              Score: {caseData.riskScore}
            </span>
          </div>

          {/* Reason */}
          <div className="bg-danger-500/5 border border-danger-500/15 rounded-xl p-4">
            <p className="text-[10px] text-danger-400 uppercase tracking-wider font-semibold mb-1">Flag Reason</p>
            <p className="text-sm text-slate-200">{caseData.reason}</p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {caseData.flags.map(f => (
                <span key={f} className="text-[10px] bg-dark-800 text-slate-400 px-2 py-0.5 rounded-md border border-dark-700/30 font-mono">{f}</span>
              ))}
            </div>
          </div>

          {/* Transaction Details */}
          <div>
            <p className="section-header mb-3">Transaction Details</p>
            <div className="grid grid-cols-2 gap-3">
              <DetailItem label="Transaction ID" value={caseData.txnId} mono />
              <DetailItem label="User" value={caseData.user} />
              <DetailItem label="User ID" value={caseData.userId} mono />
              <DetailItem label="Amount" value={`$${caseData.amount.toLocaleString()} ${caseData.currency}`} />
              <DetailItem label="Country" value={caseData.country} />
              <DetailItem label="Device" value={caseData.device} />
              <DetailItem label="Payment" value={caseData.paymentMethod} />
              <DetailItem label="IP Address" value={caseData.ipAddress} mono />
            </div>
          </div>

          {/* Resolution Info */}
          {caseData.resolvedBy && (
            <div>
              <p className="section-header mb-3">Resolution</p>
              <div className="bg-dark-850 rounded-xl p-4 border border-dark-700/30 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Resolved by</span>
                  <span className="text-slate-300 font-medium">{caseData.resolvedBy}</span>
                </div>
                {caseData.resolvedAt && (
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Resolved at</span>
                    <span className="text-slate-300">{caseData.resolvedAt}</span>
                  </div>
                )}
                {caseData.note && (
                  <div className="mt-2 pt-2 border-t border-dark-700/30">
                    <p className="text-[10px] text-slate-500 mb-1">Analyst Note</p>
                    <p className="text-xs text-slate-300 italic">&quot;{caseData.note}&quot;</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          {caseData.status === 'pending' && (
            <div className="space-y-2 pt-2">
              <p className="section-header mb-3">Take Action</p>
              <button
                onClick={() => onAction(caseData.id, 'approved')}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-safe-500/10 text-safe-400 border border-safe-500/20 rounded-xl hover:bg-safe-500/20 transition-colors text-sm font-medium"
              >
                <ShieldCheck className="w-4 h-4" /> Approve (False Positive)
              </button>
              <button
                onClick={() => onAction(caseData.id, 'blocked')}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-danger-500/10 text-danger-400 border border-danger-500/20 rounded-xl hover:bg-danger-500/20 transition-colors text-sm font-medium"
              >
                <ShieldX className="w-4 h-4" /> Block Transaction
              </button>
              <button
                onClick={() => onAction(caseData.id, 'escalated')}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary-500/10 text-primary-400 border border-primary-500/20 rounded-xl hover:bg-primary-500/20 transition-colors text-sm font-medium"
              >
                <ArrowUpRight className="w-4 h-4" /> Escalate to Risk Team
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value, mono }) {
  return (
    <div className="bg-dark-850 rounded-lg p-3 border border-dark-700/30">
      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-xs text-slate-200 ${mono ? 'font-mono' : ''} truncate`}>{value}</p>
    </div>
  );
}

function StatMini({ icon, label, value, accent }) {
  const accents = {
    danger: 'border-danger-500/15',
    warning: 'border-warning-500/15',
    safe: 'border-safe-500/15',
    primary: 'border-primary-500/15',
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

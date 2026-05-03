import { useState, useEffect } from 'react';
import { ShieldAlert, Activity, AlertTriangle, Clock, Hash, User, DollarSign, MapPin, Monitor, ChevronDown, Zap } from 'lucide-react';

const API_URL = "http://localhost:8501";
const POLL_INTERVAL = 5000;

// Risk score color logic
function getRiskColor(score) {
  if (score >= 90) return { bg: 'bg-danger-500', text: 'text-danger-400', bar: 'from-danger-500 to-rose-400', badge: 'badge-critical', label: 'CRITICAL' };
  if (score >= 70) return { bg: 'bg-warning-500', text: 'text-warning-400', bar: 'from-warning-500 to-amber-400', badge: 'badge-warning', label: 'HIGH' };
  return { bg: 'bg-safe-500', text: 'text-safe-400', bar: 'from-safe-500 to-emerald-400', badge: 'badge-safe', label: 'MODERATE' };
}

export default function LiveAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [filterSeverity, setFilterSeverity] = useState('all');

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/api/recent-high-risk`);
      if (!res.ok) throw new Error('Failed to fetch alerts');
      setAlerts(await res.json());
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Connection interrupted. Ensure Engine Port 8501 is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const filteredAlerts = filterSeverity === 'all' ? alerts : alerts.filter(a => {
    if (filterSeverity === 'critical') return a.risk_score >= 90;
    if (filterSeverity === 'high') return a.risk_score >= 70 && a.risk_score < 90;
    return a.risk_score < 70;
  });

  // Stats
  const criticalCount = alerts.filter(a => a.risk_score >= 90).length;
  const highCount = alerts.filter(a => a.risk_score >= 70 && a.risk_score < 90).length;
  const avgScore = alerts.length > 0 ? Math.round(alerts.reduce((s, a) => s + (a.risk_score || 0), 0) / alerts.length) : 0;
  const maxAmount = alerts.length > 0 ? Math.max(...alerts.map(a => a.amount || 0)) : 0;

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-12">
      {/* Page Header */}
      <div className="mb-2 animate-fade-in">
        <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
          Live Interventions <span className="gradient-text-danger">Queue</span>
        </h1>
        <p className="text-slate-500 text-sm">Real-time log of critical transactions isolated by PySpark heuristics.</p>
      </div>

      {error && (
        <div className="bg-danger-500/10 border border-danger-500/20 p-4 rounded-2xl flex items-start text-danger-400 animate-fade-in">
          <ShieldAlert className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Summary Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in fill-both stagger-1">
        <StatMini icon={<AlertTriangle className="w-4 h-4 text-danger-400" />} label="Critical" value={criticalCount} accent="danger" />
        <StatMini icon={<ShieldAlert className="w-4 h-4 text-warning-400" />} label="High Risk" value={highCount} accent="warning" />
        <StatMini icon={<Zap className="w-4 h-4 text-cyan-400" />} label="Avg Score" value={avgScore} accent="cyan" />
        <StatMini icon={<DollarSign className="w-4 h-4 text-primary-400" />} label="Max Volume" value={`$${maxAmount.toLocaleString()}`} accent="primary" />
      </div>

      {/* Main Table Card */}
      <div className="pro-card overflow-hidden flex flex-col animate-fade-in fill-both stagger-2">
        {/* Table Header */}
        <div className="p-5 border-b border-dark-700/30 flex justify-between items-center bg-dark-900/60">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-danger-500 animate-pulse" />
            Threat Matrix
          </h3>
          <div className="flex items-center gap-3">
            {/* Filter Dropdown */}
            <div className="relative">
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="appearance-none bg-dark-800 border border-dark-700/50 text-xs text-slate-300 px-3 py-1.5 pr-7 rounded-lg focus:outline-none focus:border-primary-500/30 cursor-pointer"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical Only</option>
                <option value="high">High Only</option>
                <option value="moderate">Moderate</option>
              </select>
              <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <div className="badge-critical">
              <span className="w-1.5 h-1.5 rounded-full bg-danger-500 mr-1.5 animate-pulse" />
              {filteredAlerts.length} NODES
            </div>
          </div>
        </div>

        {loading && alerts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 space-y-4">
            <div className="relative">
              <Activity className="w-8 h-8 text-primary-500 animate-spin" />
              <div className="absolute -inset-3 rounded-full bg-primary-500/10 animate-pulse" />
            </div>
            <p className="text-slate-400 text-sm">Aggregating threat data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-slate-500 uppercase text-[10px] tracking-[0.15em] border-b border-dark-700/30 bg-dark-900/40">
                <tr>
                  <th className="px-6 py-4 font-medium"><Hash className="w-3 h-3 inline mr-1 -mt-0.5" />Block Hash</th>
                  <th className="px-6 py-4 font-medium"><User className="w-3 h-3 inline mr-1 -mt-0.5" />User</th>
                  <th className="px-6 py-4 font-medium"><DollarSign className="w-3 h-3 inline mr-1 -mt-0.5" />Volume</th>
                  <th className="px-6 py-4 font-medium"><MapPin className="w-3 h-3 inline mr-1 -mt-0.5" />Origin</th>
                  <th className="px-6 py-4 font-medium"><Monitor className="w-3 h-3 inline mr-1 -mt-0.5" />Device</th>
                  <th className="px-6 py-4 font-medium">Severity</th>
                  <th className="px-6 py-4 font-medium">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700/20">
                {filteredAlerts.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <ShieldAlert className="w-8 h-8 text-slate-600" />
                        <p className="text-slate-500 text-sm">No threats matching current filter</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAlerts.map((alert, idx) => {
                    const risk = getRiskColor(alert.risk_score);
                    const isExpanded = expandedRow === idx;
                    return (
                      <tr
                        key={idx}
                        className={`pro-table-row cursor-pointer ${isExpanded ? 'bg-dark-800/40' : ''}`}
                        onClick={() => setExpandedRow(isExpanded ? null : idx)}
                        style={{ animationDelay: `${idx * 40}ms` }}
                      >
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs text-primary-400 bg-primary-500/5 px-2 py-1 rounded-md border border-primary-500/10">
                            {(alert.transaction_id || '').substring(0, 10)}...
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs text-slate-300">USR_{alert.user_id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm font-semibold text-white">
                            ${typeof alert.amount === 'number' ? alert.amount.toLocaleString(undefined, { minimumFractionDigits: 2 }) : alert.amount}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs text-slate-300 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                            {alert.country}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs text-slate-400 capitalize bg-dark-800/60 px-2 py-1 rounded-md">
                            {alert.device_type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={risk.badge}>
                            <span className={`w-1.5 h-1.5 rounded-full ${risk.bg} mr-1.5`} />
                            {risk.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3 min-w-[120px]">
                            <span className={`font-mono font-bold text-sm ${risk.text}`}>{alert.risk_score}</span>
                            <div className="flex-1 risk-bar">
                              <div
                                className={`risk-bar__fill bg-gradient-to-r ${risk.bar}`}
                                style={{ width: `${Math.min(alert.risk_score, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 border-t border-dark-700/30 flex items-center justify-between text-xs text-slate-500 bg-dark-900/40">
          <span>Showing {filteredAlerts.length} of {alerts.length} flagged transactions</span>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            <span>Polling every {POLL_INTERVAL / 1000}s</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatMini({ icon, label, value, accent }) {
  const accents = {
    danger: 'border-danger-500/15',
    warning: 'border-warning-500/15',
    cyan: 'border-cyan-500/15',
    primary: 'border-primary-500/15',
  };

  return (
    <div className={`pro-card p-4 flex items-center gap-3 ${accents[accent]}`}>
      <div className="p-2 bg-dark-800 rounded-lg border border-dark-700/30">
        {icon}
      </div>
      <div>
        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">{label}</p>
        <p className="text-lg font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

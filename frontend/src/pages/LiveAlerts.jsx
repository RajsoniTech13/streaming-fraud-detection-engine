import { useState, useEffect } from 'react';
import { ShieldAlert, Activity } from 'lucide-react';

const API_URL = "http://localhost:8501";
const POLL_INTERVAL = 5000;

export default function LiveAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    fetchData(); // Initial load
    const interval = setInterval(fetchData, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-white mb-2">Live Interventions Queue</h1>
        <p className="text-slate-400 text-sm">Real-time log of critical transactions isolated by PySpark heuristics.</p>
      </div>

      {error && (
        <div className="bg-danger-500/10 border border-danger-500/30 p-4 rounded-xl flex items-start text-danger-400">
          <ShieldAlert className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <div className="pro-card overflow-hidden flex flex-col min-h-[50vh]">
        <div className="p-5 border-b border-dark-700/50 flex justify-between items-center bg-dark-900">
          <h3 className="text-base font-medium text-white flex items-center">
            <ShieldAlert className="w-4 h-4 mr-2 text-danger-500 animate-[pulse_2s_ease-in-out_infinite]" /> Threat Matrix
          </h3>
          <div className="px-3 py-1 bg-danger-500/10 text-danger-400 rounded text-xs font-semibold border border-danger-500/20">
            {alerts.length} CRITICAL NODES
          </div>
        </div>
        
        {loading && alerts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <Activity className="w-8 h-8 text-primary-500 animate-spin" />
            <p className="text-slate-400 text-sm">Aggregating HDFS Logs...</p>
          </div>
        ) : (
          <div className="overflow-x-auto flex-1 bg-dark-950/20">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-slate-400 uppercase text-xs tracking-wider border-b border-dark-700/50 bg-dark-900/40">
                <tr>
                  <th className="px-6 py-4 font-medium">Block Hash (ID)</th>
                  <th className="px-6 py-4 font-medium">User Ident</th>
                  <th className="px-6 py-4 font-medium">Financial Volume</th>
                  <th className="px-6 py-4 font-medium">Origin Country</th>
                  <th className="px-6 py-4 font-medium">Hardware Node</th>
                  <th className="px-6 py-4 font-medium">Engine Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700/30">
                {alerts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">Awaiting incident data...</td>
                  </tr>
                ) : (
                  alerts.map((alert, idx) => (
                    <tr key={idx} className="pro-table-row">
                      <td className="px-6 py-4 font-mono text-primary-400 text-xs">{(alert.transaction_id || '').substring(0, 12)}...</td>
                      <td className="px-6 py-4 font-mono text-slate-300">USER_{alert.user_id}</td>
                      <td className="px-6 py-4 font-mono text-white">
                        ${typeof alert.amount === 'number' ? alert.amount.toFixed(2) : alert.amount}
                      </td>
                      <td className="px-6 py-4 text-slate-300">{alert.country}</td>
                      <td className="px-6 py-4 text-slate-300 capitalize">{alert.device_type}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className="w-2 h-2 mr-2 rounded-full bg-danger-500 opacity-90"></span>
                          <span className="text-danger-400 font-semibold">{alert.risk_score}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

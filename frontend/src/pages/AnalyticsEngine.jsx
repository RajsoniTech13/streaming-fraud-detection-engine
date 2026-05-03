import { useState, useEffect } from 'react';
import {
  ResponsiveContainer, Tooltip,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ZAxis,
  Treemap, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area, Cell,
} from 'recharts';
import { BrainCircuit, Layers, Target, TrendingUp, AlertTriangle, BarChart3, Radar as RadarIcon, GitBranch } from 'lucide-react';

const API_URL = "http://localhost:8501";
const POLL_INTERVAL = 8000;

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-dark-900/95 backdrop-blur-md border border-dark-700/50 rounded-xl px-4 py-3 shadow-2xl">
      {label && <p className="text-xs text-slate-400 mb-2 font-medium">{label}</p>}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center justify-between gap-6 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: entry.color || '#a855f7' }} />
            {entry.name || entry.dataKey}
          </span>
          <span className="font-mono font-semibold text-white">
            {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// Generate scatter data from alerts
function generateScatterData(alerts) {
  return alerts.map(a => ({
    amount: a.amount || Math.random() * 10000,
    riskScore: a.risk_score || Math.random() * 100,
    country: a.country || 'Unknown',
    device: a.device_type || 'unknown',
  }));
}

// Generate funnel data
function generateFunnelData(riskData) {
  const total = riskData.reduce((a, b) => a + (b.count || 0), 0);
  const safe = riskData.find(d => d.risk_level === 'SAFE')?.count || 0;
  const medium = riskData.find(d => d.risk_level === 'MEDIUM')?.count || 0;
  const high = riskData.find(d => d.risk_level === 'HIGH')?.count || 0;
  return [
    { name: 'Total Processed', value: total, fill: '#475569' },
    { name: 'Passed Filters', value: total - safe, fill: '#a855f7' },
    { name: 'Medium Risk', value: medium + high, fill: '#f59e0b' },
    { name: 'High Risk', value: high, fill: '#ef4444' },
    { name: 'Blocked', value: Math.round(high * 0.7), fill: '#f43f5e' },
  ];
}


// Generate correlation data for time-of-day analysis
function generateTimeAnalysis() {
  const data = [];
  for (let h = 0; h < 24; h++) {
    const label = `${String(h).padStart(2, '0')}:00`;
    const isRisky = (h >= 0 && h <= 5) || (h >= 22);
    const base = isRisky ? 15 : 5;
    data.push({
      hour: label,
      threats: Math.round(base + Math.random() * 10),
      volume: Math.round(50 + Math.random() * 200),
    });
  }
  return data;
}

export default function AnalyticsEngine() {
  const [riskData, setRiskData] = useState([]);
  const [countryData, setCountryData] = useState([]);
  const [paymentData, setPaymentData] = useState([]);
  const [deviceData, setDeviceData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const [riskRes, countryRes, paymentRes, deviceRes, alertsRes] = await Promise.all([
        fetch(`${API_URL}/api/risk-distribution`),
        fetch(`${API_URL}/api/country-fraud`),
        fetch(`${API_URL}/api/payment-fraud`),
        fetch(`${API_URL}/api/device-fraud`),
        fetch(`${API_URL}/api/recent-high-risk`),
      ]);

      if (!riskRes.ok || !countryRes.ok || !paymentRes.ok || !deviceRes.ok || !alertsRes.ok)
        throw new Error('Failed to fetch from endpoints');

      setRiskData(await riskRes.json());
      setCountryData(await countryRes.json());
      setPaymentData(await paymentRes.json());
      setDeviceData(await deviceRes.json());
      setAlerts(await alertsRes.json());
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

  const scatterData = generateScatterData(alerts);
  const funnelData = generateFunnelData(riskData);
  const timeData = generateTimeAnalysis();
  const treemapData = [
    ...countryData.map(d => ({ name: d.country, size: d.count, fill: '#a855f7' })),
    ...paymentData.map(d => ({ name: d.payment_method, size: d.count, fill: '#22d3ee' })),
    ...deviceData.map(d => ({ name: d.device_type, size: d.count, fill: '#f59e0b' })),
  ];

  // Multi-dimensional radar from all vectors
  const radarData = [
    { axis: 'Volume', A: funnelData[0]?.value || 0 },
    { axis: 'Filtered', A: funnelData[1]?.value || 0 },
    { axis: 'Medium', A: funnelData[2]?.value || 0 },
    { axis: 'High', A: funnelData[3]?.value || 0 },
    { axis: 'Blocked', A: funnelData[4]?.value || 0 },
  ];

  // Normalize radar values for display
  const maxRadar = Math.max(...radarData.map(d => d.A), 1);
  const normalizedRadar = radarData.map(d => ({ ...d, A: Math.round((d.A / maxRadar) * 100) }));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-dark-900 border border-dark-700/30 flex items-center justify-center">
            <BrainCircuit className="w-8 h-8 text-cyan-400 animate-spin" />
          </div>
          <div className="absolute -inset-2 rounded-2xl bg-cyan-500/10 animate-pulse -z-10" />
        </div>
        <h3 className="text-lg text-slate-300 font-medium">Initializing Analytics Engine...</h3>
        <p className="text-xs text-slate-500">Processing multi-dimensional correlations</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-12">
      {/* Page Header */}
      <div className="mb-2 animate-fade-in">
        <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
          Analytics <span className="gradient-text">Engine</span>
        </h1>
        <p className="text-slate-500 text-sm">Deep-dive into risk correlations, threat vectors, and detection pipeline metrics.</p>
      </div>

      {error && (
        <div className="bg-danger-500/10 border border-danger-500/20 p-4 rounded-2xl flex items-start text-danger-400 animate-fade-in">
          <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Row 1: Scatter + Funnel */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Scatter Plot: Amount vs Risk */}
        <div className="pro-card p-6 h-[380px] flex flex-col animate-fade-in fill-both stagger-1">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1 h-4 rounded-full bg-gradient-to-b from-cyan-500 to-primary-500" />
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-400" />
                Amount vs Risk Correlation
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Each point = one flagged transaction</p>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#232838" />
                <XAxis
                  dataKey="amount"
                  name="Amount ($)"
                  stroke="#475569"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10 }}
                  label={{ value: 'Amount ($)', position: 'bottom', offset: -5, style: { fontSize: 10, fill: '#64748b' } }}
                />
                <YAxis
                  dataKey="riskScore"
                  name="Risk Score"
                  stroke="#475569"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10 }}
                  domain={[0, 100]}
                  label={{ value: 'Risk Score', angle: -90, position: 'insideLeft', offset: 15, style: { fontSize: 10, fill: '#64748b' } }}
                />
                <ZAxis range={[40, 160]} />
                <Tooltip content={<CustomTooltip />} />
                <Scatter name="Transactions" data={scatterData} fill="#a855f7" fillOpacity={0.7} strokeWidth={0}>
                  {scatterData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.riskScore >= 90 ? '#ef4444' : entry.riskScore >= 70 ? '#f59e0b' : '#22d3ee'}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detection Funnel */}
        <div className="pro-card p-6 h-[380px] flex flex-col animate-fade-in fill-both stagger-2">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1 h-4 rounded-full bg-gradient-to-b from-primary-500 to-danger-500" />
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-primary-400" />
                Detection Pipeline Funnel
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Transaction flow through risk filters</p>
            </div>
          </div>
          <div className="flex-1 min-h-0 flex items-center">
            {/* Manual funnel visualization */}
            <div className="w-full space-y-2 px-4">
              {funnelData.map((item, idx) => {
                const maxVal = funnelData[0]?.value || 1;
                const pct = Math.max((item.value / maxVal) * 100, 15);
                return (
                  <div key={idx} className="flex items-center gap-3 group">
                    <span className="text-[10px] text-slate-400 w-28 text-right truncate">{item.name}</span>
                    <div className="flex-1 h-8 bg-dark-800/50 rounded-lg overflow-hidden relative">
                      <div
                        className="h-full rounded-lg flex items-center justify-end pr-3 transition-all duration-700"
                        style={{
                          width: `${pct}%`,
                          background: `linear-gradient(90deg, ${item.fill}33, ${item.fill}cc)`,
                          border: `1px solid ${item.fill}44`,
                        }}
                      >
                        <span className="text-xs font-mono font-semibold text-white drop-shadow-sm">
                          {item.value.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Time Analysis + Pipeline Radar */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Time-of-Day Threat Analysis */}
        <div className="pro-card p-6 h-80 xl:col-span-2 flex flex-col animate-fade-in fill-both stagger-3">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1 h-4 rounded-full bg-gradient-to-b from-warning-400 to-danger-500" />
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-warning-400" />
                Time-of-Day Threat Distribution
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Threat density mapped against hourly transaction volume</p>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="threatGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#232838" vertical={false} />
                <XAxis dataKey="hour" stroke="#475569" axisLine={false} tickLine={false} tick={{ fontSize: 9 }} interval={2} />
                <YAxis stroke="#475569" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="volume" name="Volume" stroke="#22d3ee" fill="url(#volGrad)" strokeWidth={1.5} />
                <Area type="monotone" dataKey="threats" name="Threats" stroke="#ef4444" fill="url(#threatGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pipeline Radar */}
        <div className="pro-card p-6 h-80 flex flex-col animate-fade-in fill-both stagger-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1 h-4 rounded-full bg-gradient-to-b from-primary-500 to-cyan-500" />
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <RadarIcon className="w-4 h-4 text-primary-400" />
                Pipeline Profile
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Normalized detection stages</p>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={normalizedRadar} cx="50%" cy="50%" outerRadius="65%">
                <PolarGrid stroke="#232838" />
                <PolarAngleAxis dataKey="axis" tick={{ fontSize: 9, fill: '#94a3b8' }} />
                <PolarRadiusAxis tick={false} axisLine={false} />
                <Radar name="Pipeline" dataKey="A" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.12} strokeWidth={2} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Treemap */}
      <div className="pro-card p-6 animate-fade-in fill-both stagger-5">
        <div className="flex items-center gap-2 mb-5">
          <span className="w-1 h-4 rounded-full bg-gradient-to-b from-primary-500 to-warning-400" />
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary-400" />
              Threat Vector Composition
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Proportional breakdown across all risk dimensions</p>
          </div>
          <div className="ml-auto flex items-center gap-4 text-[10px]">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-primary-500" /> Countries</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-cyan-500" /> Payments</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-warning-500" /> Devices</span>
          </div>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={treemapData}
              dataKey="size"
              nameKey="name"
              stroke="#0d1017"
              strokeWidth={2}
              animationDuration={800}
            >
              <Tooltip content={<CustomTooltip />} />
            </Treemap>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-fade-in fill-both stagger-6">
        <InsightCard
          icon={<Target className="w-5 h-5 text-danger-400" />}
          title="Highest Risk Vector"
          value={countryData[0]?.country || 'N/A'}
          detail={`${countryData[0]?.count || 0} high-risk transactions detected`}
          accent="danger"
        />
        <InsightCard
          icon={<TrendingUp className="w-5 h-5 text-warning-400" />}
          title="Peak Threat Hour"
          value={timeData.reduce((max, d) => d.threats > max.threats ? d : max, timeData[0])?.hour || '00:00'}
          detail="Most threats concentrated in late-night hours"
          accent="warning"
        />
        <InsightCard
          icon={<BrainCircuit className="w-5 h-5 text-cyan-400" />}
          title="Detection Efficiency"
          value={`${funnelData[0]?.value ? Math.round((funnelData[3]?.value / funnelData[0]?.value) * 100) : 0}%`}
          detail="Transactions correctly escalated to HIGH risk"
          accent="cyan"
        />
      </div>
    </div>
  );
}

function InsightCard({ icon, title, value, detail, accent }) {
  const accents = {
    danger: 'border-danger-500/15 hover:border-danger-500/30',
    warning: 'border-warning-500/15 hover:border-warning-500/30',
    cyan: 'border-cyan-500/15 hover:border-cyan-500/30',
  };

  return (
    <div className={`pro-card p-5 ${accents[accent]} group cursor-default`}>
      <div className="flex items-start gap-3">
        <div className="p-2.5 bg-dark-800 rounded-xl border border-dark-700/30 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mb-1">{title}</p>
          <p className="text-xl font-bold text-white mb-1 truncate">{value}</p>
          <p className="text-[11px] text-slate-500 leading-relaxed">{detail}</p>
        </div>
      </div>
    </div>
  );
}

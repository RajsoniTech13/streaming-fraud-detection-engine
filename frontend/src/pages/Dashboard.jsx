import { useState, useEffect, useRef } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ComposedChart, Line
} from 'recharts';
import { Activity, ShieldAlert, Globe, TrendingUp, TrendingDown, Zap, Eye } from 'lucide-react';

const API_URL = "http://localhost:8501";
const POLL_INTERVAL = 5000;

// Animated counter hook
function useAnimatedCounter(target, duration = 1200) {
  const [count, setCount] = useState(0);
  const prevTarget = useRef(0);

  useEffect(() => {
    if (target === prevTarget.current) return;
    const start = prevTarget.current;
    const diff = target - start;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.round(start + diff * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
    prevTarget.current = target;
  }, [target, duration]);

  return count;
}

// Synthetic time-series data generator (simulating trend data from last 24h)
function generateTrendData(riskData) {
  const hours = [];
  const total = riskData.reduce((a, b) => a + (b.count || 0), 0) || 100;
  const highCount = riskData.find(d => d.risk_level === 'HIGH')?.count || 10;

  for (let i = 23; i >= 0; i--) {
    const hour = new Date();
    hour.setHours(hour.getHours() - i);
    const label = hour.toLocaleTimeString('en-US', { hour: '2-digit', hour12: false }) + ':00';
    const base = Math.round(total / 24);
    const jitter = Math.random() * 0.6 + 0.7;
    const safe = Math.round(base * jitter * 0.6);
    const medium = Math.round(base * jitter * 0.25);
    const high = Math.round((highCount / 24) * (Math.random() * 1.5 + 0.5));
    hours.push({ time: label, Safe: safe, Medium: medium, High: high, total: safe + medium + high });
  }
  return hours;
}

// Custom tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-dark-900/95 backdrop-blur-md border border-dark-700/50 rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-xs text-slate-400 mb-2 font-medium">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center justify-between gap-6 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            {entry.name}
          </span>
          <span className="font-mono font-semibold text-white">{typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}</span>
        </div>
      ))}
    </div>
  );
};

// Pie chart center label
const CenterLabel = ({ total }) => (
  <text x="50%" y="48%" textAnchor="middle" dominantBaseline="central" className="fill-white text-2xl font-bold">
    {total.toLocaleString()}
    <tspan x="50%" dy="22" className="fill-slate-400 text-[10px] font-normal tracking-widest">
      TOTAL BLOCKS
    </tspan>
  </text>
);

export default function Dashboard() {
  const [riskData, setRiskData] = useState([]);
  const [countryData, setCountryData] = useState([]);
  const [paymentData, setPaymentData] = useState([]);
  const [deviceData, setDeviceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const [riskRes, countryRes, paymentRes, deviceRes] = await Promise.all([
        fetch(`${API_URL}/api/risk-distribution`),
        fetch(`${API_URL}/api/country-fraud`),
        fetch(`${API_URL}/api/payment-fraud`),
        fetch(`${API_URL}/api/device-fraud`)
      ]);

      if (!riskRes.ok || !countryRes.ok || !paymentRes.ok || !deviceRes.ok)
        throw new Error('Failed to fetch from endpoints');

      setRiskData(await riskRes.json());
      setCountryData(await countryRes.json());
      setPaymentData(await paymentRes.json());
      setDeviceData(await deviceRes.json());
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

  const pieData = riskData.map(d => ({ name: d.risk_level, value: d.count }));
  const totalBlocks = pieData.reduce((a, b) => a + b.value, 0);
  const highCount = pieData.find(d => d.name === 'HIGH')?.value || 0;
  const safeCount = pieData.find(d => d.name === 'SAFE')?.value || 0;
  const detectionRate = totalBlocks > 0 ? ((highCount / totalBlocks) * 100).toFixed(1) : '0.0';
  const safeRate = totalBlocks > 0 ? ((safeCount / totalBlocks) * 100).toFixed(1) : '0.0';

  const animatedTotal = useAnimatedCounter(totalBlocks);
  const animatedHigh = useAnimatedCounter(highCount);
  const animatedRegions = useAnimatedCounter(countryData.length);

  const trendData = generateTrendData(riskData);

  // Build radar data from device + payment
  const radarData = [
    { axis: 'Mobile', value: deviceData.find(d => d.device_type === 'mobile')?.count || 0 },
    { axis: 'Desktop', value: deviceData.find(d => d.device_type === 'desktop')?.count || 0 },
    { axis: 'Tablet', value: deviceData.find(d => d.device_type === 'tablet')?.count || 0 },
    { axis: 'Crypto', value: paymentData.find(d => d.payment_method === 'crypto')?.count || 0 },
    { axis: 'Card', value: paymentData.find(d => d.payment_method === 'credit_card')?.count || 0 },
    { axis: 'Transfer', value: paymentData.find(d => d.payment_method === 'bank_transfer')?.count || 0 },
  ];

  const COLORS = {
    'SAFE': '#22c55e',
    'MEDIUM': '#f59e0b',
    'HIGH': '#ef4444'
  };

  const calculateDomain = (data) => {
    if (!data || data.length === 0) return [0, 100];
    const maxVal = Math.max(...data.map(d => d.count));
    return [0, Math.ceil(maxVal * 1.15)];
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-dark-900 border border-dark-700/30 flex items-center justify-center">
            <Activity className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
          <div className="absolute -inset-2 rounded-2xl bg-primary-500/10 animate-pulse -z-10" />
        </div>
        <h3 className="text-lg text-slate-300 font-medium tracking-wide">Syncing Telemetry...</h3>
        <p className="text-xs text-slate-500">Establishing connection to Engine Port 8501</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-12">
      {/* Page Header */}
      <div className="mb-2 animate-fade-in">
        <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
          Core Analytics <span className="gradient-text">Dashboard</span>
        </h1>
        <p className="text-slate-500 text-sm">Visual aggregation of global data blocks evaluated against heuristics.</p>
      </div>

      {error && (
        <div className="bg-danger-500/10 border border-danger-500/20 p-4 rounded-2xl flex items-start text-danger-400 animate-fade-in">
          <ShieldAlert className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <MetricCard
          title="Monitored Blocks"
          value={animatedTotal.toLocaleString()}
          icon={<Activity className="w-5 h-5" />}
          accent="purple"
          trend={`+${Math.round(totalBlocks * 0.12)}`}
          trendUp={true}
          delay="stagger-1"
        />
        <MetricCard
          title="Critical Flags"
          value={animatedHigh.toLocaleString()}
          icon={<ShieldAlert className="w-5 h-5" />}
          accent="rose"
          trend={`${detectionRate}%`}
          trendLabel="detection"
          trendUp={false}
          delay="stagger-2"
        />
        <MetricCard
          title="Active Regions"
          value={animatedRegions}
          icon={<Globe className="w-5 h-5" />}
          accent="cyan"
          trend="Global"
          trendUp={true}
          delay="stagger-3"
        />
        <MetricCard
          title="Safe Rate"
          value={`${safeRate}%`}
          icon={<Zap className="w-5 h-5" />}
          accent="emerald"
          trend="Optimal"
          trendUp={true}
          delay="stagger-4"
        />
      </div>

      {/* Trend Area Chart - Full Width */}
      <div className="pro-card p-6 animate-fade-in fill-both stagger-3">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400" />
              24-Hour Threat Trend
            </h3>
            <p className="text-xs text-slate-500 mt-1">Stacked distribution of risk classifications over time</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-safe-500" /> Safe</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-warning-400" /> Medium</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-danger-500" /> High</span>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradSafe" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradMedium" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradHigh" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#232838" vertical={false} />
              <XAxis dataKey="time" stroke="#475569" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} interval={2} />
              <YAxis stroke="#475569" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="Safe" stackId="1" stroke="#22c55e" fill="url(#gradSafe)" strokeWidth={1.5} />
              <Area type="monotone" dataKey="Medium" stackId="1" stroke="#f59e0b" fill="url(#gradMedium)" strokeWidth={1.5} />
              <Area type="monotone" dataKey="High" stackId="1" stroke="#ef4444" fill="url(#gradHigh)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Risk Distribution + Regional Threat */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Risk Distribution Donut */}
        <div className="pro-card p-6 h-[380px] flex flex-col animate-fade-in fill-both stagger-4">
          <h3 className="section-header mb-4 flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-gradient-to-b from-primary-500 to-cyan-500" />
            Risk Distribution
          </h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius="62%" outerRadius="82%" paddingAngle={3} dataKey="value" stroke="none" cornerRadius={4}>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#334155'} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => <span className="text-xs text-slate-300 ml-1">{value}</span>}
                />
                <CenterLabel total={totalBlocks} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Regional Threat Volume */}
        <div className="pro-card p-6 h-[380px] xl:col-span-2 flex flex-col animate-fade-in fill-both stagger-5">
          <h3 className="section-header mb-4 flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-gradient-to-b from-danger-500 to-warning-400" />
            Regional Threat Volume
          </h3>
          <div className="flex-1 min-h-0 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={countryData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#232838" vertical={false} />
                <XAxis dataKey="country" stroke="#475569" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} dy={8} />
                <YAxis stroke="#475569" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="url(#barGrad)" radius={[6, 6, 0, 0]} maxBarSize={45} />
                <Line type="monotone" dataKey="count" stroke="#22d3ee" strokeWidth={2} dot={{ r: 3, fill: '#22d3ee' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Radar + Payment + Device */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Threat Radar */}
        <div className="pro-card p-6 h-80 flex flex-col animate-fade-in fill-both stagger-5">
          <h3 className="section-header mb-4 flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-gradient-to-b from-cyan-500 to-primary-500" />
            Threat Vector Radar
          </h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="#232838" />
                <PolarAngleAxis dataKey="axis" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <PolarRadiusAxis tick={false} axisLine={false} />
                <Radar name="Threats" dataKey="value" stroke="#a855f7" fill="#a855f7" fillOpacity={0.15} strokeWidth={2} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Method Vector */}
        <div className="pro-card p-6 h-80 flex flex-col animate-fade-in fill-both stagger-5">
          <h3 className="section-header mb-4 flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-gradient-to-b from-primary-400 to-primary-600" />
            Vector: Financial Medium
          </h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                <defs>
                  <linearGradient id="payGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#c084fc" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#232838" horizontal={false} />
                <XAxis type="number" stroke="#475569" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} domain={calculateDomain(paymentData)} />
                <YAxis dataKey="payment_method" type="category" stroke="#475569" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} dx={-5} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="url(#payGrad)" radius={[0, 6, 6, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device Type Vector */}
        <div className="pro-card p-6 h-80 flex flex-col animate-fade-in fill-both stagger-6">
          <h3 className="section-header mb-4 flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-gradient-to-b from-warning-400 to-danger-500" />
            Vector: Hardware Node
          </h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deviceData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                <defs>
                  <linearGradient id="devGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.7} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0.9} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#232838" horizontal={false} />
                <XAxis type="number" stroke="#475569" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} domain={calculateDomain(deviceData)} />
                <YAxis dataKey="device_type" type="category" stroke="#475569" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} dx={-5} width={70} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="url(#devGrad)" radius={[0, 6, 6, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// Enhanced Metric Card
function MetricCard({ title, value, icon, accent, trend, trendUp, trendLabel, delay }) {
  const accentColors = {
    purple: { icon: 'text-primary-400', bg: 'bg-primary-500/10', border: 'border-primary-500/20', trend: 'text-primary-300' },
    rose: { icon: 'text-danger-400', bg: 'bg-danger-500/10', border: 'border-danger-500/20', trend: 'text-danger-300' },
    cyan: { icon: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', trend: 'text-cyan-300' },
    emerald: { icon: 'text-safe-400', bg: 'bg-safe-500/10', border: 'border-safe-500/20', trend: 'text-safe-300' },
  };
  const colors = accentColors[accent] || accentColors.purple;

  return (
    <div className={`metric-card metric-card--${accent} animate-fade-in fill-both ${delay} group`}>
      <div className="flex items-start justify-between">
        <div>
          <h4 className="section-header mb-2">{title}</h4>
          <div className="text-3xl font-bold tracking-tight text-white mb-2">{value}</div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs ${colors.trend}`}>
              {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span className="font-medium">{trend}</span>
              {trendLabel && <span className="text-slate-500 ml-1">{trendLabel}</span>}
            </div>
          )}
        </div>
        <div className={`p-3 ${colors.bg} rounded-xl ${colors.border} border group-hover:scale-110 transition-transform duration-300`}>
          <span className={colors.icon}>{icon}</span>
        </div>
      </div>
    </div>
  );
}

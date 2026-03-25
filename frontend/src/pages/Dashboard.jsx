import { useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { Activity, ShieldAlert, Cpu, Globe, CreditCard } from 'lucide-react';

const API_URL = "http://localhost:8501";
const POLL_INTERVAL = 5000;

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
  const COLORS = { 'SAFE': '#22c55e', 'MEDIUM': '#f59e0b', 'HIGH': '#ef4444' };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Activity className="w-10 h-10 text-primary-500 animate-spin" />
        <h3 className="text-lg text-slate-300 font-medium tracking-wide">Syncing Telemetry...</h3>
      </div>
    );
  }

  // To make responsive domain limit calculations
  const calculateDomain = (data) => {
    if (!data || data.length === 0) return [0, 100];
    const maxVal = Math.max(...data.map(d => d.count));
    // Provide a dynamic ceiling so charts aren't constrained
    const padding = maxVal * 0.1; 
    return [0, Math.ceil(maxVal + padding)];
  };

  const deviceDomain = calculateDomain(deviceData);
  const paymentDomain = calculateDomain(paymentData);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-white mb-2">Core Analytics Dashboard</h1>
        <p className="text-slate-400 text-sm">Visual aggregation of global data blocks evaluated against heuristics.</p>
      </div>

      {error && (
        <div className="bg-danger-500/10 border border-danger-500/30 p-4 rounded-xl flex items-start text-danger-400">
          <ShieldAlert className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <MetricCard title="Monitored Blocks" value={pieData.reduce((a, b) => a + b.value, 0).toLocaleString()} icon={<Activity className="text-primary-400" />} />
        <MetricCard title="Critical Flags" value={pieData.find(d => d.name === 'HIGH')?.value.toLocaleString() || 0} icon={<ShieldAlert className="text-danger-400" />} />
        <MetricCard title="Active Regions" value={countryData.length} icon={<Globe className="text-primary-400" />} />
        <MetricCard title="Engine Efficiency" value="99.9%" icon={<Cpu className="text-safe-400" />} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Risk Distribution Pie */}
        <div className="pro-card p-6 h-[24rem] flex flex-col">
          <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center uppercase tracking-wider">
            Risk Distribution
          </h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius="65%" outerRadius="85%" paddingAngle={4} dataKey="value" stroke="none">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#334155'} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#15181e', border: '1px solid #2a303c', borderRadius: '8px', color: '#f1f5f9' }}
                  itemStyle={{ color: '#f1f5f9' }}
                  cursor={{fill: 'transparent'}}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Global Impact Bar */}
        <div className="pro-card p-6 h-[24rem] xl:col-span-2 flex flex-col">
          <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center uppercase tracking-wider">
            Regional Threat Volume
          </h3>
          <div className="flex-1 min-h-0 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={countryData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a303c" vertical={false} />
                <XAxis dataKey="country" stroke="#64748b" axisLine={false} tickLine={false} tick={{fontSize: 12}} dy={10} />
                <YAxis stroke="#64748b" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#1f242d'}}
                  contentStyle={{ backgroundColor: '#15181e', border: '1px solid #2a303c', borderRadius: '8px' }}
                />
                <Bar dataKey="count" fill="#a855f7" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Payment Vulnerability */}
        <div className="pro-card p-6 h-80 flex flex-col">
          <h3 className="text-sm font-medium text-slate-300 mb-6 flex items-center uppercase tracking-wider">
            Vector: Financial Medium
          </h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentData} layout="vertical" margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a303c" horizontal={false} />
                {/* Dynamically scale XAxis instead of hardcoded 60 max */}
                <XAxis type="number" stroke="#64748b" axisLine={false} tickLine={false} domain={paymentDomain} />
                <YAxis dataKey="payment_method" type="category" stroke="#64748b" axisLine={false} tickLine={false} dx={-10} />
                <Tooltip 
                  cursor={{fill: '#1f242d'}}
                  contentStyle={{ backgroundColor: '#15181e', border: '1px solid #2a303c', borderRadius: '8px' }}
                />
                <Bar dataKey="count" fill="#c084fc" radius={[0, 4, 4, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device Targets */}
        <div className="pro-card p-6 h-80 flex flex-col">
          <h3 className="text-sm font-medium text-slate-300 mb-6 flex items-center uppercase tracking-wider">
            Vector: Hardware Node
          </h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deviceData} layout="vertical" margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a303c" horizontal={false} />
                {/* Dynamically scale XAxis instead of hardcoded 60 max */}
                <XAxis type="number" stroke="#64748b" axisLine={false} tickLine={false} domain={deviceDomain} />
                <YAxis dataKey="device_type" type="category" stroke="#64748b" axisLine={false} tickLine={false} dx={-10} />
                <Tooltip 
                  cursor={{fill: '#1f242d'}}
                  contentStyle={{ backgroundColor: '#15181e', border: '1px solid #2a303c', borderRadius: '8px' }}
                />
                <Bar dataKey="count" fill="#9333ea" radius={[0, 4, 4, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon }) {
  return (
    <div className="pro-card p-6 flex items-center justify-between group">
      <div>
        <h4 className="text-slate-400 text-xs font-semibold tracking-wider uppercase mb-2">{title}</h4>
        <div className="text-3xl font-semibold tracking-tight text-white">{value}</div>
      </div>
      <div className="p-3 bg-dark-800 rounded-xl border border-dark-700/50 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
    </div>
  );
}

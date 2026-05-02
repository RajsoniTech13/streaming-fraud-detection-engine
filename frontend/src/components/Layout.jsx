import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Settings, ShieldAlert, Activity, Shield, BarChart3, Bell, Search, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

const API_URL = "http://localhost:8501";
const POLL_INTERVAL = 5000;

const navSections = [
  {
    label: 'Dashboard',
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Core Analytics', accent: 'primary' },
      { to: '/analytics', icon: BarChart3, label: 'Analytics Engine', accent: 'cyan' },
      { to: '/alerts', icon: ShieldAlert, label: 'Live Interventions', accent: 'danger' },
    ]
  },
  {
    label: 'System',
    items: [
      { to: '/parameters', icon: Settings, label: 'Engine Parameters', accent: 'primary' },
    ]
  }
];

// Page title mapping
const pageTitles = {
  '/': { title: 'Core Analytics', subtitle: 'Real-time fraud intelligence overview' },
  '/analytics': { title: 'Analytics Engine', subtitle: 'Deep-dive risk analysis & correlation' },
  '/alerts': { title: 'Live Interventions', subtitle: 'Critical threat monitoring queue' },
  '/parameters': { title: 'Engine Parameters', subtitle: 'System architecture & configuration' },
};

export default function Layout({ children }) {
  const location = useLocation();
  const pageInfo = pageTitles[location.pathname] || pageTitles['/'];
  const [currentTime, setCurrentTime] = useState(new Date());
  const [alertCount, setAlertCount] = useState(0);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch(`${API_URL}/api/recent-high-risk`);
        if (res.ok) {
          const data = await res.json();
          setAlertCount(data.length);
          setIsConnected(true);
        } else {
          setIsConnected(false);
        }
      } catch (err) {
        console.error("Failed to fetch alerts for notification badge", err);
        setIsConnected(false);
      }
    };
    
    fetchAlerts();
    const alertTimer = setInterval(fetchAlerts, POLL_INTERVAL);
    return () => clearInterval(alertTimer);
  }, []);

  return (
    <div className="flex h-screen bg-dark-950 text-slate-200 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-72 border-r border-dark-700/30 bg-dark-900/95 backdrop-blur-xl flex flex-col justify-between relative overflow-hidden">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary-500/[0.02] to-transparent pointer-events-none" />
        
        <div className="relative z-10">
          {/* Brand */}
          <div className="h-[72px] flex items-center px-6 border-b border-dark-700/30">
            <div className="flex items-center">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-primary-500/20 mr-3">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-wide text-white leading-tight">
                  Sentinel<span className="gradient-text font-semibold">AI</span>
                </h1>
                <p className="text-[10px] text-slate-500 tracking-widest uppercase">Fraud Engine v2.0</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-6 mt-1">
            {navSections.map((section, sIdx) => (
              <div key={sIdx}>
                <div className="section-header px-4 pb-3">{section.label}</div>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/'}
                      className={({ isActive }) =>
                        `nav-item group ${isActive ? 'nav-item--active' : 'nav-item--inactive'}`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon className={`w-[18px] h-[18px] mr-3 transition-colors ${isActive ? 'text-primary-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                          <span className="flex-1">{item.label}</span>
                          {isActive && (
                            <ChevronRight className="w-3.5 h-3.5 text-primary-500/50" />
                          )}
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Status Indicator */}
        <div className="relative z-10 p-4 border-t border-dark-700/30">
          <div className="bg-dark-850 p-3 rounded-xl border border-dark-700/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center text-xs text-slate-400">
                <div className={`pulse-dot mr-2 ${isConnected ? 'bg-safe-500' : 'bg-danger-500'}`} />
                {isConnected ? 'Engine Active' : 'Engine Offline'}
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {currentTime.toLocaleTimeString('en-US', { hour12: false })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500">Uptime</span>
              <span className={`text-[10px] font-mono font-medium ${isConnected ? 'text-safe-400' : 'text-danger-400'}`}>
                {isConnected ? '99.97%' : '0.00%'}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-[72px] flex items-center justify-between px-8 border-b border-dark-700/30 bg-dark-950/90 backdrop-blur-xl relative z-10 flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-white tracking-tight">{pageInfo.title}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{pageInfo.subtitle}</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="flex items-center bg-dark-900/80 px-3.5 py-2 rounded-xl border border-dark-700/30 w-56">
              <Search className="w-3.5 h-3.5 text-slate-500 mr-2" />
              <span className="text-xs text-slate-500">Search transactions...</span>
            </div>

            {/* Notification */}
            <button className="relative p-2.5 bg-dark-900/80 rounded-xl border border-dark-700/30 hover:border-dark-600/50 transition-colors">
              <Bell className="w-4 h-4 text-slate-400" />
              {alertCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center animate-pulse">
                  {alertCount}
                </span>
              )}
            </button>
            
            {/* Connection Status */}
            <div className={`flex items-center space-x-2 bg-dark-900/80 px-3.5 py-2 rounded-xl border border-dark-700/30 transition-colors ${!isConnected && 'border-danger-500/30'}`}>
              <Activity className={`w-3.5 h-3.5 ${isConnected ? 'text-cyan-400 animate-pulse' : 'text-danger-500'}`} />
              <span className="text-xs font-medium text-slate-300 font-mono">:8501</span>
              <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-safe-400' : 'bg-danger-500'}`} />
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8 bg-grid min-h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

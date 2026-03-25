import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Settings, ShieldAlert, Activity, Shield } from 'lucide-react';

export default function Layout({ children }) {
  return (
    <div className="flex h-screen bg-dark-950 text-slate-200 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-dark-700/50 bg-dark-900 flex flex-col justify-between">
        <div>
          {/* Brand */}
          <div className="h-16 flex items-center px-6 border-b border-dark-700/50">
            <Shield className="w-6 h-6 text-primary-500 mr-3" />
            <h1 className="text-lg font-semibold tracking-wide text-white">Sentinel<span className="text-primary-500 font-normal">Analytics</span></h1>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1 mt-2">
            <div className="px-4 pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Dashboard</div>

            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 text-sm ${isActive
                  ? 'bg-primary-500/10 text-primary-400 font-medium'
                  : 'text-slate-400 hover:bg-dark-800 hover:text-slate-200'
                }`
              }
            >
              <LayoutDashboard className="w-4 h-4 mr-3" />
              Core Analytics
            </NavLink>

            <NavLink
              to="/alerts"
              className={({ isActive }) =>
                `flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 text-sm ${isActive
                  ? 'bg-primary-500/10 text-primary-400 font-medium'
                  : 'text-slate-400 hover:bg-dark-800 hover:text-slate-200'
                }`
              }
            >
              <ShieldAlert className="w-4 h-4 mr-3" />
              Live Interventions
            </NavLink>

            <div className="px-4 pt-6 pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">System</div>

            <NavLink
              to="/parameters"
              className={({ isActive }) =>
                `flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 text-sm ${isActive
                  ? 'bg-primary-500/10 text-primary-400 font-medium'
                  : 'text-slate-400 hover:bg-dark-800 hover:text-slate-200'
                }`
              }
            >
              <Settings className="w-4 h-4 mr-3" />
              Engine Parameters
            </NavLink>
          </nav>
        </div>

        {/* Status Indicator */}
        <div className="p-4 border-t border-dark-700/50">
          <div className="flex items-center justify-center text-xs text-slate-400 bg-dark-800 p-2.5 rounded-lg border border-dark-700/50">
            <div className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-safe-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-safe-500"></span>
            </div>
            Engine Synchronized
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto">
        <header className="h-16 flex items-center justify-between px-8 border-b border-dark-700/50 bg-dark-950/80 backdrop-blur-md  top-0 z-10">
          <h2 className="text-xl font-medium text-white tracking-tight">Fraud Detection Network</h2>
          <div className="flex items-center space-x-3 bg-dark-900 px-3 py-1.5 rounded-md border border-dark-700/50">
            <Activity className="w-3.5 h-3.5 text-primary-500 animate-pulse" />
            <span className="text-xs font-medium text-slate-300">Port 8501 Connected</span>
          </div>
        </header>

        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

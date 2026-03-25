import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, AlertTriangle, Settings, ShieldAlert } from 'lucide-react';

const Sidebar = () => {
  return (
    <div className="w-64 h-screen bg-surface border-r border-gray-200 flex flex-col fixed left-0 top-0 text-text-muted shadow-sm">
      <div className="p-6 flex items-center space-x-3 border-b border-gray-100">
        <ShieldAlert className="w-8 h-8 text-primary-600" />
        <span className="text-xl font-bold text-text-main tracking-tight">Defend<span className="text-primary-600">X</span></span>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        <NavLink 
          to="/dashboard" 
          className={({isActive}) => `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 font-medium ${isActive ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'}`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </NavLink>
        
        <NavLink 
          to="/alerts" 
          className={({isActive}) => `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 font-medium ${isActive ? 'bg-danger-50 text-danger-600' : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'}`}
        >
          <AlertTriangle className="w-5 h-5" />
          <span>Live Alerts</span>
        </NavLink>
        
        <NavLink 
          to="/parameters" 
          className={({isActive}) => `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 font-medium ${isActive ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'}`}
        >
          <Settings className="w-5 h-5" />
          <span>System Parameters</span>
        </NavLink>
      </nav>

      <div className="p-6 border-t border-gray-100 bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse"></div>
          <span className="text-xs text-text-muted font-bold tracking-wide">SYSTEM ACTIVE</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

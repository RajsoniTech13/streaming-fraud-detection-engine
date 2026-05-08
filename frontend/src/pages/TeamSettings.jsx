import { useState } from 'react';
import {
  Users, Shield, Crown, Eye, Plus, Trash2, Mail, CheckCircle,
  Lock, Settings, ChevronDown, X, UserPlus, Building2, Key
} from 'lucide-react';

const ROLES = [
  { id: 'admin', name: 'Admin', icon: Crown, color: 'text-warning-400', bg: 'bg-warning-500/10', border: 'border-warning-500/20', desc: 'Full access. Manage API keys, billing, and team.' },
  { id: 'risk_manager', name: 'Risk Manager', icon: Shield, color: 'text-primary-400', bg: 'bg-primary-500/10', border: 'border-primary-500/20', desc: 'Create and manage rules. View all analytics.' },
  { id: 'analyst', name: 'Analyst', icon: Eye, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', desc: 'Review and resolve cases. View dashboards.' },
  { id: 'viewer', name: 'Viewer', icon: Eye, color: 'text-slate-400', bg: 'bg-dark-800', border: 'border-dark-700/30', desc: 'Read-only access to dashboards.' },
];

const INITIAL_MEMBERS = [
  { id: 1, name: 'Raj Soni', email: 'raj@defendx.io', role: 'admin', avatar: 'RS', status: 'active', lastActive: 'Just now' },
  { id: 2, name: 'Sarah Chen', email: 'sarah.chen@defendx.io', role: 'risk_manager', avatar: 'SC', status: 'active', lastActive: '5 min ago' },
  { id: 3, name: 'Bob Johnson', email: 'bob.j@defendx.io', role: 'analyst', avatar: 'BJ', status: 'active', lastActive: '30 min ago' },
  { id: 4, name: 'Alice Wong', email: 'alice.w@defendx.io', role: 'analyst', avatar: 'AW', status: 'active', lastActive: '2 hours ago' },
  { id: 5, name: 'David Miller', email: 'david.m@partner.com', role: 'viewer', avatar: 'DM', status: 'invited', lastActive: 'Never' },
];

const AUDIT_LOG = [
  { action: 'Rule "Velocity Burst" activated', user: 'sarah.chen@defendx.io', time: '10 min ago', type: 'rule' },
  { action: 'Case CAS-4821 blocked', user: 'bob.j@defendx.io', time: '22 min ago', type: 'case' },
  { action: 'API Key "Production" generated', user: 'raj@defendx.io', time: '1 hour ago', type: 'api' },
  { action: 'Team member david.m@partner.com invited', user: 'raj@defendx.io', time: '2 hours ago', type: 'team' },
  { action: 'Case CAS-4818 approved', user: 'bob.j@defendx.io', time: '3 hours ago', type: 'case' },
  { action: 'Rule "Blacklisted Region" modified', user: 'sarah.chen@defendx.io', time: '5 hours ago', type: 'rule' },
];

export default function TeamSettings() {
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('analyst');
  const [activeTab, setActiveTab] = useState('team');

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    setMembers([...members, {
      id: Date.now(),
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      avatar: inviteEmail.slice(0, 2).toUpperCase(),
      status: 'invited',
      lastActive: 'Never',
    }]);
    setInviteEmail('');
    setShowInvite(false);
  };

  const changeRole = (id, role) => {
    setMembers(members.map(m => m.id === id ? { ...m, role } : m));
  };

  const removeMember = (id) => {
    setMembers(members.filter(m => m.id !== id));
  };

  const tabs = [
    { id: 'team', label: 'Team Members', icon: Users },
    { id: 'roles', label: 'Role Permissions', icon: Lock },
    { id: 'audit', label: 'Audit Log', icon: Settings },
    { id: 'org', label: 'Organization', icon: Building2 },
  ];

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="mb-2 animate-fade-in">
        <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
          Team & <span className="gradient-text">Access</span>
        </h1>
        <p className="text-slate-500 text-sm">Manage team members, roles, permissions, and audit activity logs.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-900/80 p-1 rounded-xl border border-dark-700/30 w-fit animate-fade-in fill-both stagger-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                : 'text-slate-500 hover:text-slate-300 border border-transparent'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Team Members Tab */}
      {activeTab === 'team' && (
        <div className="space-y-5 animate-fade-in">
          <div className="flex justify-end">
            <button
              onClick={() => setShowInvite(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-cyan-500 text-white rounded-xl hover:shadow-lg hover:shadow-primary-500/20 transition-all text-sm font-medium"
            >
              <UserPlus className="w-4 h-4" /> Invite Member
            </button>
          </div>

          <div className="pro-card overflow-hidden">
            <div className="p-5 border-b border-dark-700/30 bg-dark-900/60">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-primary-400" />
                Team ({members.length})
              </h3>
            </div>
            <div className="divide-y divide-dark-700/20">
              {members.map(m => {
                const roleConf = ROLES.find(r => r.id === m.role);
                const RoleIcon = roleConf.icon;
                return (
                  <div key={m.id} className="p-5 hover:bg-dark-800/30 transition-colors group flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-cyan-500/20 flex items-center justify-center text-sm font-bold text-primary-300 border border-primary-500/10">
                        {m.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className="text-sm font-medium text-white">{m.name}</h4>
                          {m.status === 'invited' && (
                            <span className="text-[9px] font-bold uppercase tracking-wider bg-warning-500/10 text-warning-400 px-2 py-0.5 rounded-full border border-warning-500/20">Pending</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">{m.email}</p>
                        <p className="text-[10px] text-slate-600 mt-0.5">Active: {m.lastActive}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <select
                          value={m.role}
                          onChange={(e) => changeRole(m.id, e.target.value)}
                          className={`appearance-none text-xs font-medium px-3 py-1.5 pr-7 rounded-lg border cursor-pointer focus:outline-none ${roleConf.bg} ${roleConf.color} ${roleConf.border}`}
                        >
                          {ROLES.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                        <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                      <button
                        onClick={() => removeMember(m.id)}
                        className="p-2 text-slate-600 hover:text-danger-400 hover:bg-danger-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Invite Modal */}
          {showInvite && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowInvite(false)} />
              <div className="relative bg-dark-900 border border-dark-700/30 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fade-in">
                <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-primary-400" /> Invite Team Member
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="section-header block mb-2">Email</label>
                    <div className="flex items-center bg-dark-850 border border-dark-700/50 rounded-xl px-4 py-2.5">
                      <Mail className="w-4 h-4 text-slate-500 mr-2" />
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="colleague@company.com"
                        className="bg-transparent text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none w-full"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="section-header block mb-2">Role</label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="w-full bg-dark-850 border border-dark-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-primary-500/30"
                    >
                      {ROLES.map(r => <option key={r.id} value={r.id}>{r.name} — {r.desc}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button onClick={() => setShowInvite(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">Cancel</button>
                  <button onClick={handleInvite} className="px-5 py-2 bg-gradient-to-r from-primary-500 to-cyan-500 text-white rounded-xl text-sm font-medium">Send Invite</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Role Permissions Tab */}
      {activeTab === 'roles' && (
        <div className="space-y-5 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ROLES.map(role => {
              const RoleIcon = role.icon;
              const permissions = getPermissions(role.id);
              return (
                <div key={role.id} className={`pro-card p-5 border ${role.border}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2.5 rounded-xl ${role.bg} border ${role.border}`}>
                      <RoleIcon className={`w-5 h-5 ${role.color}`} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{role.name}</h4>
                      <p className="text-[10px] text-slate-500">{role.desc}</p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {permissions.map((p, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <CheckCircle className={`w-3.5 h-3.5 ${p.allowed ? 'text-safe-400' : 'text-slate-700'}`} />
                        <span className={p.allowed ? 'text-slate-300' : 'text-slate-600 line-through'}>{p.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Audit Log Tab */}
      {activeTab === 'audit' && (
        <div className="space-y-5 animate-fade-in">
          <div className="pro-card overflow-hidden">
            <div className="p-5 border-b border-dark-700/30 bg-dark-900/60">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-primary-400" />
                Recent Activity
              </h3>
            </div>
            <div className="divide-y divide-dark-700/20">
              {AUDIT_LOG.map((log, idx) => (
                <div key={idx} className="px-5 py-4 flex items-center justify-between hover:bg-dark-800/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      log.type === 'case' ? 'bg-danger-500' :
                      log.type === 'rule' ? 'bg-primary-500' :
                      log.type === 'api' ? 'bg-cyan-500' : 'bg-warning-500'
                    }`} />
                    <div>
                      <p className="text-xs text-slate-200">{log.action}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">by {log.user}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{log.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Organization Tab */}
      {activeTab === 'org' && (
        <div className="space-y-5 animate-fade-in">
          <div className="pro-card p-6">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-6">
              <Building2 className="w-4 h-4 text-primary-400" />
              Organization Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <OrgField label="Organization Name" value="DefendX Inc." />
              <OrgField label="Tenant ID" value="org_dx_a1b2c3d4" mono />
              <OrgField label="Plan" value="Enterprise" />
              <OrgField label="API Rate Limit" value="10,000 req/min" />
              <OrgField label="Data Region" value="US-East-1 (Virginia)" />
              <OrgField label="Created" value="2026-04-15" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OrgField({ label, value, mono }) {
  return (
    <div className="bg-dark-850 rounded-xl p-4 border border-dark-700/30">
      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-sm text-white font-medium ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  );
}

function getPermissions(role) {
  const all = [
    { label: 'View Dashboards', allowed: true },
    { label: 'View Cases', allowed: role !== 'viewer' },
    { label: 'Resolve Cases', allowed: ['admin', 'analyst', 'risk_manager'].includes(role) },
    { label: 'Create / Edit Rules', allowed: ['admin', 'risk_manager'].includes(role) },
    { label: 'Manage API Keys', allowed: role === 'admin' },
    { label: 'Manage Team', allowed: role === 'admin' },
    { label: 'View Audit Log', allowed: ['admin', 'risk_manager'].includes(role) },
    { label: 'Billing & Subscription', allowed: role === 'admin' },
  ];
  return all;
}

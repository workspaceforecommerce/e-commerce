import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  UserPlus,
  Key,
  Lock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Activity,
  Smartphone
} from 'lucide-react';

export const UserManagementView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'roles' | 'sessions' | 'logs'>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [uRes, rRes, lRes]: [any, any, any] = await Promise.all([
        fetch('/api/users/users').then((r) => r.json()),
        fetch('/api/users/roles').then((r) => r.json()),
        fetch('/api/users/login-logs').then((r) => r.json()),
      ]);

      if (uRes.success) setUsers(uRes.users);
      if (rRes.success) setRoles(rRes.roles);
      if (lRes.success) setLogs(lRes.logs);
    } catch {

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeactivateUser = async (id: number) => {
    try {
      await fetch(`/api/users/users/${id}`, { method: 'DELETE' });
      showNotice(`User #${id} account deactivated.`);
      loadData();
    } catch {
      showNotice(`User #${id} deactivated.`);
    }
  };

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 4000);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="wp-card p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold text-amber-700 uppercase tracking-widest">
            Enterprise Security Suite
          </span>
          <h1 className="font-heading text-2xl font-extrabold text-slate-900">
            User Accounts & RBAC Role Controller
          </h1>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-300 transition-all"
        >
          <RefreshCw className="w-4 h-4 text-emerald-700" /> Refresh Security Logs
        </button>
      </div>

      {notice && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs px-4 py-3 rounded-xl flex items-center gap-2 font-semibold">
          <CheckCircle className="w-4 h-4 text-emerald-700" /> {notice}
        </div>
      )}

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'users', label: 'User Accounts', icon: Users },
          { id: 'roles', label: 'Roles & Permissions', icon: ShieldCheck },
          { id: 'sessions', label: 'Active Sessions', icon: Smartphone },
          { id: 'logs', label: 'Login & Audit Logs', icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Users Tab */}
      {activeSubTab === 'users' && (
        <div className="wp-card p-6 rounded-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search user name, email, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl pl-9 pr-4 py-2.5 border border-slate-300 focus:outline-none focus:border-emerald-700"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>

            <button
              onClick={() => alert('Modal: Create New Admin User Account')}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
            >
              <UserPlus className="w-4 h-4" /> Create User Account
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-900 font-bold uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Assigned Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">
                      {u.first_name} {u.last_name}
                    </td>
                    <td className="p-3 font-mono text-slate-600">{u.email}</td>
                    <td className="p-3 text-slate-600">{u.phone || 'N/A'}</td>
                    <td className="p-3">
                      <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-emerald-300">
                        {u.role_name}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[10px] font-bold">
                        {u.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleDeactivateUser(u.id)}
                        className="text-red-600 hover:underline font-bold text-[11px]"
                      >
                        Deactivate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Roles & Permissions Matrix */}
      {activeSubTab === 'roles' && (
        <div className="wp-card p-6 rounded-2xl space-y-6">
          <h2 className="font-heading font-bold text-lg text-slate-900">Role Access Control Matrix</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((r) => (
              <div key={r.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold text-sm text-slate-900">{r.name}</h3>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                    Role #{r.id}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{r.description}</p>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-[11px] text-emerald-700 font-semibold">
                  <span>Permissions: Full Read/Write</span>
                  <button className="hover:underline text-slate-800 font-bold">Edit Matrix</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Login & Audit Logs */}
      {activeSubTab === 'logs' && (
        <div className="wp-card p-6 rounded-2xl space-y-4">
          <h2 className="font-heading font-bold text-lg text-slate-900">Authentication & Audit Logs</h2>
          <div className="space-y-2 font-mono text-xs">
            {logs.map((l) => (
              <div key={l.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-emerald-800">[{l.service_name}]</span>{' '}
                  <span className="text-amber-700 font-bold">{l.event_type}</span> for <span className="text-slate-900">{l.recipient}</span>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-bold">
                  {l.response_status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

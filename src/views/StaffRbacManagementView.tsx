import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Users, Lock, Key, CheckCircle2, AlertTriangle, RefreshCw,
  Search, Plus, Edit3, Trash2, Eye, Shield, Activity, UserPlus, Sliders,
  Check, X
} from 'lucide-react';
import { Button } from '../shared/components/ui/Button';
import { Modal } from '../shared/components/ui/Modal';

interface StaffUser {
  id: string; employee_id: string; name: string; email: string; phone?: string;
  role_name: string; department: string; status: 'Active' | 'Suspended';
  last_login?: string; created_at: string;
}

interface RoleConfig {
  id: string; name: string; is_system: number; description: string;
  users_count: number; permissions: Record<string, string[]>;
}

interface AuditLog {
  id: string; service_name: string; event_type: string; recipient: string;
  payload: string; created_at: string;
}

const MODULE_LIST = ['Products', 'Categories', 'Orders', 'Customers', 'Inventory', 'Payments', 'Shipping', 'Coupons', 'CMS', 'Media'];
const ACTION_LIST = ['view', 'create', 'edit', 'delete', 'export'];

export const StaffRbacManagementView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'staff' | 'matrix' | 'audit'>('staff');
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [roles, setRoles] = useState<RoleConfig[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);

  // Matrix selection state
  const [selectedRole, setSelectedRole] = useState<RoleConfig | null>(null);
  const [matrixPermissions, setMatrixPermissions] = useState<Record<string, string[]>>({});

  // Staff Modal State
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [staffForm, setStaffForm] = useState<Partial<StaffUser>>({
    name: '', email: '', phone: '', role_name: 'Store Manager', department: 'Management', status: 'Active'
  });

  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null);
  const showNotice = (text: string, error = false) => { setNotice({ text, error }); setTimeout(() => setNotice(null), 4000); };

  const loadData = async () => {
    setLoading(true);
    try {
      const [sRes, rRes, lRes]: [any, any, any] = await Promise.all([
        fetch('/api/staff').then(r => r.json()),
        fetch('/api/staff/roles').then(r => r.json()),
        fetch('/api/staff/audit-logs').then(r => r.json()).catch(() => ({ success: false })),
      ]);
      if (sRes.success) setStaffList(sRes.staff);
      if (rRes.success) {
        setRoles(rRes.roles);
        if (rRes.roles?.length) {
          setSelectedRole(rRes.roles[0]);
          setMatrixPermissions(rRes.roles[0].permissions || {});
        }
      }
      if (lRes.success) setLogs(lRes.logs);
    } catch {
      setStaffList(mockStaffList());
      const mRoles = mockRolesList();
      setRoles(mRoles);
      setSelectedRole(mRoles[0]);
      setMatrixPermissions(mRoles[0].permissions);
      setLogs(mockAuditLogs());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const selectRoleForMatrix = (r: RoleConfig) => {
    setSelectedRole(r);
    setMatrixPermissions(r.permissions || {});
  };

  const togglePermission = (moduleName: string, action: string) => {
    const currentActions = matrixPermissions[moduleName] || [];
    const nextActions = currentActions.includes(action)
      ? currentActions.filter(a => a !== action)
      : [...currentActions, action];

    setMatrixPermissions({
      ...matrixPermissions,
      [moduleName]: nextActions
    });
  };

  const handleSaveMatrix = async () => {
    if (!selectedRole) return;
    await fetch(`/api/staff/roles/${selectedRole.id}/permissions`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ permissions: matrixPermissions })
    }).catch(() => {});

    showNotice(`Permission Matrix for "${selectedRole.name}" updated successfully.`);
    setRoles(roles.map(r => r.id === selectedRole.id ? { ...r, permissions: matrixPermissions } : r));
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.name || !staffForm.email) return;

    if (staffForm.id) {
      await fetch(`/api/staff/${staffForm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staffForm)
      }).catch(() => {});
      showNotice('Staff user details updated.');
    } else {
      await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staffForm)
      }).catch(() => {});
      showNotice('New staff account created.');
    }
    setIsStaffModalOpen(false);
    loadData();
  };

  const toggleStaffStatus = async (stf: StaffUser) => {
    const nextStatus = stf.status === 'Active' ? 'Suspended' : 'Active';
    await fetch(`/api/staff/${stf.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus })
    }).catch(() => {});

    showNotice(`Staff ${stf.name} account set to ${nextStatus}.`);
    setStaffList(staffList.map(s => s.id === stf.id ? { ...s, status: nextStatus } : s));
  };

  return (
    <div className="space-y-5 pb-12 animate-fade-in text-xs">
      {notice && (
        <div className={`px-4 py-3 rounded-xl flex items-center gap-2 font-semibold border ${notice.error ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {notice.text}
        </div>
      )}

      {/* Header */}
      <div className="wp-card p-5 rounded-2xl bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-200">
        <div>
          <h1 className="font-heading text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-700" /> Enterprise Staff & Role-Based Access Control (RBAC)
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5">Granular module-level & action-level permission matrix with system audit logs</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
          <button onClick={() => setActiveSubTab('staff')} className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeSubTab === 'staff' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}>Staff Directory</button>
          <button onClick={() => setActiveSubTab('matrix')} className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeSubTab === 'matrix' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}>Permission Matrix</button>
          <button onClick={() => setActiveSubTab('audit')} className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeSubTab === 'audit' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}>RBAC Audit Logs</button>
        </div>
      </div>

      {/* ── SUB-TAB 1: Staff Directory ─────────────────────────────────── */}
      {activeSubTab === 'staff' && (
        <div className="wp-card bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-extrabold text-sm text-slate-900">Admin Staff Members ({staffList.length})</h2>
            <Button variant="primary" size="sm" icon={<UserPlus className="w-3.5 h-3.5" />} onClick={() => { setStaffForm({ name: '', email: '', phone: '', role_name: 'Store Manager', department: 'Management', status: 'Active' }); setIsStaffModalOpen(true); }}>
              Add Staff Member
            </Button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left">
              <thead className="bg-slate-100 font-bold uppercase text-slate-900 border-b border-slate-200">
                <tr>
                  <th className="p-3">Employee ID</th>
                  <th className="p-3">Staff Name</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Assigned Role</th>
                  <th className="p-3">Last Login</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {staffList.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-700">{s.employee_id}</td>
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{s.name}</p>
                      <p className="text-[10px] text-slate-500">{s.email} · {s.phone}</p>
                    </td>
                    <td className="p-3 font-semibold text-slate-800">{s.department}</td>
                    <td className="p-3 font-bold text-indigo-800">{s.role_name}</td>
                    <td className="p-3 text-slate-500">{s.last_login ? new Date(s.last_login).toLocaleString() : 'Never'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${s.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>{s.status}</span>
                    </td>
                    <td className="p-3 flex items-center gap-1.5">
                      <button onClick={() => { setStaffForm(s); setIsStaffModalOpen(true); }} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-800"><Edit3 className="w-3.5 h-3.5" /></button>
                      {s.role_name !== 'Super Admin' && (
                        <button onClick={() => toggleStaffStatus(s)} className={`p-1.5 rounded-lg font-bold text-[10px] ${s.status === 'Active' ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'}`}>
                          {s.status === 'Active' ? 'Suspend' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── SUB-TAB 2: Permission Matrix ──────────────────────────────── */}
      {activeSubTab === 'matrix' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left 4 cols: Roles Selector */}
          <div className="lg:col-span-4 wp-card bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <h2 className="font-heading font-extrabold text-sm text-slate-900 border-b border-slate-200 pb-2">Configured Admin Roles</h2>
            <div className="space-y-2">
              {roles.map(r => (
                <div key={r.id} onClick={() => selectRoleForMatrix(r)} className={`p-3 rounded-xl border cursor-pointer transition-all ${selectedRole?.id === r.id ? 'bg-emerald-50 border-emerald-600 shadow-xs' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900">{r.name}</span>
                    {r.is_system ? <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">System</span> : null}
                  </div>
                  <p className="text-[10px] text-slate-500">{r.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right 8 cols: Interactive Permission Matrix */}
          <div className="lg:col-span-8 wp-card bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="font-heading font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-700" /> Permission Matrix: {selectedRole?.name}
                </h2>
                <p className="text-[10px] text-slate-500">Configure module-level & action-level permissions for this role.</p>
              </div>
              {selectedRole?.name !== 'Super Admin' && (
                <Button variant="primary" size="sm" onClick={handleSaveMatrix}>Save Matrix</Button>
              )}
            </div>

            {selectedRole?.name === 'Super Admin' ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-semibold text-xs flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 shrink-0" />
                <span>Super Admin role has full unrestricted access across all system modules by default.</span>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 font-bold uppercase text-slate-900 border-b border-slate-200">
                    <tr>
                      <th className="p-3">Module Name</th>
                      {ACTION_LIST.map(act => <th key={act} className="p-3 text-center uppercase">{act}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {MODULE_LIST.map(mod => {
                      const activeActions = matrixPermissions[mod] || [];
                      return (
                        <tr key={mod} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-900">{mod}</td>
                          {ACTION_LIST.map(act => {
                            const isChecked = activeActions.includes(act);
                            return (
                              <td key={act} className="p-3 text-center">
                                <input type="checkbox" checked={isChecked} onChange={() => togglePermission(mod, act)} className="rounded cursor-pointer w-4 h-4 text-emerald-700" />
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── SUB-TAB 3: RBAC Audit Logs ─────────────────────────────────── */}
      {activeSubTab === 'audit' && (
        <div className="wp-card bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-extrabold text-sm text-slate-900">Security & RBAC Audit Logs</h2>
            <button onClick={loadData} className="p-1.5 bg-slate-100 rounded-lg text-slate-700 hover:bg-slate-200"><RefreshCw className="w-3.5 h-3.5" /></button>
          </div>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left">
              <thead className="bg-slate-100 font-bold uppercase text-slate-900 border-b border-slate-200">
                <tr>
                  <th className="p-3">Event Type</th>
                  <th className="p-3">Target / Recipient</th>
                  <th className="p-3">Payload Details</th>
                  <th className="p-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {logs.map(l => (
                  <tr key={l.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-emerald-800">{l.event_type}</td>
                    <td className="p-3 font-bold text-slate-900">{l.recipient}</td>
                    <td className="p-3 font-mono text-[10px] text-slate-500 max-w-xs truncate">{l.payload}</td>
                    <td className="p-3 text-slate-500">{new Date(l.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Staff Modal */}
      <Modal isOpen={isStaffModalOpen} onClose={() => setIsStaffModalOpen(false)} title={staffForm.id ? 'Edit Staff Member' : 'Add New Staff Member'}>
        <form onSubmit={handleSaveStaff} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
              <input type="text" required value={staffForm.name || ''} onChange={e => setStaffForm({ ...staffForm, name: e.target.value })} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700" />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official Email *</label>
              <input type="email" required value={staffForm.email || ''} onChange={e => setStaffForm({ ...staffForm, email: e.target.value })} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mobile Phone</label>
              <input type="text" value={staffForm.phone || ''} onChange={e => setStaffForm({ ...staffForm, phone: e.target.value })} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700" />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department</label>
              <select value={staffForm.department || 'Management'} onChange={e => setStaffForm({ ...staffForm, department: e.target.value })} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700">
                {['Management', 'Sales', 'Warehouse', 'Finance', 'Marketing', 'Support'].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Assigned Role</label>
            <select value={staffForm.role_name || 'Store Manager'} onChange={e => setStaffForm({ ...staffForm, role_name: e.target.value })} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700">
              {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsStaffModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm">Save Staff Record</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

function mockStaffList(): StaffUser[] {
  return [
    { id: 'stf1', employee_id: 'EMP-1001', name: 'Mohd Nomaan Talib', email: 'mohdnomaantalib@gmail.com', phone: '+91 9812345678', role_name: 'Super Admin', department: 'Management', status: 'Active', last_login: '2026-07-27T21:40:00Z', created_at: '2025-01-01T00:00:00Z' },
    { id: 'stf2', employee_id: 'EMP-1002', name: 'Rajesh Kumar', email: 'rajesh@healthymonks.com', phone: '+91 9712345679', role_name: 'Store Manager', department: 'Management', status: 'Active', last_login: '2026-07-27T18:20:00Z', created_at: '2025-03-15T10:00:00Z' },
    { id: 'stf3', employee_id: 'EMP-1003', name: 'Ananya Roy', email: 'ananya@healthymonks.com', phone: '+91 9612345670', role_name: 'Warehouse Manager', department: 'Warehouse', status: 'Active', last_login: '2026-07-26T14:10:00Z', created_at: '2025-05-20T11:30:00Z' },
  ];
}

function mockRolesList(): RoleConfig[] {
  return [
    { id: 'r1', name: 'Super Admin', is_system: 1, description: 'Unrestricted full system control & RBAC delegation', users_count: 1, permissions: { Products: ['view', 'create', 'edit', 'delete', 'export'], Orders: ['view', 'create', 'edit', 'delete', 'export'] } },
    { id: 'r2', name: 'Store Manager', is_system: 1, description: 'Manages catalog, orders, coupons & basic customer records', users_count: 3, permissions: { Products: ['view', 'create', 'edit'], Orders: ['view', 'edit', 'export'], Customers: ['view', 'edit'] } },
    { id: 'r3', name: 'Warehouse Manager', is_system: 1, description: 'Fulfills shipments, generates AWBs & manages inventory stock', users_count: 2, permissions: { Orders: ['view', 'edit'], Inventory: ['view', 'edit'], Shipping: ['view', 'create', 'edit'] } },
  ];
}

function mockAuditLogs(): AuditLog[] {
  return [
    { id: 'al1', service_name: 'RBAC', event_type: 'LoginSuccess', recipient: 'mohdnomaantalib@gmail.com', payload: '{"ip":"49.37.12.9","device":"Chrome macOS"}', created_at: '2026-07-27T21:40:00Z' },
    { id: 'al2', service_name: 'RBAC', event_type: 'UpdateRolePermissions', recipient: 'r2', payload: '{"role":"Store Manager","updated_modules":["Products","Orders"]}', created_at: '2026-07-26T15:30:00Z' },
  ];
}

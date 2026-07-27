import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Search, Filter, RefreshCw, Eye, Edit3, Trash2, UserPlus,
  Building, Phone, Mail, MapPin, Tag, ShieldCheck, Clock, DollarSign,
  TrendingUp, Award, CheckCircle2, AlertTriangle, Plus, ChevronRight,
  MessageSquare, Layers
} from 'lucide-react';
import { Button } from '../shared/components/ui/Button';
import { Modal } from '../shared/components/ui/Modal';

interface SavedAddress {
  id: string; address_type: string; full_name: string; mobile: string;
  address_line1: string; city: string; state: string; postal_code: string; is_default: number;
}

interface CustomerTimeline {
  id: string; event_type: string; description: string; created_at: string;
}

interface StaffNote {
  id: string; author: string; note: string; created_at: string;
}

interface CustomerRecord {
  id: string; name: string; email: string; phone?: string; company?: string;
  gst_number?: string; customer_group: 'Retail' | 'Wholesale' | 'VIP' | 'Corporate' | 'Distributor';
  status: 'Active' | 'Inactive' | 'Suspended'; total_orders: number; total_spent: number;
  aov: number; created_at: string; tags?: string[]; addresses?: SavedAddress[];
  timeline?: CustomerTimeline[]; notes?: StaffNote[];
}

export const CustomerManagementView: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [filterGroup, setFilterGroup] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // 360 Profile Modal State
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);
  const [staffNoteInput, setStaffNoteInput] = useState('');
  const [newTagInput, setNewTagInput] = useState('');

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<CustomerRecord>>({
    name: '', email: '', phone: '', company: '', gst_number: '', customer_group: 'Retail', status: 'Active'
  });

  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null);
  const showNotice = (text: string, error = false) => { setNotice({ text, error }); setTimeout(() => setNotice(null), 4000); };

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQ) params.set('q', searchQ);
      if (filterGroup) params.set('group', filterGroup);
      if (filterStatus) params.set('status', filterStatus);

      const res: any = await fetch(`/api/customers?${params}`).then(r => r.json());
      if (res.success) setCustomers(res.customers);
    } catch {
      setCustomers(mockCustomersList());
    } finally {
      setLoading(false);
    }
  }, [searchQ, filterGroup, filterStatus]);

  useEffect(() => { loadCustomers(); }, [loadCustomers]);

  const open360Profile = async (c: CustomerRecord) => {
    try {
      const res: any = await fetch(`/api/customers/${c.id}`).then(r => r.json());
      if (res.success && res.customer) {
        setSelectedCustomer(res.customer);
        return;
      }
    } catch {}
    setSelectedCustomer(c);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    if (formData.id) {
      await fetch(`/api/customers/${formData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      }).catch(() => {});
      showNotice('Customer profile updated.');
    } else {
      await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      }).catch(() => {});
      showNotice('New customer account created.');
    }
    setIsModalOpen(false);
    loadCustomers();
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !staffNoteInput.trim()) return;

    await fetch(`/api/customers/${selectedCustomer.id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: staffNoteInput, author: 'CRM Admin' })
    }).catch(() => {});

    showNotice('Internal CRM note added.');
    setStaffNoteInput('');
    open360Profile(selectedCustomer);
  };

  const handleAddTag = async () => {
    if (!selectedCustomer || !newTagInput.trim()) return;
    const existingTags = selectedCustomer.tags || [];
    if (existingTags.includes(newTagInput.trim())) return;

    const updatedTags = [...existingTags, newTagInput.trim()];
    await fetch(`/api/customers/${selectedCustomer.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tags: updatedTags })
    }).catch(() => {});

    showNotice(`Tag "${newTagInput.trim()}" added to customer.`);
    setNewTagInput('');
    setSelectedCustomer({ ...selectedCustomer, tags: updatedTags });
    loadCustomers();
  };

  const groupBadgeColor: Record<string, string> = {
    VIP: 'bg-purple-100 text-purple-800 border-purple-300',
    Wholesale: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    Corporate: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    Distributor: 'bg-amber-100 text-amber-800 border-amber-300',
    Retail: 'bg-slate-100 text-slate-700 border-slate-300',
  };

  const totalSpentAll = customers.reduce((sum, c) => sum + (c.total_spent || 0), 0);
  const avgLTV = customers.length ? Math.round(totalSpentAll / customers.length) : 0;

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
            <Users className="w-5 h-5 text-emerald-700" /> Enterprise Customer Management (CRM)
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5">Central Customer 360°, LTV tracking, B2B wholesale groups & timeline history</p>
        </div>
        <Button variant="primary" size="sm" icon={<UserPlus className="w-3.5 h-3.5" />} onClick={() => { setFormData({ name: '', email: '', phone: '', company: '', gst_number: '', customer_group: 'Retail', status: 'Active' }); setIsModalOpen(true); }}>
          Add Customer
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="wp-card p-4 bg-white rounded-2xl border border-slate-200"><p className="text-xl font-extrabold text-slate-900">{customers.length}</p><p className="text-[11px] text-slate-500">Total Customers</p></div>
        <div className="wp-card p-4 bg-white rounded-2xl border border-slate-200"><p className="text-xl font-extrabold text-emerald-800">₹{totalSpentAll.toLocaleString()}</p><p className="text-[11px] text-slate-500">Total LTV Revenue</p></div>
        <div className="wp-card p-4 bg-white rounded-2xl border border-slate-200"><p className="text-xl font-extrabold text-indigo-800">₹{avgLTV.toLocaleString()}</p><p className="text-[11px] text-slate-500">Avg LTV / Customer</p></div>
        <div className="wp-card p-4 bg-white rounded-2xl border border-slate-200"><p className="text-xl font-extrabold text-purple-800">{customers.filter(c => c.customer_group === 'VIP' || c.customer_group === 'Wholesale').length}</p><p className="text-[11px] text-slate-500">VIP / Wholesale Accounts</p></div>
      </div>

      {/* Filterable Table Card */}
      <div className="wp-card bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input type="search" placeholder="Search customer name, email, mobile, GSTIN..." value={searchQ} onChange={e => setSearchQ(e.target.value)} className="w-full bg-slate-50 text-xs text-slate-900 rounded-xl pl-9 pr-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700" />
          </div>
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            <select value={filterGroup} onChange={e => setFilterGroup(e.target.value)} className="bg-slate-50 text-xs text-slate-700 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700">
              <option value="">All Customer Groups</option>
              {['Retail', 'Wholesale', 'VIP', 'Corporate', 'Distributor'].map(grp => <option key={grp} value={grp}>{grp}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-slate-50 text-xs text-slate-700 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700">
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
            </select>
            <button onClick={loadCustomers} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"><RefreshCw className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left">
            <thead className="bg-slate-100 font-bold uppercase text-slate-900 border-b border-slate-200">
              <tr>
                <th className="p-3">Customer Name</th>
                <th className="p-3">Group</th>
                <th className="p-3">Total Orders</th>
                <th className="p-3">Lifetime Value (LTV)</th>
                <th className="p-3">Avg Order Value (AOV)</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {customers.map(c => (
                <tr key={c.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => open360Profile(c)}>
                  <td className="p-3">
                    <p className="font-bold text-slate-900">{c.name}</p>
                    <p className="text-[10px] text-slate-500">{c.email} · {c.phone}</p>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${groupBadgeColor[c.customer_group] || 'bg-slate-100'}`}>{c.customer_group}</span>
                  </td>
                  <td className="p-3 font-mono font-bold text-slate-800">{c.total_orders}</td>
                  <td className="p-3 font-extrabold text-emerald-800">₹{c.total_spent?.toLocaleString()}</td>
                  <td className="p-3 font-mono text-slate-700">₹{c.aov || Math.round(c.total_spent / (c.total_orders || 1))}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${c.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>{c.status}</span>
                  </td>
                  <td className="p-3" onClick={e => e.stopPropagation()}>
                    <button onClick={() => open360Profile(c)} className="p-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-indigo-800 font-bold flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" /> 360° Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 360° Customer Profile Modal */}
      <Modal isOpen={!!selectedCustomer} onClose={() => setSelectedCustomer(null)} title={`Customer 360° Profile: ${selectedCustomer?.name || ''}`}>
        {selectedCustomer && (
          <div className="space-y-5 text-xs">
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 flex-wrap gap-2">
              <div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${groupBadgeColor[selectedCustomer.customer_group] || 'bg-slate-100'}`}>{selectedCustomer.customer_group} Customer</span>
                {selectedCustomer.company && <span className="ml-2 text-slate-500 font-semibold">{selectedCustomer.company}</span>}
              </div>
              <p className="text-[11px] text-slate-400 font-mono">Member Since: {new Date(selectedCustomer.created_at).toLocaleDateString()}</p>
            </div>

            {/* Metrics grid */}
            <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-center">
              <div><p className="text-slate-500 text-[10px]">Total Orders</p><p className="text-lg font-extrabold text-slate-900">{selectedCustomer.total_orders}</p></div>
              <div><p className="text-slate-500 text-[10px]">Lifetime Spend (LTV)</p><p className="text-lg font-extrabold text-emerald-800">₹{selectedCustomer.total_spent?.toLocaleString()}</p></div>
              <div><p className="text-slate-500 text-[10px]">Avg Order Value (AOV)</p><p className="text-lg font-extrabold text-indigo-800">₹{selectedCustomer.aov}</p></div>
            </div>

            {/* Personal Details */}
            <div className="grid grid-cols-2 gap-4 bg-white p-3.5 rounded-xl border border-slate-200">
              <div className="space-y-1">
                <p className="font-bold text-slate-900 text-xs">Contact Details</p>
                <p className="text-slate-700">Email: <span className="font-semibold">{selectedCustomer.email}</span></p>
                <p className="text-slate-700">Phone: <span className="font-mono font-semibold">{selectedCustomer.phone}</span></p>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-slate-900 text-xs">B2B GSTIN Registration</p>
                <p className="text-slate-700">GSTIN: <span className="font-mono font-bold text-slate-900">{selectedCustomer.gst_number || 'N/A (B2C)'}</span></p>
              </div>
            </div>

            {/* Customer Tags */}
            <div className="space-y-2">
              <p className="font-bold text-slate-900 text-xs flex items-center gap-1"><Tag className="w-3.5 h-3.5 text-emerald-700" /> Customer Tags & Segmentation</p>
              <div className="flex items-center gap-2 flex-wrap">
                {(selectedCustomer.tags || []).map((t, idx) => (
                  <span key={idx} className="bg-emerald-50 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 text-[10px]">{t}</span>
                ))}
                <div className="flex items-center gap-1">
                  <input placeholder="Add tag..." value={newTagInput} onChange={e => setNewTagInput(e.target.value)} className="bg-slate-50 text-xs px-2.5 py-1 rounded-lg border border-slate-300 focus:outline-none" />
                  <button type="button" onClick={handleAddTag} className="bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg">+</button>
                </div>
              </div>
            </div>

            {/* Saved Addresses */}
            <div className="space-y-2">
              <p className="font-bold text-slate-900 text-xs flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-emerald-700" /> Saved Delivery Addresses</p>
              <div className="space-y-2">
                {(selectedCustomer.addresses || []).map((addr, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700">
                    <span className="font-bold text-slate-900 text-[11px]">{addr.full_name} ({addr.address_type})</span>
                    <p className="text-[11px] text-slate-600">{addr.address_line1}, {addr.city}, {addr.state} - {addr.postal_code}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-2">
              <p className="font-bold text-slate-900 text-xs flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-emerald-700" /> Activity Timeline History</p>
              <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200 max-h-40 overflow-y-auto">
                {(selectedCustomer.timeline || []).map((t, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-[11px]">
                    <div className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-900">{t.event_type} <span className="font-normal text-slate-600">— {t.description}</span></p>
                      <p className="text-[10px] text-slate-400">{new Date(t.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Internal Staff Notes */}
            <div className="space-y-2">
              <p className="font-bold text-slate-900 text-xs">CRM Staff Notes</p>
              <form onSubmit={handleAddNote} className="flex gap-2">
                <input placeholder="Add internal note for customer CRM record..." value={staffNoteInput} onChange={e => setStaffNoteInput(e.target.value)} className="flex-1 bg-white text-xs rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700" />
                <Button type="submit" variant="outline" size="sm">Add Note</Button>
              </form>
              <div className="space-y-1.5">
                {(selectedCustomer.notes || []).map((n, idx) => (
                  <div key={idx} className="bg-amber-50 border-l-2 border-amber-500 p-2 text-xs rounded-r-lg">
                    <p className="font-bold text-amber-800 text-[10px]">{n.author} · {new Date(n.created_at).toLocaleString()}</p>
                    <p className="text-slate-700">{n.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Add / Edit Customer Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={formData.id ? 'Edit Customer Account' : 'Create New Customer Account'}>
        <form onSubmit={handleSaveCustomer} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
              <input type="text" required value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700" />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
              <input type="email" required value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mobile Phone *</label>
              <input type="text" required value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700" />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Customer Group</label>
              <select value={formData.customer_group || 'Retail'} onChange={e => setFormData({ ...formData, customer_group: e.target.value as any })} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700">
                <option value="Retail">Retail</option>
                <option value="Wholesale">Wholesale</option>
                <option value="VIP">VIP</option>
                <option value="Corporate">Corporate</option>
                <option value="Distributor">Distributor</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company (Optional)</label>
              <input type="text" value={formData.company || ''} onChange={e => setFormData({ ...formData, company: e.target.value })} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700" />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">GSTIN Number (Optional)</label>
              <input type="text" placeholder="29AAACH7409R1ZX" value={formData.gst_number || ''} onChange={e => setFormData({ ...formData, gst_number: e.target.value.toUpperCase() })} className="w-full bg-white uppercase font-mono text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm">Save Customer Record</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

function mockCustomersList(): CustomerRecord[] {
  return [
    {
      id: 'cust1', name: 'Aarav Sharma', email: 'aarav@example.com', phone: '+91 9812345678',
      company: 'Lotus Wellness Ltd', gst_number: '29AAACH7409R1ZX', customer_group: 'VIP',
      status: 'Active', total_orders: 8, total_spent: 14890, aov: 1861, created_at: '2025-11-10T10:00:00Z',
      tags: ['Frequent Buyer', 'Ayurveda Enthusiast', 'High LTV'],
      addresses: [
        { id: 'ca1', address_type: 'Home', full_name: 'Aarav Sharma', mobile: '+91 9812345678', address_line1: '42 Lotus Heights, MG Road', city: 'Bengaluru', state: 'Karnataka', postal_code: '560038', is_default: 1 }
      ],
      timeline: [
        { id: 'ctl1', event_type: 'Order Placed', description: 'Placed Order #HM-ORD-482910 for ₹698', created_at: '2026-07-27T14:30:00Z' },
        { id: 'ctl2', event_type: 'Review Submitted', description: 'Rated 5 Stars on KSM-66 Ashwagandha Root Powder', created_at: '2026-07-25T11:00:00Z' }
      ],
      notes: [
        { id: 'cn1', author: 'Senior Support Lead', note: 'Prefers WhatsApp order updates over SMS.', created_at: '2026-07-26T16:00:00Z' }
      ]
    },
    {
      id: 'cust2', name: 'Priya Mehta', email: 'priya@gmail.com', phone: '+91 9765432109',
      company: 'Mehta Herbal Spa', gst_number: '27AAACH9918K1Z5', customer_group: 'Wholesale',
      status: 'Active', total_orders: 14, total_spent: 38400, aov: 2742, created_at: '2025-08-14T12:30:00Z',
      tags: ['Bulk Wholesale', 'B2B GST Verified'],
      addresses: [
        { id: 'ca2', address_type: 'Office', full_name: 'Priya Mehta', mobile: '+91 9765432109', address_line1: '15 Sector 4, HSR Layout', city: 'Bengaluru', state: 'Karnataka', postal_code: '560102', is_default: 1 }
      ],
      timeline: [
        { id: 'ctl4', event_type: 'Order Placed', description: 'Placed Order #HM-ORD-839210 for ₹1,149', created_at: '2026-07-26T11:20:00Z' }
      ]
    }
  ];
}

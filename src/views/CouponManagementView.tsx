import React, { useState, useEffect, useCallback } from 'react';
import {
  Tag, Plus, Trash2, Edit3, CheckCircle2, Ticket, Clock, Percent,
  Copy, RotateCcw, AlertCircle, Search, Filter, Sparkles, Layers,
  Zap, Calendar, DollarSign, Users, ShieldCheck, Check, X, Loader2,
  TrendingUp, BarChart3, HelpCircle, AlertTriangle
} from 'lucide-react';
import { Button } from '../shared/components/ui/Button';
import { Input } from '../shared/components/ui/Input';
import { Modal } from '../shared/components/ui/Modal';
import { Badge } from '../shared/components/ui/Badge';

interface CouponItem {
  id: string; code: string; name: string; description: string;
  discount_type: 'percentage' | 'flat' | 'fixed_amount' | 'free_shipping' | 'buy_x_get_y';
  discount_value: number; min_order_amount: number; max_discount_amount: number;
  usage_limit: number; used_count: number; per_customer_limit: number;
  is_stackable: number; auto_apply: number; start_date: string | null;
  end_date: string | null; status: 'active' | 'inactive' | 'expired' | 'draft';
  created_at: string;
}

interface CampaignItem {
  id: string; name: string; code_prefix: string; status: string;
  budget: number; spent: number; total_redemptions: number; created_at: string;
}

const emptyCouponForm = (): Partial<CouponItem> => ({
  code: '', name: '', description: '', discount_type: 'percentage',
  discount_value: 15, min_order_amount: 499, max_discount_amount: 250,
  usage_limit: 500, per_customer_limit: 1, is_stackable: 0, auto_apply: 0,
  start_date: new Date().toISOString().slice(0, 10),
  end_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
  status: 'active',
});

export const CouponManagementView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'coupons' | 'campaigns'>('coupons');
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<CouponItem>>(emptyCouponForm());
  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null);

  const showNotice = (text: string, error = false) => {
    setNotice({ text, error });
    setTimeout(() => setNotice(null), 4000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [cRes, campRes]: [any, any] = await Promise.all([
        fetch('/api/coupons').then(r => r.json()),
        fetch('/api/coupons/campaigns/list').then(r => r.json()).catch(() => ({ success: false })),
      ]);
      if (cRes.success) setCoupons(cRes.coupons);
      if (campRes.success) setCampaigns(campRes.campaigns);
    } catch {
      setCoupons([
        { id: 'cpn1', code: 'WELCOME100', name: 'New Customer Welcome', description: '₹100 flat discount on orders over ₹499', discount_type: 'flat', discount_value: 100, min_order_amount: 499, max_discount_amount: 100, usage_limit: 1000, used_count: 342, per_customer_limit: 1, is_stackable: 0, auto_apply: 0, start_date: '2026-01-01', end_date: '2026-12-31', status: 'active', created_at: '2026-01-01T00:00:00Z' },
        { id: 'cpn2', code: 'MONK15', name: '15% Off Organic Wellness', description: '15% percentage discount up to ₹250', discount_type: 'percentage', discount_value: 15, min_order_amount: 799, max_discount_amount: 250, usage_limit: 500, used_count: 189, per_customer_limit: 2, is_stackable: 0, auto_apply: 0, start_date: '2026-06-01', end_date: '2026-08-31', status: 'active', created_at: '2026-06-01T00:00:00Z' },
        { id: 'cpn3', code: 'DETOX20', name: '20% Summer Detox Sale', description: '20% discount on herbal teas & cleanses', discount_type: 'percentage', discount_value: 20, min_order_amount: 999, max_discount_amount: 300, usage_limit: 300, used_count: 78, per_customer_limit: 1, is_stackable: 1, auto_apply: 0, start_date: '2026-07-01', end_date: '2026-07-31', status: 'active', created_at: '2026-07-01T00:00:00Z' },
        { id: 'cpn4', code: 'FREESHIP', name: 'Free Shipping Voucher', description: 'Zero shipping charges on any order value', discount_type: 'free_shipping', discount_value: 0, min_order_amount: 299, max_discount_amount: 0, usage_limit: 2000, used_count: 614, per_customer_limit: 5, is_stackable: 1, auto_apply: 1, start_date: '2026-01-01', end_date: '2026-12-31', status: 'active', created_at: '2026-01-01T00:00:00Z' },
        { id: 'cpn5', code: 'FLASH30', name: '⚡ Flash Sale 30% Off', description: '30% massive discount for flash sale weekend', discount_type: 'percentage', discount_value: 30, min_order_amount: 1499, max_discount_amount: 500, usage_limit: 100, used_count: 100, per_customer_limit: 1, is_stackable: 0, auto_apply: 0, start_date: '2026-07-20', end_date: '2026-07-22', status: 'expired', created_at: '2026-07-15T00:00:00Z' },
      ]);
      setCampaigns([
        { id: 'camp1', name: 'Monsoon Immunity Drive', code_prefix: 'IMMUNITY', status: 'active', budget: 50000, spent: 18400, total_redemptions: 184, created_at: '2026-07-01T10:00:00Z' },
        { id: 'camp2', name: 'Festival Super Saver', code_prefix: 'FESTIVAL', status: 'scheduled', budget: 100000, spent: 0, total_redemptions: 0, created_at: '2026-07-15T10:00:00Z' },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Actions ─────────────────────────────────────────────────────────────────
  const openNewModal = () => { setForm(emptyCouponForm()); setEditingId(null); setModalOpen(true); };
  const openEditModal = (c: CouponItem) => { setForm({ ...c }); setEditingId(c.id); setModalOpen(true); };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `/api/coupons/${editingId}` : '/api/coupons';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    }).catch(() => {});

    showNotice(editingId ? 'Coupon updated' : `Coupon "${form.code?.toUpperCase()}" created!`);
    setModalOpen(false);
    loadData();
  };

  const handleDeleteCoupon = async (id: string) => {
    await fetch(`/api/coupons/${id}`, { method: 'DELETE' }).catch(() => {});
    showNotice('Coupon deleted');
    loadData();
  };

  const handleDuplicateCoupon = async (id: string) => {
    await fetch(`/api/coupons/${id}/duplicate`, { method: 'POST' }).catch(() => {});
    showNotice('Coupon duplicated');
    loadData();
  };

  const filteredCoupons = coupons.filter(c =>
    (!searchQ || c.code.toLowerCase().includes(searchQ.toLowerCase()) || c.name.toLowerCase().includes(searchQ.toLowerCase())) &&
    (!filterType || c.discount_type === filterType) &&
    (!filterStatus || c.status === filterStatus)
  );

  const activeCount = coupons.filter(c => c.status === 'active').length;
  const totalRedemptions = coupons.reduce((sum, c) => sum + (c.used_count || 0), 0);

  return (
    <div className="space-y-5 pb-12 animate-fade-in">
      {/* Notice */}
      {notice && (
        <div className={`px-4 py-3 rounded-xl flex items-center gap-2 text-xs font-semibold border ${notice.error ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
          {notice.error ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
          {notice.text}
        </div>
      )}

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="wp-card p-5 rounded-2xl bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-extrabold text-slate-900">Coupons, Discounts & Promotion Engine</h1>
          <p className="text-[11px] text-slate-500 mt-0.5">{activeCount} active promotions · {totalRedemptions} total redemptions across all campaigns</p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={openNewModal}>
          Create New Coupon
        </Button>
      </div>

      {/* ── Stats Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Active Coupons', value: activeCount, icon: Ticket, color: 'bg-emerald-100 text-emerald-700' },
          { label: 'Total Redemptions', value: totalRedemptions, icon: TrendingUp, color: 'bg-blue-100 text-blue-700' },
          { label: 'Auto-Apply Vouchers', value: coupons.filter(c => c.auto_apply).length, icon: Zap, color: 'bg-amber-100 text-amber-700' },
          { label: 'Promotional Campaigns', value: campaigns.length, icon: Layers, color: 'bg-violet-100 text-violet-700' },
        ].map(s => (
          <div key={s.label} className="wp-card bg-white p-4 rounded-2xl flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.color}`}><s.icon className="w-4 h-4" /></div>
            <div><p className="text-xl font-extrabold text-slate-900">{s.value}</p><p className="text-[11px] text-slate-500">{s.label}</p></div>
          </div>
        ))}
      </div>

      {/* ── Section Tabs & Toolbar ─────────────────────────────────────── */}
      <div className="wp-card bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center border-b border-slate-200 px-4 gap-1">
          <button onClick={() => setActiveTab('coupons')} className={`py-3 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === 'coupons' ? 'border-emerald-700 text-emerald-800' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            <Ticket className="w-3.5 h-3.5" /> Coupon Vouchers ({filteredCoupons.length})
          </button>
          <button onClick={() => setActiveTab('campaigns')} className={`py-3 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === 'campaigns' ? 'border-emerald-700 text-emerald-800' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            <Layers className="w-3.5 h-3.5" /> Promotional Campaigns ({campaigns.length})
          </button>

          <div className="ml-auto flex items-center gap-2 py-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input type="search" placeholder="Search coupon code..." value={searchQ} onChange={e => setSearchQ(e.target.value)} className="bg-slate-50 text-xs text-slate-900 rounded-lg pl-8 pr-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-600 w-40" />
            </div>
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="bg-slate-50 text-xs text-slate-700 rounded-lg px-2.5 py-2 border border-slate-200 focus:outline-none focus:border-emerald-600">
              <option value="">All Types</option>
              <option value="percentage">Percentage (%)</option>
              <option value="flat">Flat Amount (₹)</option>
              <option value="free_shipping">Free Shipping</option>
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-slate-50 text-xs text-slate-700 rounded-lg px-2.5 py-2 border border-slate-200 focus:outline-none focus:border-emerald-600">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>

        <div className="p-4">
          {loading && <div className="flex justify-center py-12"><Loader2 className="w-7 h-7 text-emerald-700 animate-spin" /></div>}

          {/* ── COUPONS TAB ──────────────────────────────────────────────── */}
          {!loading && activeTab === 'coupons' && (
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 font-bold uppercase text-slate-900 border-b border-slate-200">
                  <tr>
                    <th className="p-3">Coupon Code</th>
                    <th className="p-3">Type & Discount</th>
                    <th className="p-3">Min Order</th>
                    <th className="p-3">Max Cap</th>
                    <th className="p-3">Usage</th>
                    <th className="p-3">Flags</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredCoupons.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="p-3">
                        <div className="flex items-center gap-1.5 font-mono font-bold text-emerald-800">
                          <Ticket className="w-4 h-4 text-emerald-700" />
                          <span>{c.code}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-sans">{c.name}</p>
                      </td>
                      <td className="p-3">
                        <span className="font-extrabold text-slate-900">
                          {c.discount_type === 'percentage' ? `${c.discount_value}% OFF` : c.discount_type === 'free_shipping' ? '🚚 Free Shipping' : `₹${c.discount_value} OFF`}
                        </span>
                        <p className="text-[10px] text-slate-400 uppercase">{c.discount_type.replace('_', ' ')}</p>
                      </td>
                      <td className="p-3 font-semibold text-slate-900">₹{c.min_order_amount}</td>
                      <td className="p-3 font-semibold text-slate-900">{c.max_discount_amount ? `₹${c.max_discount_amount}` : 'No cap'}</td>
                      <td className="p-3">
                        <span className="font-medium text-slate-800">{c.used_count} / {c.usage_limit || '∞'}</span>
                        <div className="w-16 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                          <div className="bg-emerald-600 h-full rounded-full" style={{ width: c.usage_limit ? `${Math.min(100, Math.round((c.used_count / c.usage_limit) * 100))}%` : '20%' }} />
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {c.auto_apply ? <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5"><Zap className="w-2.5 h-2.5" />Auto</span> : null}
                          {c.is_stackable ? <span className="bg-blue-100 text-blue-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full">Stackable</span> : null}
                        </div>
                      </td>
                      <td className="p-3"><Badge status={c.status} /></td>
                      <td className="p-3 flex items-center gap-1">
                        <button onClick={() => openEditModal(c)} className="p-1 rounded hover:bg-slate-100 text-slate-600"><Edit3 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDuplicateCoupon(c.id)} className="p-1 rounded hover:bg-slate-100 text-slate-600"><Copy className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDeleteCoupon(c.id)} className="p-1 rounded hover:bg-red-50 text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── CAMPAIGNS TAB ────────────────────────────────────────────── */}
          {!loading && activeTab === 'campaigns' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {campaigns.map(camp => (
                <div key={camp.id} className="border border-slate-200 rounded-2xl p-4 bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{camp.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">PREFIX: {camp.code_prefix}*</p>
                    </div>
                    <Badge status={camp.status} />
                  </div>
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 rounded-xl p-3 text-center text-xs">
                    <div><p className="text-[10px] text-slate-400">Budget</p><p className="font-bold text-slate-900">₹{camp.budget.toLocaleString()}</p></div>
                    <div><p className="text-[10px] text-slate-400">Spent</p><p className="font-bold text-emerald-700">₹{camp.spent.toLocaleString()}</p></div>
                    <div><p className="text-[10px] text-slate-400">Redemptions</p><p className="font-bold text-slate-900">{camp.total_redemptions}</p></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Create / Edit Coupon Modal ────────────────────────────────────── */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Coupon Voucher' : 'Create Promotional Coupon'}>
        <form onSubmit={handleSaveCoupon} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Coupon Code *" required placeholder="MONK20" value={form.code || ''} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} />
            <Input label="Coupon Title / Name" placeholder="Summer Detox 20% Off" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description</label>
            <input placeholder="Short customer-facing description" value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700 text-xs" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Discount Type *</label>
              <select value={form.discount_type || 'percentage'} onChange={e => setForm(f => ({ ...f, discount_type: e.target.value as any }))} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700 text-xs">
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Amount (₹)</option>
                <option value="free_shipping">Free Shipping</option>
              </select>
            </div>
            <Input label="Discount Value *" type="number" required value={String(form.discount_value || 0)} onChange={e => setForm(f => ({ ...f, discount_value: parseFloat(e.target.value) || 0 }))} />
            <Input label="Max Discount Cap (₹)" type="number" placeholder="0 = No cap" value={String(form.max_discount_amount || 0)} onChange={e => setForm(f => ({ ...f, max_discount_amount: parseFloat(e.target.value) || 0 }))} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input label="Min Order Amount (₹)" type="number" value={String(form.min_order_amount || 0)} onChange={e => setForm(f => ({ ...f, min_order_amount: parseFloat(e.target.value) || 0 }))} />
            <Input label="Total Usage Limit" type="number" placeholder="0 = Unlimited" value={String(form.usage_limit || 0)} onChange={e => setForm(f => ({ ...f, usage_limit: parseInt(e.target.value) || 0 }))} />
            <Input label="Per Customer Limit" type="number" value={String(form.per_customer_limit || 1)} onChange={e => setForm(f => ({ ...f, per_customer_limit: parseInt(e.target.value) || 1 }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Start Date" type="date" value={form.start_date || ''} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
            <Input label="Expiry Date" type="date" value={form.end_date || ''} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
          </div>
          <div className="flex items-center gap-6 pt-1">
            <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
              <input type="checkbox" checked={!!form.auto_apply} onChange={e => setForm(f => ({ ...f, auto_apply: e.target.checked ? 1 : 0 }))} className="rounded" />
              Auto-Apply at Checkout
            </label>
            <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
              <input type="checkbox" checked={!!form.is_stackable} onChange={e => setForm(f => ({ ...f, is_stackable: e.target.checked ? 1 : 0 }))} className="rounded" />
              Stackable with other offers
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm">{editingId ? 'Update Coupon' : 'Create Coupon'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

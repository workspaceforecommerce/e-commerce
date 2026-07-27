import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Edit, CheckCircle2, Ticket, Clock, Percent } from 'lucide-react';
import { Coupon } from '../types';
import { Button } from '../shared/components/ui/Button';
import { Input } from '../shared/components/ui/Input';
import { Modal } from '../shared/components/ui/Modal';
import { Badge } from '../shared/components/ui/Badge';

export const CouponManagementView: React.FC = () => {
  const [coupons, setCoupons] = useState<any[]>([
    {
      id: 1,
      code: 'MONK10',
      discount_type: 'percentage',
      discount_value: 10,
      min_order_amount: 499,
      usage_limit: 500,
      used_count: 42,
      expiry_date: '2026-12-31',
      status: 'active'
    },
    {
      id: 2,
      code: 'AYUSH100',
      discount_type: 'flat',
      discount_value: 100,
      min_order_amount: 999,
      usage_limit: 200,
      used_count: 88,
      expiry_date: '2026-10-15',
      status: 'active'
    }
  ]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [notice, setNotice] = useState('');

  const [form, setForm] = useState({
    code: '',
    discount_type: 'percentage' as 'flat' | 'percentage',
    discount_value: 10,
    min_order_amount: 499,
    usage_limit: 100,
    expiry_date: '2026-12-31'
  });

  const loadCoupons = async () => {
    try {
      const res: any = await fetch('/api/admin/coupons').then(r => r.json());
      if (res.success && res.coupons) setCoupons(res.coupons);
    } catch {

    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const newCoupon = {
      id: Date.now(),
      code: form.code.toUpperCase(),
      discount_type: form.discount_type,
      discount_value: form.discount_value,
      min_order_amount: form.min_order_amount,
      usage_limit: form.usage_limit,
      used_count: 0,
      expiry_date: form.expiry_date,
      status: 'active'
    };

    try {
      await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCoupon)
      });
      setNotice(`Coupon "${form.code.toUpperCase()}" created!`);
      setIsAddModalOpen(false);
      setForm({ code: '', discount_type: 'percentage', discount_value: 10, min_order_amount: 499, usage_limit: 100, expiry_date: '2026-12-31' });
      loadCoupons();
    } catch {
      setCoupons([...coupons, newCoupon]);
      setNotice(`Coupon "${form.code.toUpperCase()}" added locally.`);
      setIsAddModalOpen(false);
    }
  };

  const handleDeleteCoupon = (id: number) => {
    setCoupons(coupons.filter(c => c.id !== id));
    setNotice(`Coupon #${id} removed.`);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {notice && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs px-4 py-3 rounded-xl flex items-center gap-2 font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" /> {notice}
        </div>
      )}

      {/* Header Bar */}
      <div className="wp-card p-6 rounded-2xl bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-slate-900">Promo Coupons & Discounts Master</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage promotional codes, flat/percentage discounts & usage limits</p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setIsAddModalOpen(true)}>
          Create New Coupon
        </Button>
      </div>

      {/* Coupons Table */}
      <div className="wp-card p-6 rounded-2xl bg-white space-y-4">
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 text-slate-900 font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="p-3">Coupon Code</th>
                <th className="p-3">Discount Type</th>
                <th className="p-3">Discount Value</th>
                <th className="p-3">Min Order Amount</th>
                <th className="p-3">Usage (Used / Limit)</th>
                <th className="p-3">Expiry Date</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono font-bold text-amber-700 flex items-center gap-1.5">
                    <Ticket className="w-4 h-4 text-amber-600" /> {c.code}
                  </td>
                  <td className="p-3 uppercase font-bold text-slate-800">{c.discount_type}</td>
                  <td className="p-3 font-extrabold text-emerald-800">
                    {c.discount_type === 'percentage' ? `${c.discount_value}% OFF` : `₹${c.discount_value} OFF`}
                  </td>
                  <td className="p-3 font-semibold text-slate-900">₹{c.min_order_amount}</td>
                  <td className="p-3 text-slate-600 font-medium">
                    {c.used_count} / {c.usage_limit}
                  </td>
                  <td className="p-3 text-slate-500 font-mono">{c.expiry_date}</td>
                  <td className="p-3">
                    <Badge status={c.status} />
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleDeleteCoupon(c.id)}
                      className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Coupon Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create New Promotional Coupon">
        <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
          <Input
            label="Coupon Code *"
            required
            placeholder="e.g. MONK20"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Discount Type *</label>
              <select
                value={form.discount_type}
                onChange={(e) => setForm({ ...form, discount_type: e.target.value as any })}
                className="w-full bg-white text-slate-900 rounded-xl px-3 py-2.5 border border-slate-300 focus:outline-none focus:border-emerald-700"
              >
                <option value="percentage">Percentage (%) Discount</option>
                <option value="flat">Flat Amount (₹) Discount</option>
              </select>
            </div>

            <Input
              label="Discount Value *"
              type="number"
              required
              value={form.discount_value}
              onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Min Order Amount (₹) *"
              type="number"
              required
              value={form.min_order_amount}
              onChange={(e) => setForm({ ...form, min_order_amount: Number(e.target.value) })}
            />

            <Input
              label="Usage Limit *"
              type="number"
              required
              value={form.usage_limit}
              onChange={(e) => setForm({ ...form, usage_limit: Number(e.target.value) })}
            />
          </div>

          <Input
            label="Expiry Date *"
            type="date"
            required
            value={form.expiry_date}
            onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Coupon
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

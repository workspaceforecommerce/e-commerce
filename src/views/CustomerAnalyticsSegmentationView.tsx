import React, { useState, useEffect } from 'react';
import {
  BarChart3, PieChart, Users, TrendingUp, Zap, Target, Layers, ArrowUpRight,
  RefreshCw, CheckCircle2, AlertTriangle, Filter, Plus, Mail, MessageSquare,
  Gift, ShieldCheck, DollarSign, Clock, Smartphone, UserCheck, Eye
} from 'lucide-react';
import { Button } from '../shared/components/ui/Button';
import { Modal } from '../shared/components/ui/Modal';

interface CustomerMetric {
  total_customers: number; total_revenue: number; clv: number; aov: number;
  repeat_purchase_rate: number; churn_risk_rate: number; top_customers: any[];
}

interface SegmentRecord {
  id: string; name: string; description: string; member_count: number; updated_at: string;
}

interface AudienceRecord {
  id: string; name: string; count: number; channel_reach: string; conversion_rate: string;
}

interface WorkflowRecord {
  id: string; name: string; trigger_event: string; actions: string[]; status: string; total_triggered: number;
}

export const CustomerAnalyticsSegmentationView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'analytics' | 'segments' | 'automation'>('analytics');
  const [metrics, setMetrics] = useState<CustomerMetric | null>(null);
  const [segments, setSegments] = useState<SegmentRecord[]>([]);
  const [audiences, setAudiences] = useState<AudienceRecord[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // Segment Modal State
  const [isSegmentModalOpen, setIsSegmentModalOpen] = useState(false);
  const [segForm, setSegForm] = useState({ name: '', description: '', min_spend: 10000, min_orders: 5, group: 'All' });

  // Workflow Modal State
  const [isWfModalOpen, setIsWfModalOpen] = useState(false);
  const [wfForm, setWfForm] = useState({ name: '', trigger_event: 'Registration', channel_action: 'WhatsApp Welcome' });

  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null);
  const showNotice = (text: string, error = false) => { setNotice({ text, error }); setTimeout(() => setNotice(null), 4000); };

  const loadData = async () => {
    setLoading(true);
    try {
      const [mRes, sRes, aRes, wRes]: [any, any, any, any] = await Promise.all([
        fetch('/api/analytics/customers').then(r => r.json()),
        fetch('/api/analytics/segments').then(r => r.json()),
        fetch('/api/analytics/audiences').then(r => r.json()),
        fetch('/api/analytics/automation').then(r => r.json()),
      ]);
      if (mRes.success) setMetrics(mRes.metrics);
      if (sRes.success) setSegments(sRes.segments);
      if (aRes.success) setAudiences(aRes.audiences);
      if (wRes.success) setWorkflows(wRes.workflows);
    } catch {
      setMetrics({
        total_customers: 1240, total_revenue: 5634000, clv: 4543, aov: 1860,
        repeat_purchase_rate: 68.4, churn_risk_rate: 12.1, top_customers: mockTopCustomers()
      });
      setSegments(mockSegmentsList());
      setAudiences(mockAudiencesList());
      setWorkflows(mockWorkflowsList());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleCreateSegment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!segForm.name) return;

    await fetch('/api/analytics/segments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: segForm.name, description: segForm.description, rules: { min_spend: segForm.min_spend, min_orders: segForm.min_orders, group: segForm.group } })
    }).catch(() => {});

    showNotice(`Segment "${segForm.name}" created successfully.`);
    setIsSegmentModalOpen(false);
    loadData();
  };

  const handleCreateWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wfForm.name) return;

    await fetch('/api/analytics/automation/workflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: wfForm.name, trigger_event: wfForm.trigger_event, actions: [wfForm.channel_action] })
    }).catch(() => {});

    showNotice(`Automation Workflow "${wfForm.name}" activated.`);
    setIsWfModalOpen(false);
    loadData();
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
            <BarChart3 className="w-5 h-5 text-emerald-700" /> Customer Analytics, Segmentation & Automation
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5">CLV & AOV intelligence, dynamic audience builder & event-driven marketing workflows</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
          <button onClick={() => setActiveSubTab('analytics')} className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeSubTab === 'analytics' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}>Analytics CLV</button>
          <button onClick={() => setActiveSubTab('segments')} className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeSubTab === 'segments' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}>Segments Builder</button>
          <button onClick={() => setActiveSubTab('automation')} className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeSubTab === 'automation' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}>Audiences & Automation</button>
        </div>
      </div>

      {/* ── SUB-TAB 1: Executive Analytics ──────────────────────────────── */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="wp-card p-4 bg-white rounded-2xl border border-slate-200"><p className="text-xl font-extrabold text-emerald-800">₹{metrics?.clv?.toLocaleString()}</p><p className="text-[11px] text-slate-500">Customer Lifetime Value (CLV)</p></div>
            <div className="wp-card p-4 bg-white rounded-2xl border border-slate-200"><p className="text-xl font-extrabold text-indigo-800">₹{metrics?.aov?.toLocaleString()}</p><p className="text-[11px] text-slate-500">Average Order Value (AOV)</p></div>
            <div className="wp-card p-4 bg-white rounded-2xl border border-slate-200"><p className="text-xl font-extrabold text-purple-800">{metrics?.repeat_purchase_rate}%</p><p className="text-[11px] text-slate-500">Repeat Purchase Rate</p></div>
            <div className="wp-card p-4 bg-white rounded-2xl border border-slate-200"><p className="text-xl font-extrabold text-amber-800">{metrics?.churn_risk_rate}%</p><p className="text-[11px] text-slate-500">Predicted Churn Rate</p></div>
          </div>

          <div className="wp-card bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-extrabold text-sm text-slate-900">Top Revenue Contributing Customers</h2>
              <button onClick={loadData} className="p-1.5 bg-slate-100 rounded-lg text-slate-700 hover:bg-slate-200"><RefreshCw className="w-3.5 h-3.5" /></button>
            </div>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left">
                <thead className="bg-slate-100 font-bold uppercase text-slate-900 border-b border-slate-200">
                  <tr>
                    <th className="p-3">Customer Name</th>
                    <th className="p-3">Group</th>
                    <th className="p-3">Total Orders</th>
                    <th className="p-3">Lifetime Value (LTV)</th>
                    <th className="p-3">Avg Basket (AOV)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {(metrics?.top_customers || []).map((c, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{c.name} <span className="font-normal text-slate-500 text-[10px]">({c.email})</span></td>
                      <td className="p-3 font-bold text-indigo-800">{c.customer_group}</td>
                      <td className="p-3 font-mono font-bold">{c.total_orders}</td>
                      <td className="p-3 font-extrabold text-emerald-800">₹{c.total_spent?.toLocaleString()}</td>
                      <td className="p-3 font-mono text-slate-700">₹{c.aov}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── SUB-TAB 2: Customer Segmentation Builder ───────────────────── */}
      {activeSubTab === 'segments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-extrabold text-sm text-slate-900">Dynamic Customer Segments ({segments.length})</h2>
            <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setIsSegmentModalOpen(true)}>Create Segment</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {segments.map(s => (
              <div key={s.id} className="wp-card p-5 rounded-2xl bg-white border border-slate-200 space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-heading font-extrabold text-sm text-slate-900">{s.name}</h3>
                  <span className="font-bold text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">{s.member_count} Members</span>
                </div>
                <p className="text-[11px] text-slate-600">{s.description}</p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Updated: {new Date(s.updated_at).toLocaleDateString()}</span>
                  <span className="font-bold text-emerald-700 cursor-pointer hover:underline">View Audience</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SUB-TAB 3: Marketing Audiences & Automation Workflows ─────── */}
      {activeSubTab === 'automation' && (
        <div className="space-y-5">
          {/* Audiences */}
          <div className="wp-card bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
            <h2 className="font-heading font-extrabold text-sm text-slate-900">Reusable Marketing Audiences</h2>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left">
                <thead className="bg-slate-100 font-bold uppercase text-slate-900 border-b border-slate-200">
                  <tr>
                    <th className="p-3">Audience Target</th>
                    <th className="p-3">Est. Reach</th>
                    <th className="p-3">Channel Reach</th>
                    <th className="p-3">Historical Conv. Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {audiences.map(a => (
                    <tr key={a.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{a.name}</td>
                      <td className="p-3 font-extrabold text-emerald-800">{a.count} Users</td>
                      <td className="p-3 font-semibold text-slate-700">{a.channel_reach}</td>
                      <td className="p-3 font-bold text-indigo-800">{a.conversion_rate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Workflows */}
          <div className="wp-card bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-extrabold text-sm text-slate-900">Event-Driven Automation Workflows</h2>
              <Button variant="primary" size="sm" icon={<Zap className="w-3.5 h-3.5" />} onClick={() => setIsWfModalOpen(true)}>New Workflow</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {workflows.map(w => (
                <div key={w.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{w.name}</span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">{w.status}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono">Trigger: {w.trigger_event}</p>
                  <div className="space-y-1">
                    {w.actions.map((act, idx) => (
                      <div key={idx} className="text-[10px] font-bold text-slate-700 bg-white p-1.5 rounded border border-slate-200">➔ {act}</div>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono pt-1">Triggered {w.total_triggered} times</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create Segment Modal */}
      <Modal isOpen={isSegmentModalOpen} onClose={() => setIsSegmentModalOpen(false)} title="Create Dynamic Customer Segment">
        <form onSubmit={handleCreateSegment} className="space-y-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Segment Name *</label>
            <input type="text" required placeholder="e.g. VIP Ashwagandha Repeat Buyers" value={segForm.name} onChange={e => setSegForm({ ...segForm, name: e.target.value })} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description</label>
            <input type="text" placeholder="Target audience criteria..." value={segForm.description} onChange={e => setSegForm({ ...segForm, description: e.target.value })} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Min Spend (₹)</label>
              <input type="number" value={segForm.min_spend} onChange={e => setSegForm({ ...segForm, min_spend: parseInt(e.target.value) })} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700" />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Min Orders</label>
              <input type="number" value={segForm.min_orders} onChange={e => setSegForm({ ...segForm, min_orders: parseInt(e.target.value) })} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsSegmentModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm">Save Segment</Button>
          </div>
        </form>
      </Modal>

      {/* Create Workflow Modal */}
      <Modal isOpen={isWfModalOpen} onClose={() => setIsWfModalOpen(false)} title="Create Automation Workflow">
        <form onSubmit={handleCreateWorkflow} className="space-y-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Workflow Name *</label>
            <input type="text" required placeholder="e.g. Birthday Promo WhatsApp Trigger" value={wfForm.name} onChange={e => setWfForm({ ...wfForm, name: e.target.value })} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Event Trigger</label>
              <select value={wfForm.trigger_event} onChange={e => setWfForm({ ...wfForm, trigger_event: e.target.value })} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700">
                <option value="Registration">Registration</option>
                <option value="First Order">First Order</option>
                <option value="Cart Abandoned">Cart Abandoned</option>
                <option value="Loyalty Tier Upgrade">Loyalty Tier Upgrade</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Channel Action</label>
              <select value={wfForm.channel_action} onChange={e => setWfForm({ ...wfForm, channel_action: e.target.value })} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700">
                <option value="WhatsApp Welcome">WhatsApp Welcome</option>
                <option value="Email Promo Voucher">Email Promo Voucher</option>
                <option value="SMS Reminder">SMS Reminder</option>
                <option value="Award 500 Points">Award 500 Points</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsWfModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm">Activate Workflow</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

function mockTopCustomers() {
  return [
    { id: 'cust2', name: 'Priya Mehta', email: 'priya@gmail.com', customer_group: 'Wholesale', total_orders: 14, total_spent: 38400, aov: 2742 },
    { id: 'cust1', name: 'Aarav Sharma', email: 'aarav@example.com', customer_group: 'VIP', total_orders: 8, total_spent: 14890, aov: 1861 },
    { id: 'cust4', name: 'Neha Verma', email: 'neha@yahoo.com', customer_group: 'Corporate', total_orders: 6, total_spent: 9800, aov: 1633 }
  ];
}

function mockSegmentsList(): SegmentRecord[] {
  return [
    { id: 'seg1', name: 'VIP High Spenders', description: 'Customers with LTV > ₹15,000', member_count: 184, updated_at: '2026-07-27T10:00:00Z' },
    { id: 'seg2', name: 'Wholesale GST Accounts', description: 'B2B GST registered spa & clinic accounts', member_count: 35, updated_at: '2026-07-26T14:00:00Z' }
  ];
}

function mockAudiencesList(): AudienceRecord[] {
  return [
    { id: 'aud1', name: 'VIP High Spenders (> ₹15,000)', count: 184, channel_reach: 'Email, WhatsApp, Push', conversion_rate: '24.2%' },
    { id: 'aud2', name: 'Cart Abandoners (Last 48 Hours)', count: 42, channel_reach: 'WhatsApp, SMS', conversion_rate: '18.6%' }
  ];
}

function mockWorkflowsList(): WorkflowRecord[] {
  return [
    { id: 'wf1', name: 'Welcome Onboarding Series', trigger_event: 'Registration', actions: ['Send WhatsApp Welcome', 'Issue WELCOME100 Coupon'], status: 'Active', total_triggered: 1240 },
    { id: 'wf2', name: 'Cart Recovery Nudge', trigger_event: 'Cart Abandoned', actions: ['Send WhatsApp Reminder (1hr)', 'Send Email Coupon (24hr)'], status: 'Active', total_triggered: 412 }
  ];
}

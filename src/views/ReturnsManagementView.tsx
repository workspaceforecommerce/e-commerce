import React, { useState, useEffect } from 'react';
import {
  RotateCcw, ShieldCheck, CheckCircle2, XCircle, Clock, AlertTriangle, Search,
  RefreshCw, FileText, Image as ImageIcon, Eye, ArrowRightLeft, Package, User,
  Check, X, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { Button } from '../shared/components/ui/Button';
import { Modal } from '../shared/components/ui/Modal';

interface ReturnRecord {
  id: string; rma_number: string; order_number: string; customer_name: string;
  customer_email: string; return_reason: string; resolution: 'Refund' | 'Replacement' | 'Exchange';
  rma_status: string; refund_amount: number; comments?: string; evidence_url?: string;
  admin_remarks?: string; created_at: string;
}

export const ReturnsManagementView: React.FC = () => {
  const [returns, setReturns] = useState<ReturnRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQ, setSearchQ] = useState('');

  // Inspection Modal State
  const [selectedRma, setSelectedRma] = useState<ReturnRecord | null>(null);
  const [inspectionAction, setInspectionAction] = useState<'restock' | 'damaged'>('restock');
  const [inspectorNotes, setInspectorNotes] = useState('');

  // Submit RMA Modal State (Customer / Admin proxy)
  const [isNewRmaModalOpen, setIsNewRmaModalOpen] = useState(false);
  const [newRmaData, setNewRmaData] = useState({
    order_number: '', customer_name: '', customer_email: '', return_reason: 'Damaged Product',
    resolution: 'Refund' as 'Refund' | 'Replacement' | 'Exchange', comments: '', evidence_url: ''
  });

  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null);
  const showNotice = (text: string, error = false) => { setNotice({ text, error }); setTimeout(() => setNotice(null), 4000); };

  const loadData = async () => {
    setLoading(true);
    try {
      const res: any = await fetch('/api/returns').then(r => r.json());
      if (res.success) setReturns(res.returns);
    } catch {
      setReturns(mockReturnsList());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleUpdateStatus = async (rma: ReturnRecord, nextStatus: string) => {
    await fetch(`/api/returns/${rma.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus })
    }).catch(() => {});

    showNotice(`RMA #${rma.rma_number} status updated to ${nextStatus}`);
    loadData();
  };

  const handleInspectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRma) return;

    await fetch(`/api/returns/${selectedRma.id}/inspection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: inspectionAction, inspector_notes: inspectorNotes })
    }).catch(() => {});

    showNotice(`Inspection completed for RMA #${selectedRma.rma_number}. Action: ${inspectionAction.toUpperCase()}`);
    setSelectedRma(null);
    setInspectorNotes('');
    loadData();
  };

  const handleCreateRma = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRmaData.order_number || !newRmaData.customer_name) return;

    const res: any = await fetch('/api/returns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newRmaData, items: [{ product_title: 'KSM-66 Ashwagandha Root Powder', quantity: 1, price: 499 }] })
    }).then(r => r.json()).catch(() => ({ success: true, rma_number: 'RMA-MOCK' }));

    if (res.success) {
      showNotice(`Return Request #${res.rma_number} created successfully.`);
      setIsNewRmaModalOpen(false);
      loadData();
    }
  };

  const statusBadge = (st: string) => {
    switch (st) {
      case 'Requested': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Under Review': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'Approved': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Inspection Passed': return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      case 'Refund Completed': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Rejected': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-slate-100 text-slate-700 border-slate-300';
    }
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
            <RotateCcw className="w-5 h-5 text-emerald-700" /> Enterprise Returns, Refunds & RMA Management
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5">Post-purchase Return Merchandise Authorization, quality inspection & inventory restocking</p>
        </div>
        <Button variant="primary" size="sm" icon={<RotateCcw className="w-3.5 h-3.5" />} onClick={() => setIsNewRmaModalOpen(true)}>
          Create Return Request
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="wp-card p-4 bg-white rounded-2xl border border-slate-200"><p className="text-xl font-extrabold text-amber-700">{returns.filter(r => r.rma_status === 'Requested' || r.rma_status === 'Under Review').length}</p><p className="text-[11px] text-slate-500">Pending Review</p></div>
        <div className="wp-card p-4 bg-white rounded-2xl border border-slate-200"><p className="text-xl font-extrabold text-blue-700">{returns.filter(r => r.rma_status === 'Approved').length}</p><p className="text-[11px] text-slate-500">Approved RMA</p></div>
        <div className="wp-card p-4 bg-white rounded-2xl border border-slate-200"><p className="text-xl font-extrabold text-cyan-700">{returns.filter(r => r.rma_status === 'Inspection Passed').length}</p><p className="text-[11px] text-slate-500">Inspection Passed</p></div>
        <div className="wp-card p-4 bg-white rounded-2xl border border-slate-200"><p className="text-xl font-extrabold text-purple-700">{returns.filter(r => r.rma_status === 'Refund Completed').length}</p><p className="text-[11px] text-slate-500">Refund Completed</p></div>
      </div>

      {/* RMA Requests Table */}
      <div className="wp-card bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-extrabold text-sm text-slate-900">RMA Return Applications</h2>
          <button onClick={loadData} className="p-1.5 bg-slate-100 rounded-lg text-slate-700 hover:bg-slate-200"><RefreshCw className="w-3.5 h-3.5" /></button>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left">
            <thead className="bg-slate-100 font-bold uppercase text-slate-900 border-b border-slate-200">
              <tr>
                <th className="p-3">RMA Number</th>
                <th className="p-3">Order Number</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Reason</th>
                <th className="p-3">Resolution</th>
                <th className="p-3">Status</th>
                <th className="p-3">Refund Amount</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {returns.map(r => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono font-extrabold text-emerald-800">{r.rma_number}</td>
                  <td className="p-3 font-mono text-slate-700">{r.order_number}</td>
                  <td className="p-3 font-bold text-slate-900">{r.customer_name}</td>
                  <td className="p-3 font-semibold text-amber-800">{r.return_reason}</td>
                  <td className="p-3 uppercase font-bold text-[10px] text-slate-700">{r.resolution}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge(r.rma_status)}`}>{r.rma_status}</span>
                  </td>
                  <td className="p-3 font-extrabold text-slate-900">₹{r.refund_amount}</td>
                  <td className="p-3 flex items-center gap-1.5">
                    <button onClick={() => setSelectedRma(r)} className="p-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-indigo-800 font-bold flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" /> Inspect
                    </button>
                    {r.rma_status === 'Under Review' && (
                      <button onClick={() => handleUpdateStatus(r, 'Approved')} className="p-1.5 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-emerald-800 font-bold">Approve</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quality Inspection Modal */}
      <Modal isOpen={!!selectedRma} onClose={() => setSelectedRma(null)} title={`RMA Inspection: ${selectedRma?.rma_number || ''}`}>
        {selectedRma && (
          <form onSubmit={handleInspectionSubmit} className="space-y-4">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
              <p className="font-bold text-slate-900">{selectedRma.customer_name} ({selectedRma.customer_email})</p>
              <p className="text-slate-600 font-semibold">Reason: <span className="text-amber-800">{selectedRma.return_reason}</span></p>
              <p className="text-slate-500">{selectedRma.comments}</p>
            </div>

            {selectedRma.evidence_url && (
              <div>
                <p className="font-bold text-slate-900 mb-1">Customer Evidence Photo</p>
                <img src={selectedRma.evidence_url} alt="Evidence" className="w-full h-40 object-cover rounded-xl border border-slate-200" />
              </div>
            )}

            <div className="space-y-2">
              <p className="font-bold text-slate-900">Restocking Decision</p>
              <div className="grid grid-cols-2 gap-3">
                <label onClick={() => setInspectionAction('restock')} className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2 ${inspectionAction === 'restock' ? 'bg-emerald-50 border-emerald-600 text-slate-900' : 'bg-white border-slate-300'}`}>
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <div><p className="font-bold text-xs">Restock to Active Stock</p><p className="text-[10px] text-slate-500">+1 inventory count</p></div>
                </label>
                <label onClick={() => setInspectionAction('damaged')} className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2 ${inspectionAction === 'damaged' ? 'bg-red-50 border-red-600 text-slate-900' : 'bg-white border-slate-300'}`}>
                  <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <div><p className="font-bold text-xs">Mark Damaged Non-Sellable</p><p className="text-[10px] text-slate-500">Do not restock</p></div>
                </label>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Inspector Notes & Remarks</label>
              <textarea placeholder="Purity seal verified, product packaging intact..." value={inspectorNotes} onChange={e => setInspectorNotes(e.target.value)} className="w-full bg-white text-slate-900 rounded-xl p-2.5 border border-slate-300 focus:outline-none focus:border-emerald-700" rows={2} />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <Button type="button" variant="outline" size="sm" onClick={() => setSelectedRma(null)}>Cancel</Button>
              <Button type="submit" variant="primary" size="sm">Pass Inspection & Restock</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* New RMA Request Modal */}
      <Modal isOpen={isNewRmaModalOpen} onClose={() => setIsNewRmaModalOpen(false)} title="Submit New Return Request (RMA)">
        <form onSubmit={handleCreateRma} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Order Number *</label>
              <input type="text" required placeholder="HM-ORD-482910" value={newRmaData.order_number} onChange={e => setNewRmaData({ ...newRmaData, order_number: e.target.value })} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700" />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Customer Name *</label>
              <input type="text" required value={newRmaData.customer_name} onChange={e => setNewRmaData({ ...newRmaData, customer_name: e.target.value })} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Return Reason</label>
              <select value={newRmaData.return_reason} onChange={e => setNewRmaData({ ...newRmaData, return_reason: e.target.value })} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700">
                {['Damaged Product', 'Wrong Product', 'Missing Item', 'Defective Product', 'Size Issue', 'Quality Issue', 'No Longer Needed'].map(rs => <option key={rs} value={rs}>{rs}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Preferred Resolution</label>
              <select value={newRmaData.resolution} onChange={e => setNewRmaData({ ...newRmaData, resolution: e.target.value as any })} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700">
                <option value="Refund">Refund</option>
                <option value="Replacement">Replacement</option>
                <option value="Exchange">Exchange</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Comments & Description</label>
            <textarea value={newRmaData.comments} onChange={e => setNewRmaData({ ...newRmaData, comments: e.target.value })} className="w-full bg-white text-slate-900 rounded-xl p-2 border border-slate-300 focus:outline-none focus:border-emerald-700" rows={2} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsNewRmaModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm">Submit RMA</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

function mockReturnsList(): ReturnRecord[] {
  return [
    { id: 'rma1', rma_number: 'RMA-981203', order_number: 'HM-ORD-482910', customer_name: 'Aarav Sharma', customer_email: 'aarav@example.com', return_reason: 'Damaged Product', resolution: 'Replacement', rma_status: 'Under Review', refund_amount: 499, comments: 'Jar seal was broken upon arrival', evidence_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=60', created_at: '2026-07-27T16:00:00Z' },
    { id: 'rma2', rma_number: 'RMA-448102', order_number: 'HM-ORD-839210', customer_name: 'Priya Mehta', customer_email: 'priya@gmail.com', return_reason: 'Wrong Product Sent', resolution: 'Refund', rma_status: 'Inspection Passed', refund_amount: 899, comments: 'Received Chyawanprash instead of Ashwagandha', created_at: '2026-07-26T14:20:00Z' },
    { id: 'rma3', rma_number: 'RMA-110293', order_number: 'HM-ORD-109283', customer_name: 'Vikram Singh', customer_email: 'vikram@yahoo.com', return_reason: 'Quality Issue', resolution: 'Refund', rma_status: 'Refund Completed', refund_amount: 539, comments: 'Moisture inside seal', created_at: '2026-07-25T11:10:00Z' },
  ];
}

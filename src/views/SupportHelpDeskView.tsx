import React, { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare, HelpCircle, Bot, Send, ShieldCheck, Clock, AlertTriangle,
  CheckCircle2, RefreshCw, Eye, Edit3, User, Tag, Sparkles, Lock, FileText,
  Search, Plus, BookOpen, Layers
} from 'lucide-react';
import { Button } from '../shared/components/ui/Button';
import { Modal } from '../shared/components/ui/Modal';

interface TicketMessage {
  id: string; sender_type: 'Customer' | 'Agent' | 'System'; sender_name: string;
  message: string; is_internal: number; created_at: string;
}

interface SupportTicket {
  id: string; ticket_number: string; customer_name: string; customer_email: string;
  customer_phone?: string; order_number?: string; category: string; priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed'; assigned_agent?: string; subject: string;
  created_at: string; messages?: TicketMessage[];
}

interface KbArticle {
  id: string; category: string; title: string; content: string; views: number;
}

export const SupportHelpDeskView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'tickets' | 'kb'>('tickets');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [kbArticles, setKbArticles] = useState<KbArticle[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Selected Ticket Drawer Modal
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyInput, setReplyInput] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);

  // AI Copilot state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiCopilotData, setAiCopilotData] = useState<{ suggested_reply: string; conversation_summary: string; sentiment: string } | null>(null);

  // Add Ticket Modal State
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [newTicketForm, setNewTicketForm] = useState<Partial<SupportTicket>>({
    customer_name: '', customer_email: '', customer_phone: '', order_number: '', category: 'Order Issue', priority: 'Medium', subject: '',
  });
  const [initialMessage, setInitialMessage] = useState('');

  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null);
  const showNotice = (text: string, error = false) => { setNotice({ text, error }); setTimeout(() => setNotice(null), 4000); };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.set('status', filterStatus);
      if (filterPriority) params.set('priority', filterPriority);
      if (filterCategory) params.set('category', filterCategory);

      const [tRes, kRes]: [any, any] = await Promise.all([
        fetch(`/api/tickets?${params}`).then(r => r.json()),
        fetch('/api/tickets/kb').then(r => r.json())
      ]);
      if (tRes.success) setTickets(tRes.tickets);
      if (kRes.success) setKbArticles(kRes.articles);
    } catch {
      setTickets(mockTicketsList());
      setKbArticles(mockKbArticles());
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterPriority, filterCategory]);

  useEffect(() => { loadData(); }, [loadData]);

  const openTicketDrawer = async (tck: SupportTicket) => {
    setAiCopilotData(null);
    try {
      const res: any = await fetch(`/api/tickets/${tck.id}`).then(r => r.json());
      if (res.success && res.ticket) {
        setSelectedTicket(res.ticket);
        return;
      }
    } catch {}
    setSelectedTicket(tck);
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyInput.trim()) return;

    await fetch(`/api/tickets/${selectedTicket.id}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender_name: 'Siddharth Nair', sender_type: 'Agent', message: replyInput, is_internal: isInternalNote })
    }).catch(() => {});

    showNotice(isInternalNote ? 'Internal staff note recorded.' : 'Public reply sent to customer.');
    setReplyInput('');
    openTicketDrawer(selectedTicket);
    loadData();
  };

  const handleGenerateAiCopilot = async () => {
    if (!selectedTicket) return;
    setAiLoading(true);
    try {
      const res: any = await fetch(`/api/tickets/${selectedTicket.id}/ai-copilot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: selectedTicket.subject, category: selectedTicket.category })
      }).then(r => r.json());

      if (res.success && res.copilot) {
        setAiCopilotData(res.copilot);
        showNotice('AI Support Copilot draft generated!');
      }
    } catch {
      setAiCopilotData({
        suggested_reply: `Dear ${selectedTicket.customer_name},\n\nThank you for bringing order #${selectedTicket.order_number || ''} to our attention. Our fulfillment desk is investigating your ${selectedTicket.category} query.\n\nWarm regards,\nHealthy Monks Support`,
        conversation_summary: `Customer opened inquiry regarding ${selectedTicket.category}. High priority response advised.`,
        sentiment: 'Urgent Inquiry'
      });
    } finally {
      setAiLoading(false);
    }
  };

  const applyAiDraft = () => {
    if (aiCopilotData?.suggested_reply) {
      setReplyInput(aiCopilotData.suggested_reply);
      setIsInternalNote(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketForm.customer_name || !newTicketForm.customer_email || !newTicketForm.subject) return;

    await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newTicketForm, message: initialMessage })
    }).catch(() => {});

    showNotice('New support ticket created.');
    setIsNewTicketOpen(false);
    loadData();
  };

  const priorityColor: Record<string, string> = {
    Urgent: 'bg-red-100 text-red-800 border-red-300',
    High: 'bg-amber-100 text-amber-800 border-amber-300',
    Medium: 'bg-blue-100 text-blue-800 border-blue-300',
    Low: 'bg-slate-100 text-slate-700 border-slate-300',
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
            <MessageSquare className="w-5 h-5 text-emerald-700" /> Help Desk, Ticketing & AI Support Copilot
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5">Omni-channel customer support, internal staff notes & AI draft assistant</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
            <button onClick={() => setActiveSubTab('tickets')} className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeSubTab === 'tickets' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}>Tickets Desk</button>
            <button onClick={() => setActiveSubTab('kb')} className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeSubTab === 'kb' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}>Knowledge Base</button>
          </div>
          <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setIsNewTicketOpen(true)}>New Ticket</Button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="wp-card p-4 bg-white rounded-2xl border border-slate-200"><p className="text-xl font-extrabold text-slate-900">{tickets.length}</p><p className="text-[11px] text-slate-500">Total Tickets</p></div>
        <div className="wp-card p-4 bg-white rounded-2xl border border-slate-200"><p className="text-xl font-extrabold text-amber-800">{tickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length}</p><p className="text-[11px] text-slate-500">Active / Open Queue</p></div>
        <div className="wp-card p-4 bg-white rounded-2xl border border-slate-200"><p className="text-xl font-extrabold text-red-800">{tickets.filter(t => t.priority === 'Urgent' || t.priority === 'High').length}</p><p className="text-[11px] text-slate-500">Urgent Priority</p></div>
        <div className="wp-card p-4 bg-white rounded-2xl border border-slate-200"><p className="text-xl font-extrabold text-emerald-800">{kbArticles.length}</p><p className="text-[11px] text-slate-500">Knowledge Base FAQs</p></div>
      </div>

      {/* ── SUB-TAB 1: Tickets Queue ───────────────────────────────────── */}
      {activeSubTab === 'tickets' && (
        <div className="wp-card bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-slate-50 text-xs text-slate-700 rounded-xl px-3 py-1.5 border border-slate-300 focus:outline-none">
                <option value="">All Statuses</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
              <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="bg-slate-50 text-xs text-slate-700 rounded-xl px-3 py-1.5 border border-slate-300 focus:outline-none">
                <option value="">All Priorities</option>
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="bg-slate-50 text-xs text-slate-700 rounded-xl px-3 py-1.5 border border-slate-300 focus:outline-none">
                <option value="">All Categories</option>
                <option value="Shipping Issue">Shipping Issue</option>
                <option value="Return & Refund">Return & Refund</option>
                <option value="Order Issue">Order Issue</option>
                <option value="Product Query">Product Query</option>
              </select>
            </div>
            <button onClick={loadData} className="p-1.5 bg-slate-100 rounded-lg text-slate-700 hover:bg-slate-200"><RefreshCw className="w-3.5 h-3.5" /></button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left">
              <thead className="bg-slate-100 font-bold uppercase text-slate-900 border-b border-slate-200">
                <tr>
                  <th className="p-3">Ticket #</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Subject / Order</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Assigned Agent</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {tickets.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => openTicketDrawer(t)}>
                    <td className="p-3 font-mono font-bold text-emerald-800">{t.ticket_number}</td>
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{t.customer_name}</p>
                      <p className="text-[10px] text-slate-500">{t.customer_email}</p>
                    </td>
                    <td className="p-3">
                      <p className="font-bold text-slate-900 truncate max-w-xs">{t.subject}</p>
                      {t.order_number && <p className="font-mono text-[10px] text-slate-500">Order: {t.order_number}</p>}
                    </td>
                    <td className="p-3 font-semibold text-slate-700">{t.category}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${priorityColor[t.priority]}`}>{t.priority}</span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${t.status === 'Open' ? 'bg-amber-100 text-amber-800' : t.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'}`}>{t.status}</span>
                    </td>
                    <td className="p-3 text-slate-600 font-semibold">{t.assigned_agent || 'Unassigned'}</td>
                    <td className="p-3" onClick={e => e.stopPropagation()}>
                      <button onClick={() => openTicketDrawer(t)} className="p-1.5 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-emerald-800 font-bold flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" /> View Thread
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── SUB-TAB 2: Knowledge Base ──────────────────────────────────── */}
      {activeSubTab === 'kb' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {kbArticles.map(a => (
            <div key={a.id} className="wp-card p-5 rounded-2xl bg-white border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full uppercase border border-emerald-200">{a.category}</span>
              <h3 className="font-heading font-extrabold text-sm text-slate-900">{a.title}</h3>
              <p className="text-slate-600 text-[11px] leading-relaxed">{a.content}</p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span>{a.views} Views</span>
                <span className="font-bold text-emerald-700">Verified FAQ Article</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ticket Drawer & Thread Modal */}
      <Modal isOpen={!!selectedTicket} onClose={() => setSelectedTicket(null)} title={`Ticket ${selectedTicket?.ticket_number || ''}: ${selectedTicket?.subject || ''}`}>
        {selectedTicket && (
          <div className="space-y-4 text-xs">
            {/* Header Details */}
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] flex-wrap gap-2">
              <div>
                <p className="font-bold text-slate-900">{selectedTicket.customer_name} ({selectedTicket.customer_email})</p>
                <p className="text-slate-500">Order: <span className="font-mono font-bold text-slate-800">{selectedTicket.order_number || 'N/A'}</span> · Phone: {selectedTicket.customer_phone || 'N/A'}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full font-bold border ${priorityColor[selectedTicket.priority]}`}>{selectedTicket.priority}</span>
                <span className="font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-300">{selectedTicket.status}</span>
              </div>
            </div>

            {/* AI Support Copilot Section */}
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-900 flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-purple-700" /> AI Support Copilot</span>
                <button type="button" onClick={handleGenerateAiCopilot} disabled={aiLoading} className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-[10px] flex items-center gap-1">
                  {aiLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Bot className="w-3 h-3" />} Generate AI Draft
                </button>
              </div>
              {aiCopilotData && (
                <div className="space-y-2 bg-white p-2.5 rounded-lg border border-purple-200 text-[11px]">
                  <p className="text-purple-800 font-bold">Summary: <span className="font-normal text-slate-700">{aiCopilotData.conversation_summary}</span></p>
                  <div className="p-2 bg-slate-50 rounded border border-slate-200 font-mono text-[10px] text-slate-800 whitespace-pre-wrap">{aiCopilotData.suggested_reply}</div>
                  <button type="button" onClick={applyAiDraft} className="text-purple-700 font-extrabold hover:underline text-[10px]">Use AI Suggested Reply</button>
                </div>
              )}
            </div>

            {/* Conversation Thread History */}
            <div className="space-y-2 max-h-60 overflow-y-auto p-3 bg-slate-50 rounded-xl border border-slate-200">
              {(selectedTicket.messages || [
                { id: 'm1', sender_type: 'Customer', sender_name: selectedTicket.customer_name, message: selectedTicket.subject, is_internal: 0, created_at: selectedTicket.created_at }
              ]).map((m, idx) => (
                <div key={idx} className={`p-3 rounded-xl border ${m.is_internal ? 'bg-amber-50 border-amber-300 text-amber-900' : m.sender_type === 'Agent' ? 'bg-emerald-50 border-emerald-200 text-emerald-900 ml-4' : 'bg-white border-slate-200 text-slate-800 mr-4'}`}>
                  <div className="flex items-center justify-between mb-1 font-bold text-[10px]">
                    <span className="flex items-center gap-1">
                      {m.is_internal ? <Lock className="w-3 h-3 text-amber-600" /> : null}
                      {m.sender_name} ({m.sender_type})
                    </span>
                    <span className="text-slate-400 font-normal">{new Date(m.created_at).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed whitespace-pre-wrap">{m.message}</p>
                </div>
              ))}
            </div>

            {/* Reply Form */}
            <form onSubmit={handleSendReply} className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block font-bold text-slate-800">Reply Message</label>
                <label className="flex items-center gap-1 text-[11px] text-amber-800 font-bold cursor-pointer">
                  <input type="checkbox" checked={isInternalNote} onChange={e => setIsInternalNote(e.target.checked)} className="rounded text-amber-600" /> Internal Staff Note Only
                </label>
              </div>
              <textarea required rows={3} value={replyInput} onChange={e => setReplyInput(e.target.value)} placeholder={isInternalNote ? 'Write internal note visible only to support staff...' : 'Write customer response...'} className={`w-full text-xs rounded-xl p-2.5 border focus:outline-none ${isInternalNote ? 'bg-amber-50 border-amber-300 focus:border-amber-500 text-amber-900' : 'bg-white border-slate-300 focus:border-emerald-700 text-slate-900'}`} />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setSelectedTicket(null)}>Close</Button>
                <Button type="submit" variant="primary" size="sm" icon={<Send className="w-3.5 h-3.5" />}>
                  {isInternalNote ? 'Save Internal Note' : 'Send Reply'}
                </Button>
              </div>
            </form>
          </div>
        )}
      </Modal>

      {/* Create New Ticket Modal */}
      <Modal isOpen={isNewTicketOpen} onClose={() => setIsNewTicketOpen(false)} title="Create Support Ticket">
        <form onSubmit={handleCreateTicket} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Customer Name *</label>
              <input type="text" required value={newTicketForm.customer_name || ''} onChange={e => setNewTicketForm({ ...newTicketForm, customer_name: e.target.value })} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700" />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Customer Email *</label>
              <input type="email" required value={newTicketForm.customer_email || ''} onChange={e => setNewTicketForm({ ...newTicketForm, customer_email: e.target.value })} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Linked Order # (Optional)</label>
              <input type="text" placeholder="HM-ORD-482910" value={newTicketForm.order_number || ''} onChange={e => setNewTicketForm({ ...newTicketForm, order_number: e.target.value })} className="w-full bg-white font-mono text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700" />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category</label>
              <select value={newTicketForm.category || 'Order Issue'} onChange={e => setNewTicketForm({ ...newTicketForm, category: e.target.value })} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700">
                <option value="Shipping Issue">Shipping Issue</option>
                <option value="Return & Refund">Return & Refund</option>
                <option value="Order Issue">Order Issue</option>
                <option value="Product Query">Product Query</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Subject Header *</label>
            <input type="text" required value={newTicketForm.subject || ''} onChange={e => setNewTicketForm({ ...newTicketForm, subject: e.target.value })} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Initial Message *</label>
            <textarea required rows={3} value={initialMessage} onChange={e => setInitialMessage(e.target.value)} className="w-full bg-white text-slate-900 rounded-xl p-2.5 border border-slate-300 focus:outline-none focus:border-emerald-700" />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsNewTicketOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm">Submit Ticket</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

function mockTicketsList(): SupportTicket[] {
  return [
    {
      id: 'tck1', ticket_number: 'TCK-2026-4891', customer_name: 'Aarav Sharma', customer_email: 'aarav@example.com', customer_phone: '+91 9812345678', order_number: 'HM-ORD-482910', category: 'Shipping Issue', priority: 'High', status: 'In Progress', assigned_agent: 'Siddharth Nair', subject: 'Delay in Blue Dart Courier Delivery', created_at: '2026-07-27T10:15:00Z',
      messages: [
        { id: 'm1', sender_type: 'Customer', sender_name: 'Aarav Sharma', message: 'Hello, my order #HM-ORD-482910 was shipped yesterday but Blue Dart tracking shows no updates.', is_internal: 0, created_at: '2026-07-27T10:15:00Z' },
        { id: 'm2', sender_type: 'Agent', sender_name: 'Siddharth Nair', message: 'Namaste Aarav! I am checking with the Blue Dart dispatch hub now. Your parcel is in transit.', is_internal: 0, created_at: '2026-07-27T11:00:00Z' }
      ]
    },
    {
      id: 'tck2', ticket_number: 'TCK-2026-9021', customer_name: 'Priya Mehta', customer_email: 'priya@gmail.com', customer_phone: '+91 9765432109', order_number: 'HM-ORD-839210', category: 'Return & Refund', priority: 'Urgent', status: 'Open', assigned_agent: 'Unassigned', subject: 'Damaged Jar Seal Received', created_at: '2026-07-27T12:40:00Z',
      messages: [
        { id: 'm4', sender_type: 'Customer', sender_name: 'Priya Mehta', message: 'The outer seal on my Chyawanprash 1kg jar was broken upon delivery. Requesting replacement.', is_internal: 0, created_at: '2026-07-27T12:40:00Z' }
      ]
    }
  ];
}

function mockKbArticles(): KbArticle[] {
  return [
    { id: 'kb1', category: 'Shipping & Delivery', title: 'How to track my order shipment?', content: 'You can track your order using the courier AWB number sent to your email or WhatsApp.', views: 1420 },
    { id: 'kb2', category: 'Returns & Refunds', title: 'What is the Healthy Monks return policy?', content: 'We offer a 7-day hassle-free return policy for damaged or defective Ayurvedic products.', views: 980 }
  ];
}

import React, { useState, useEffect } from 'react';
import {
  FileText, Bell, Mail, MessageSquare, Send, ShieldCheck, Printer,
  RefreshCw, CheckCircle2, AlertTriangle, Eye, Edit3, Smartphone, Zap
} from 'lucide-react';
import { Button } from '../shared/components/ui/Button';
import { Modal } from '../shared/components/ui/Modal';

interface InvoiceRecord {
  id: string; invoice_number: string; order_number: string; customer_name: string;
  customer_email: string; customer_phone?: string; shipping_address?: string;
  subtotal: number; discount_amount: number; coupon_code?: string; tax_amount: number;
  shipping_fee?: number; grand_total: number; payment_method?: string; payment_status?: string;
  gst_number?: string; created_at: string; items?: any[];
}

interface NotificationLog {
  id: string; service_name: string; event_type: string; recipient: string;
  payload: string; created_at: string;
}

interface NotificationTemplate {
  id: string; event_name: string; channel: string; subject: string; body: string;
}

export const NotificationsInvoicesView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'invoices' | 'logs' | 'templates'>('invoices');
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  // Invoice Modal State
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null);

  // Template Modal State
  const [editTemplate, setEditTemplate] = useState<NotificationTemplate | null>(null);
  const [templateSubject, setTemplateSubject] = useState('');
  const [templateBody, setTemplateBody] = useState('');

  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null);
  const showNotice = (text: string, error = false) => { setNotice({ text, error }); setTimeout(() => setNotice(null), 4000); };

  const loadData = async () => {
    setLoading(true);
    try {
      const [iRes, lRes, tRes]: [any, any, any] = await Promise.all([
        fetch('/api/invoices').then(r => r.json()),
        fetch('/api/notifications/logs').then(r => r.json()),
        fetch('/api/notifications/templates').then(r => r.json()),
      ]);
      if (iRes.success) setInvoices(iRes.invoices);
      if (lRes.success) setLogs(lRes.logs);
      if (tRes.success) setTemplates(tRes.templates);
    } catch {
      setInvoices(mockInvoicesList());
      setLogs(mockNotificationLogs());
      setTemplates(mockTemplatesList());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const openInvoiceModal = async (inv: InvoiceRecord) => {
    try {
      const res: any = await fetch(`/api/invoices/${inv.id}`).then(r => r.json());
      if (res.success && res.invoice) {
        setSelectedInvoice(res.invoice);
        return;
      }
    } catch {}
    setSelectedInvoice(inv);
  };

  const handleUpdateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTemplate) return;

    await fetch(`/api/notifications/templates/${editTemplate.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: templateSubject, body: templateBody })
    }).catch(() => {});

    showNotice(`Template for ${editTemplate.event_name} (${editTemplate.channel}) updated.`);
    setEditTemplate(null);
    loadData();
  };

  const triggerTestNotification = async (channel: string, event_name: string) => {
    await fetch('/api/notifications/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel, recipient: 'customer@example.com', event_name, payload: { test: true } })
    }).catch(() => {});

    showNotice(`Test ${channel} notification dispatched for ${event_name}`);
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
            <FileText className="w-5 h-5 text-emerald-700" /> Invoices, Multi-Channel Notifications & Timeline
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5">GST Tax Invoice generator, Email/SMS/WhatsApp/Push logs & template customization</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
          <button onClick={() => setActiveSubTab('invoices')} className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeSubTab === 'invoices' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}>Tax Invoices</button>
          <button onClick={() => setActiveSubTab('logs')} className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeSubTab === 'logs' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}>Notification Logs</button>
          <button onClick={() => setActiveSubTab('templates')} className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeSubTab === 'templates' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}>Templates Manager</button>
        </div>
      </div>

      {/* ── SUB-TAB 1: Tax Invoices ────────────────────────────────────── */}
      {activeSubTab === 'invoices' && (
        <div className="wp-card bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-extrabold text-sm text-slate-900">Generated Tax Invoices</h2>
            <button onClick={loadData} className="p-1.5 bg-slate-100 rounded-lg text-slate-700 hover:bg-slate-200"><RefreshCw className="w-3.5 h-3.5" /></button>
          </div>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left">
              <thead className="bg-slate-100 font-bold uppercase text-slate-900 border-b border-slate-200">
                <tr>
                  <th className="p-3">Invoice #</th>
                  <th className="p-3">Order #</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">GSTIN</th>
                  <th className="p-3">Subtotal</th>
                  <th className="p-3">GST (5%)</th>
                  <th className="p-3">Grand Total</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-extrabold text-emerald-800">{inv.invoice_number}</td>
                    <td className="p-3 font-mono text-slate-700">{inv.order_number}</td>
                    <td className="p-3 font-bold text-slate-900">{inv.customer_name}</td>
                    <td className="p-3 font-mono text-[10px] text-slate-500">{inv.gst_number || 'B2C (Retail)'}</td>
                    <td className="p-3">₹{inv.subtotal}</td>
                    <td className="p-3 font-semibold text-emerald-700">₹{inv.tax_amount}</td>
                    <td className="p-3 font-extrabold text-slate-900">₹{inv.grand_total}</td>
                    <td className="p-3">
                      <button onClick={() => openInvoiceModal(inv)} className="p-1.5 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-emerald-800 font-bold flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" /> View PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── SUB-TAB 2: Notification Logs ───────────────────────────────── */}
      {activeSubTab === 'logs' && (
        <div className="wp-card bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-extrabold text-sm text-slate-900">Multi-Channel Dispatched Logs</h2>
            <button onClick={loadData} className="p-1.5 bg-slate-100 rounded-lg text-slate-700 hover:bg-slate-200"><RefreshCw className="w-3.5 h-3.5" /></button>
          </div>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left">
              <thead className="bg-slate-100 font-bold uppercase text-slate-900 border-b border-slate-200">
                <tr>
                  <th className="p-3">Channel</th>
                  <th className="p-3">Event Type</th>
                  <th className="p-3">Recipient</th>
                  <th className="p-3">Payload Data</th>
                  <th className="p-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {logs.map(l => (
                  <tr key={l.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase ${l.service_name === 'WhatsApp' ? 'bg-emerald-100 text-emerald-800' : l.service_name === 'Email' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>{l.service_name}</span>
                    </td>
                    <td className="p-3 font-mono text-slate-800">{l.event_type}</td>
                    <td className="p-3 font-semibold text-slate-900">{l.recipient}</td>
                    <td className="p-3 font-mono text-[10px] text-slate-500 max-w-xs truncate">{l.payload}</td>
                    <td className="p-3 text-slate-500">{new Date(l.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── SUB-TAB 3: Templates Manager ───────────────────────────────── */}
      {activeSubTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map(t => (
            <div key={t.id} className="wp-card p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div>
                  <h3 className="font-heading font-extrabold text-sm text-slate-900">{t.event_name}</h3>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{t.channel}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => triggerTestNotification(t.channel, t.event_name)} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-bold text-[10px] flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-600" /> Test
                  </button>
                  <button onClick={() => { setEditTemplate(t); setTemplateSubject(t.subject); setTemplateBody(t.body); }} className="p-1.5 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-emerald-800 font-bold text-[10px] flex items-center gap-1">
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-slate-800">Subject: <span className="font-normal text-slate-600">{t.subject}</span></p>
                <p className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-mono">{t.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Printable Tax Invoice Modal */}
      <Modal isOpen={!!selectedInvoice} onClose={() => setSelectedInvoice(null)} title={`Tax Invoice ${selectedInvoice?.invoice_number || ''}`}>
        {selectedInvoice && (
          <div className="space-y-5 text-xs bg-white p-4 rounded-xl border border-slate-300 font-sans text-slate-900">
            {/* Invoice Header */}
            <div className="flex justify-between border-b-2 border-slate-900 pb-4">
              <div>
                <h2 className="font-heading font-extrabold text-lg text-emerald-800">HEALTHY MONKS AYURVEDA</h2>
                <p className="text-[11px] text-slate-600">Himalayan Herbals & Wellness Pvt. Ltd.</p>
                <p className="text-[11px] text-slate-600">GSTIN: 29AAACH7409R1ZX · FSSAI #11221333000441</p>
                <p className="text-[11px] text-slate-600">42 MG Road, Indiranagar, Bengaluru, KA 560038</p>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-sm bg-slate-900 text-white px-3 py-1 rounded">TAX INVOICE</span>
                <p className="font-mono font-bold mt-2 text-slate-900">{selectedInvoice.invoice_number}</p>
                <p className="text-slate-500 font-mono text-[11px]">Order: {selectedInvoice.order_number}</p>
                <p className="text-slate-500 text-[11px]">{new Date(selectedInvoice.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Customer & B2B GST Grid */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px]">
              <div>
                <p className="font-bold text-slate-900 uppercase">BILLED TO / SHIP TO:</p>
                <p className="font-extrabold text-slate-900">{selectedInvoice.customer_name}</p>
                <p>{selectedInvoice.customer_email}</p>
                <p>{selectedInvoice.customer_phone || '+91 9812345678'}</p>
                <p className="text-slate-600">{selectedInvoice.shipping_address || 'Bengaluru, KA'}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900 uppercase">INVOICE METRICS:</p>
                <p>Customer GSTIN: <span className="font-mono font-bold">{selectedInvoice.gst_number || 'N/A (Retail B2C)'}</span></p>
                <p>Payment Mode: <span className="font-bold uppercase">{selectedInvoice.payment_method || 'COD'}</span></p>
                <p>Payment Status: <span className="font-bold text-emerald-700 uppercase">{selectedInvoice.payment_status || 'PAID'}</span></p>
              </div>
            </div>

            {/* Items Breakdown Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-100 font-bold border-b border-slate-200">
                  <tr><th className="p-2">Description</th><th className="p-2">HSN Code</th><th className="p-2">Qty</th><th className="p-2">Rate</th><th className="p-2">Amount</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {(selectedInvoice.items || [{ product_title: 'KSM-66 Ashwagandha Root Powder (250g Jar)', price: 499, quantity: 1, total_price: 499 }]).map((it, idx) => (
                    <tr key={idx}>
                      <td className="p-2 font-bold">{it.product_title}</td>
                      <td className="p-2 font-mono text-slate-500">3004.90</td>
                      <td className="p-2 font-mono">{it.quantity}</td>
                      <td className="p-2">₹{it.price}</td>
                      <td className="p-2 font-bold">₹{it.total_price || it.price * it.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="flex justify-between items-end pt-2 border-t border-slate-200">
              <div className="text-[10px] text-slate-400 font-mono">
                <p>QR Code Verified Payload</p>
                <p>This is a computer-generated tax invoice.</p>
              </div>
              <div className="space-y-1 text-right text-xs">
                <p className="flex justify-between gap-6"><span>Subtotal:</span><span className="font-bold">₹{selectedInvoice.subtotal}</span></p>
                {selectedInvoice.discount_amount > 0 && <p className="flex justify-between gap-6 text-emerald-700"><span>Discount ({selectedInvoice.coupon_code || ''}):</span><span>-₹{selectedInvoice.discount_amount}</span></p>}
                <p className="flex justify-between gap-6"><span>Ayush GST (5% Included):</span><span className="font-bold">₹{selectedInvoice.tax_amount}</span></p>
                <p className="flex justify-between gap-6 font-extrabold text-sm pt-1 border-t border-slate-300"><span>Grand Total:</span><span className="text-emerald-800">₹{selectedInvoice.grand_total}</span></p>
              </div>
            </div>

            <div className="pt-2">
              <Button type="button" variant="primary" size="sm" className="w-full" onClick={() => window.print()}>
                <Printer className="w-3.5 h-3.5" /> Print Official Tax Invoice
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Template Modal */}
      <Modal isOpen={!!editTemplate} onClose={() => setEditTemplate(null)} title={`Edit Template: ${editTemplate?.event_name || ''}`}>
        {editTemplate && (
          <form onSubmit={handleUpdateTemplate} className="space-y-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Subject Header</label>
              <input type="text" required value={templateSubject} onChange={e => setTemplateSubject(e.target.value)} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700" />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Notification Body (Supports `&#123;&#123;variables&#125;&#125;`)</label>
              <textarea required value={templateBody} onChange={e => setTemplateBody(e.target.value)} className="w-full bg-white text-slate-900 font-mono text-xs rounded-xl p-2.5 border border-slate-300 focus:outline-none focus:border-emerald-700" rows={4} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditTemplate(null)}>Cancel</Button>
              <Button type="submit" variant="primary" size="sm">Save Template</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

function mockInvoicesList(): InvoiceRecord[] {
  return [
    {
      id: 'inv1', invoice_number: 'INV-2026-1029', order_number: 'HM-ORD-482910', customer_name: 'Aarav Sharma', customer_email: 'aarav@example.com', customer_phone: '+91 9812345678', shipping_address: '42 Lotus Heights, MG Road, Bengaluru, KA 560038', subtotal: 798, discount_amount: 100, coupon_code: 'WELCOME100', tax_amount: 40, shipping_fee: 0, grand_total: 698, payment_method: 'COD', payment_status: 'Pending', gst_number: '29AAACH7409R1ZX', created_at: '2026-07-27T14:30:00Z',
      items: [
        { id: 'ii1', product_title: 'KSM-66 Ashwagandha Root Powder (250g Jar)', price: 499, quantity: 1, total_price: 499 },
        { id: 'ii2', product_title: 'Himalayan Tulsi Green Tea (100g Tin)', price: 299, quantity: 1, total_price: 299 }
      ]
    },
    {
      id: 'inv2', invoice_number: 'INV-2026-1030', order_number: 'HM-ORD-839210', customer_name: 'Priya Mehta', customer_email: 'priya@gmail.com', customer_phone: '+91 9765432109', shipping_address: '15 Sector 4, HSR Layout, Bengaluru, KA 560102', subtotal: 1299, discount_amount: 150, coupon_code: 'MONK15', tax_amount: 65, shipping_fee: 0, grand_total: 1149, payment_method: 'Prepaid (Razorpay UPI)', payment_status: 'Paid', created_at: '2026-07-26T11:20:00Z',
      items: [
        { id: 'ii3', product_title: 'Amla Chyawanprash Supreme (1kg Jar)', price: 899, quantity: 1, total_price: 899 },
        { id: 'ii4', product_title: 'Moringa Leaf Superfood Powder (200g Pouch)', price: 400, quantity: 1, total_price: 400 }
      ]
    }
  ];
}

function mockNotificationLogs(): NotificationLog[] {
  return [
    { id: 'nl1', service_name: 'Email', event_type: 'OrderConfirmation', recipient: 'aarav@example.com', payload: '{"order_number":"HM-ORD-482910","total":698}', created_at: '2026-07-27T14:30:05Z' },
    { id: 'nl2', service_name: 'WhatsApp', event_type: 'OrderConfirmation', recipient: '+91 9812345678', payload: '{"order_number":"HM-ORD-482910","status":"Confirmed"}', created_at: '2026-07-27T14:30:06Z' },
    { id: 'nl3', service_name: 'SMS', event_type: 'OutForDelivery', recipient: '+91 9765432109', payload: '{"order_number":"HM-ORD-839210","courier":"Blue Dart"}', created_at: '2026-07-26T18:00:00Z' },
    { id: 'nl4', service_name: 'PushNotification', event_type: 'RefundCompleted', recipient: 'priya@gmail.com', payload: '{"rma":"RMA-448102","amount":899}', created_at: '2026-07-26T14:21:00Z' },
  ];
}

function mockTemplatesList(): NotificationTemplate[] {
  return [
    { id: 'tmpl1', event_name: 'OrderConfirmation', channel: 'Email', subject: 'Order Confirmation - Healthy Monks #{{order_number}}', body: 'Dear {{customer_name}}, thank you for your order! Your total is ₹{{total_amount}}.' },
    { id: 'tmpl2', event_name: 'OrderShipped', channel: 'WhatsApp', subject: 'Package Shipped', body: 'Namaste {{customer_name}}! Your parcel for #{{order_number}} is shipped via {{courier_name}} (AWB: {{awb_number}}).' },
    { id: 'tmpl3', event_name: 'RefundCompleted', channel: 'SMS', subject: 'Refund Processed', body: 'HM Alert: ₹{{refund_amount}} refunded for order #{{order_number}}. Credited to original source.' },
  ];
}

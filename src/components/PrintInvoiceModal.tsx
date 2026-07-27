import React from 'react';
import { Printer, X, ShieldCheck, Download } from 'lucide-react';
import { Order } from '../types';

interface PrintInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export const PrintInvoiceModal: React.FC<PrintInvoiceModalProps> = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative border border-slate-200 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        {/* Modal Action Bar (Hidden during window.print) */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <h3 className="font-heading font-extrabold text-base text-slate-900">
              Tax Invoice #{order.invoice_number || order.order_number}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Printer className="w-4 h-4" /> Print / Download PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Sheet */}
        <div className="space-y-6 text-xs text-slate-800 p-4 border border-slate-200 rounded-2xl bg-white font-sans">
          {/* Header Branding & Invoice Details */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-800 text-amber-300 font-extrabold text-xs flex items-center justify-center">
                  HM
                </div>
                <h1 className="font-heading text-xl font-extrabold text-slate-900">Healthy Monks</h1>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">42 Herbal Park, MG Road, Bengaluru 560001</p>
              <p className="text-[11px] text-slate-500">GSTIN: 29AAAAA0000A1Z5 | Ayush Lic: AYU-2024-8891</p>
            </div>

            <div className="text-right">
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded uppercase">
                Official Tax Invoice
              </span>
              <p className="font-mono font-bold text-sm text-slate-900 mt-2">#{order.order_number}</p>
              <p className="text-[11px] text-slate-500">Date: {order.created_at || 'July 27, 2026'}</p>
            </div>
          </div>

          {/* Customer & Shipping Information */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Billed & Shipped To:</span>
              <p className="font-bold text-slate-900">{order.customer_name}</p>
              <p className="text-[11px] text-slate-600">{order.shipping_address}</p>
              <p className="text-[11px] text-slate-600">{order.city}, PIN: {order.pincode}</p>
              <p className="text-[11px] text-slate-600">Phone: {order.customer_phone}</p>
            </div>

            <div className="text-right space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Payment & Dispatch:</span>
              <p className="font-semibold text-slate-900 uppercase">Method: {order.payment_method}</p>
              <p className="font-semibold text-emerald-700">Payment Status: {order.payment_status}</p>
              {order.courier_name && (
                <p className="text-[11px] text-amber-800 font-medium">Courier: {order.courier_name}</p>
              )}
              {order.tracking_number && (
                <p className="text-[11px] font-mono text-slate-700">AWB: {order.tracking_number}</p>
              )}
            </div>
          </div>

          {/* Itemized Order Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-900 font-bold uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3">Item Description</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Unit Price</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-3 font-bold text-slate-900">
                        {item.product_title}
                        {item.variant_name && <span className="text-[10px] text-slate-500 block">{item.variant_name}</span>}
                      </td>
                      <td className="p-3 text-center font-bold">{item.quantity}</td>
                      <td className="p-3 text-right">₹{item.price}</td>
                      <td className="p-3 text-right font-extrabold">₹{item.total_price || item.price * item.quantity}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="p-3 font-bold text-slate-900">Organic Ayurvedic Supplement Package</td>
                    <td className="p-3 text-center font-bold">1</td>
                    <td className="p-3 text-right">₹{order.subtotal || order.total_amount}</td>
                    <td className="p-3 text-right font-extrabold">₹{order.total_amount}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="flex justify-end pt-2">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-bold text-slate-900">₹{order.subtotal || order.total_amount}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon Discount:</span>
                  <span>-₹{order.discount_amount}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Shipping & Handling:</span>
                <span className="font-bold text-slate-900">
                  {order.shipping_fee === 0 ? 'FREE' : `₹${order.shipping_fee}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-slate-900 border-t border-slate-300 pt-2">
                <span>Grand Total:</span>
                <span className="text-emerald-800">₹{order.total_amount}</span>
              </div>
            </div>
          </div>

          {/* Footer Terms */}
          <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-400 text-center space-y-1">
            <p>Thank you for shopping with Healthy Monks. 100% Certified Organic Himalayan Ayurvedic Herbs.</p>
            <p>For support or returns, email support@healthymonks.com or call +91 98123 45678.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

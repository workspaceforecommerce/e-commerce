import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

export const ContactView: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="wp-card p-8 rounded-3xl bg-slate-900 text-white space-y-2">
        <h1 className="font-heading text-3xl font-extrabold">Contact Healthy Monks Support</h1>
        <p className="text-xs text-slate-300">Have questions about dosage or shipment updates? Our team is here to assist.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-4">
          <div className="wp-card p-5 rounded-2xl flex items-center gap-4 bg-white">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase">Customer Care Hotline</span>
              <p className="font-bold text-sm text-slate-900">+91 98123 45678</p>
              <p className="text-[11px] text-slate-500">Mon - Sat (9am - 7pm IST)</p>
            </div>
          </div>

          <div className="wp-card p-5 rounded-2xl flex items-center gap-4 bg-white">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase">Official Support Email</span>
              <p className="font-bold text-sm text-slate-900">support@healthymonks.com</p>
              <p className="text-[11px] text-slate-500">Fast 24-hour response time</p>
            </div>
          </div>

          <div className="wp-card p-5 rounded-2xl flex items-center gap-4 bg-white">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase">Corporate Headquarters</span>
              <p className="font-bold text-sm text-slate-900">42 Herbal Park, MG Road</p>
              <p className="text-[11px] text-slate-500">Bengaluru, Karnataka 560001</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 wp-card p-6 sm:p-8 rounded-2xl space-y-4 bg-white">
          <h2 className="font-heading font-bold text-lg text-slate-900 border-b border-slate-200 pb-3">Send Us a Direct Message</h2>

          {sent && (
            <div className="p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" /> Message sent successfully! Our team will respond shortly.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white text-slate-900 rounded-xl px-3 py-2.5 border border-slate-300 focus:outline-none focus:border-emerald-700"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white text-slate-900 rounded-xl px-3 py-2.5 border border-slate-300 focus:outline-none focus:border-emerald-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Subject</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full bg-white text-slate-900 rounded-xl px-3 py-2.5 border border-slate-300 focus:outline-none focus:border-emerald-700"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Your Message *</label>
              <textarea
                rows={4}
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-white text-slate-900 rounded-xl px-3 py-2.5 border border-slate-300 focus:outline-none focus:border-emerald-700"
              />
            </div>

            <button
              type="submit"
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-xs flex items-center gap-2 transition-all"
            >
              <Send className="w-4 h-4" /> Send Inquiry
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

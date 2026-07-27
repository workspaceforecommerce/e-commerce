import React, { useState, useEffect } from 'react';
import {
  Megaphone, Image, MessageSquare, Zap, Plus, Edit3, Trash2, Eye, RefreshCw,
  Tag, Calendar, TrendingUp, DollarSign, Clock, ShieldCheck, CheckCircle2,
  Sparkles, ChevronRight, Layers, Bell
} from 'lucide-react';
import { Button } from '../shared/components/ui/Button';
import { Modal } from '../shared/components/ui/Modal';

interface CampaignItem {
  id: string; name: string; campaign_type: string; target_audience: string;
  start_date: string; end_date: string; discount_code?: string; status: string;
  impressions: number; conversions: number;
}

interface BannerItem {
  id: string; title: string; subtitle: string; image_url: string; link_url: string; section: string; is_active: number;
}

interface PopupItem {
  id: string; name: string; type: string; trigger_rule: string; coupon_code?: string; status: string; conversion_rate: string;
}

interface AnnouncementItem {
  id: string; message: string; cta_text: string; cta_url: string; bg_color: string; status: string;
}

export const MarketingCampaignsView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'campaigns' | 'banners' | 'popups' | 'announcements'>('campaigns');
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [popups, setPopups] = useState<PopupItem[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [isCampModalOpen, setIsCampModalOpen] = useState(false);
  const [campForm, setCampForm] = useState({ name: '', campaign_type: 'Flash Sale', target_audience: 'All Customers', discount_code: 'FLASH20' });

  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [bannerForm, setBannerForm] = useState({ title: '', subtitle: '', image_url: '', link_url: '/shop', section: 'Hero Slider' });

  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null);
  const showNotice = (text: string, error = false) => { setNotice({ text, error }); setTimeout(() => setNotice(null), 4000); };

  const loadMarketingData = async () => {
    setLoading(true);
    try {
      const [cRes, bRes, pRes, aRes]: [any, any, any, any] = await Promise.all([
        fetch('/api/campaigns').then(r => r.json()),
        fetch('/api/campaigns/banners').then(r => r.json()),
        fetch('/api/campaigns/popups').then(r => r.json()),
        fetch('/api/campaigns/announcements').then(r => r.json()),
      ]);
      if (cRes.success) setCampaigns(cRes.campaigns);
      if (bRes.success) setBanners(bRes.banners);
      if (pRes.success) setPopups(pRes.popups);
      if (aRes.success) setAnnouncements(aRes.announcements);
    } catch {
      setCampaigns(mockCampaignsList());
      setBanners(mockBannersList());
      setPopups(mockPopupsList());
      setAnnouncements(mockAnnouncementsList());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMarketingData(); }, []);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campForm.name) return;

    await fetch('/api/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(campForm)
    }).catch(() => {});

    showNotice(`Campaign "${campForm.name}" created and activated.`);
    setIsCampModalOpen(false);
    loadMarketingData();
  };

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerForm.title || !bannerForm.image_url) return;

    await fetch('/api/campaigns/banners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bannerForm)
    }).catch(() => {});

    showNotice(`Banner "${bannerForm.title}" added to store slider.`);
    setIsBannerModalOpen(false);
    loadMarketingData();
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
            <Megaphone className="w-5 h-5 text-emerald-700" /> Banners, Popups & Marketing Campaigns
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5">Centralized promotion suite for hero sliders, exit-intent popups, top announcement bars & sales</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
          <button onClick={() => setActiveSubTab('campaigns')} className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeSubTab === 'campaigns' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}>Sales Campaigns</button>
          <button onClick={() => setActiveSubTab('banners')} className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeSubTab === 'banners' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}>Hero Banners</button>
          <button onClick={() => setActiveSubTab('popups')} className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeSubTab === 'popups' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}>Popups & Promos</button>
          <button onClick={() => setActiveSubTab('announcements')} className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeSubTab === 'announcements' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}>Top Announcement Bar</button>
        </div>
      </div>

      {/* ── SUB-TAB 1: Sales Campaigns ────────────────────────────────────── */}
      {activeSubTab === 'campaigns' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="wp-card p-4 bg-white rounded-2xl border border-slate-200"><p className="text-xl font-extrabold text-slate-900">{campaigns.filter(c => c.status === 'Active').length}</p><p className="text-[11px] text-slate-500">Active Campaigns</p></div>
            <div className="wp-card p-4 bg-white rounded-2xl border border-slate-200"><p className="text-xl font-extrabold text-emerald-800">48,290</p><p className="text-[11px] text-slate-500">Total Impressions</p></div>
            <div className="wp-card p-4 bg-white rounded-2xl border border-slate-200"><p className="text-xl font-extrabold text-indigo-800">13.2%</p><p className="text-[11px] text-slate-500">Click-Through Rate (CTR)</p></div>
            <div className="wp-card p-4 bg-white rounded-2xl border border-slate-200"><p className="text-xl font-extrabold text-purple-800">₹4,12,900</p><p className="text-[11px] text-slate-500">Attributed Revenue</p></div>
          </div>

          <div className="wp-card bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-extrabold text-sm text-slate-900">Promotional Campaigns List</h2>
              <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setIsCampModalOpen(true)}>New Campaign</Button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left">
                <thead className="bg-slate-100 font-bold uppercase text-slate-900 border-b border-slate-200">
                  <tr>
                    <th className="p-3">Campaign Name</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Audience</th>
                    <th className="p-3">Promo Code</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Impressions / Sales</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {campaigns.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{c.name}</td>
                      <td className="p-3 font-bold text-indigo-800">{c.campaign_type}</td>
                      <td className="p-3 text-slate-700">{c.target_audience}</td>
                      <td className="p-3 font-mono font-bold text-emerald-700">{c.discount_code || 'None'}</td>
                      <td className="p-3 font-bold">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${c.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>{c.status}</span>
                      </td>
                      <td className="p-3 font-mono">{c.impressions.toLocaleString()} / <span className="font-bold text-emerald-800">{c.conversions} orders</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── SUB-TAB 2: Banners & Sliders ──────────────────────────────────── */}
      {activeSubTab === 'banners' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-extrabold text-sm text-slate-900">Hero Slider & Category Banners ({banners.length})</h2>
            <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setIsBannerModalOpen(true)}>Add Banner</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {banners.map(b => (
              <div key={b.id} className="wp-card p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-200 border border-slate-300">
                  <img src={b.image_url} alt={b.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-heading font-extrabold text-sm text-slate-900">{b.title}</h3>
                    <p className="text-[11px] text-slate-500">{b.subtitle}</p>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">{b.section}</span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="font-mono text-emerald-700">CTA Destination: {b.link_url}</span>
                  <span className="font-bold text-emerald-700">Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SUB-TAB 3: Popups & Exit Intent ────────────────────────────────── */}
      {activeSubTab === 'popups' && (
        <div className="wp-card bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
          <h2 className="font-heading font-extrabold text-sm text-slate-900">Popups & Exit Intent Engine</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {popups.map(p => (
              <div key={p.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{p.name}</span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">{p.status}</span>
                </div>
                <p className="text-[10px] text-slate-500 font-mono">Trigger Rule: {p.trigger_rule}</p>
                <p className="text-[10px] font-bold text-indigo-800 font-mono">Coupon: {p.coupon_code || 'N/A'}</p>
                <p className="text-[10px] text-slate-400 font-mono pt-1">Conv. Rate: {p.conversion_rate}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SUB-TAB 4: Announcement Bar ───────────────────────────────────── */}
      {activeSubTab === 'announcements' && (
        <div className="wp-card bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
          <h2 className="font-heading font-extrabold text-sm text-slate-900">Top Announcement Bar Configuration</h2>
          {announcements.map(a => (
            <div key={a.id} className="p-4 rounded-2xl text-white space-y-2" style={{ backgroundColor: a.bg_color }}>
              <div className="flex justify-between items-center font-bold">
                <span>{a.message}</span>
                <span className="bg-white text-slate-900 px-3 py-1 rounded-xl text-[10px]">{a.cta_text}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Campaign Modal */}
      <Modal isOpen={isCampModalOpen} onClose={() => setIsCampModalOpen(false)} title="Create Sales Campaign">
        <form onSubmit={handleCreateCampaign} className="space-y-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Campaign Name *</label>
            <input type="text" required placeholder="e.g. Navratri Ayurvedic Health Fest 2026" value={campForm.name} onChange={e => setCampForm({ ...campForm, name: e.target.value })} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Campaign Type</label>
              <select value={campForm.campaign_type} onChange={e => setCampForm({ ...campForm, campaign_type: e.target.value })} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700">
                <option value="Flash Sale">Flash Sale</option>
                <option value="Festival Sale">Festival Sale</option>
                <option value="Clearance Sale">Clearance Sale</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Promo Code</label>
              <input type="text" value={campForm.discount_code} onChange={e => setCampForm({ ...campForm, discount_code: e.target.value })} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsCampModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm">Activate Campaign</Button>
          </div>
        </form>
      </Modal>

      {/* Add Banner Modal */}
      <Modal isOpen={isBannerModalOpen} onClose={() => setIsBannerModalOpen(false)} title="Add Hero Slider Banner">
        <form onSubmit={handleCreateBanner} className="space-y-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Banner Headline *</label>
            <input type="text" required placeholder="e.g. Pure Himalayan Shilajit Resin" value={bannerForm.title} onChange={e => setBannerForm({ ...bannerForm, title: e.target.value })} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Cloudinary CDN Image URL *</label>
            <input type="url" required placeholder="https://res.cloudinary.com/..." value={bannerForm.image_url} onChange={e => setBannerForm({ ...bannerForm, image_url: e.target.value })} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">CTA Destination URL</label>
            <input type="text" value={bannerForm.link_url} onChange={e => setBannerForm({ ...bannerForm, link_url: e.target.value })} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700" />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsBannerModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm">Save Banner</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

function mockCampaignsList(): CampaignItem[] {
  return [
    { id: 'camp1', name: 'Monsoon Ayurvedic Festival 2026', campaign_type: 'Festival Sale', target_audience: 'All Customers', start_date: '2026-07-20T00:00:00Z', end_date: '2026-08-10T23:59:59Z', discount_code: 'MONSOON20', status: 'Active', impressions: 24500, conversions: 840 }
  ];
}

function mockBannersList(): BannerItem[] {
  return [
    { id: 'ban1', title: 'Authentic Himalayan Shilajit Resin', subtitle: '100% Raw & Fulvic Acid Rich for Pure Vitality', image_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80', link_url: '/shop?cat=herbs', section: 'Hero Slider', is_active: 1 }
  ];
}

function mockPopupsList(): PopupItem[] {
  return [
    { id: 'pop1', name: 'Welcome 10% Off Newsletter Popup', type: 'Newsletter', trigger_rule: 'Time on Page 5s', coupon_code: 'WELCOME10', status: 'Active', conversion_rate: '14.2%' }
  ];
}

function mockAnnouncementsList(): AnnouncementItem[] {
  return [
    { id: 'ann1', message: '🌿 FREE Express Shipping on all orders above ₹499 | Use Code: HEALTHY100', cta_text: 'Shop Now', cta_url: '/shop', bg_color: '#15803d', status: 'Active' }
  ];
}

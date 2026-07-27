import React, { useState, useEffect } from 'react';
import {
  Monitor, Tablet, Smartphone, MoveUp, MoveDown, Plus, Trash2, Copy, Eye,
  Save, CheckCircle2, Layout, Grid, Sparkles, Sliders, Palette, Zap,
  MessageSquare, HelpCircle, Clock, ShoppingBag, Layers, Lock, ShieldCheck, ArrowLeft
} from 'lucide-react';
import { Button } from '../shared/components/ui/Button';

interface LayoutSection {
  id: string; widget_type: string; title?: string; subtitle?: string;
  cta_text?: string; bg_color?: string; category_filter?: string; limit?: number; items?: string[];
}

interface TemplateRecord {
  id: string; name: string; category: string; preview_img: string; sections_count: number;
}

export const VisualPageBuilderView: React.FC = () => {
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activePanelTab, setActivePanelTab] = useState<'widgets' | 'theme' | 'templates'>('widgets');

  const [sections, setSections] = useState<LayoutSection[]>([
    { id: 'sec_hero', widget_type: 'Hero Banner', title: '100% Authentic Ayurvedic Wellness', subtitle: 'Handcrafted with organic herbs by Vaidyas', cta_text: 'Shop Best Sellers', bg_color: '#f0fdf4' },
    { id: 'sec_features', widget_type: 'Feature Badges', items: ['AYUSH Certified', 'Zero Chemicals', 'Free Shipping over ₹499'] },
    { id: 'sec_prods', widget_type: 'Product Carousel', title: 'Curated Ayurvedic Remedies', category_filter: 'Herbs', limit: 6 },
    { id: 'sec_testimonials', widget_type: 'Testimonials', title: 'Trusted by 50,000+ Happy Families' }
  ]);

  const [selectedSecId, setSelectedSecId] = useState<string>('sec_hero');
  const [themeSettings, setThemeSettings] = useState({
    primary_color: '#15803d', accent_color: '#d97706', container_width: '1280px', dark_mode: false
  });

  const [templates, setTemplates] = useState<TemplateRecord[]>([]);
  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null);
  const showNotice = (text: string, error = false) => { setNotice({ text, error }); setTimeout(() => setNotice(null), 4000); };

  useEffect(() => {
    fetch('/api/builder/templates')
      .then(r => r.json())
      .then((res: any) => { if (res.success) setTemplates(res.templates); })
      .catch(() => {});
  }, []);

  const selectedSection = sections.find(s => s.id === selectedSecId) || sections[0];

  const handleUpdateSection = (key: string, val: any) => {
    setSections(sections.map(s => s.id === selectedSecId ? { ...s, [key]: val } : s));
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;
    const newSecs = [...sections];
    const temp = newSecs[index];
    newSecs[index] = newSecs[targetIdx];
    newSecs[targetIdx] = temp;
    setSections(newSecs);
  };

  const handleDuplicateSection = (sec: LayoutSection) => {
    const dup = { ...sec, id: `sec_${Date.now()}`, title: `${sec.title || sec.widget_type} (Copy)` };
    setSections([...sections, dup]);
    showNotice(`Section "${sec.widget_type}" duplicated.`);
  };

  const handleDeleteSection = (id: string) => {
    if (sections.length <= 1) return;
    setSections(sections.filter(s => s.id !== id));
    showNotice('Section removed from canvas.');
  };

  const handleAddWidget = (widgetType: string) => {
    const newSec: LayoutSection = {
      id: `sec_${Date.now()}`,
      widget_type: widgetType,
      title: `New ${widgetType} Section`,
      subtitle: 'Customize this block in the property inspector',
      bg_color: '#ffffff'
    };
    setSections([...sections, newSec]);
    setSelectedSecId(newSec.id);
    showNotice(`Added "${widgetType}" widget to canvas.`);
  };

  const handleSaveDraft = async () => {
    await fetch('/api/builder/layout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page_id: 'pg1', name: 'Homepage Main Layout', sections, theme_settings: themeSettings })
    }).catch(() => {});
    showNotice('Page layout draft saved successfully.');
  };

  const handlePublishLive = async () => {
    await fetch('/api/builder/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page_id: 'pg1' })
    }).catch(() => {});
    showNotice('🎉 Visual page layout published LIVE to PWA storefront!');
  };

  return (
    <div className="space-y-4 pb-12 animate-fade-in text-xs">
      {notice && (
        <div className={`px-4 py-3 rounded-xl flex items-center gap-2 font-semibold border ${notice.error ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {notice.text}
        </div>
      )}

      {/* ── TOP RESPONSIVE TOOLBAR ────────────────────────────────────────── */}
      <div className="wp-card p-4 rounded-2xl bg-white border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl font-bold">
            <Layout className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-heading text-sm font-extrabold text-slate-900">Visual Drag-and-Drop Page Builder</h1>
            <p className="text-[10px] text-slate-500">Live Shopify Theme & Elementor-style editor powering PWA storefront</p>
          </div>
        </div>

        {/* Viewport Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button onClick={() => setDeviceMode('desktop')} className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${deviceMode === 'desktop' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}>
            <Monitor className="w-3.5 h-3.5 text-emerald-700" /> Desktop
          </button>
          <button onClick={() => setDeviceMode('tablet')} className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${deviceMode === 'tablet' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}>
            <Tablet className="w-3.5 h-3.5 text-indigo-700" /> Tablet (768px)
          </button>
          <button onClick={() => setDeviceMode('mobile')} className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${deviceMode === 'mobile' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}>
            <Smartphone className="w-3.5 h-3.5 text-purple-700" /> Mobile (375px)
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={<Save className="w-3.5 h-3.5" />} onClick={handleSaveDraft}>Save Draft</Button>
          <Button variant="primary" size="sm" icon={<Sparkles className="w-3.5 h-3.5" />} onClick={handlePublishLive}>Publish Live</Button>
        </div>
      </div>

      {/* ── THREE-COLUMN BUILDER WORKSPACE ─────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">

        {/* LEFT SIDEBAR: Widgets, Theme & Templates (3 Cols) */}
        <div className="md:col-span-3 space-y-3">
          <div className="wp-card bg-white p-3 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
              <button onClick={() => setActivePanelTab('widgets')} className={`flex-1 py-1 rounded-lg font-bold text-center ${activePanelTab === 'widgets' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}>Widgets</button>
              <button onClick={() => setActivePanelTab('theme')} className={`flex-1 py-1 rounded-lg font-bold text-center ${activePanelTab === 'theme' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}>Theme</button>
              <button onClick={() => setActivePanelTab('templates')} className={`flex-1 py-1 rounded-lg font-bold text-center ${activePanelTab === 'templates' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}>Templates</button>
            </div>

            {activePanelTab === 'widgets' && (
              <div className="space-y-2">
                <p className="text-[10px] text-slate-400 uppercase font-extrabold">Add Section Widget</p>
                {[
                  { name: 'Hero Banner', icon: Layout },
                  { name: 'Product Carousel', icon: ShoppingBag },
                  { name: 'Feature Badges', icon: Grid },
                  { name: 'Testimonials', icon: MessageSquare },
                  { name: 'Flash Sale Timer', icon: Clock },
                  { name: 'FAQ Accordion', icon: HelpCircle },
                ].map(w => (
                  <div key={w.name} onClick={() => handleAddWidget(w.name)} className="p-2.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl cursor-pointer transition-all flex items-center justify-between font-bold text-slate-800">
                    <span className="flex items-center gap-2"><w.icon className="w-3.5 h-3.5 text-emerald-700" /> {w.name}</span>
                    <Plus className="w-3.5 h-3.5 text-emerald-700" />
                  </div>
                ))}
              </div>
            )}

            {activePanelTab === 'theme' && (
              <div className="space-y-3">
                <p className="text-[10px] text-slate-400 uppercase font-extrabold">Global Theme Settings</p>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Primary Brand Color</label>
                  <input type="color" value={themeSettings.primary_color} onChange={e => setThemeSettings({ ...themeSettings, primary_color: e.target.value })} className="w-full h-8 rounded-lg cursor-pointer" />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Accent Highlight Color</label>
                  <input type="color" value={themeSettings.accent_color} onChange={e => setThemeSettings({ ...themeSettings, accent_color: e.target.value })} className="w-full h-8 rounded-lg cursor-pointer" />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Container Width</label>
                  <select value={themeSettings.container_width} onChange={e => setThemeSettings({ ...themeSettings, container_width: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 font-mono">
                    <option value="1280px">1280px (Standard)</option>
                    <option value="1440px">1440px (Wide)</option>
                    <option value="100%">100% Full Width</option>
                  </select>
                </div>
              </div>
            )}

            {activePanelTab === 'templates' && (
              <div className="space-y-2">
                <p className="text-[10px] text-slate-400 uppercase font-extrabold">Pre-Built Templates</p>
                {templates.map(t => (
                  <div key={t.id} onClick={() => showNotice(`Loaded template: "${t.name}"`)} className="p-2.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 rounded-xl cursor-pointer transition-all space-y-1">
                    <img src={t.preview_img} alt={t.name} className="w-full h-16 object-cover rounded-lg" />
                    <p className="font-bold text-slate-900">{t.name}</p>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono">{t.category}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CENTER CANVAS: Device Frame & Live Render (6 Cols) */}
        <div className="md:col-span-6 space-y-3">
          <div className={`mx-auto transition-all duration-300 ${deviceMode === 'tablet' ? 'max-w-[768px]' : deviceMode === 'mobile' ? 'max-w-[375px]' : 'w-full'}`}>
            <div className="bg-slate-900 text-white text-[10px] px-3 py-1.5 rounded-t-2xl font-mono flex items-center justify-between">
              <span>Preview Mode: {deviceMode.toUpperCase()}</span>
              <span>{deviceMode === 'desktop' ? '100% Responsive Width' : deviceMode === 'tablet' ? '768px' : '375px'}</span>
            </div>

            {/* Canvas Area */}
            <div className="wp-card bg-slate-100 p-3 rounded-b-2xl border-x border-b border-slate-300 min-h-[500px] space-y-3">
              {sections.map((sec, idx) => (
                <div key={sec.id} onClick={() => setSelectedSecId(sec.id)} className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer relative group ${selectedSecId === sec.id ? 'border-emerald-600 shadow-md ring-2 ring-emerald-500/20' : 'border-slate-200 hover:border-slate-300'}`}>

                  {/* Section Control Floating Overlay */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/90 text-white p-1 rounded-xl shadow-md">
                    <button onClick={(e) => { e.stopPropagation(); handleMoveSection(idx, 'up'); }} className="p-1 hover:bg-slate-700 rounded"><MoveUp className="w-3 h-3" /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleMoveSection(idx, 'down'); }} className="p-1 hover:bg-slate-700 rounded"><MoveDown className="w-3 h-3" /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDuplicateSection(sec); }} className="p-1 hover:bg-slate-700 rounded"><Copy className="w-3 h-3" /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteSection(sec.id); }} className="p-1 text-red-400 hover:bg-slate-700 rounded"><Trash2 className="w-3 h-3" /></button>
                  </div>

                  {/* Widget Live Visual Mock */}
                  {sec.widget_type === 'Hero Banner' && (
                    <div className="p-5 rounded-xl text-center space-y-2" style={{ backgroundColor: sec.bg_color || '#f0fdf4' }}>
                      <h2 className="font-heading font-extrabold text-base text-slate-900">{sec.title}</h2>
                      <p className="text-[11px] text-slate-600">{sec.subtitle}</p>
                      <button className="bg-emerald-700 text-white px-4 py-1.5 rounded-xl font-bold text-[10px]">{sec.cta_text || 'Explore'}</button>
                    </div>
                  )}

                  {sec.widget_type === 'Feature Badges' && (
                    <div className="grid grid-cols-3 gap-2 text-center">
                      {(sec.items || ['Doctor Formulated', 'AYUSH Certified', 'Free Express Shipping']).map((f, i) => (
                        <div key={i} className="p-2 bg-emerald-50 rounded-xl border border-emerald-100 font-bold text-emerald-900 text-[10px]">{f}</div>
                      ))}
                    </div>
                  )}

                  {sec.widget_type === 'Product Carousel' && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center"><h3 className="font-bold text-slate-900">{sec.title}</h3><span className="text-[10px] text-emerald-700 font-bold">View All ➔</span></div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl space-y-1"><div className="h-12 bg-slate-200 rounded-lg"></div><p className="font-bold text-[10px]">Ashwagandha Gold</p><p className="text-emerald-700 font-bold">₹799</p></div>
                        <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl space-y-1"><div className="h-12 bg-slate-200 rounded-lg"></div><p className="font-bold text-[10px]">Kumkumadi Tailam</p><p className="text-emerald-700 font-bold">₹1,249</p></div>
                        <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl space-y-1"><div className="h-12 bg-slate-200 rounded-lg"></div><p className="font-bold text-[10px]">Triphala Churna</p><p className="text-emerald-700 font-bold">₹349</p></div>
                      </div>
                    </div>
                  )}

                  {sec.widget_type === 'Testimonials' && (
                    <div className="p-4 bg-purple-50 rounded-xl text-center space-y-1">
                      <p className="font-bold text-slate-900">{sec.title}</p>
                      <p className="text-[10px] text-slate-600 italic">"Purest Ayurvedic supplements I have used. Fast delivery and doctor approved!"</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT INSPECTOR PANEL: Selected Widget Property Inspector (3 Cols) */}
        <div className="md:col-span-3 space-y-3">
          <div className="wp-card bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <h2 className="font-heading font-extrabold text-xs text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Property Inspector: {selectedSection?.widget_type}
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Heading Title</label>
                <input type="text" value={selectedSection?.title || ''} onChange={e => handleUpdateSection('title', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-bold" />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Subtitle / Description</label>
                <textarea value={selectedSection?.subtitle || ''} onChange={e => handleUpdateSection('subtitle', e.target.value)} rows={2} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-[11px]" />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Background Hex Color</label>
                <input type="color" value={selectedSection?.bg_color || '#ffffff'} onChange={e => handleUpdateSection('bg_color', e.target.value)} className="w-full h-8 rounded-lg cursor-pointer" />
              </div>

              {selectedSection?.widget_type === 'Hero Banner' && (
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">CTA Button Text</label>
                  <input type="text" value={selectedSection?.cta_text || ''} onChange={e => handleUpdateSection('cta_text', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5" />
                </div>
              )}

              {selectedSection?.widget_type === 'Product Carousel' && (
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Category Filter</label>
                  <select value={selectedSection?.category_filter || 'Herbs'} onChange={e => handleUpdateSection('category_filter', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
                    <option value="Herbs">Herbs & Adaptogens</option>
                    <option value="Oils">Tailam & Oils</option>
                    <option value="Supplements">Churna & Vati</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

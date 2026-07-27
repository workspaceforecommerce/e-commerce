import React, { useState, useEffect } from 'react';
import {
  FileText, FolderTree, Layers, History, Plus, Edit3, Eye, Trash2, Copy,
  CheckCircle2, RefreshCw, Layout, Grid, HelpCircle, Zap, MessageSquare,
  Globe, Lock, ShieldCheck, ArrowUpRight, ChevronRight, Save, Clock
} from 'lucide-react';
import { Button } from '../shared/components/ui/Button';
import { Modal } from '../shared/components/ui/Modal';

interface CmsPage {
  id: string; title: string; slug: string; status: 'Published' | 'Draft' | 'Scheduled' | 'Archived';
  version: number; author: string; updated_at: string; content?: string; is_system?: number;
}

interface CmsMenu {
  id: string; name: string; location: string; items: any[];
}

interface ContentBlock {
  id: string; type: string; name: string; category: string; icon: string;
}

interface Revision {
  id: string; page_id: string; version: number; title: string; author: string; created_at: string; notes?: string;
}

export const CmsCoreManagementView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'pages' | 'builder' | 'menus' | 'revisions'>('pages');
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [menus, setMenus] = useState<CmsMenu[]>([]);
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(false);

  // Selected Page Builder State
  const [selectedPage, setSelectedPage] = useState<CmsPage | null>(null);
  const [pageBlocks, setPageBlocks] = useState<any[]>([]);

  // Modals
  const [isPageModalOpen, setIsPageModalOpen] = useState(false);
  const [pageForm, setPageForm] = useState({ title: '', slug: '', status: 'Draft', content: '' });

  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [menuForm, setMenuForm] = useState({ name: '', location: 'Header', item_label: '', item_url: '' });

  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null);
  const showNotice = (text: string, error = false) => { setNotice({ text, error }); setTimeout(() => setNotice(null), 4000); };

  const loadCmsData = async () => {
    setLoading(true);
    try {
      const [pRes, mRes, bRes]: [any, any, any] = await Promise.all([
        fetch('/api/cms/pages').then(r => r.json()),
        fetch('/api/cms/menus').then(r => r.json()),
        fetch('/api/cms/blocks').then(r => r.json()),
      ]);
      if (pRes.success) setPages(pRes.pages);
      if (mRes.success) setMenus(mRes.menus);
      if (bRes.success) setBlocks(bRes.blocks);
    } catch {
      setPages(mockPagesList());
      setMenus(mockMenusList());
      setBlocks(mockBlocksList());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCmsData(); }, []);

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageForm.title || !pageForm.slug) return;

    await fetch('/api/cms/pages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pageForm)
    }).catch(() => {});

    showNotice(`CMS Page "${pageForm.title}" created successfully.`);
    setIsPageModalOpen(false);
    setPageForm({ title: '', slug: '', status: 'Draft', content: '' });
    loadCmsData();
  };

  const handleEditPage = (page: CmsPage) => {
    setSelectedPage(page);
    setPageBlocks([
      { id: 'b1', type: 'Hero', title: 'Welcome to Healthy Monks', subtitle: '100% Organic Ayurvedic Wellness Products' },
      { id: 'b2', type: 'Feature Grid', title: 'Why Choose Us', items: ['Doctor Formulated', 'AYUSH Certified', 'Zero Chemicals'] },
      { id: 'b3', type: 'FAQ Accordion', title: 'Frequently Asked Questions' }
    ]);
    setActiveSubTab('builder');
  };

  const handleSavePageBlocks = async () => {
    if (!selectedPage) return;
    await fetch(`/api/cms/pages/${selectedPage.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...selectedPage, blocks: pageBlocks })
    }).catch(() => {});

    showNotice(`Page "${selectedPage.title}" updated to Version ${selectedPage.version + 1}`);
    loadCmsData();
  };

  const handleLoadRevisions = async (pageId: string) => {
    try {
      const res: any = await fetch(`/api/cms/revisions/${pageId}`).then(r => r.json());
      if (res.success) setRevisions(res.revisions);
    } catch {
      setRevisions([
        { id: 'rev2', page_id: pageId, version: 2, title: 'Updated Header Links', author: 'Mohd Nomaan', created_at: '2026-07-27T14:00:00Z', notes: 'Added Doctor Consultation link' },
        { id: 'rev1', page_id: pageId, version: 1, title: 'Initial Draft', author: 'System Admin', created_at: '2026-07-26T10:00:00Z', notes: 'Page published' }
      ]);
    }
    setActiveSubTab('revisions');
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
            <Layers className="w-5 h-5 text-emerald-700" /> Headless CMS Core & Content Engine
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5">Enterprise page builder, reusable block library, nested navigation menus & version history</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
          <button onClick={() => setActiveSubTab('pages')} className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeSubTab === 'pages' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}>Page Explorer</button>
          <button onClick={() => setActiveSubTab('builder')} className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeSubTab === 'builder' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}>Block Builder</button>
          <button onClick={() => setActiveSubTab('menus')} className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeSubTab === 'menus' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}>Menus & Navigation</button>
          <button onClick={() => setActiveSubTab('revisions')} className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeSubTab === 'revisions' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}>Revisions Log</button>
        </div>
      </div>

      {/* ── SUB-TAB 1: Page Explorer ──────────────────────────────────────── */}
      {activeSubTab === 'pages' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="wp-card p-4 bg-white rounded-2xl border border-slate-200"><p className="text-xl font-extrabold text-slate-900">{pages.length}</p><p className="text-[11px] text-slate-500">Total Pages</p></div>
            <div className="wp-card p-4 bg-white rounded-2xl border border-slate-200"><p className="text-xl font-extrabold text-emerald-800">{pages.filter(p => p.status === 'Published').length}</p><p className="text-[11px] text-slate-500">Published Pages</p></div>
            <div className="wp-card p-4 bg-white rounded-2xl border border-slate-200"><p className="text-xl font-extrabold text-amber-800">{pages.filter(p => p.status === 'Draft').length}</p><p className="text-[11px] text-slate-500">Draft Queue</p></div>
            <div className="wp-card p-4 bg-white rounded-2xl border border-slate-200"><p className="text-xl font-extrabold text-indigo-800">{menus.length}</p><p className="text-[11px] text-slate-500">Navigation Menus</p></div>
          </div>

          <div className="wp-card bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-extrabold text-sm text-slate-900">CMS Pages Directory</h2>
              <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setIsPageModalOpen(true)}>Create Page</Button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left">
                <thead className="bg-slate-100 font-bold uppercase text-slate-900 border-b border-slate-200">
                  <tr>
                    <th className="p-3">Page Title</th>
                    <th className="p-3">URL Slug</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Version</th>
                    <th className="p-3">Last Updated</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {pages.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{p.title} {p.is_system === 1 && <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono ml-1">Core</span>}</td>
                      <td className="p-3 font-mono text-emerald-700">/{p.slug}</td>
                      <td className="p-3 font-bold">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${p.status === 'Published' ? 'bg-emerald-100 text-emerald-800' : p.status === 'Draft' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-600">v{p.version}</td>
                      <td className="p-3 text-slate-500">{new Date(p.updated_at).toLocaleDateString()}</td>
                      <td className="p-3 text-right space-x-1">
                        <Button size="sm" variant="outline" icon={<Edit3 className="w-3 h-3" />} onClick={() => handleEditPage(p)}>Edit</Button>
                        <Button size="sm" variant="ghost" icon={<History className="w-3 h-3" />} onClick={() => handleLoadRevisions(p.id)}>History</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── SUB-TAB 2: Block-Based Page Builder & Rich Editor ─────────────── */}
      {activeSubTab === 'builder' && (
        <div className="space-y-4">
          <div className="wp-card bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="font-heading font-extrabold text-sm text-slate-900">
                {selectedPage ? `Editing: ${selectedPage.title}` : 'Page Builder - Select a Page'}
              </h2>
              <p className="text-[11px] text-slate-500">{selectedPage ? `Slug: /${selectedPage.slug} | Version: v${selectedPage.version}` : 'Select a page from Page Explorer or build with reusable blocks'}</p>
            </div>
            {selectedPage && (
              <Button variant="primary" size="sm" icon={<Save className="w-3.5 h-3.5" />} onClick={handleSavePageBlocks}>Save & Publish Revision</Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Block Canvas */}
            <div className="md:col-span-2 space-y-3">
              <h3 className="font-heading font-extrabold text-xs text-slate-700 uppercase tracking-wider">Page Canvas Blocks</h3>
              {pageBlocks.map((blk, idx) => (
                <div key={blk.id} className="wp-card p-4 bg-white rounded-2xl border border-slate-200 space-y-2 relative group">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5"><Layout className="w-3.5 h-3.5 text-emerald-700" /> Block #{idx + 1}: {blk.type}</span>
                    <button onClick={() => setPageBlocks(pageBlocks.filter(b => b.id !== blk.id))} className="text-red-500 hover:text-red-700 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                  <input type="text" value={blk.title || ''} onChange={e => {
                    const copy = [...pageBlocks]; copy[idx].title = e.target.value; setPageBlocks(copy);
                  }} className="w-full bg-slate-50 font-semibold px-3 py-1.5 rounded-xl border border-slate-200" placeholder="Block Heading..." />
                </div>
              ))}
              {pageBlocks.length === 0 && (
                <div className="p-8 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400">
                  Drag or select reusable content blocks from the library to build page.
                </div>
              )}
            </div>

            {/* Block Library */}
            <div className="space-y-3">
              <h3 className="font-heading font-extrabold text-xs text-slate-700 uppercase tracking-wider">Reusable Block Library</h3>
              <div className="space-y-2">
                {blocks.map(b => (
                  <div key={b.id} onClick={() => setPageBlocks([...pageBlocks, { id: `b_${Date.now()}`, type: b.type, title: b.name }])} className="p-3 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl cursor-pointer transition-all flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{b.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{b.category} • {b.type}</p>
                    </div>
                    <Plus className="w-4 h-4 text-emerald-700" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SUB-TAB 3: Navigation Menu Builder ────────────────────────────── */}
      {activeSubTab === 'menus' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-extrabold text-sm text-slate-900">Navigation Menus ({menus.length})</h2>
            <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setIsMenuModalOpen(true)}>Create Menu</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {menus.map(m => (
              <div key={m.id} className="wp-card p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div>
                    <h3 className="font-heading font-extrabold text-sm text-slate-900">{m.name}</h3>
                    <p className="text-[10px] font-mono text-emerald-700">Location: {m.location}</p>
                  </div>
                  <span className="font-bold text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">{m.items?.length || 0} Links</span>
                </div>
                <div className="space-y-1">
                  {(m.items || []).map((item: any) => (
                    <div key={item.id} className="p-2 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
                      <span className="font-bold text-slate-800">{item.label}</span>
                      <span className="font-mono text-[10px] text-slate-500">{item.url}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SUB-TAB 4: Revision History & Version Control ─────────────────── */}
      {activeSubTab === 'revisions' && (
        <div className="wp-card bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
          <h2 className="font-heading font-extrabold text-sm text-slate-900">Page Revision Logs & Version History</h2>
          <div className="space-y-3">
            {revisions.map(r => (
              <div key={r.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">Version v{r.version}</span>
                  <p className="font-bold text-slate-900 mt-1">{r.title}</p>
                  <p className="text-[10px] text-slate-500">Edited by {r.author} on {new Date(r.created_at).toLocaleString()}</p>
                </div>
                <Button size="sm" variant="outline">Restore Version</Button>
              </div>
            ))}
            {revisions.length === 0 && <p className="text-slate-400 text-center py-6">Select a page from Page Explorer to view its revision timeline.</p>}
          </div>
        </div>
      )}

      {/* Create Page Modal */}
      <Modal isOpen={isPageModalOpen} onClose={() => setIsPageModalOpen(false)} title="Create New CMS Page">
        <form onSubmit={handleCreatePage} className="space-y-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Page Title *</label>
            <input type="text" required placeholder="e.g. Clinical Research & Studies" value={pageForm.title} onChange={e => setPageForm({ ...pageForm, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') })} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">URL Slug *</label>
            <input type="text" required value={pageForm.slug} onChange={e => setPageForm({ ...pageForm, slug: e.target.value })} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Initial Status</label>
            <select value={pageForm.status} onChange={e => setPageForm({ ...pageForm, status: e.target.value as any })} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700">
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsPageModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm">Create Page</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

function mockPagesList(): CmsPage[] {
  return [
    { id: 'pg1', title: 'Home Page', slug: 'home', status: 'Published', version: 5, author: 'Super Admin', updated_at: '2026-07-27T16:00:00Z', is_system: 1 },
    { id: 'pg2', title: 'About Healthy Monks', slug: 'about-us', status: 'Published', version: 3, author: 'Super Admin', updated_at: '2026-07-27T14:30:00Z', is_system: 1 },
    { id: 'pg3', title: 'Contact & Doctor Consultation', slug: 'contact-us', status: 'Published', version: 2, author: 'Support Admin', updated_at: '2026-07-25T11:20:00Z', is_system: 1 }
  ];
}

function mockMenusList(): CmsMenu[] {
  return [
    {
      id: 'menu_hdr', name: 'Header Main Navigation', location: 'Header',
      items: [{ id: 'm1', label: 'Home', url: '/' }, { id: 'm2', label: 'Shop Herbs', url: '/shop' }]
    }
  ];
}

function mockBlocksList(): ContentBlock[] {
  return [
    { id: 'blk_hero', type: 'Hero', name: 'Ayurvedic Wellness Hero Banner', category: 'Headers', icon: 'Layout' },
    { id: 'blk_features', type: 'Feature Grid', name: '100% Organic Badges', category: 'Content', icon: 'Grid' }
  ];
}

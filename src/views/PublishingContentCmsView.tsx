import React, { useState, useEffect } from 'react';
import {
  BookOpen, FileText, CheckCircle2, Plus, Edit3, Trash2, Eye, RefreshCw,
  Search, Tag, FolderTree, MessageSquare, ShieldCheck, User, Clock, Copy, ChevronRight
} from 'lucide-react';
import { Button } from '../shared/components/ui/Button';
import { Modal } from '../shared/components/ui/Modal';

interface ContentItem {
  id: string; title: string; slug: string; content_type: string; category: string;
  excerpt: string; content?: string; author_name: string; status: string;
  reading_time_mins: number; created_at: string; cover_image?: string;
}

export const PublishingContentCmsView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'editor' | 'documentation' | 'comments'>('dashboard');
  const [articles, setArticles] = useState<ContentItem[]>([]);
  const [selectedType, setSelectedType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Editor State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [articleForm, setArticleForm] = useState({
    title: '', slug: '', content_type: 'Blog', category: 'Medicinal Herbs & Adaptogens',
    author_name: 'Vaidya Ananya', excerpt: '', content: '', cover_image: ''
  });

  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null);
  const showNotice = (text: string, error = false) => { setNotice({ text, error }); setTimeout(() => setNotice(null), 4000); };

  const loadContent = async () => {
    setLoading(true);
    try {
      const res: any = await fetch('/api/content').then(r => r.json());
      if (res.success) setArticles(res.articles);
    } catch {
      setArticles(mockArticlesList());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadContent(); }, []);

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleForm.title) return;

    await fetch('/api/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(articleForm)
    }).catch(() => {});

    showNotice(`Content "${articleForm.title}" published successfully.`);
    setIsEditorOpen(false);
    setArticleForm({ title: '', slug: '', content_type: 'Blog', category: 'Medicinal Herbs & Adaptogens', author_name: 'Vaidya Ananya', excerpt: '', content: '', cover_image: '' });
    loadContent();
  };

  const filteredArticles = articles.filter(a => {
    const matchesType = selectedType === 'All' || a.content_type === selectedType;
    const matchesSearch = !searchQuery || a.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

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
            <BookOpen className="w-5 h-5 text-emerald-700" /> Enterprise Blog, News & Documentation CMS
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5">Multi-channel publishing engine for articles, clinical docs, news & tutorials</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
          <button onClick={() => setActiveSubTab('dashboard')} className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeSubTab === 'dashboard' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}>Articles Explorer</button>
          <button onClick={() => setActiveSubTab('documentation')} className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeSubTab === 'documentation' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}>Doc Portal Builder</button>
          <button onClick={() => setActiveSubTab('comments')} className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeSubTab === 'comments' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}>Comments Moderation</button>
        </div>
      </div>

      {/* ── SUB-TAB 1: Articles Explorer ──────────────────────────────────── */}
      {activeSubTab === 'dashboard' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="wp-card p-4 bg-white rounded-2xl border border-slate-200"><p className="text-xl font-extrabold text-slate-900">{articles.length}</p><p className="text-[11px] text-slate-500">Total Published Articles</p></div>
            <div className="wp-card p-4 bg-white rounded-2xl border border-slate-200"><p className="text-xl font-extrabold text-emerald-800">{articles.filter(a => a.content_type === 'Blog').length}</p><p className="text-[11px] text-slate-500">Blog Posts</p></div>
            <div className="wp-card p-4 bg-white rounded-2xl border border-slate-200"><p className="text-xl font-extrabold text-indigo-800">{articles.filter(a => a.content_type === 'Documentation').length}</p><p className="text-[11px] text-slate-500">Doc Portal Guides</p></div>
            <div className="wp-card p-4 bg-white rounded-2xl border border-slate-200"><p className="text-xl font-extrabold text-purple-800">{articles.filter(a => a.content_type === 'News').length}</p><p className="text-[11px] text-slate-500">Press Releases & News</p></div>
          </div>

          <div className="wp-card bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 max-w-sm bg-slate-100 px-3 py-1.5 rounded-xl">
                <Search className="w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Search by title, author, category..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="bg-transparent border-none focus:outline-none w-full text-xs" />
              </div>

              <div className="flex items-center gap-2">
                <select value={selectedType} onChange={e => setSelectedType(e.target.value)} className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 font-bold">
                  <option value="All">All Content Types</option>
                  <option value="Blog">Blog</option>
                  <option value="Documentation">Documentation</option>
                  <option value="News">News</option>
                </select>
                <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setIsEditorOpen(true)}>New Article</Button>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left">
                <thead className="bg-slate-100 font-bold uppercase text-slate-900 border-b border-slate-200">
                  <tr>
                    <th className="p-3">Article Title</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Author</th>
                    <th className="p-3">Read Time</th>
                    <th className="p-3">Published Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredArticles.map(a => (
                    <tr key={a.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900 max-w-xs truncate">{a.title}</td>
                      <td className="p-3 font-bold">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${a.content_type === 'Blog' ? 'bg-emerald-100 text-emerald-800' : a.content_type === 'Documentation' ? 'bg-indigo-100 text-indigo-800' : 'bg-purple-100 text-purple-800'}`}>
                          {a.content_type}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-slate-700">{a.category}</td>
                      <td className="p-3 font-bold text-slate-800">{a.author_name}</td>
                      <td className="p-3 font-mono text-slate-600">{a.reading_time_mins} min read</td>
                      <td className="p-3 text-slate-500">{new Date(a.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── SUB-TAB 2: Documentation Portal Builder ───────────────────────── */}
      {activeSubTab === 'documentation' && (
        <div className="space-y-4">
          <div className="wp-card bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading font-extrabold text-sm text-slate-900">Doc Portal & Knowledge Base Tree</h2>
                <p className="text-[10px] text-slate-500">Structured documentation chapters, version selector & API code blocks</p>
              </div>
              <span className="font-mono text-xs bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-full font-bold">Version v2.0 (Latest)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h3 className="font-heading font-extrabold text-xs text-slate-900 border-b border-slate-200 pb-1">Getting Started & Dosha Guide</h3>
                <div className="space-y-1">
                  <div className="p-2 bg-white rounded-xl border border-slate-200 font-bold text-slate-800">1. Ayurvedic Body Dosha Assessment (Vata, Pitta, Kapha)</div>
                  <div className="p-2 bg-white rounded-xl border border-slate-200 font-bold text-slate-800">2. Daily Wellness & Dinacharya Morning Routine</div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h3 className="font-heading font-extrabold text-xs text-slate-900 border-b border-slate-200 pb-1">Product Usage & Clinical Application</h3>
                <div className="space-y-1">
                  <div className="p-2 bg-white rounded-xl border border-slate-200 font-bold text-slate-800">1. Ashwagandha Gold Extra Strength Usage Instructions</div>
                  <div className="p-2 bg-white rounded-xl border border-slate-200 font-bold text-slate-800">2. Kumkumadi Night Serum Application Protocol</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SUB-TAB 3: Comment Moderation Queue ───────────────────────────── */}
      {activeSubTab === 'comments' && (
        <div className="wp-card bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
          <h2 className="font-heading font-extrabold text-sm text-slate-900">Customer Comment Moderation Queue</h2>
          <div className="space-y-3">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start justify-between">
              <div>
                <p className="font-bold text-slate-900">Rohan Das <span className="font-normal text-[10px] text-slate-500">(on Ashwagandha Benefits)</span></p>
                <p className="text-[11px] text-slate-700 mt-1 font-sans">"Very insightful article! Should this be taken with warm milk or water for best absorption?"</p>
                <p className="text-[9px] text-slate-400 mt-1">Submitted 2 hours ago • Verified Buyer</p>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="primary" onClick={() => showNotice('Comment Approved & Published')}>Approve</Button>
                <Button size="sm" variant="outline" onClick={() => showNotice('Marked as Spam')}>Mark Spam</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Article Modal */}
      <Modal isOpen={isEditorOpen} onClose={() => setIsEditorOpen(false)} title="Publish New Article / Documentation">
        <form onSubmit={handleCreateArticle} className="space-y-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Article Title *</label>
            <input type="text" required placeholder="e.g. Science of Brahmi & Memory Enhancement" value={articleForm.title} onChange={e => setArticleForm({ ...articleForm, title: e.target.value })} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Content Type</label>
              <select value={articleForm.content_type} onChange={e => setArticleForm({ ...articleForm, content_type: e.target.value })} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700">
                <option value="Blog">Blog Post</option>
                <option value="Documentation">Documentation Guide</option>
                <option value="News">News & Press</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category</label>
              <select value={articleForm.category} onChange={e => setArticleForm({ ...articleForm, category: e.target.value })} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700">
                <option value="Medicinal Herbs & Adaptogens">Medicinal Herbs & Adaptogens</option>
                <option value="Ayurvedic Principles">Ayurvedic Principles</option>
                <option value="Product Guides & Dosage Docs">Product Guides & Dosage Docs</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Excerpt Summary</label>
            <input type="text" placeholder="Short 1-2 sentence overview..." value={articleForm.excerpt} onChange={e => setArticleForm({ ...articleForm, excerpt: e.target.value })} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Article Content Body (Markdown / Rich Text)</label>
            <textarea value={articleForm.content} onChange={e => setArticleForm({ ...articleForm, content: e.target.value })} rows={4} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700 text-xs font-mono" placeholder="Write full article body..." />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsEditorOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm">Publish Content</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

function mockArticlesList(): ContentItem[] {
  return [
    {
      id: 'art1', title: '10 Proven Benefits of Ashwagandha According to Modern Science & Charaka Samhita',
      slug: 'proven-benefits-of-ashwagandha', content_type: 'Blog', category: 'Medicinal Herbs & Adaptogens',
      excerpt: 'Explore how Withania somnifera lowers cortisol, improves sleep quality, and restores vitality.',
      author_name: 'Dr. Rajesh Sharma, MD (Ayurveda)', status: 'Published', reading_time_mins: 5, created_at: '2026-07-27T10:00:00Z'
    },
    {
      id: 'art2', title: 'Understanding Your Prakriti: Vata, Pitta and Kapha Self-Assessment Guide',
      slug: 'understanding-your-prakriti', content_type: 'Documentation', category: 'Product Guides & Dosage Docs',
      excerpt: 'Learn how to identify your unique mind-body constitution and choose ideal herbal supplements.',
      author_name: 'Vaidya Ananya Roy', status: 'Published', reading_time_mins: 8, created_at: '2026-07-26T14:30:00Z'
    }
  ];
}

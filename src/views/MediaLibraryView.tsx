import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  UploadCloud, Grid3X3, List, Search, FolderPlus, Trash2, RotateCcw,
  Star, StarOff, Tag, Copy, Check, Eye, X, Edit3, Move, Download,
  Filter, ChevronRight, ChevronDown, Image as ImageIcon, File,
  Loader2, CheckCircle2, AlertCircle, FolderOpen, Folder, MoreVertical
} from 'lucide-react';
import { Button } from '../shared/components/ui/Button';
import { Input } from '../shared/components/ui/Input';
import { Modal } from '../shared/components/ui/Modal';
import { Badge } from '../shared/components/ui/Badge';

interface MediaItem {
  id: string;
  url: string;
  public_id: string;
  original_name: string;
  mime_type: string;
  file_size: number;
  width: number;
  height: number;
  folder_id: string | null;
  alt_text: string;
  caption: string;
  tags: string;
  is_favorite: number;
  created_at: string;
  deleted_at: string | null;
}

interface MediaFolder {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  media_count?: number;
}

const CLOUDINARY_CLOUD = 'hfx4iebd';
const CLOUDINARY_PRESET = 'healthy_monks_unsigned';

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const MediaLibraryView: React.FC = () => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [showRecycleBin, setShowRecycleBin] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [filterType, setFilterType] = useState('');
  const [sortBy, setSortBy] = useState('created_at');

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [editItem, setEditItem] = useState<MediaItem | null>(null);
  const [newFolderModal, setNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showNotice = (text: string, error = false) => {
    setNotice({ text, error });
    setTimeout(() => setNotice(null), 4000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeFolder) params.set('folder', activeFolder);
      if (filterType) params.set('type', filterType);
      if (searchQ) params.set('q', searchQ);
      if (sortBy) params.set('sort', sortBy);
      if (showRecycleBin) params.set('deleted', '1');

      const [mRes, fRes]: [any, any] = await Promise.all([
        fetch(`/api/media?${params}`).then(r => r.json()),
        fetch('/api/media/folders').then(r => r.json()),
      ]);
      if (mRes.success) setMedia(mRes.media);
      if (fRes.success) setFolders(fRes.folders);
    } catch {
      // Use inline mock data when API is unreachable
      setMedia([
        { id: 'm1', url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400', public_id: 'hm/ashwagandha', original_name: 'ashwagandha-powder.jpg', mime_type: 'image/jpeg', file_size: 128400, width: 800, height: 600, folder_id: 'f1', alt_text: 'KSM-66 Ashwagandha Root Powder', caption: 'Premium grade adaptogen', tags: 'ashwagandha,powder', is_favorite: 1, created_at: '2026-07-20T10:00:00Z', deleted_at: null },
        { id: 'm2', url: 'https://images.unsplash.com/photo-1609501676725-7186f017a4b7?w=400', public_id: 'hm/tulsi', original_name: 'tulsi-green-tea.jpg', mime_type: 'image/jpeg', file_size: 96200, width: 800, height: 600, folder_id: 'f1', alt_text: 'Himalayan Tulsi Green Tea', caption: 'Certified organic', tags: 'tulsi,tea', is_favorite: 0, created_at: '2026-07-21T10:00:00Z', deleted_at: null },
        { id: 'm3', url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400', public_id: 'hm/moringa', original_name: 'moringa-leaf-powder.jpg', mime_type: 'image/jpeg', file_size: 114300, width: 800, height: 600, folder_id: 'f2', alt_text: 'Organic Moringa Leaf Powder', caption: 'Rich in antioxidants', tags: 'moringa,superfood', is_favorite: 0, created_at: '2026-07-22T10:00:00Z', deleted_at: null },
        { id: 'm4', url: 'https://images.unsplash.com/photo-1612151855475-877969f4a6cc?w=400', public_id: 'hm/amla', original_name: 'amla-vitamin-c.jpg', mime_type: 'image/jpeg', file_size: 88100, width: 800, height: 600, folder_id: 'f2', alt_text: 'Amla Indian Gooseberry', caption: 'Natural Vitamin C', tags: 'amla,vitamin-c', is_favorite: 1, created_at: '2026-07-23T10:00:00Z', deleted_at: null },
        { id: 'm5', url: 'https://images.unsplash.com/photo-1596543805442-2ad43b978248?w=400', public_id: 'hm/shilajit', original_name: 'shilajit-pure-resin.jpg', mime_type: 'image/jpeg', file_size: 102500, width: 800, height: 600, folder_id: 'f1', alt_text: 'Pure Himalayan Shilajit', caption: 'Gold grade fulvic acid', tags: 'shilajit,resin', is_favorite: 0, created_at: '2026-07-24T10:00:00Z', deleted_at: null },
        { id: 'm6', url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', public_id: 'hm/banner', original_name: 'homepage-hero-banner.jpg', mime_type: 'image/jpeg', file_size: 246000, width: 1920, height: 640, folder_id: 'f3', alt_text: 'Homepage Hero Banner', caption: 'Main store banner', tags: 'banner,cms', is_favorite: 0, created_at: '2026-07-25T10:00:00Z', deleted_at: null },
      ]);
      setFolders([
        { id: 'f1', name: 'Products', slug: 'products', parent_id: null, media_count: 3 },
        { id: 'f2', name: 'Superfoods', slug: 'superfoods', parent_id: 'f1', media_count: 2 },
        { id: 'f3', name: 'Banners & CMS', slug: 'banners-cms', parent_id: null, media_count: 1 },
        { id: 'f4', name: 'Blog Images', slug: 'blog-images', parent_id: null, media_count: 0 },
      ]);
    } finally {
      setLoading(false);
    }
  }, [activeFolder, filterType, searchQ, sortBy, showRecycleBin]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Upload via Cloudinary unsigned preset ──────────────────────────────────
  const uploadFiles = async (files: File[]) => {
    setUploading(true);
    setUploadProgress(0);
    let uploaded = 0;
    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_PRESET);
        formData.append('folder', 'healthy_monks');

        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, {
          method: 'POST',
          body: formData,
        });
        const data = await res.json() as any;

        if (data.secure_url) {
          const meta = {
            url: data.secure_url,
            public_id: data.public_id,
            original_name: file.name,
            mime_type: file.type,
            file_size: data.bytes,
            width: data.width,
            height: data.height,
            folder_id: activeFolder,
            alt_text: file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
            caption: '',
          };
          await fetch('/api/media', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(meta) });
        }
        uploaded++;
        setUploadProgress(Math.round((uploaded / files.length) * 100));
      } catch {
        showNotice(`Failed to upload ${file.name}`, true);
      }
    }
    setUploading(false);
    setUploadProgress(0);
    showNotice(`${uploaded} file${uploaded > 1 ? 's' : ''} uploaded successfully!`);
    loadData();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length) uploadFiles(files);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length) uploadFiles(files);
  };

  // ── Selection helpers ─────────────────────────────────────────────────────
  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const selectAll = () => {
    if (selected.size === media.length) { setSelected(new Set()); }
    else { setSelected(new Set(media.map(m => m.id))); }
  };

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleDelete = async (ids: string[]) => {
    for (const id of ids) {
      await fetch(`/api/media/${id}`, { method: 'DELETE' }).catch(() => {});
    }
    setSelected(new Set());
    showNotice(`${ids.length} item${ids.length > 1 ? 's' : ''} moved to recycle bin`);
    loadData();
  };

  const handleRestore = async (ids: string[]) => {
    for (const id of ids) {
      await fetch(`/api/media/${id}/restore`, { method: 'POST' }).catch(() => {});
    }
    setSelected(new Set());
    showNotice(`${ids.length} item${ids.length > 1 ? 's' : ''} restored`);
    loadData();
  };

  const handleFavorite = async (item: MediaItem) => {
    await fetch(`/api/media/${item.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_favorite: item.is_favorite ? 0 : 1 }) }).catch(() => {});
    loadData();
  };

  const handleSaveEdit = async () => {
    if (!editItem) return;
    await fetch(`/api/media/${editItem.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ alt_text: editItem.alt_text, caption: editItem.caption, tags: editItem.tags, original_name: editItem.original_name }) }).catch(() => {});
    showNotice('Media details updated');
    setEditItem(null);
    loadData();
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url).then(() => showNotice('URL copied to clipboard!')).catch(() => {});
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/media/folders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newFolderName }) }).catch(() => {});
    showNotice(`Folder "${newFolderName}" created`);
    setNewFolderModal(false);
    setNewFolderName('');
    loadData();
  };

  const filteredMedia = media.filter(m =>
    (!searchQ || m.original_name.toLowerCase().includes(searchQ.toLowerCase()) || m.alt_text?.toLowerCase().includes(searchQ.toLowerCase()) || m.tags?.includes(searchQ.toLowerCase())) &&
    (!filterType || m.mime_type.startsWith(filterType)) &&
    (!activeFolder || m.folder_id === activeFolder)
  );

  return (
    <div className="space-y-4 pb-12 animate-fade-in">
      {/* Notice Banner */}
      {notice && (
        <div className={`px-4 py-3 rounded-xl flex items-center gap-2 text-xs font-semibold border ${notice.error ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
          {notice.error ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
          {notice.text}
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="wp-card p-5 rounded-2xl bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-extrabold text-slate-900">Enterprise Media Library</h1>
          <p className="text-[11px] text-slate-500 mt-0.5">{media.length} assets · Cloudinary CDN · WebP delivery</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" icon={<FolderPlus className="w-3.5 h-3.5" />} onClick={() => setNewFolderModal(true)}>New Folder</Button>
          <Button variant="primary" size="sm" icon={<UploadCloud className="w-3.5 h-3.5" />} onClick={() => fileInputRef.current?.click()} isLoading={uploading}>
            {uploading ? `Uploading ${uploadProgress}%` : 'Upload Media'}
          </Button>
          <input ref={fileInputRef} type="file" multiple accept="image/*,video/*,.pdf" className="hidden" onChange={handleFileChange} />
        </div>
      </div>

      <div className="flex gap-4">
        {/* ── Sidebar: Folder Tree ────────────────────────────────────── */}
        <aside className="hidden lg:flex flex-col w-52 shrink-0 gap-2">
          <div className="wp-card p-3 rounded-2xl bg-white">
            <p className="text-[10px] font-extrabold uppercase text-slate-400 mb-2 px-1">Folders</p>
            <button
              onClick={() => { setActiveFolder(null); setShowRecycleBin(false); }}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all ${!activeFolder && !showRecycleBin ? 'bg-emerald-700 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
            >
              <FolderOpen className="w-3.5 h-3.5" /> All Media
              <span className="ml-auto text-[10px] opacity-70">{media.length}</span>
            </button>

            {folders.map(f => (
              <button
                key={f.id}
                onClick={() => { setActiveFolder(f.id); setShowRecycleBin(false); }}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeFolder === f.id ? 'bg-emerald-700 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
              >
                <Folder className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{f.name}</span>
                <span className="ml-auto text-[10px] opacity-70">{f.media_count ?? 0}</span>
              </button>
            ))}

            <div className="border-t border-slate-200 mt-2 pt-2">
              <button
                onClick={() => { setShowRecycleBin(true); setActiveFolder(null); }}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all ${showRecycleBin ? 'bg-red-600 text-white' : 'text-red-600 hover:bg-red-50'}`}
              >
                <Trash2 className="w-3.5 h-3.5" /> Recycle Bin
              </button>
            </div>
          </div>
        </aside>

        {/* ── Main Panel ─────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Toolbar */}
          <div className="wp-card p-3 rounded-2xl bg-white flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[160px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="search"
                placeholder="Search media..."
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                className="w-full bg-slate-50 text-xs text-slate-900 rounded-lg pl-8 pr-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="bg-slate-50 text-xs text-slate-700 rounded-lg px-2.5 py-2 border border-slate-200 focus:outline-none focus:border-emerald-600">
              <option value="">All Types</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="application">Documents</option>
            </select>

            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-slate-50 text-xs text-slate-700 rounded-lg px-2.5 py-2 border border-slate-200 focus:outline-none focus:border-emerald-600">
              <option value="created_at">Newest First</option>
              <option value="name">Name A–Z</option>
              <option value="size">Largest First</option>
            </select>

            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
              <button onClick={() => setViewMode('grid')} className={`p-1.5 transition-colors ${viewMode === 'grid' ? 'bg-emerald-700 text-white' : 'text-slate-500 hover:bg-slate-100'}`}><Grid3X3 className="w-3.5 h-3.5" /></button>
              <button onClick={() => setViewMode('list')} className={`p-1.5 transition-colors ${viewMode === 'list' ? 'bg-emerald-700 text-white' : 'text-slate-500 hover:bg-slate-100'}`}><List className="w-3.5 h-3.5" /></button>
            </div>

            {selected.size > 0 && (
              <div className="flex items-center gap-1.5 ml-auto">
                <span className="text-[11px] font-bold text-slate-600">{selected.size} selected</span>
                {showRecycleBin
                  ? <button onClick={() => handleRestore([...selected])} className="flex items-center gap-1 bg-emerald-700 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg hover:bg-emerald-800"><RotateCcw className="w-3 h-3" /> Restore</button>
                  : <button onClick={() => handleDelete([...selected])} className="flex items-center gap-1 bg-red-600 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg hover:bg-red-700"><Trash2 className="w-3 h-3" /> Delete</button>
                }
                <button onClick={() => setSelected(new Set())} className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200"><X className="w-3.5 h-3.5 text-slate-600" /></button>
              </div>
            )}
          </div>

          {/* Drag & Drop Zone */}
          <div
            onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl transition-all text-center py-4 cursor-pointer ${isDragOver ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white hover:border-emerald-400 hover:bg-emerald-50/40'}`}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2 py-2">
                <Loader2 className="w-6 h-6 text-emerald-700 animate-spin" />
                <p className="text-xs font-bold text-emerald-800">Uploading to Cloudinary CDN… {uploadProgress}%</p>
                <div className="w-48 h-1.5 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-emerald-600 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} /></div>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3 py-1">
                <UploadCloud className="w-5 h-5 text-emerald-700" />
                <p className="text-xs font-semibold text-slate-600">Drag & drop images here or <span className="text-emerald-700 font-bold underline">browse files</span></p>
              </div>
            )}
          </div>

          {/* Select All Bar */}
          {filteredMedia.length > 0 && (
            <div className="flex items-center gap-2 px-1">
              <input type="checkbox" checked={selected.size === filteredMedia.length && filteredMedia.length > 0} onChange={selectAll} className="rounded" />
              <span className="text-[11px] text-slate-500">Select All ({filteredMedia.length})</span>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-7 h-7 text-emerald-700 animate-spin" />
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredMedia.length === 0 && (
            <div className="wp-card p-12 rounded-2xl bg-white text-center">
              <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-bold text-slate-500 text-sm">No media found</p>
              <p className="text-xs text-slate-400 mt-1">Upload your first image or change your filters</p>
            </div>
          )}

          {/* ── Grid View ──────────────────────────────────────────────── */}
          {!loading && viewMode === 'grid' && filteredMedia.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredMedia.map(item => (
                <div
                  key={item.id}
                  className={`group relative bg-white rounded-2xl border overflow-hidden cursor-pointer transition-all hover:shadow-md ${selected.has(item.id) ? 'border-emerald-500 ring-2 ring-emerald-400' : 'border-slate-200'}`}
                >
                  {/* Checkbox */}
                  <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <input type="checkbox" checked={selected.has(item.id)} onChange={() => toggleSelect(item.id)} className="rounded w-4 h-4 accent-emerald-600" onClick={e => e.stopPropagation()} />
                  </div>

                  {/* Favorite */}
                  <button
                    onClick={e => { e.stopPropagation(); handleFavorite(item); }}
                    className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-xs rounded-lg p-1"
                  >
                    {item.is_favorite ? <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" /> : <StarOff className="w-3.5 h-3.5 text-slate-400" />}
                  </button>

                  {/* Image */}
                  <div className="aspect-square bg-slate-100 overflow-hidden" onClick={() => setPreviewItem(item)}>
                    <img
                      src={item.url}
                      alt={item.alt_text || item.original_name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>

                  {/* Footer */}
                  <div className="p-2 border-t border-slate-100">
                    <p className="text-[10px] font-semibold text-slate-800 truncate">{item.original_name}</p>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-[9px] text-slate-400">{formatBytes(item.file_size)}</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => copyUrl(item.url)} className="p-0.5 rounded hover:bg-slate-100 text-slate-500"><Copy className="w-3 h-3" /></button>
                        <button onClick={() => setEditItem({ ...item })} className="p-0.5 rounded hover:bg-slate-100 text-slate-500"><Edit3 className="w-3 h-3" /></button>
                        <button onClick={() => handleDelete([item.id])} className="p-0.5 rounded hover:bg-red-50 text-red-500"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── List View ──────────────────────────────────────────────── */}
          {!loading && viewMode === 'list' && filteredMedia.length > 0 && (
            <div className="wp-card rounded-2xl bg-white border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 border-b border-slate-200 font-bold uppercase text-slate-900">
                  <tr>
                    <th className="p-3 w-8"><input type="checkbox" checked={selected.size === filteredMedia.length} onChange={selectAll} className="rounded" /></th>
                    <th className="p-3">Preview</th>
                    <th className="p-3">File Name</th>
                    <th className="p-3 hidden md:table-cell">Dimensions</th>
                    <th className="p-3 hidden md:table-cell">Size</th>
                    <th className="p-3 hidden lg:table-cell">Type</th>
                    <th className="p-3 hidden lg:table-cell">Uploaded</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredMedia.map(item => (
                    <tr key={item.id} className={`hover:bg-slate-50 ${selected.has(item.id) ? 'bg-emerald-50' : ''}`}>
                      <td className="p-3"><input type="checkbox" checked={selected.has(item.id)} onChange={() => toggleSelect(item.id)} className="rounded" /></td>
                      <td className="p-3"><div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden cursor-pointer" onClick={() => setPreviewItem(item)}><img src={item.url} alt={item.alt_text} className="w-full h-full object-cover" loading="lazy" /></div></td>
                      <td className="p-3">
                        <p className="font-bold text-slate-900">{item.original_name}</p>
                        {item.alt_text && <p className="text-[10px] text-slate-400 truncate max-w-xs">{item.alt_text}</p>}
                      </td>
                      <td className="p-3 hidden md:table-cell text-slate-500">{item.width && item.height ? `${item.width}×${item.height}` : '—'}</td>
                      <td className="p-3 hidden md:table-cell font-mono text-slate-600">{formatBytes(item.file_size)}</td>
                      <td className="p-3 hidden lg:table-cell"><Badge status="active" label={item.mime_type.split('/')[1]?.toUpperCase() || 'FILE'} /></td>
                      <td className="p-3 hidden lg:table-cell text-slate-400 font-mono">{new Date(item.created_at).toLocaleDateString('en-IN')}</td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          {item.is_favorite ? <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" /> : null}
                          <button onClick={() => copyUrl(item.url)} className="p-1 rounded hover:bg-slate-100 text-slate-500"><Copy className="w-3 h-3" /></button>
                          <button onClick={() => setEditItem({ ...item })} className="p-1 rounded hover:bg-slate-100 text-slate-500"><Edit3 className="w-3 h-3" /></button>
                          {showRecycleBin
                            ? <button onClick={() => handleRestore([item.id])} className="p-1 rounded hover:bg-emerald-50 text-emerald-600"><RotateCcw className="w-3 h-3" /></button>
                            : <button onClick={() => handleDelete([item.id])} className="p-1 rounded hover:bg-red-50 text-red-500"><Trash2 className="w-3 h-3" /></button>
                          }
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Preview Modal ─────────────────────────────────────────────── */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm" onClick={() => setPreviewItem(null)}>
          <div className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]" onClick={e => e.stopPropagation()}>
            {/* Image */}
            <div className="flex-1 bg-slate-900 flex items-center justify-center min-h-64 md:min-h-0">
              <img src={previewItem.url} alt={previewItem.alt_text} className="max-w-full max-h-[70vh] object-contain" />
            </div>

            {/* Details Panel */}
            <div className="w-full md:w-72 shrink-0 flex flex-col border-t md:border-t-0 md:border-l border-slate-200">
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <h3 className="font-heading font-bold text-sm text-slate-900">Media Details</h3>
                <button onClick={() => setPreviewItem(null)} className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-4 h-4 text-slate-600" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
                <div><span className="font-bold text-slate-400 uppercase text-[10px]">File Name</span><p className="text-slate-900 font-semibold mt-0.5 break-all">{previewItem.original_name}</p></div>
                <div><span className="font-bold text-slate-400 uppercase text-[10px]">Dimensions</span><p className="text-slate-900 font-semibold mt-0.5">{previewItem.width}×{previewItem.height} px</p></div>
                <div><span className="font-bold text-slate-400 uppercase text-[10px]">File Size</span><p className="text-slate-900 font-semibold mt-0.5">{formatBytes(previewItem.file_size)}</p></div>
                <div><span className="font-bold text-slate-400 uppercase text-[10px]">MIME Type</span><p className="text-slate-900 font-semibold mt-0.5">{previewItem.mime_type}</p></div>
                <div><span className="font-bold text-slate-400 uppercase text-[10px]">Alt Text</span><p className="text-slate-700 mt-0.5">{previewItem.alt_text || '—'}</p></div>
                <div><span className="font-bold text-slate-400 uppercase text-[10px]">Caption</span><p className="text-slate-700 mt-0.5">{previewItem.caption || '—'}</p></div>
                {previewItem.tags && <div><span className="font-bold text-slate-400 uppercase text-[10px]">Tags</span><div className="flex flex-wrap gap-1 mt-1">{previewItem.tags.split(',').map(t => <span key={t} className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">{t.trim()}</span>)}</div></div>}
                <div><span className="font-bold text-slate-400 uppercase text-[10px]">Cloudinary CDN URL</span>
                  <div className="flex items-center gap-1 mt-0.5 bg-slate-50 border border-slate-200 rounded-lg p-2 break-all">
                    <p className="text-[10px] font-mono text-slate-600 flex-1 truncate">{previewItem.url}</p>
                    <button onClick={() => copyUrl(previewItem.url)} className="text-emerald-700 hover:text-emerald-800 shrink-0"><Copy className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-slate-200 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" icon={<Edit3 className="w-3.5 h-3.5" />} onClick={() => { setEditItem({ ...previewItem! }); setPreviewItem(null); }}>Edit</Button>
                <Button variant="primary" size="sm" className="flex-1" icon={<Copy className="w-3.5 h-3.5" />} onClick={() => copyUrl(previewItem.url)}>Copy URL</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Metadata Modal ───────────────────────────────────────── */}
      <Modal isOpen={!!editItem} onClose={() => setEditItem(null)} title="Edit Media Metadata">
        {editItem && (
          <div className="space-y-3 text-xs">
            <div className="flex gap-3">
              <div className="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                <img src={editItem.url} alt={editItem.alt_text} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 space-y-2">
                <Input label="File Name" value={editItem.original_name} onChange={e => setEditItem({ ...editItem, original_name: e.target.value })} />
              </div>
            </div>
            <div><label className="block font-semibold text-slate-700 mb-1">Alt Text (SEO)</label><input value={editItem.alt_text || ''} onChange={e => setEditItem({ ...editItem, alt_text: e.target.value })} placeholder="Describe this image for accessibility and SEO" className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700 text-xs" /></div>
            <div><label className="block font-semibold text-slate-700 mb-1">Caption</label><input value={editItem.caption || ''} onChange={e => setEditItem({ ...editItem, caption: e.target.value })} placeholder="Short image caption" className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700 text-xs" /></div>
            <div><label className="block font-semibold text-slate-700 mb-1">Tags (comma separated)</label><input value={editItem.tags || ''} onChange={e => setEditItem({ ...editItem, tags: e.target.value })} placeholder="ashwagandha, powder, herb" className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700 text-xs" /></div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="fav-toggle" checked={!!editItem.is_favorite} onChange={e => setEditItem({ ...editItem, is_favorite: e.target.checked ? 1 : 0 })} className="rounded" />
              <label htmlFor="fav-toggle" className="font-semibold text-slate-700">Mark as Favourite</label>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditItem(null)}>Cancel</Button>
              <Button type="button" variant="primary" size="sm" onClick={handleSaveEdit}>Save Changes</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── New Folder Modal ──────────────────────────────────────────── */}
      <Modal isOpen={newFolderModal} onClose={() => setNewFolderModal(false)} title="Create New Folder">
        <form onSubmit={handleCreateFolder} className="space-y-4 text-xs">
          <Input label="Folder Name *" required placeholder="e.g. Blog Images" value={newFolderName} onChange={e => setNewFolderName(e.target.value)} />
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setNewFolderModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm">Create Folder</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

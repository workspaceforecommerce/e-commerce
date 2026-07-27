import React, { useState, useEffect, useRef } from 'react';
import { Search, UploadCloud, X, Check, Image as ImageIcon, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '../shared/components/ui/Button';

interface MediaItem {
  id: string;
  url: string;
  public_id: string;
  original_name: string;
  mime_type: string;
  file_size: number;
  width: number;
  height: number;
  alt_text: string;
}

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called with the selected image URL when user confirms */
  onSelect: (url: string, alt?: string) => void;
  /** Allow selecting multiple images */
  multiple?: boolean;
  /** Initial filter type: 'image' | 'video' | '' */
  filterType?: string;
  title?: string;
}

const CLOUDINARY_CLOUD = 'hfx4iebd';
const CLOUDINARY_PRESET = 'healthy_monks_unsigned';

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const FALLBACK_MEDIA: MediaItem[] = [
  { id: 'm1', url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400', public_id: 'hm/ashwagandha', original_name: 'ashwagandha-powder.jpg', mime_type: 'image/jpeg', file_size: 128400, width: 800, height: 600, alt_text: 'KSM-66 Ashwagandha Root Powder' },
  { id: 'm2', url: 'https://images.unsplash.com/photo-1609501676725-7186f017a4b7?w=400', public_id: 'hm/tulsi', original_name: 'tulsi-green-tea.jpg', mime_type: 'image/jpeg', file_size: 96200, width: 800, height: 600, alt_text: 'Himalayan Tulsi Green Tea' },
  { id: 'm3', url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400', public_id: 'hm/moringa', original_name: 'moringa-leaf-powder.jpg', mime_type: 'image/jpeg', file_size: 114300, width: 800, height: 600, alt_text: 'Organic Moringa Leaf Powder' },
  { id: 'm4', url: 'https://images.unsplash.com/photo-1612151855475-877969f4a6cc?w=400', public_id: 'hm/amla', original_name: 'amla-vitamin-c.jpg', mime_type: 'image/jpeg', file_size: 88100, width: 800, height: 600, alt_text: 'Amla Indian Gooseberry' },
  { id: 'm5', url: 'https://images.unsplash.com/photo-1596543805442-2ad43b978248?w=400', public_id: 'hm/shilajit', original_name: 'shilajit-pure-resin.jpg', mime_type: 'image/jpeg', file_size: 102500, width: 800, height: 600, alt_text: 'Pure Himalayan Shilajit' },
  { id: 'm6', url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', public_id: 'hm/banner', original_name: 'homepage-hero-banner.jpg', mime_type: 'image/jpeg', file_size: 246000, width: 1920, height: 640, alt_text: 'Homepage Hero Banner' },
];

export const MediaPickerModal: React.FC<MediaPickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  multiple = false,
  filterType = 'image',
  title = 'Select Media',
}) => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState<'library' | 'upload'>('library');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setSelected(new Set());
    setSearchQ('');
    setLoading(true);
    fetch(`/api/media?type=${filterType}`)
      .then(r => r.json())
      .then((data: any) => { if (data.success) setMedia(data.media); })
      .catch(() => setMedia(FALLBACK_MEDIA))
      .finally(() => setLoading(false));
  }, [isOpen, filterType]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);

    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_PRESET);
        formData.append('folder', 'healthy_monks');
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, { method: 'POST', body: formData });
        const data = await res.json() as any;
        if (data.secure_url) {
          const meta = { url: data.secure_url, public_id: data.public_id, original_name: file.name, mime_type: file.type, file_size: data.bytes, width: data.width, height: data.height, alt_text: file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '), caption: '' };
          await fetch('/api/media', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(meta) }).catch(() => {});
          setMedia(prev => [{ id: data.asset_id || `u${Date.now()}`, ...meta, folder_id: null } as any, ...prev]);
          setTab('library');
        }
      } catch {
        // silently continue to next file
      }
    }
    setUploading(false);
    e.target.value = '';
  };

  const toggleSelect = (id: string) => {
    if (multiple) {
      const next = new Set(selected);
      next.has(id) ? next.delete(id) : next.add(id);
      setSelected(next);
    } else {
      setSelected(new Set([id]));
    }
  };

  const handleConfirm = () => {
    const selectedItems = media.filter(m => selected.has(m.id));
    if (selectedItems.length === 0) return;
    if (multiple) {
      selectedItems.forEach(m => onSelect(m.url, m.alt_text));
    } else {
      const item = selectedItems[0];
      onSelect(item.url, item.alt_text);
    }
    onClose();
  };

  const filtered = media.filter(m =>
    !searchQ || m.original_name.toLowerCase().includes(searchQ.toLowerCase()) || m.alt_text?.toLowerCase().includes(searchQ.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 shrink-0">
          <div>
            <h2 className="font-heading font-extrabold text-slate-900">{title}</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">{selected.size > 0 ? `${selected.size} selected` : 'Click to select an image from your Media Library'}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"><X className="w-4 h-4" /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 px-5 shrink-0">
          <button onClick={() => setTab('library')} className={`py-2.5 px-1 mr-4 text-xs font-bold border-b-2 transition-colors ${tab === 'library' ? 'border-emerald-700 text-emerald-800' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Media Library</button>
          <button onClick={() => setTab('upload')} className={`py-2.5 px-1 text-xs font-bold border-b-2 transition-colors ${tab === 'upload' ? 'border-emerald-700 text-emerald-800' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Upload New</button>
        </div>

        {/* Library Tab */}
        {tab === 'library' && (
          <>
            <div className="px-4 pt-3 pb-2 shrink-0">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input type="search" placeholder="Search media by name or alt text..." value={searchQ} onChange={e => setSearchQ(e.target.value)} className="w-full bg-slate-50 text-xs text-slate-900 rounded-xl pl-8 pr-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-600" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {loading && <div className="flex justify-center py-12"><Loader2 className="w-7 h-7 text-emerald-700 animate-spin" /></div>}

              {!loading && filtered.length === 0 && (
                <div className="text-center py-12">
                  <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-semibold">No media found. Upload some images first.</p>
                </div>
              )}

              {!loading && filtered.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                  {filtered.map(item => (
                    <button
                      key={item.id}
                      onClick={() => toggleSelect(item.id)}
                      className={`relative group rounded-xl overflow-hidden border-2 transition-all aspect-square bg-slate-100 ${selected.has(item.id) ? 'border-emerald-500 ring-2 ring-emerald-400' : 'border-transparent hover:border-slate-300'}`}
                    >
                      <img src={item.url} alt={item.alt_text || item.original_name} className="w-full h-full object-cover" loading="lazy" />
                      {selected.has(item.id) && (
                        <div className="absolute inset-0 bg-emerald-700/30 flex items-center justify-center">
                          <div className="w-6 h-6 bg-emerald-700 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/70 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-[9px] text-white font-semibold truncate">{item.original_name}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Upload Tab */}
        {tab === 'upload' && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-slate-300 rounded-2xl p-10 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/40 transition-all"
            >
              {uploading
                ? <div className="flex flex-col items-center gap-2"><Loader2 className="w-8 h-8 text-emerald-700 animate-spin" /><p className="text-sm font-bold text-emerald-800">Uploading to Cloudinary…</p></div>
                : <><UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-3" /><p className="text-sm font-semibold text-slate-600">Click or drag & drop to upload</p><p className="text-xs text-slate-400 mt-1">PNG, JPG, WebP, GIF up to 10MB</p></>
              }
            </div>
            <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-200 shrink-0">
          <p className="text-[11px] text-slate-500">{filtered.length} files · Cloudinary CDN</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleConfirm} disabled={selected.size === 0}>
              {multiple ? `Insert ${selected.size} Image${selected.size !== 1 ? 's' : ''}` : 'Insert Image'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useCallback } from 'react';
import {
  Tag, Building2, Layers, Plus, Edit3, Trash2, Copy, Star, StarOff,
  Globe, Phone, Mail, MapPin, CheckCircle2, AlertCircle, Search,
  ToggleLeft, ToggleRight, ExternalLink, Grid3X3, List, Loader2,
  ChevronDown, Zap, Clock, TrendingUp, Package, BarChart3
} from 'lucide-react';
import { Button } from '../shared/components/ui/Button';
import { Input } from '../shared/components/ui/Input';
import { Modal } from '../shared/components/ui/Modal';
import { Badge } from '../shared/components/ui/Badge';
import { MediaPickerModal } from '../components/MediaPickerModal';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Brand {
  id: string; name: string; slug: string; description: string; logo_url: string;
  banner_url: string; website: string; country: string; status: string;
  is_featured: number; product_count: number; meta_title: string;
  meta_description: string; created_at: string;
}
interface Manufacturer {
  id: string; name: string; contact_name: string; email: string; phone: string;
  website: string; country: string; address: string; logo_url: string;
  description: string; status: string; product_count: number; created_at: string;
}
interface Collection {
  id: string; name: string; slug: string; type: string; description: string;
  thumbnail_url: string; banner_url: string; status: string; is_featured: number;
  display_order: number; product_count: number; rules: string; publish_at: string | null;
  expires_at: string | null; meta_title: string; meta_description: string; created_at: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const COLLECTION_TYPES = ['manual', 'automatic'] as const;
const COLLECTION_RULE_FIELDS = ['brand', 'category', 'price_min', 'price_max', 'tags', 'rating', 'stock_status', 'is_featured', 'created_within_days'];
const RULE_OPERATORS: Record<string, string[]> = {
  brand: ['is', 'is_not'], category: ['is', 'is_not'], tags: ['contains', 'not_contains'],
  stock_status: ['is'], is_featured: ['is'], price_min: ['greater_than'], price_max: ['less_than'],
  rating: ['greater_than', 'less_than'], created_within_days: ['within_days'],
};

function toSlug(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

// ─── Brand Form ───────────────────────────────────────────────────────────────
const emptyBrand = (): Partial<Brand> => ({ name: '', slug: '', description: '', logo_url: '', banner_url: '', website: '', country: 'India', status: 'active', is_featured: 0, meta_title: '', meta_description: '' });

// ─── Main Component ───────────────────────────────────────────────────────────
export const BrandsView: React.FC = () => {
  const [section, setSection] = useState<'brands' | 'manufacturers' | 'collections'>('brands');
  const [brands, setBrands] = useState<Brand[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQ, setSearchQ] = useState('');
  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null);

  // Brand modal state
  const [brandModal, setBrandModal] = useState(false);
  const [brandForm, setBrandForm] = useState<Partial<Brand>>(emptyBrand());
  const [editingBrandId, setEditingBrandId] = useState<string | null>(null);
  const [brandLogoPickerOpen, setBrandLogoPickerOpen] = useState(false);

  // Manufacturer modal state
  const [mfgModal, setMfgModal] = useState(false);
  const [mfgForm, setMfgForm] = useState<Partial<Manufacturer>>({ name: '', contact_name: '', email: '', phone: '', website: '', country: 'India', address: '', logo_url: '', description: '', status: 'active' });
  const [editingMfgId, setEditingMfgId] = useState<string | null>(null);

  // Collection modal state
  const [colModal, setColModal] = useState(false);
  const [colForm, setColForm] = useState<Partial<Collection & { rulesArr: any[] }>>({ name: '', slug: '', type: 'manual', description: '', thumbnail_url: '', banner_url: '', status: 'active', is_featured: 0, display_order: 0, meta_title: '', meta_description: '', rulesArr: [] });
  const [editingColId, setEditingColId] = useState<string | null>(null);
  const [colThumbPickerOpen, setColThumbPickerOpen] = useState(false);
  const [seoTab, setSeoTab] = useState(false);

  const showNotice = (text: string, error = false) => { setNotice({ text, error }); setTimeout(() => setNotice(null), 4000); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [bRes, mRes, cRes]: [any, any, any] = await Promise.all([
        fetch('/api/brands').then(r => r.json()),
        fetch('/api/manufacturers').then(r => r.json()),
        fetch('/api/collections').then(r => r.json()),
      ]);
      if (bRes.success) setBrands(bRes.brands);
      if (mRes.success) setManufacturers(mRes.manufacturers);
      if (cRes.success) setCollections(cRes.collections);
    } catch {
      // Fallback mock
      setBrands([
        { id: 'b1', name: 'Himalaya Herbals', slug: 'himalaya-herbals', description: "India's leading herbal brand since 1930", logo_url: 'https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=80&h=80&fit=crop', banner_url: '', website: 'https://himalayawellness.in', country: 'India', status: 'active', is_featured: 1, product_count: 12, meta_title: '', meta_description: '', created_at: '2026-01-10T10:00:00Z' },
        { id: 'b2', name: 'Organic India', slug: 'organic-india', description: 'Pure & certified organic ayurvedic products', logo_url: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=80&h=80&fit=crop', banner_url: '', website: 'https://organicindia.com', country: 'India', status: 'active', is_featured: 1, product_count: 8, meta_title: '', meta_description: '', created_at: '2026-01-15T10:00:00Z' },
        { id: 'b3', name: 'Patanjali Ayurved', slug: 'patanjali-ayurved', description: 'Natural ayurvedic products', logo_url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=80&h=80&fit=crop', banner_url: '', website: 'https://patanjaliayurved.net', country: 'India', status: 'active', is_featured: 0, product_count: 15, meta_title: '', meta_description: '', created_at: '2026-02-01T10:00:00Z' },
        { id: 'b4', name: 'Healthy Monks', slug: 'healthy-monks', description: 'Our in-house wellness collection', logo_url: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=80&h=80&fit=crop', banner_url: '', website: 'https://healthymonks.in', country: 'India', status: 'active', is_featured: 1, product_count: 6, meta_title: '', meta_description: '', created_at: '2026-02-15T10:00:00Z' },
      ]);
      setManufacturers([
        { id: 'mfg1', name: 'Arya Vaidya Pharmacy', contact_name: 'Dr. Suresh Sharma', email: 'contact@avp.in', phone: '+91 422 435 8258', website: 'https://avpayurveda.com', country: 'India', address: 'Coimbatore, Tamil Nadu', logo_url: '', description: 'One of the oldest Ayurvedic pharmacies, founded 1943.', status: 'active', product_count: 4, created_at: '2026-01-10T10:00:00Z' },
        { id: 'mfg2', name: 'Dabur India Ltd.', contact_name: 'Rahul Garg', email: 'consumer@dabur.com', phone: '+91 11 2323 9200', website: 'https://dabur.com', country: 'India', address: 'Ghaziabad, Uttar Pradesh', logo_url: '', description: "India's leading Ayurveda FMCG company.", status: 'active', product_count: 7, created_at: '2026-01-20T10:00:00Z' },
        { id: 'mfg3', name: 'Nagarjuna Herbal', contact_name: 'Priya Nair', email: 'info@nagarjunaherbal.com', phone: '+91 484 266 9400', website: 'https://nagarjunaherbal.com', country: 'India', address: 'Kochi, Kerala', logo_url: '', description: 'Classical Ayurvedic formulations from Kerala.', status: 'active', product_count: 3, created_at: '2026-02-01T10:00:00Z' },
      ]);
      setCollections([
        { id: 'col1', name: 'New Arrivals', slug: 'new-arrivals', type: 'automatic', description: 'Freshly added products', thumbnail_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400', banner_url: '', status: 'active', is_featured: 1, display_order: 1, product_count: 8, rules: '[]', publish_at: null, expires_at: null, meta_title: '', meta_description: '', created_at: '2026-07-01T10:00:00Z' },
        { id: 'col2', name: 'Best Sellers', slug: 'best-sellers', type: 'automatic', description: 'Most popular products', thumbnail_url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400', banner_url: '', status: 'active', is_featured: 1, display_order: 2, product_count: 12, rules: '[]', publish_at: null, expires_at: null, meta_title: '', meta_description: '', created_at: '2026-07-01T10:00:00Z' },
        { id: 'col3', name: 'Immunity Boosters', slug: 'immunity-boosters', type: 'manual', description: 'Curated immunity products', thumbnail_url: 'https://images.unsplash.com/photo-1612151855475-877969f4a6cc?w=400', banner_url: '', status: 'active', is_featured: 1, display_order: 3, product_count: 6, rules: '[]', publish_at: null, expires_at: null, meta_title: '', meta_description: '', created_at: '2026-07-05T10:00:00Z' },
        { id: 'col4', name: 'Flash Sale', slug: 'flash-sale', type: 'manual', description: '⚡ Up to 40% off!', thumbnail_url: 'https://images.unsplash.com/photo-1596543805442-2ad43b978248?w=400', banner_url: '', status: 'active', is_featured: 1, display_order: 4, product_count: 5, rules: '[]', publish_at: '2026-07-27T00:00:00Z', expires_at: '2026-07-31T23:59:59Z', meta_title: '', meta_description: '', created_at: '2026-07-25T10:00:00Z' },
        { id: 'col5', name: 'Premium Adaptogens', slug: 'premium-adaptogens', type: 'manual', description: 'Elite adaptogenic herbs', thumbnail_url: 'https://images.unsplash.com/photo-1609501676725-7186f017a4b7?w=400', banner_url: '', status: 'active', is_featured: 0, display_order: 5, product_count: 4, rules: '[]', publish_at: null, expires_at: null, meta_title: '', meta_description: '', created_at: '2026-07-10T10:00:00Z' },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Brand CRUD ────────────────────────────────────────────────────────────
  const openNewBrand = () => { setBrandForm(emptyBrand()); setEditingBrandId(null); setBrandModal(true); };
  const openEditBrand = (b: Brand) => { setBrandForm({ ...b }); setEditingBrandId(b.id); setBrandModal(true); };

  const saveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingBrandId ? 'PUT' : 'POST';
    const url = editingBrandId ? `/api/brands/${editingBrandId}` : '/api/brands';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(brandForm) }).catch(() => {});
    showNotice(editingBrandId ? 'Brand updated' : `Brand "${brandForm.name}" created`);
    setBrandModal(false);
    load();
  };

  const deleteBrand = async (id: string) => {
    await fetch(`/api/brands/${id}`, { method: 'DELETE' }).catch(() => {});
    showNotice('Brand deleted'); load();
  };

  const duplicateBrand = async (id: string) => {
    await fetch(`/api/brands/${id}/duplicate`, { method: 'POST' }).catch(() => {});
    showNotice('Brand duplicated'); load();
  };

  const toggleFeaturedBrand = async (b: Brand) => {
    await fetch(`/api/brands/${b.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_featured: b.is_featured ? 0 : 1 }) }).catch(() => {});
    load();
  };

  // ── Manufacturer CRUD ─────────────────────────────────────────────────────
  const openNewMfg = () => { setMfgForm({ name: '', contact_name: '', email: '', phone: '', website: '', country: 'India', address: '', logo_url: '', description: '', status: 'active' }); setEditingMfgId(null); setMfgModal(true); };
  const openEditMfg = (m: Manufacturer) => { setMfgForm({ ...m }); setEditingMfgId(m.id); setMfgModal(true); };
  const saveMfg = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingMfgId ? 'PUT' : 'POST';
    const url = editingMfgId ? `/api/manufacturers/${editingMfgId}` : '/api/manufacturers';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(mfgForm) }).catch(() => {});
    showNotice(editingMfgId ? 'Manufacturer updated' : 'Manufacturer created');
    setMfgModal(false); load();
  };
  const deleteMfg = async (id: string) => {
    await fetch(`/api/manufacturers/${id}`, { method: 'DELETE' }).catch(() => {});
    showNotice('Manufacturer deleted'); load();
  };

  // ── Collection CRUD ───────────────────────────────────────────────────────
  const openNewCol = () => { setColForm({ name: '', slug: '', type: 'manual', description: '', thumbnail_url: '', banner_url: '', status: 'active', is_featured: 0, display_order: 0, meta_title: '', meta_description: '', rulesArr: [] }); setEditingColId(null); setColModal(true); setSeoTab(false); };
  const openEditCol = (col: Collection) => {
    let rulesArr: any[] = [];
    try { rulesArr = JSON.parse(col.rules || '[]'); } catch {}
    setColForm({ ...col, rulesArr });
    setEditingColId(col.id);
    setColModal(true);
    setSeoTab(false);
  };
  const saveCol = async (e: React.FormEvent) => {
    e.preventDefault();
    const { rulesArr, ...rest } = colForm as any;
    const method = editingColId ? 'PUT' : 'POST';
    const url = editingColId ? `/api/collections/${editingColId}` : '/api/collections';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...rest, rules: rulesArr }) }).catch(() => {});
    showNotice(editingColId ? 'Collection updated' : `Collection "${colForm.name}" created`);
    setColModal(false); load();
  };
  const deleteCol = async (id: string) => {
    await fetch(`/api/collections/${id}`, { method: 'DELETE' }).catch(() => {});
    showNotice('Collection deleted'); load();
  };

  const addRule = () => setColForm(f => ({ ...f, rulesArr: [...(f.rulesArr || []), { field: 'brand', operator: 'is', value: '' }] }));
  const updateRule = (i: number, key: string, val: string) => {
    const arr = [...(colForm.rulesArr || [])];
    arr[i] = { ...arr[i], [key]: val };
    setColForm(f => ({ ...f, rulesArr: arr }));
  };
  const removeRule = (i: number) => setColForm(f => ({ ...f, rulesArr: (f.rulesArr || []).filter((_, idx) => idx !== i) }));

  // ── Filter ────────────────────────────────────────────────────────────────
  const filteredBrands = brands.filter(b => !searchQ || b.name.toLowerCase().includes(searchQ.toLowerCase()));
  const filteredMfgs = manufacturers.filter(m => !searchQ || m.name.toLowerCase().includes(searchQ.toLowerCase()));
  const filteredCols = collections.filter(c => !searchQ || c.name.toLowerCase().includes(searchQ.toLowerCase()));

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = [
    { label: 'Total Brands', value: brands.length, icon: Tag, color: 'bg-violet-100 text-violet-700' },
    { label: 'Featured Brands', value: brands.filter(b => b.is_featured).length, icon: Star, color: 'bg-amber-100 text-amber-700' },
    { label: 'Manufacturers', value: manufacturers.length, icon: Building2, color: 'bg-blue-100 text-blue-700' },
    { label: 'Collections', value: collections.length, icon: Layers, color: 'bg-emerald-100 text-emerald-700' },
  ];

  const collectionTypeIcon = (type: string) => {
    if (type === 'automatic') return <Zap className="w-3 h-3 text-amber-600" />;
    return <Layers className="w-3 h-3 text-blue-600" />;
  };

  return (
    <div className="space-y-5 pb-12 animate-fade-in">
      {/* Notice */}
      {notice && (
        <div className={`px-4 py-3 rounded-xl flex items-center gap-2 text-xs font-semibold border ${notice.error ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
          {notice.error ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
          {notice.text}
        </div>
      )}

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="wp-card p-5 rounded-2xl bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-extrabold text-slate-900">Brands, Manufacturers & Collections</h1>
          <p className="text-[11px] text-slate-500 mt-0.5">{brands.length} brands · {manufacturers.length} manufacturers · {collections.length} collections</p>
        </div>
        <div className="flex items-center gap-2">
          {section === 'brands' && <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={openNewBrand}>New Brand</Button>}
          {section === 'manufacturers' && <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={openNewMfg}>New Manufacturer</Button>}
          {section === 'collections' && <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={openNewCol}>New Collection</Button>}
        </div>
      </div>

      {/* ── Stats ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(s => (
          <div key={s.label} className="wp-card bg-white p-4 rounded-2xl flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.color}`}><s.icon className="w-4 h-4" /></div>
            <div><p className="text-xl font-extrabold text-slate-900">{s.value}</p><p className="text-[11px] text-slate-500">{s.label}</p></div>
          </div>
        ))}
      </div>

      {/* ── Section Tabs + Toolbar ───────────────────────────────────────── */}
      <div className="wp-card bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center border-b border-slate-200 px-4 gap-1">
          {(['brands', 'manufacturers', 'collections'] as const).map(s => (
            <button key={s} onClick={() => { setSection(s); setSearchQ(''); }} className={`py-3 px-3 text-xs font-bold capitalize border-b-2 transition-colors ${section === s ? 'border-emerald-700 text-emerald-800' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
              {s === 'brands' ? <><Tag className="w-3.5 h-3.5 inline mr-1" />Brands</> : s === 'manufacturers' ? <><Building2 className="w-3.5 h-3.5 inline mr-1" />Manufacturers</> : <><Layers className="w-3.5 h-3.5 inline mr-1" />Collections</>}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2 py-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input type="search" placeholder={`Search ${section}…`} value={searchQ} onChange={e => setSearchQ(e.target.value)} className="bg-slate-50 text-xs text-slate-900 rounded-lg pl-8 pr-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-600 w-44" />
            </div>
            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
              <button onClick={() => setViewMode('grid')} className={`p-1.5 ${viewMode === 'grid' ? 'bg-emerald-700 text-white' : 'text-slate-500 hover:bg-slate-100'}`}><Grid3X3 className="w-3.5 h-3.5" /></button>
              <button onClick={() => setViewMode('list')} className={`p-1.5 ${viewMode === 'list' ? 'bg-emerald-700 text-white' : 'text-slate-500 hover:bg-slate-100'}`}><List className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        </div>

        <div className="p-4">
          {loading && <div className="flex justify-center py-12"><Loader2 className="w-7 h-7 text-emerald-700 animate-spin" /></div>}

          {/* ── BRANDS ──────────────────────────────────────────────────── */}
          {!loading && section === 'brands' && (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredBrands.map(b => (
                  <div key={b.id} className="group border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition-all bg-white">
                    {/* Logo */}
                    <div className="h-24 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center relative">
                      {b.logo_url
                        ? <img src={b.logo_url} alt={b.name} className="h-16 w-16 rounded-xl object-cover shadow-sm" />
                        : <Tag className="w-8 h-8 text-slate-400" />
                      }
                      <div className="absolute top-2 right-2 flex gap-1">
                        {b.is_featured ? <span className="bg-amber-400 text-amber-900 text-[9px] font-bold px-1.5 py-0.5 rounded-full">Featured</span> : null}
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${b.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>{b.status}</span>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="font-bold text-slate-900 text-sm truncate">{b.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{b.description}</p>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                        <Package className="w-3 h-3" />{b.product_count || 0} products
                        {b.website && <><Globe className="w-3 h-3 ml-2" />{b.country}</>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 border-t border-slate-100 px-3 py-2">
                      <button onClick={() => toggleFeaturedBrand(b)} className="p-1 rounded hover:bg-amber-50">{b.is_featured ? <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" /> : <StarOff className="w-3.5 h-3.5 text-slate-400" />}</button>
                      <button onClick={() => openEditBrand(b)} className="p-1 rounded hover:bg-slate-100 text-slate-600"><Edit3 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => duplicateBrand(b.id)} className="p-1 rounded hover:bg-slate-100 text-slate-600"><Copy className="w-3.5 h-3.5" /></button>
                      <button onClick={() => deleteBrand(b.id)} className="p-1 rounded hover:bg-red-50 text-red-500 ml-auto"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}
                <button onClick={openNewBrand} className="border-2 border-dashed border-slate-200 rounded-2xl h-48 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-emerald-400 hover:text-emerald-600 transition-all hover:bg-emerald-50/30">
                  <Plus className="w-8 h-8" /><span className="text-xs font-bold">Add Brand</span>
                </button>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 font-bold uppercase text-slate-900 border-b border-slate-200">
                  <tr><th className="p-3">Brand</th><th className="p-3">Country</th><th className="p-3">Products</th><th className="p-3">Status</th><th className="p-3">Featured</th><th className="p-3">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredBrands.map(b => (
                    <tr key={b.id} className="hover:bg-slate-50">
                      <td className="p-3 flex items-center gap-2">
                        {b.logo_url ? <img src={b.logo_url} alt={b.name} className="w-8 h-8 rounded-lg object-cover" /> : <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center"><Tag className="w-4 h-4 text-slate-400" /></div>}
                        <div><p className="font-bold text-slate-900">{b.name}</p><p className="text-[10px] text-slate-400">{b.slug}</p></div>
                      </td>
                      <td className="p-3">{b.country}</td>
                      <td className="p-3 font-mono">{b.product_count || 0}</td>
                      <td className="p-3"><Badge status={b.status === 'active' ? 'active' : 'inactive'} label={b.status} /></td>
                      <td className="p-3">{b.is_featured ? <Star className="w-4 h-4 text-amber-500 fill-amber-400" /> : '—'}</td>
                      <td className="p-3 flex gap-1">
                        <button onClick={() => openEditBrand(b)} className="p-1 rounded hover:bg-slate-100 text-slate-600"><Edit3 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => duplicateBrand(b.id)} className="p-1 rounded hover:bg-slate-100 text-slate-600"><Copy className="w-3.5 h-3.5" /></button>
                        <button onClick={() => deleteBrand(b.id)} className="p-1 rounded hover:bg-red-50 text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}

          {/* ── MANUFACTURERS ────────────────────────────────────────────── */}
          {!loading && section === 'manufacturers' && (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMfgs.map(m => (
                  <div key={m.id} className="border border-slate-200 rounded-2xl p-4 hover:shadow-md transition-all bg-white">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0"><Building2 className="w-6 h-6 text-blue-600" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 truncate">{m.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{m.contact_name}</p>
                        <Badge status={m.status === 'active' ? 'active' : 'inactive'} label={m.status} />
                      </div>
                    </div>
                    <div className="mt-3 space-y-1 text-[11px] text-slate-500">
                      {m.email && <div className="flex items-center gap-1.5"><Mail className="w-3 h-3" />{m.email}</div>}
                      {m.phone && <div className="flex items-center gap-1.5"><Phone className="w-3 h-3" />{m.phone}</div>}
                      {m.address && <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3" />{m.address}</div>}
                      {m.website && <div className="flex items-center gap-1.5"><Globe className="w-3 h-3" /><a href={m.website} target="_blank" rel="noreferrer" className="text-emerald-700 hover:underline truncate">{m.website}</a></div>}
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                      <span className="text-[11px] text-slate-400 flex items-center gap-1"><Package className="w-3 h-3" />{m.product_count || 0} products</span>
                      <div className="flex gap-1">
                        <button onClick={() => openEditMfg(m)} className="p-1 rounded hover:bg-slate-100 text-slate-600"><Edit3 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => deleteMfg(m.id)} className="p-1 rounded hover:bg-red-50 text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={openNewMfg} className="border-2 border-dashed border-slate-200 rounded-2xl min-h-48 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-blue-400 hover:text-blue-600 transition-all hover:bg-blue-50/30">
                  <Plus className="w-8 h-8" /><span className="text-xs font-bold">Add Manufacturer</span>
                </button>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 font-bold uppercase text-slate-900 border-b border-slate-200">
                  <tr><th className="p-3">Manufacturer</th><th className="p-3">Contact</th><th className="p-3">Country</th><th className="p-3">Products</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredMfgs.map(m => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="p-3"><p className="font-bold text-slate-900">{m.name}</p><p className="text-[10px] text-slate-400">{m.website}</p></td>
                      <td className="p-3"><p>{m.contact_name}</p><p className="text-[10px] text-slate-400">{m.email}</p></td>
                      <td className="p-3">{m.country}</td>
                      <td className="p-3 font-mono">{m.product_count || 0}</td>
                      <td className="p-3"><Badge status={m.status === 'active' ? 'active' : 'inactive'} label={m.status} /></td>
                      <td className="p-3 flex gap-1">
                        <button onClick={() => openEditMfg(m)} className="p-1 rounded hover:bg-slate-100 text-slate-600"><Edit3 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => deleteMfg(m.id)} className="p-1 rounded hover:bg-red-50 text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}

          {/* ── COLLECTIONS ──────────────────────────────────────────────── */}
          {!loading && section === 'collections' && (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCols.map(col => (
                  <div key={col.id} className="group border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition-all bg-white">
                    <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden">
                      {col.thumbnail_url && <img src={col.thumbnail_url} alt={col.name} className="w-full h-full object-cover" />}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                      <div className="absolute top-2 left-2 flex gap-1">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${col.type === 'automatic' ? 'bg-amber-400 text-amber-900' : 'bg-blue-100 text-blue-800'}`}>
                          {collectionTypeIcon(col.type)}{col.type}
                        </span>
                        {col.is_featured ? <span className="bg-white/90 text-amber-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full">Featured</span> : null}
                      </div>
                      <div className="absolute top-2 right-2">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${col.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>{col.status}</span>
                      </div>
                      <p className="absolute bottom-2 left-3 font-heading font-extrabold text-white text-sm">{col.name}</p>
                    </div>
                    <div className="p-3">
                      <p className="text-[11px] text-slate-500 line-clamp-2">{col.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1"><Package className="w-3 h-3" />{col.product_count || 0} products</span>
                        {col.expires_at && <span className="flex items-center gap-1 text-red-500"><Clock className="w-3 h-3" />Expires {new Date(col.expires_at).toLocaleDateString('en-IN')}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 border-t border-slate-100 px-3 py-2">
                      <button onClick={() => openEditCol(col)} className="p-1 rounded hover:bg-slate-100 text-slate-600"><Edit3 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => deleteCol(col.id)} className="p-1 rounded hover:bg-red-50 text-red-500 ml-auto"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}
                <button onClick={openNewCol} className="border-2 border-dashed border-slate-200 rounded-2xl min-h-48 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-emerald-400 hover:text-emerald-600 transition-all hover:bg-emerald-50/30">
                  <Plus className="w-8 h-8" /><span className="text-xs font-bold">New Collection</span>
                </button>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 font-bold uppercase text-slate-900 border-b border-slate-200">
                  <tr><th className="p-3">Collection</th><th className="p-3">Type</th><th className="p-3">Products</th><th className="p-3">Status</th><th className="p-3">Expires</th><th className="p-3">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredCols.map(col => (
                    <tr key={col.id} className="hover:bg-slate-50">
                      <td className="p-3 flex items-center gap-2">
                        {col.thumbnail_url && <img src={col.thumbnail_url} alt={col.name} className="w-10 h-10 rounded-lg object-cover" />}
                        <div><p className="font-bold text-slate-900">{col.name}</p><p className="text-[10px] text-slate-400">{col.slug}</p></div>
                      </td>
                      <td className="p-3 flex items-center gap-1">{collectionTypeIcon(col.type)}{col.type}</td>
                      <td className="p-3 font-mono">{col.product_count || 0}</td>
                      <td className="p-3"><Badge status={col.status === 'active' ? 'active' : 'inactive'} label={col.status} /></td>
                      <td className="p-3 text-slate-400">{col.expires_at ? new Date(col.expires_at).toLocaleDateString('en-IN') : '—'}</td>
                      <td className="p-3 flex gap-1">
                        <button onClick={() => openEditCol(col)} className="p-1 rounded hover:bg-slate-100 text-slate-600"><Edit3 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => deleteCol(col.id)} className="p-1 rounded hover:bg-red-50 text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}
        </div>
      </div>

      {/* ── Brand Modal ──────────────────────────────────────────────────── */}
      <Modal isOpen={brandModal} onClose={() => setBrandModal(false)} title={editingBrandId ? 'Edit Brand' : 'Create New Brand'}>
        <form onSubmit={saveBrand} className="space-y-4 text-xs">
          {/* Logo */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Brand Logo</label>
            <div className="flex items-center gap-3">
              {brandForm.logo_url
                ? <img src={brandForm.logo_url} alt="logo" className="w-14 h-14 rounded-xl object-cover border border-slate-200" />
                : <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center"><Tag className="w-6 h-6 text-slate-400" /></div>
              }
              <Button type="button" variant="outline" size="sm" onClick={() => setBrandLogoPickerOpen(true)}>Pick from Media Library</Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Brand Name *" required value={brandForm.name || ''} onChange={e => setBrandForm(f => ({ ...f, name: e.target.value, slug: f.slug || toSlug(e.target.value) }))} />
            <Input label="Slug" value={brandForm.slug || ''} onChange={e => setBrandForm(f => ({ ...f, slug: toSlug(e.target.value) }))} />
          </div>
          <div><label className="block font-semibold text-slate-700 mb-1">Description</label><textarea rows={3} value={brandForm.description || ''} onChange={e => setBrandForm(f => ({ ...f, description: e.target.value }))} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700 text-xs resize-none" /></div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Website" type="url" value={brandForm.website || ''} onChange={e => setBrandForm(f => ({ ...f, website: e.target.value }))} />
            <Input label="Country" value={brandForm.country || ''} onChange={e => setBrandForm(f => ({ ...f, country: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block font-semibold text-slate-700 mb-1">Status</label>
              <select value={brandForm.status || 'active'} onChange={e => setBrandForm(f => ({ ...f, status: e.target.value }))} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700 text-xs">
                <option value="active">Active</option><option value="draft">Draft</option><option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pt-4"><input type="checkbox" id="brand-featured" checked={!!brandForm.is_featured} onChange={e => setBrandForm(f => ({ ...f, is_featured: e.target.checked ? 1 : 0 }))} className="rounded" /><label htmlFor="brand-featured" className="font-semibold text-slate-700">Featured Brand</label></div>
          </div>
          {/* SEO */}
          <div className="border border-slate-200 rounded-xl p-3 space-y-2">
            <p className="font-bold text-slate-700 text-[11px] uppercase">SEO Metadata</p>
            <Input label="Meta Title" value={brandForm.meta_title || ''} onChange={e => setBrandForm(f => ({ ...f, meta_title: e.target.value }))} />
            <div><label className="block font-semibold text-slate-700 mb-1">Meta Description</label><textarea rows={2} value={brandForm.meta_description || ''} onChange={e => setBrandForm(f => ({ ...f, meta_description: e.target.value }))} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700 text-xs resize-none" /></div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setBrandModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm">{editingBrandId ? 'Update Brand' : 'Create Brand'}</Button>
          </div>
        </form>
      </Modal>

      {/* ── Manufacturer Modal ───────────────────────────────────────────── */}
      <Modal isOpen={mfgModal} onClose={() => setMfgModal(false)} title={editingMfgId ? 'Edit Manufacturer' : 'New Manufacturer'}>
        <form onSubmit={saveMfg} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Company Name *" required value={mfgForm.name || ''} onChange={e => setMfgForm(f => ({ ...f, name: e.target.value }))} />
            <Input label="Contact Person" value={mfgForm.contact_name || ''} onChange={e => setMfgForm(f => ({ ...f, contact_name: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Email" type="email" value={mfgForm.email || ''} onChange={e => setMfgForm(f => ({ ...f, email: e.target.value }))} />
            <Input label="Phone" value={mfgForm.phone || ''} onChange={e => setMfgForm(f => ({ ...f, phone: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Website" type="url" value={mfgForm.website || ''} onChange={e => setMfgForm(f => ({ ...f, website: e.target.value }))} />
            <Input label="Country" value={mfgForm.country || ''} onChange={e => setMfgForm(f => ({ ...f, country: e.target.value }))} />
          </div>
          <div><label className="block font-semibold text-slate-700 mb-1">Address</label><textarea rows={2} value={mfgForm.address || ''} onChange={e => setMfgForm(f => ({ ...f, address: e.target.value }))} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700 text-xs resize-none" /></div>
          <div><label className="block font-semibold text-slate-700 mb-1">Description</label><textarea rows={2} value={mfgForm.description || ''} onChange={e => setMfgForm(f => ({ ...f, description: e.target.value }))} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700 text-xs resize-none" /></div>
          <div><label className="block font-semibold text-slate-700 mb-1">Status</label>
            <select value={mfgForm.status || 'active'} onChange={e => setMfgForm(f => ({ ...f, status: e.target.value }))} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700 text-xs">
              <option value="active">Active</option><option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setMfgModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm">{editingMfgId ? 'Update' : 'Create'} Manufacturer</Button>
          </div>
        </form>
      </Modal>

      {/* ── Collection Modal ─────────────────────────────────────────────── */}
      <Modal isOpen={colModal} onClose={() => setColModal(false)} title={editingColId ? 'Edit Collection' : 'New Collection'}>
        <form onSubmit={saveCol} className="space-y-4 text-xs">
          {/* Tabs */}
          <div className="flex border-b border-slate-200 mb-2">
            <button type="button" onClick={() => setSeoTab(false)} className={`py-2 px-3 text-xs font-bold border-b-2 transition-colors ${!seoTab ? 'border-emerald-700 text-emerald-800' : 'border-transparent text-slate-500'}`}>General</button>
            <button type="button" onClick={() => setSeoTab(true)} className={`py-2 px-3 text-xs font-bold border-b-2 transition-colors ${seoTab ? 'border-emerald-700 text-emerald-800' : 'border-transparent text-slate-500'}`}>SEO</button>
          </div>

          {!seoTab ? (
            <>
              {/* Thumbnail */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Collection Thumbnail</label>
                <div className="flex items-center gap-3">
                  {colForm.thumbnail_url ? <img src={colForm.thumbnail_url} alt="thumb" className="w-16 h-16 rounded-xl object-cover border border-slate-200" /> : <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center"><Layers className="w-6 h-6 text-slate-400" /></div>}
                  <Button type="button" variant="outline" size="sm" onClick={() => setColThumbPickerOpen(true)}>Pick from Library</Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Collection Name *" required value={colForm.name || ''} onChange={e => setColForm(f => ({ ...f, name: e.target.value, slug: f.slug || toSlug(e.target.value) }))} />
                <Input label="Slug" value={colForm.slug || ''} onChange={e => setColForm(f => ({ ...f, slug: toSlug(e.target.value) }))} />
              </div>
              <div><label className="block font-semibold text-slate-700 mb-1">Description</label><textarea rows={2} value={colForm.description || ''} onChange={e => setColForm(f => ({ ...f, description: e.target.value }))} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700 text-xs resize-none" /></div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="block font-semibold text-slate-700 mb-1">Type</label>
                  <select value={colForm.type || 'manual'} onChange={e => setColForm(f => ({ ...f, type: e.target.value }))} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700 text-xs">
                    <option value="manual">Manual</option><option value="automatic">Automatic</option>
                  </select>
                </div>
                <div><label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select value={colForm.status || 'active'} onChange={e => setColForm(f => ({ ...f, status: e.target.value }))} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700 text-xs">
                    <option value="active">Active</option><option value="draft">Draft</option><option value="inactive">Inactive</option>
                  </select>
                </div>
                <Input label="Display Order" type="number" value={String(colForm.display_order || 0)} onChange={e => setColForm(f => ({ ...f, display_order: parseInt(e.target.value) || 0 }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Publish Date" type="datetime-local" value={colForm.publish_at?.slice(0, 16) || ''} onChange={e => setColForm(f => ({ ...f, publish_at: e.target.value || null }))} />
                <Input label="Expiry Date" type="datetime-local" value={colForm.expires_at?.slice(0, 16) || ''} onChange={e => setColForm(f => ({ ...f, expires_at: e.target.value || null }))} />
              </div>
              <div className="flex items-center gap-2"><input type="checkbox" id="col-featured" checked={!!colForm.is_featured} onChange={e => setColForm(f => ({ ...f, is_featured: e.target.checked ? 1 : 0 }))} className="rounded" /><label htmlFor="col-featured" className="font-semibold text-slate-700">Featured Collection</label></div>

              {/* Auto Rules */}
              {colForm.type === 'automatic' && (
                <div className="border border-slate-200 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-slate-700 text-[11px] uppercase flex items-center gap-1"><Zap className="w-3 h-3 text-amber-600" />Automatic Rules</p>
                    <Button type="button" variant="outline" size="sm" icon={<Plus className="w-3 h-3" />} onClick={addRule}>Add Rule</Button>
                  </div>
                  {(colForm.rulesArr || []).map((rule, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <select value={rule.field} onChange={e => updateRule(i, 'field', e.target.value)} className="bg-white text-slate-900 rounded-lg px-2 py-1.5 border border-slate-300 focus:outline-none text-xs flex-1">
                        {COLLECTION_RULE_FIELDS.map(f => <option key={f} value={f}>{f.replace(/_/g, ' ')}</option>)}
                      </select>
                      <select value={rule.operator} onChange={e => updateRule(i, 'operator', e.target.value)} className="bg-white text-slate-900 rounded-lg px-2 py-1.5 border border-slate-300 focus:outline-none text-xs flex-1">
                        {(RULE_OPERATORS[rule.field] || ['is']).map(op => <option key={op} value={op}>{op.replace(/_/g, ' ')}</option>)}
                      </select>
                      <input value={rule.value} onChange={e => updateRule(i, 'value', e.target.value)} placeholder="value" className="bg-white text-slate-900 rounded-lg px-2 py-1.5 border border-slate-300 focus:outline-none text-xs flex-1" />
                      <button type="button" onClick={() => removeRule(i)} className="p-1 rounded hover:bg-red-50 text-red-500 shrink-0"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  ))}
                  {(colForm.rulesArr || []).length === 0 && <p className="text-[11px] text-slate-400 text-center py-2">No rules yet. Products will be added manually.</p>}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-3">
              <Input label="Meta Title" value={colForm.meta_title || ''} onChange={e => setColForm(f => ({ ...f, meta_title: e.target.value }))} />
              <div><label className="block font-semibold text-slate-700 mb-1">Meta Description</label><textarea rows={3} value={colForm.meta_description || ''} onChange={e => setColForm(f => ({ ...f, meta_description: e.target.value }))} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700 text-xs resize-none" /></div>
              {(colForm.name || colForm.slug) && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Google Preview</p>
                  <p className="text-blue-700 text-sm font-semibold truncate">{colForm.meta_title || colForm.name}</p>
                  <p className="text-emerald-700 text-[11px]">healthymonks.in/collections/{colForm.slug}</p>
                  <p className="text-slate-600 text-[11px] mt-0.5 line-clamp-2">{colForm.meta_description || colForm.description}</p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setColModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm">{editingColId ? 'Update Collection' : 'Create Collection'}</Button>
          </div>
        </form>
      </Modal>

      {/* Media Pickers */}
      <MediaPickerModal isOpen={brandLogoPickerOpen} onClose={() => setBrandLogoPickerOpen(false)} title="Select Brand Logo" onSelect={url => setBrandForm(f => ({ ...f, logo_url: url }))} />
      <MediaPickerModal isOpen={colThumbPickerOpen} onClose={() => setColThumbPickerOpen(false)} title="Select Collection Thumbnail" onSelect={url => setColForm(f => ({ ...f, thumbnail_url: url }))} />
    </div>
  );
};

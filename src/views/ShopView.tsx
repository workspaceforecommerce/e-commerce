import React, { useState } from 'react';
import { SlidersHorizontal, ArrowUpDown, Filter, Frown, RefreshCw } from 'lucide-react';
import { Category, Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { QuickViewModal } from '../components/QuickViewModal';

interface ShopViewProps {
  categories: Category[];
  products: Product[];
  selectedCategoryId: number | null;
  onSelectCategory: (catId: number | null) => void;
  searchQuery: string;
}

export const ShopView: React.FC<ShopViewProps> = ({
  categories,
  products,
  selectedCategoryId,
  onSelectCategory,
  searchQuery,
}) => {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [sortBy, setSortBy] = useState<'featured' | 'price_low' | 'price_high'>('featured');

  // Filter Products
  let filtered = products.filter((p) => {
    const matchesCat = selectedCategoryId ? p.category_id === selectedCategoryId : true;
    const titleOrName = p.title || p.name || '';
    const desc = p.short_description || '';
    const matchesSearch = searchQuery
      ? titleOrName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        desc.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const pPrice = p.discount_price || p.base_price || p.price || 0;
    const matchesPrice = pPrice <= maxPrice;
    return matchesCat && matchesSearch && matchesPrice;
  });

  // Sort Products
  if (sortBy === 'price_low') {
    filtered.sort((a, b) => ((a.discount_price || a.base_price || a.price || 0) - (b.discount_price || b.base_price || b.price || 0)));
  } else if (sortBy === 'price_high') {
    filtered.sort((a, b) => ((b.discount_price || b.base_price || b.price || 0) - (a.discount_price || a.base_price || a.price || 0)));
  }

  const selectedCategoryName = categories.find((c) => c.id === selectedCategoryId)?.name || 'All Herbal Products';

  return (
    <div className="space-y-6 pb-12">
      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />

      {/* Header Banner */}
      <div className="wp-card p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-emerald-800 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">WooCommerce Shop Catalog</span>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold">{selectedCategoryName}</h1>
          <p className="text-xs text-slate-300">Showing {filtered.length} organic & certified formulations</p>
        </div>

        {selectedCategoryId && (
          <button
            onClick={() => onSelectCategory(null)}
            className="self-start sm:self-auto bg-emerald-900/80 hover:bg-emerald-950 text-white text-xs font-bold px-4 py-2 rounded-xl border border-emerald-600/60 transition-all flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Clear Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
        {/* WooCommerce Filter Sidebar */}
        <aside className="space-y-6">
          <div className="wp-card p-5 sm:p-6 rounded-2xl space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <Filter className="w-5 h-5 text-emerald-700" />
              <h3 className="font-heading font-bold text-base text-slate-900">Filter Products</h3>
            </div>

            {/* Price Filter */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-slate-900">
                <span>Max Price</span>
                <span className="text-emerald-700">₹{maxPrice}</span>
              </div>
              <input
                type="range"
                min="100"
                max="1500"
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-emerald-700 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                <span>₹100</span>
                <span>₹1500</span>
              </div>
            </div>

            {/* Categories Selection */}
            <div className="space-y-2 pt-3 border-t border-slate-200">
              <h4 className="font-heading font-bold text-xs text-slate-900 uppercase">Categories</h4>
              <ul className="space-y-1 text-xs text-slate-700 font-semibold">
                <li>
                  <button
                    onClick={() => onSelectCategory(null)}
                    className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-all ${
                      selectedCategoryId === null ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-100'
                    }`}
                  >
                    <span>All Products</span>
                    <span className="text-[10px]">{products.length}</span>
                  </button>
                </li>
                {categories.map((c) => (
                  <li key={c.id}>
                    <button
                      onClick={() => onSelectCategory(c.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-all ${
                        selectedCategoryId === c.id ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-100'
                      }`}
                    >
                      <span>{c.name}</span>
                      <span className="text-[10px]">{products.filter((p) => p.category_id === c.id).length}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        {/* Product Catalog Grid */}
        <main className="lg:col-span-3 space-y-6">
          {/* Sorting Bar */}
          <div className="wp-card p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-600 font-semibold">
              Showing <strong className="text-slate-900">{filtered.length}</strong> results
            </span>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <ArrowUpDown className="w-4 h-4 text-slate-400" />
              <span className="text-slate-500 font-semibold">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-50 text-slate-900 font-bold px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:border-emerald-700"
              >
                <option value="featured">Featured / Popular</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="wp-card rounded-2xl p-12 text-center space-y-4 bg-white/90 backdrop-blur-xs animate-in fade-in zoom-in-95 duration-300 border border-slate-200 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200/80 shadow-xs">
                <Frown className="w-8 h-8" />
              </div>
              <div className="space-y-1.5 max-w-sm mx-auto">
                <h3 className="font-heading text-lg font-bold text-slate-900">No Products Matched Your Criteria</h3>
                <p className="text-xs text-slate-500 leading-relaxed">We couldn't find any products matching your selected category or price filter.</p>
              </div>
              <button
                onClick={() => {
                  onSelectCategory(null);
                  setMaxPrice(1500);
                }}
                className="inline-flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 active:scale-95 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filtered.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

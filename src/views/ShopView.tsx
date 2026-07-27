import React, { useState } from 'react';
import { Filter, Search, SlidersHorizontal } from 'lucide-react';
import { Category, Product } from '../types';
import { ProductCard } from '../components/ProductCard';

interface ShopViewProps {
  categories: Category[];
  products: Product[];
  selectedCategoryId: number | null;
  onSelectCategory: (id: number | null) => void;
  onSelectProduct: (product: Product) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const ShopView: React.FC<ShopViewProps> = ({
  categories,
  products,
  selectedCategoryId,
  onSelectCategory,
  onSelectProduct,
  searchQuery,
  setSearchQuery,
}) => {
  const [sortBy, setSortBy] = useState<'default' | 'price-low' | 'price-high'>('default');

  let filtered = products;

  if (selectedCategoryId) {
    filtered = filtered.filter((p) => p.category_id === selectedCategoryId);
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (p) => p.title.toLowerCase().includes(q) || p.short_description.toLowerCase().includes(q)
    );
  }

  if (sortBy === 'price-low') {
    filtered = [...filtered].sort((a, b) => (a.discount_price || a.base_price) - (b.discount_price || b.base_price));
  } else if (sortBy === 'price-high') {
    filtered = [...filtered].sort((a, b) => (b.discount_price || b.base_price) - (a.discount_price || a.base_price));
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Shop Header & Filter Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-4 rounded-2xl">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Ayurvedic & Organic Catalog</h1>
          <p className="text-xs text-slate-400">Showing {filtered.length} healthy formulations</p>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 border border-slate-700 focus:outline-none focus:border-emerald-500"
          >
            <option value="default">Sort by: Default</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Category Horizontal Pill Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => onSelectCategory(null)}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            selectedCategoryId === null
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
          }`}
        >
          All Products
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategoryId === cat.id
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      {filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center space-y-3">
          <p className="text-slate-400 text-sm">No products found matching your filter criteria.</p>
          <button
            onClick={() => {
              onSelectCategory(null);
              setSearchQuery('');
            }}
            className="text-xs font-bold text-emerald-400 underline"
          >
            Clear Filters & View All
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} onSelect={onSelectProduct} />
          ))}
        </div>
      )}
    </div>
  );
};

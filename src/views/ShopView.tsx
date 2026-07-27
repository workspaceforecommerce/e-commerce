import React, { useState } from 'react';
import { Filter, Search, SlidersHorizontal, Leaf } from 'lucide-react';
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
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 wp-card p-5 rounded-2xl">
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate-900">Shop Organic Catalog</h1>
          <p className="text-xs text-slate-500">Showing {filtered.length} herbal formulations</p>
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-emerald-700" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white text-slate-800 text-xs rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700"
          >
            <option value="default">Sort by: Default</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* WooCommerce Categories Sidebar */}
        <aside className="space-y-4">
          <div className="wp-card p-5 rounded-2xl space-y-3">
            <h3 className="font-heading font-bold text-sm text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
              <Leaf className="w-4 h-4 text-emerald-700" /> Product Categories
            </h3>

            <div className="space-y-1 text-xs font-semibold">
              <button
                onClick={() => onSelectCategory(null)}
                className={`w-full text-left py-2 px-3 rounded-xl transition-all ${
                  selectedCategoryId === null
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                All Products ({products.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`w-full text-left py-2 px-3 rounded-xl transition-all ${
                    selectedCategoryId === cat.id
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="lg:col-span-3">
          {filtered.length === 0 ? (
            <div className="wp-card rounded-2xl p-12 text-center space-y-3">
              <p className="text-slate-500 text-sm">No products found matching your filter criteria.</p>
              <button
                onClick={() => {
                  onSelectCategory(null);
                  setSearchQuery('');
                }}
                className="text-xs font-bold text-emerald-700 underline"
              >
                Clear Filters & View All
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} onSelect={onSelectProduct} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

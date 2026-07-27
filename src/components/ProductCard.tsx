import React, { useState } from 'react';
import { ShoppingBag, Star, Check, Tag } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const price = product.discount_price || product.base_price;
  const hasDiscount = product.discount_price && product.discount_price < product.base_price;
  const discountPercent = hasDiscount
    ? Math.round(((product.base_price - product.discount_price!) / product.base_price) * 100)
    : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      product_id: product.id,
      variant_id: null,
      title: product.title,
      variant_name: 'Standard',
      image: product.images[0] || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
      price: price,
      original_price: product.base_price,
      quantity: 1
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div
      onClick={() => onSelect(product)}
      className="glass-card rounded-2xl p-4 flex flex-col justify-between group cursor-pointer hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-950/40 transition-all duration-300"
    >
      <div>
        {/* Product Image Container */}
        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-800 mb-3">
          <img
            src={product.images[0] || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80'}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.is_featured === 1 && (
              <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
                Featured
              </span>
            )}
            {product.is_bestseller === 1 && (
              <span className="badge-gold text-[10px] px-2 py-0.5 rounded-full shadow-md">
                Bestseller
              </span>
            )}
            {product.is_trending === 1 && (
              <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
                Trending
              </span>
            )}
          </div>

          {hasDiscount && (
            <div className="absolute top-2 right-2 bg-red-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-md">
              -{discountPercent}%
            </div>
          )}
        </div>

        {/* Category & Title */}
        <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
          {product.category_name || 'Wellness'}
        </span>
        <h3 className="font-heading font-bold text-sm text-white line-clamp-2 mt-0.5 group-hover:text-emerald-300 transition-colors">
          {product.title}
        </h3>
        <p className="text-xs text-slate-400 line-clamp-2 mt-1 font-normal">
          {product.short_description}
        </p>
      </div>

      {/* Pricing & Add Button */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-base font-extrabold text-white">₹{price}</span>
            {hasDiscount && (
              <span className="text-xs text-slate-500 line-through">₹{product.base_price}</span>
            )}
          </div>
          <span className="text-[10px] text-emerald-400 font-medium">In Stock</span>
        </div>

        <button
          onClick={handleQuickAdd}
          className={`flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-xl transition-all ${
            added
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/40'
          }`}
        >
          {added ? (
            <>
              <Check className="w-3.5 h-3.5" /> Added
            </>
          ) : (
            <>
              <ShoppingBag className="w-3.5 h-3.5" /> Add
            </>
          )}
        </button>
      </div>
    </div>
  );
};

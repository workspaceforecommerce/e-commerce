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
      quantity: 1,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div
      onClick={() => onSelect(product)}
      className="wp-card p-4 flex flex-col justify-between group cursor-pointer"
    >
      <div>
        {/* WooCommerce Image Box */}
        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-100 mb-3 border border-slate-200/80">
          <img
            src={product.images[0] || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80'}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {hasDiscount && (
              <span className="badge-sale text-[10px] px-2 py-0.5 rounded-md shadow-xs">
                SALE -{discountPercent}%
              </span>
            )}
            {product.is_bestseller === 1 && (
              <span className="badge-gold text-[10px] px-2 py-0.5 rounded-md shadow-xs">
                BESTSELLER
              </span>
            )}
            {product.is_featured === 1 && (
              <span className="badge-featured text-[10px] px-2 py-0.5 rounded-md shadow-xs">
                FEATURED
              </span>
            )}
          </div>
        </div>

        {/* Category & Title */}
        <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
          {product.category_name || 'Ayurveda'}
        </span>
        <h3 className="font-heading font-bold text-sm text-slate-900 line-clamp-2 mt-0.5 group-hover:text-emerald-700 transition-colors">
          {product.title}
        </h3>

        {/* Star Rating */}
        <div className="flex items-center gap-1 mt-1 text-[11px] text-amber-500">
          <div className="flex">
            {'★'.repeat(5)}
          </div>
          <span className="text-slate-400 text-[10px] font-medium">(128)</span>
        </div>

        <p className="text-xs text-slate-500 line-clamp-2 mt-1 font-normal leading-relaxed">
          {product.short_description}
        </p>
      </div>

      {/* Pricing & Add to Cart Button */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-extrabold text-slate-900">₹{price}</span>
            {hasDiscount && (
              <span className="text-xs text-slate-400 line-through">₹{product.base_price}</span>
            )}
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold">In Stock</span>
        </div>

        <button
          onClick={handleQuickAdd}
          className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs ${
            added
              ? 'bg-amber-500 text-white'
              : 'bg-emerald-700 hover:bg-emerald-800 text-white'
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

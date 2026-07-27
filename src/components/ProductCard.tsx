import React, { useState } from 'react';
import { ShoppingBag, Heart, Star, Check, Eye } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const price = product.discount_price || product.base_price;
  const originalPrice = product.discount_price ? product.base_price : null;
  const discountPercent = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      product_id: product.id,
      variant_id: null,
      title: product.title,
      variant_name: 'Standard Pack',
      image: product.images[0] || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
      price,
      original_price: product.base_price,
      quantity: 1,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div
      onClick={() => onQuickView && onQuickView(product)}
      className="wp-card rounded-2xl overflow-hidden flex flex-col justify-between group cursor-pointer animate-fade-in"
    >
      {/* Product Image Box */}
      <div className="relative aspect-4/3 sm:aspect-square bg-slate-50 overflow-hidden border-b border-slate-100">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80'}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {discountPercent > 0 && (
            <span className="bg-emerald-700 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-xs">
              {discountPercent}% OFF
            </span>
          )}
          {product.is_bestseller === 1 && (
            <span className="bg-amber-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-xs">
              Bestseller
            </span>
          )}
        </div>

        {/* Quick Actions Hover Overlay */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onQuickView) onQuickView(product);
            }}
            className="p-2 rounded-xl bg-white/90 hover:bg-white text-slate-700 shadow-sm backdrop-blur-xs transition-transform hover:scale-110"
            title="Quick View"
          >
            <Eye className="w-4 h-4 text-emerald-700" />
          </button>
        </div>
      </div>

      {/* Product Details Content */}
      <div className="p-4 sm:p-5 space-y-2 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
            {product.category_name || 'Ayurveda'}
          </span>

          <h3 className="font-heading font-bold text-xs sm:text-sm text-slate-900 line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
            {product.title}
          </h3>

          <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
            {product.short_description}
          </p>
        </div>

        {/* Price & Add To Cart Button */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold text-slate-900 text-base sm:text-lg">
                ₹{price}
              </span>
              {originalPrice && (
                <span className="text-xs text-slate-400 line-through">
                  ₹{originalPrice}
                </span>
              )}
            </div>

            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
              4.9 / 5.0
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            className={`w-full py-2.5 sm:py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs touch-target ${
              added
                ? 'bg-amber-600 text-white'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white active:scale-98'
            }`}
          >
            {added ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
            {added ? 'Added to Cart!' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

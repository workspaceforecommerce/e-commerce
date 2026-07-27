import React, { useState } from 'react';
import { ArrowLeft, ShoppingBag, Star, ShieldCheck, Truck, Check, RefreshCw } from 'lucide-react';
import { Product, ProductVariant } from '../types';
import { useCart } from '../context/CartContext';

interface ProductDetailViewProps {
  product: Product;
  onBack: () => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({ product, onBack }) => {
  const { addToCart } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeImage, setActiveImage] = useState(product.images[0] || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80');

  const currentPrice = selectedVariant
    ? selectedVariant.price
    : product.discount_price || product.base_price;

  const originalPrice = selectedVariant ? selectedVariant.price * 1.2 : product.base_price;

  const handleAddToCart = () => {
    addToCart({
      product_id: product.id,
      variant_id: selectedVariant ? selectedVariant.id : null,
      title: product.title,
      variant_name: selectedVariant ? selectedVariant.variant_name : 'Standard',
      image: activeImage,
      price: currentPrice,
      original_price: originalPrice,
      quantity,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-emerald-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Catalog
      </button>

      {/* Main Detail Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 glass-card p-6 sm:p-8 rounded-3xl">
        {/* Left Gallery */}
        <div className="space-y-4">
          <div className="aspect-square w-full rounded-2xl overflow-hidden bg-slate-800 border border-slate-700/60">
            <img src={activeImage} alt={product.title} className="w-full h-full object-cover" />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    activeImage === img ? 'border-emerald-500 scale-105' : 'border-slate-800 opacity-60'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Product Information */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-widest">
              {product.category_name || 'Ayurvedic Formula'}
            </span>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
              {product.title}
            </h1>
            
            {/* Rating Stars */}
            <div className="flex items-center gap-2 text-xs text-amber-400">
              <div className="flex">
                {'★'.repeat(5)}
              </div>
              <span className="text-slate-300 font-semibold">(4.9 / 5 out of 128 reviews)</span>
            </div>

            {/* Price & SKU */}
            <div className="flex items-baseline gap-3 pt-2">
              <span className="text-3xl font-extrabold text-white">₹{currentPrice}</span>
              {originalPrice > currentPrice && (
                <span className="text-sm text-slate-500 line-through">₹{Math.round(originalPrice)}</span>
              )}
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                SKU: {selectedVariant ? selectedVariant.sku : product.sku}
              </span>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed pt-2">
              {product.full_description}
            </p>

            {/* Variant Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-white uppercase tracking-wider">Select Size / Pack:</label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                        selectedVariant?.id === v.id
                          ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-950/40'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      {v.variant_name} - ₹{v.price}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector & Add Button */}
            <div className="flex items-center gap-4 pt-4">
              <div className="flex items-center bg-slate-800 rounded-xl border border-slate-700 p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 text-slate-300 hover:text-white font-bold text-sm"
                >
                  -
                </button>
                <span className="px-3 text-xs font-bold text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1.5 text-slate-300 hover:text-white font-bold text-sm"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className={`flex-1 flex items-center justify-center gap-2 text-sm font-bold py-3.5 px-6 rounded-2xl transition-all shadow-lg ${
                  added
                    ? 'bg-amber-500 text-slate-950 shadow-amber-500/30'
                    : 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-emerald-950/60'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-5 h-5" /> Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" /> Add to Cart (₹{currentPrice * quantity})
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Guarantees */}
          <div className="pt-4 border-t border-slate-800 grid grid-cols-2 gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Ayush & FSSAI Approved
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-400" /> Free Express Delivery
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-emerald-400" /> 7 Days Replacements
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" /> 100% Herbal Roots
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Catalog
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 wp-card p-6 sm:p-8 rounded-2xl">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="aspect-square w-full rounded-xl overflow-hidden bg-slate-50 border border-slate-200">
            <img src={activeImage} alt={product.title} className="w-full h-full object-cover" />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    activeImage === img ? 'border-emerald-700 scale-105' : 'border-slate-200 opacity-60'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-widest block">
              {product.category_name || 'Ayurvedic Remedy'}
            </span>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
              {product.title}
            </h1>

            <div className="flex items-center gap-2 text-xs text-amber-500 font-bold">
              <div className="flex">
                {'★'.repeat(5)}
              </div>
              <span className="text-slate-600 font-semibold">(4.9 / 5 based on 128 reviews)</span>
            </div>

            <div className="flex items-baseline gap-3 pt-2">
              <span className="text-3xl font-extrabold text-slate-900">₹{currentPrice}</span>
              {originalPrice > currentPrice && (
                <span className="text-sm text-slate-400 line-through">₹{Math.round(originalPrice)}</span>
              )}
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                SKU: {selectedVariant ? selectedVariant.sku : product.sku}
              </span>
            </div>

            <p className="text-slate-600 text-sm leading-relaxed pt-2">
              {product.full_description}
            </p>

            {product.variants && product.variants.length > 0 && (
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">Select Size / Pack:</label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                        selectedVariant?.id === v.id
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      {v.variant_name} - ₹{v.price}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 pt-4">
              <div className="flex items-center bg-slate-100 rounded-xl border border-slate-300 p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 text-slate-700 hover:text-slate-900 font-bold text-sm"
                >
                  -
                </button>
                <span className="px-3 text-xs font-bold text-slate-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1.5 text-slate-700 hover:text-slate-900 font-bold text-sm"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className={`flex-1 flex items-center justify-center gap-2 text-sm font-bold py-3.5 px-6 rounded-xl transition-all shadow-md ${
                  added
                    ? 'bg-amber-500 text-white'
                    : 'bg-emerald-700 hover:bg-emerald-800 text-white'
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

          <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" /> Ayush Approved
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-700" /> Free Shipping &gt; ₹499
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-emerald-700" /> 7 Days Replacements
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-700" /> 100% Herbal
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

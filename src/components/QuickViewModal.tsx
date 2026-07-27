import React, { useState } from 'react';
import { X, ShoppingBag, Check, ShieldCheck, Truck, Star } from 'lucide-react';
import { Product, ProductVariant } from '../types';
import { useCart } from '../context/CartContext';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  if (!product) return null;

  const { addToCart } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const price = selectedVariant ? selectedVariant.price : product.discount_price || product.base_price;

  const handleAdd = () => {
    addToCart({
      product_id: product.id,
      variant_id: selectedVariant ? selectedVariant.id : null,
      name: product.title || product.name || 'Herbal Supplement',
      title: product.title || product.name || 'Herbal Supplement',
      variant_name: selectedVariant ? selectedVariant.variant_name : 'Standard',
      image_url: product.image_url || (product.images && product.images[0]) || '',
      image: product.image_url || (product.images && product.images[0]) || '',
      price: price || product.base_price || product.price || 0,
      original_price: product.base_price || product.price || 0,
      quantity,
    });

    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative border border-slate-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
            <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
          </div>

          <div className="space-y-3 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                {product.category_name || 'Ayurveda'}
              </span>
              <h2 className="font-heading font-extrabold text-lg text-slate-900 leading-tight">
                {product.title}
              </h2>

              <div className="flex items-center gap-1 text-amber-500 text-xs my-1 font-bold">
                {'★'.repeat(5)} <span className="text-slate-400 text-[10px] ml-1">(128 reviews)</span>
              </div>

              <div className="text-2xl font-extrabold text-slate-900 my-2">₹{price}</div>

              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                {product.short_description}
              </p>

              {product.variants && product.variants.length > 0 && (
                <div className="space-y-1.5 my-3">
                  <label className="text-[11px] font-bold text-slate-800 uppercase">Pack Size:</label>
                  <div className="flex flex-wrap gap-1.5">
                    {product.variants.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                          selectedVariant?.id === v.id
                            ? 'bg-emerald-700 text-white border-emerald-700'
                            : 'bg-white text-slate-700 border-slate-300'
                        }`}
                      >
                        {v.variant_name} - ₹{v.price}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleAdd}
              className={`w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs ${
                added ? 'bg-amber-500 text-white' : 'bg-emerald-700 hover:bg-emerald-800 text-white'
              }`}
            >
              {added ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
              {added ? 'Added to Cart!' : `Add to Cart (₹${price * quantity})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

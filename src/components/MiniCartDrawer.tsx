import React from 'react';
import { X, ShoppingBag, Trash2, ArrowRight, Sparkles, Tag, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface MiniCartDrawerProps {
  onProceedCheckout: () => void;
  onViewCart: () => void;
}

export const MiniCartDrawer: React.FC<MiniCartDrawerProps> = ({ onProceedCheckout, onViewCart }) => {
  const { cart, isMiniCartOpen, closeMiniCart, removeFromCart, updateQuantity, subtotal, shippingFee, totalAmount, cartCount } = useCart();

  if (!isMiniCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={closeMiniCart} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <h2 className="font-heading font-extrabold text-sm">Your Cart ({cartCount})</h2>
            </div>
            <button onClick={closeMiniCart} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Bar */}
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-[11px] font-semibold text-emerald-800 flex items-center justify-between">
            {subtotal >= 499 ? (
              <span className="font-bold text-emerald-700 flex items-center gap-1">🎉 You unlocked FREE Express Shipping!</span>
            ) : (
              <span>Add <strong>₹{499 - subtotal}</strong> more for FREE Shipping!</span>
            )}
            <span className="text-[10px] font-mono text-slate-400">Limit ₹499</span>
          </div>

          {/* Item List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-slate-100">
            {cart.length === 0 && (
              <div className="text-center py-16 space-y-3">
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="font-bold text-slate-700 text-sm">Your cart is empty</p>
                <p className="text-xs text-slate-400">Discover our certified Himalayan herbal collection</p>
              </div>
            )}

            {cart.map((item) => (
              <div key={`${item.product_id}_${item.variant_id}`} className="pt-3 flex gap-3">
                <img src={item.image_url} alt={item.name} className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-xs truncate">{item.name}</p>
                  {item.variant_name && <p className="text-[10px] text-slate-500">{item.variant_name}</p>}
                  <p className="font-extrabold text-emerald-800 text-xs mt-1">₹{item.price}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                      <button onClick={() => updateQuantity(item.product_id, item.variant_id, -1)} className="px-2 py-0.5 hover:bg-slate-200 text-slate-600"><Minus className="w-3 h-3" /></button>
                      <span className="px-2 font-mono text-xs font-bold text-slate-800">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product_id, item.variant_id, 1)} className="px-2 py-0.5 hover:bg-slate-200 text-slate-600"><Plus className="w-3 h-3" /></button>
                    </div>
                    <button onClick={() => removeFromCart(item.product_id, item.variant_id)} className="p-1 rounded text-red-500 hover:bg-red-50 ml-auto"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Subtotal */}
          {cart.length > 0 && (
            <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                <span>Subtotal</span>
                <span className="text-base text-emerald-800">₹{subtotal}</span>
              </div>
              <p className="text-[10px] text-slate-400">Taxes and shipping calculated at checkout.</p>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => { closeMiniCart(); onViewCart(); }} className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs py-3 rounded-xl transition-all">
                  View Full Cart
                </button>
                <button onClick={() => { closeMiniCart(); onProceedCheckout(); }} className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-1 transition-all shadow-md">
                  Checkout <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

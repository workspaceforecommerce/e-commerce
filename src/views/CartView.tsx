import React, { useState } from 'react';
import {
  ShoppingBag, Trash2, ArrowRight, ArrowLeft, Tag, ShieldCheck,
  Truck, CheckCircle2, Bookmark, Heart, Clock, AlertCircle, Plus,
  Minus, Sparkles, MessageSquare, AlertTriangle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Button } from '../shared/components/ui/Button';

interface CartViewProps {
  onProceedCheckout: () => void;
  onContinueShopping: () => void;
  onNavigateWishlist?: () => void;
}

export const CartView: React.FC<CartViewProps> = ({
  onProceedCheckout,
  onContinueShopping,
  onNavigateWishlist = () => {},
}) => {
  const {
    cart, savedForLater, addToCart, removeFromCart, updateQuantity,
    saveForLater, moveToCartFromSaved, clearCart, addToWishlist,
    appliedCoupon, applyCoupon, removeCoupon, subtotal, discountAmount,
    shippingFee, taxEstimate, totalAmount, cartCount, cartNote, setCartNote
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [applying, setApplying] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setApplying(true);
    setCouponError('');
    setCouponSuccess('');

    const res = await applyCoupon(couponInput);
    if (res.success) {
      setCouponSuccess(`Coupon "${couponInput.toUpperCase()}" applied!`);
      setCouponInput('');
    } else {
      setCouponError(res.message || 'Invalid coupon code');
    }
    setApplying(false);
  };

  const freeShippingThreshold = 499;
  const freeShippingNeeded = freeShippingThreshold - subtotal;
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const suggestedCoupons = [
    { code: 'WELCOME100', text: '₹100 OFF on orders > ₹499' },
    { code: 'MONK15', text: '15% OFF on orders > ₹799' },
    { code: 'DETOX20', text: '20% OFF Summer Detox' },
    { code: 'FREESHIP', text: 'Free Shipping Voucher' },
  ];

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* ── Page Title Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">Your Shopping Cart</h1>
          <p className="text-xs text-slate-500 mt-0.5">{cartCount} items in cart · Verified Himalayan Organic Products</p>
        </div>
        <button onClick={onContinueShopping} className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 text-xs font-bold">
          <ArrowLeft className="w-4 h-4" /> Continue Shopping
        </button>
      </div>

      {cart.length === 0 ? (
        /* Empty Cart State */
        <div className="wp-card p-12 text-center rounded-3xl bg-white max-w-xl mx-auto space-y-4 my-8">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-200">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="font-heading font-extrabold text-xl text-slate-900">Your Cart is Currently Empty</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Looks like you haven't added any Himalayan herbal remedies to your cart yet. Explore our top-rated Ayurvedic supplements!
          </p>
          <div className="pt-2">
            <button onClick={onContinueShopping} className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition-all">
              Explore Herbal Catalog
            </button>
          </div>
        </div>
      ) : (
        /* Active Cart Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Cart Items Column (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Free Shipping Progress Meter */}
            <div className="wp-card p-4 rounded-2xl bg-gradient-to-r from-emerald-900 to-slate-900 text-white space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-amber-300">
                  <Truck className="w-4 h-4" />
                  {freeShippingNeeded <= 0 ? '🎉 You qualify for FREE Express Shipping!' : `Add ₹${freeShippingNeeded} more to unlock FREE Express Shipping!`}
                </span>
                <span className="text-[10px] text-emerald-200 font-mono">{freeShippingProgress}%</span>
              </div>
              <div className="w-full bg-emerald-950 rounded-full h-2 overflow-hidden border border-emerald-700/50">
                <div className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full rounded-full transition-all duration-500" style={{ width: `${freeShippingProgress}%` }} />
              </div>
            </div>

            {/* Cart Items Table List */}
            <div className="wp-card bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
              <div className="p-4 bg-slate-50 flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Products in Order ({cart.length})</span>
                <button onClick={clearCart} className="text-red-600 hover:underline text-[11px] font-semibold">Clear All</button>
              </div>

              {cart.map((item) => (
                <div key={`${item.product_id}_${item.variant_id}`} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Thumbnail & Product Details */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <img src={item.image_url} alt={item.name} className="w-20 h-20 rounded-xl object-cover border border-slate-200 shrink-0" />
                    <div className="space-y-1 min-w-0">
                      <h3 className="font-heading font-extrabold text-sm text-slate-900 leading-snug truncate">{item.name}</h3>
                      {item.variant_name && <p className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 inline-block px-2 py-0.5 rounded-full border border-emerald-200">{item.variant_name}</p>}
                      <p className="text-[11px] text-slate-400">SKU: HM-PRD-{item.product_id}</p>
                      <div className="flex items-center gap-1 text-[10px] text-emerald-800 font-semibold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-700" /> In Stock & Ready to Ship
                      </div>
                    </div>
                  </div>

                  {/* Quantity & Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-3 sm:pt-0">
                    <p className="font-extrabold text-slate-900 text-base">₹{item.price * item.quantity}</p>

                    <div className="flex items-center gap-3">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                        <button onClick={() => updateQuantity(item.product_id, item.variant_id, -1)} className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 transition-colors"><Minus className="w-3 h-3" /></button>
                        <span className="px-3 font-mono font-bold text-xs text-slate-900">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product_id, item.variant_id, 1)} className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 transition-colors"><Plus className="w-3 h-3" /></button>
                      </div>

                      {/* Action Icon Buttons */}
                      <button onClick={() => saveForLater(item.product_id, item.variant_id)} title="Save for Later" className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors">
                        <Bookmark className="w-4 h-4" />
                      </button>
                      <button onClick={() => removeFromCart(item.product_id, item.variant_id)} title="Remove" className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Saved for Later Section */}
            {savedForLater.length > 0 && (
              <div className="wp-card bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <h3 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <Bookmark className="w-4 h-4 text-amber-600" /> Saved for Later ({savedForLater.length})
                </h3>
                <div className="divide-y divide-slate-100">
                  {savedForLater.map((item) => (
                    <div key={`${item.product_id}_${item.variant_id}`} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <img src={item.image_url} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                        <div><p className="font-bold text-slate-900">{item.name}</p><p className="font-extrabold text-emerald-800">₹{item.price}</p></div>
                      </div>
                      <button onClick={() => moveToCartFromSaved(item.product_id, item.variant_id)} className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors">
                        Move to Cart
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cart Notes Collapsible */}
            <div className="wp-card bg-white p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <button onClick={() => setNoteOpen(!noteOpen)} className="font-bold text-slate-800 flex items-center gap-1.5 w-full justify-between">
                <span className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5 text-emerald-700" /> Add Order Note / Delivery Instructions</span>
                <span className="text-[10px] text-slate-400">{noteOpen ? 'Collapse' : 'Expand'}</span>
              </button>
              {noteOpen && (
                <textarea rows={2} value={cartNote} onChange={e => setCartNote(e.target.value)} placeholder="e.g. Please leave package at front gate or call before delivery..." className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700 text-xs resize-none mt-2" />
              )}
            </div>
          </div>

          {/* Right Summary Column (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Promo Coupon Box */}
            <div className="wp-card bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
              <h3 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-emerald-700" /> Apply Promo Code
              </h3>

              {appliedCoupon ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="font-mono font-bold text-emerald-800 text-xs flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> {appliedCoupon.code}</p>
                    <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">Saving ₹{appliedCoupon.calculatedDiscount} on this order!</p>
                  </div>
                  <button onClick={removeCoupon} className="text-red-600 font-bold text-xs hover:underline">Remove</button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-2">
                  <div className="flex gap-2">
                    <input type="text" placeholder="Enter coupon code" value={couponInput} onChange={e => setCouponInput(e.target.value)} className="w-full bg-slate-50 uppercase font-mono text-slate-900 text-xs rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700" />
                    <button type="submit" disabled={applying} className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl shrink-0 transition-colors">
                      {applying ? '...' : 'Apply'}
                    </button>
                  </div>
                  {couponError && <p className="text-[11px] text-red-600 font-semibold flex items-center gap-1"><AlertCircle className="w-3 h-3" />{couponError}</p>}
                  {couponSuccess && <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />{couponSuccess}</p>}
                </form>
              )}

              {/* Quick Coupon Suggestions */}
              {!appliedCoupon && (
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Available Offers</p>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestedCoupons.map(sc => (
                      <button key={sc.code} onClick={() => { setCouponInput(sc.code); }} className="bg-slate-100 hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 text-[10px] font-mono font-bold px-2 py-1 rounded-lg border border-slate-200 transition-colors">
                        {sc.code}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Order Price Summary Card */}
            <div className="wp-card bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="font-heading font-extrabold text-sm text-slate-900 border-b border-slate-200 pb-3">Order Price Summary</h3>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal ({cartCount} items)</span>
                  <span className="font-bold text-slate-900">₹{subtotal}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Coupon Savings ({appliedCoupon.code})</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span className="font-bold text-slate-900">{shippingFee === 0 ? <span className="text-emerald-700 uppercase font-bold">FREE</span> : `₹${shippingFee}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Ayush GST (5%)</span>
                  <span className="font-bold text-slate-900">₹{taxEstimate}</span>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-slate-900">
                <div>
                  <span className="font-heading font-extrabold text-sm block">Grand Total</span>
                  <span className="text-[10px] text-slate-400">Includes GST & shipping</span>
                </div>
                <span className="font-heading font-extrabold text-2xl text-emerald-800">₹{totalAmount}</span>
              </div>

              {/* Estimated Delivery Note */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex items-center gap-2 text-[11px] text-slate-600">
                <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Estimated Delivery: <strong>2–4 Business Days</strong> via Express Courier</span>
              </div>

              {/* Checkout Button */}
              <button onClick={onProceedCheckout} className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5">
                Proceed to Secure Checkout <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-3 text-[10px] text-slate-400 pt-1">
                <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-700" /> 256-Bit SSL Encrypted</span>
                <span>•</span>
                <span>FSSAI & Ayush Approved</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

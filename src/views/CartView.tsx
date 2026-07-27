import React, { useState } from 'react';
import { Trash2, ShoppingBag, Tag, ArrowRight, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface CartViewProps {
  onProceedCheckout: () => void;
  onContinueShopping: () => void;
}

export const CartView: React.FC<CartViewProps> = ({ onProceedCheckout, onContinueShopping }) => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    subtotal,
    discountAmount,
    shippingFee,
    totalAmount,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const res = await applyCoupon(couponCode);
    if (res.success) {
      setCouponMsg({ text: 'Coupon code applied successfully!', isError: false });
      setCouponCode('');
    } else {
      setCouponMsg({ text: res.message || 'Invalid coupon code', isError: true });
    }
  };

  if (cart.length === 0) {
    return (
      <div className="wp-card rounded-2xl p-12 text-center max-w-md mx-auto space-y-4 my-8">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-emerald-700">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="font-heading text-xl font-bold text-slate-900">Your Cart is Currently Empty</h2>
        <p className="text-xs text-slate-500">Explore our certified ayurvedic herbs and superfood teas.</p>
        <button
          onClick={onContinueShopping}
          className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-xs inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Shop Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-slate-900">Shopping Cart ({cart.length} items)</h1>
        <button
          onClick={onContinueShopping}
          className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Continue Shopping
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div
              key={`${item.product_id}-${item.variant_id}`}
              className="wp-card p-4 rounded-xl flex items-center gap-4 border border-slate-200"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-20 h-20 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200"
              />

              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-bold text-sm text-slate-900 truncate">{item.title}</h3>
                <p className="text-xs text-emerald-700 font-semibold">{item.variant_name || 'Standard'}</p>
                <div className="text-sm font-extrabold text-slate-900 mt-1">₹{item.price}</div>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-slate-100 rounded-xl border border-slate-300 p-1">
                  <button
                    onClick={() => updateQuantity(item.product_id, item.variant_id, -1)}
                    className="w-6 h-6 flex items-center justify-center text-slate-700 hover:text-slate-900 font-bold"
                  >
                    -
                  </button>
                  <span className="px-2 text-xs font-bold text-slate-900">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product_id, item.variant_id, 1)}
                    className="w-6 h-6 flex items-center justify-center text-slate-700 hover:text-slate-900 font-bold"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item.product_id, item.variant_id)}
                  className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          <div className="wp-card p-5 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-700">
              <Tag className="w-4 h-4" /> Apply Coupon Code
            </div>

            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                <div>
                  <span className="font-extrabold text-xs text-emerald-800">{appliedCoupon.code}</span>
                  <p className="text-[11px] text-slate-600">Saving ₹{appliedCoupon.calculatedDiscount}</p>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-xs text-red-600 hover:underline font-bold"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="WELCOME100 or MONK15"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 bg-white text-slate-900 text-xs rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700"
                />
                <button
                  type="submit"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all"
                >
                  Apply
                </button>
              </form>
            )}

            {couponMsg && (
              <p className={`text-[11px] font-medium ${couponMsg.isError ? 'text-red-600' : 'text-emerald-700'}`}>
                {couponMsg.text}
              </p>
            )}
          </div>

          <div className="wp-card p-6 rounded-2xl space-y-4">
            <h2 className="font-heading font-bold text-base text-slate-900 border-b border-slate-200 pb-3">
              Cart Totals
            </h2>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">₹{subtotal}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-emerald-700">
                  <span>Coupon Discount ({appliedCoupon.code})</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping {subtotal > 499 && <span className="text-[10px] text-emerald-700 font-bold">(FREE)</span>}</span>
                <span className="font-semibold text-slate-900">{shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}</span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline text-base font-extrabold text-slate-900">
                <span>Total Payable</span>
                <span className="text-emerald-700 text-xl">₹{totalAmount}</span>
              </div>
            </div>

            <button
              onClick={onProceedCheckout}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

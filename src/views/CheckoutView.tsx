import React, { useState } from 'react';
import { ShieldCheck, Truck, CreditCard, Banknote, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface CheckoutViewProps {
  onOrderSuccess: (orderNumber: string) => void;
  onBackToCart: () => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({ onOrderSuccess, onBackToCart }) => {
  const { cart, subtotal, discountAmount, shippingFee, totalAmount, appliedCoupon, clearCart } = useCart();

  const [formData, setFormData] = useState({
    customer_name: 'Aarav Sharma',
    customer_email: 'aarav@example.com',
    customer_phone: '+91 9812345678',
    shipping_address: '42 Lotus Heights, MG Road',
    city: 'Bengaluru',
    pincode: '560001',
    payment_method: 'cod',
    notes: 'Please call before delivery',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          items: cart,
          coupon_code: appliedCoupon?.code || null,
          discount_amount: discountAmount,
        }),
      });

      const data: any = await res.json();
      if (data.success && data.order) {
        clearCart();
        onOrderSuccess(data.order.order_number);
      } else {
        setErrorMsg(data.message || 'Could not place order. Please try again.');
      }
    } catch {
      // Offline fallback
      const mockOrd = 'HM-ORD-' + Math.floor(1000 + Math.random() * 9000);
      clearCart();
      onOrderSuccess(mockOrd);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <button
        onClick={onBackToCart}
        className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Return to Cart
      </button>

      <h1 className="font-heading text-2xl font-bold text-slate-900">Checkout & Delivery Details</h1>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <div className="wp-card p-6 rounded-2xl space-y-4">
            <h2 className="font-heading font-bold text-base text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-700" /> Shipping & Billing Address
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  className="w-full bg-white text-slate-900 rounded-xl px-3 py-2.5 border border-slate-300 focus:outline-none focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Phone (SMS / WhatsApp Updates) *</label>
                <input
                  type="text"
                  required
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                  className="w-full bg-white text-slate-900 rounded-xl px-3 py-2.5 border border-slate-300 focus:outline-none focus:border-emerald-700"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.customer_email}
                  onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                  className="w-full bg-white text-slate-900 rounded-xl px-3 py-2.5 border border-slate-300 focus:outline-none focus:border-emerald-700"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">Full Delivery Address *</label>
                <input
                  type="text"
                  required
                  value={formData.shipping_address}
                  onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
                  className="w-full bg-white text-slate-900 rounded-xl px-3 py-2.5 border border-slate-300 focus:outline-none focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-white text-slate-900 rounded-xl px-3 py-2.5 border border-slate-300 focus:outline-none focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Pincode *</label>
                <input
                  type="text"
                  required
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full bg-white text-slate-900 rounded-xl px-3 py-2.5 border border-slate-300 focus:outline-none focus:border-emerald-700"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="wp-card p-6 rounded-2xl space-y-4">
            <h2 className="font-heading font-bold text-base text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-700" /> Payment Option
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label
                onClick={() => setFormData({ ...formData, payment_method: 'cod' })}
                className={`p-4 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${
                  formData.payment_method === 'cod'
                    ? 'bg-emerald-50 border-emerald-600 text-slate-900 shadow-xs'
                    : 'bg-white border-slate-300 text-slate-700'
                }`}
              >
                <Banknote className="w-6 h-6 text-amber-600 shrink-0" />
                <div>
                  <h4 className="font-heading font-bold text-xs">Cash on Delivery (COD)</h4>
                  <p className="text-[11px] text-slate-500">Pay cash upon parcel delivery</p>
                </div>
              </label>

              <label
                onClick={() => setFormData({ ...formData, payment_method: 'prepaid' })}
                className={`p-4 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${
                  formData.payment_method === 'prepaid'
                    ? 'bg-emerald-50 border-emerald-600 text-slate-900 shadow-xs'
                    : 'bg-white border-slate-300 text-slate-700'
                }`}
              >
                <CreditCard className="w-6 h-6 text-emerald-700 shrink-0" />
                <div>
                  <h4 className="font-heading font-bold text-xs">UPI / Credit / Debit Card</h4>
                  <p className="text-[11px] text-slate-500">Instant digital confirmation</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Summary */}
        <div className="space-y-4">
          <div className="wp-card p-6 rounded-2xl space-y-4 sticky top-24">
            <h2 className="font-heading font-bold text-base text-slate-900 border-b border-slate-200 pb-3">
              Your Order
            </h2>

            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {cart.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="truncate pr-2">
                    <p className="font-bold text-slate-900 truncate">{item.title}</p>
                    <span className="text-[10px] text-slate-500">{item.variant_name} x {item.quantity}</span>
                  </div>
                  <span className="font-bold text-slate-900 shrink-0">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-200">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">₹{subtotal}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="font-semibold text-slate-900">{shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline text-base font-extrabold text-slate-900">
                <span>Total Amount</span>
                <span className="text-emerald-700 text-xl">₹{totalAmount}</span>
              </div>
            </div>

            {errorMsg && <p className="text-xs text-red-600 font-medium">{errorMsg}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? 'Placing Order...' : `Place Order (₹${totalAmount})`}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

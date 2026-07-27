import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Truck, CreditCard, Banknote, ArrowLeft, CheckCircle2,
  MapPin, Plus, User, Phone, Mail, Building, Tag, Clock, AlertCircle,
  HelpCircle, Edit3, Trash2, Check, Lock, Sparkles, ChevronRight
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Button } from '../shared/components/ui/Button';
import { Modal } from '../shared/components/ui/Modal';

interface SavedAddress {
  id: string; full_name: string; mobile: string; email?: string;
  address_line1: string; address_line2?: string; landmark?: string;
  city: string; state: string; country: string; postal_code: string;
  address_type: 'Home' | 'Office' | 'Other'; is_default: number; gst_number?: string;
}

interface CheckoutViewProps {
  onOrderSuccess: (orderNumber: string) => void;
  onBackToCart: () => void;
  user?: any;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  onOrderSuccess,
  onBackToCart,
  user = null,
}) => {
  const {
    cart, subtotal, discountAmount, shippingFee, taxEstimate, totalAmount,
    appliedCoupon, applyCoupon, removeCoupon, clearCart, cartNote
  } = useCart();

  // Saved Addresses State
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddrId, setSelectedAddrId] = useState<string>('');
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  // Delivery Speed State
  const [deliveryMethod, setDeliveryMethod] = useState<'standard' | 'express'>('standard');
  const [sameAsBilling, setSameAsBilling] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    customer_name: user?.first_name ? `${user.first_name} ${user.last_name || ''}` : 'Aarav Sharma',
    customer_email: user?.email || 'aarav@example.com',
    customer_phone: user?.phone || '+91 9812345678',
    shipping_address: '42 Lotus Heights, MG Road',
    address_line2: 'Indiranagar',
    landmark: 'Near Metro Station',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038',
    payment_method: 'cod',
    gst_number: '',
    address_type: 'Home' as 'Home' | 'Office' | 'Other',
    notes: cartNote || 'Please call before delivery',
  });

  // Modal Form State
  const [modalAddr, setModalAddr] = useState<Partial<SavedAddress>>({
    full_name: '', mobile: '', address_line1: '', city: 'Bengaluru',
    state: 'Karnataka', postal_code: '560038', address_type: 'Home', is_default: 0
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState('');

  // Load Saved Addresses
  useEffect(() => {
    fetch('/api/addresses')
      .then(r => r.json())
      .then((res: any) => {
        if (res.success && res.addresses?.length) {
          setAddresses(res.addresses);
          const def = res.addresses.find((a: SavedAddress) => a.is_default) || res.addresses[0];
          selectAddress(def);
        }
      })
      .catch(() => {
        const mock = mockAddressesList();
        setAddresses(mock);
        selectAddress(mock[0]);
      });
  }, []);

  const selectAddress = (addr: SavedAddress) => {
    setSelectedAddrId(addr.id);
    setFormData(f => ({
      ...f,
      customer_name: addr.full_name,
      customer_phone: addr.mobile,
      customer_email: addr.email || f.customer_email,
      shipping_address: addr.address_line1,
      address_line2: addr.address_line2 || '',
      landmark: addr.landmark || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.postal_code,
      gst_number: addr.gst_number || '',
      address_type: addr.address_type,
    }));
  };

  const handleSaveNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalAddr.full_name || !modalAddr.mobile || !modalAddr.address_line1) return;
    const newAddr: SavedAddress = {
      id: `addr_${Date.now()}`,
      full_name: modalAddr.full_name,
      mobile: modalAddr.mobile,
      email: modalAddr.email || formData.customer_email,
      address_line1: modalAddr.address_line1,
      address_line2: modalAddr.address_line2 || '',
      landmark: modalAddr.landmark || '',
      city: modalAddr.city || 'Bengaluru',
      state: modalAddr.state || 'Karnataka',
      country: 'India',
      postal_code: modalAddr.postal_code || '560038',
      address_type: (modalAddr.address_type as any) || 'Home',
      is_default: modalAddr.is_default ? 1 : 0,
      gst_number: modalAddr.gst_number || '',
    };
    setAddresses([newAddr, ...addresses]);
    selectAddress(newAddr);
    setIsAddressModalOpen(false);
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput) return;
    setCouponMsg('');
    const res = await applyCoupon(couponInput);
    if (res.success) { setCouponMsg('Coupon applied!'); setCouponInput(''); }
    else setCouponMsg(res.message || 'Invalid coupon');
  };

  const calculatedShipping = deliveryMethod === 'express' ? 99 : shippingFee;
  const grandTotal = Math.max(0, subtotal - discountAmount + calculatedShipping);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Stock Validation
      const valRes: any = await fetch('/api/checkout/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart, pincode: formData.pincode }),
      }).then(r => r.json()).catch(() => ({ success: true }));

      if (!valRes.success) {
        setErrorMsg(valRes.message || 'Inventory validation failed.');
        setLoading(false);
        return;
      }

      // 2. Place Order
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          items: cart,
          coupon_code: appliedCoupon?.code || null,
          discount_amount: discountAmount,
          shipping_fee: calculatedShipping,
          delivery_method: deliveryMethod,
          subtotal,
          total_amount: grandTotal,
        }),
      });

      const data: any = await res.json();
      if (data.success && data.order) {
        clearCart();
        onOrderSuccess(data.order.order_number);
      } else {
        setErrorMsg(data.message || 'Could not place order. Please check input fields.');
      }
    } catch {
      const mockOrd = 'HM-ORD-' + Math.floor(1000 + Math.random() * 9000);
      clearCart();
      onOrderSuccess(mockOrd);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Top Breadcrumb Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <button onClick={onBackToCart} className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Return to Shopping Cart
        </button>
        <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>256-Bit SSL Encrypted Checkout</span>
        </div>
      </div>

      <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">Secure Express Checkout</h1>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols): Checkout Steps */}
        <div className="lg:col-span-8 space-y-6">

          {/* STEP 1: Customer Contact Info */}
          <div className="wp-card p-6 rounded-2xl bg-white space-y-4 border border-slate-200">
            <h2 className="font-heading font-extrabold text-base text-slate-900 border-b border-slate-200 pb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-mono text-xs flex items-center justify-center font-bold">1</span>
                Customer Contact Details
              </span>
              {user ? <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">Logged In as {user.first_name}</span> : <span className="text-[11px] text-slate-400">Guest Checkout Supported</span>}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Full Name *</label>
                <input type="text" required value={formData.customer_name} onChange={e => setFormData({ ...formData, customer_name: e.target.value })} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2.5 border border-slate-300 focus:outline-none focus:border-emerald-700" />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Mobile Phone (WhatsApp Updates) *</label>
                <input type="text" required value={formData.customer_phone} onChange={e => setFormData({ ...formData, customer_phone: e.target.value })} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2.5 border border-slate-300 focus:outline-none focus:border-emerald-700" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">Email Address (Order Confirmation) *</label>
                <input type="email" required value={formData.customer_email} onChange={e => setFormData({ ...formData, customer_email: e.target.value })} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2.5 border border-slate-300 focus:outline-none focus:border-emerald-700" />
              </div>
            </div>
          </div>

          {/* STEP 2: Saved Address & Shipping Details */}
          <div className="wp-card p-6 rounded-2xl bg-white space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="font-heading font-extrabold text-base text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-mono text-xs flex items-center justify-center font-bold">2</span>
                Shipping Address
              </h2>
              <Button type="button" variant="outline" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setIsAddressModalOpen(true)}>
                Add New Address
              </Button>
            </div>

            {/* Saved Address Cards Selector */}
            {addresses.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {addresses.map(addr => (
                  <div key={addr.id} onClick={() => selectAddress(addr)} className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedAddrId === addr.id ? 'bg-emerald-50 border-emerald-600 text-slate-900 shadow-xs' : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-slate-900">{addr.full_name}</span>
                      <span className="text-[10px] font-bold uppercase bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">{addr.address_type}</span>
                    </div>
                    <p className="text-[11px] text-slate-600">{addr.address_line1}, {addr.city}, {addr.state} - {addr.postal_code}</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">{addr.mobile}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Address Input Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">Flat / House No. / Street Address *</label>
                <input type="text" required value={formData.shipping_address} onChange={e => setFormData({ ...formData, shipping_address: e.target.value })} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2.5 border border-slate-300 focus:outline-none focus:border-emerald-700" />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">City *</label>
                <input type="text" required value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2.5 border border-slate-300 focus:outline-none focus:border-emerald-700" />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">State *</label>
                <input type="text" required value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2.5 border border-slate-300 focus:outline-none focus:border-emerald-700" />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">6-Digit Pincode *</label>
                <input type="text" maxLength={6} required value={formData.pincode} onChange={e => setFormData({ ...formData, pincode: e.target.value })} className="w-full bg-white font-mono text-slate-900 rounded-xl px-3 py-2.5 border border-slate-300 focus:outline-none focus:border-emerald-700" />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">GSTIN (Optional for B2B tax invoice)</label>
                <input type="text" placeholder="29AAACH7409R1ZX" value={formData.gst_number} onChange={e => setFormData({ ...formData, gst_number: e.target.value.toUpperCase() })} className="w-full bg-white uppercase font-mono text-slate-900 rounded-xl px-3 py-2.5 border border-slate-300 focus:outline-none focus:border-emerald-700" />
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 pt-1 cursor-pointer">
              <input type="checkbox" checked={sameAsBilling} onChange={e => setSameAsBilling(e.target.checked)} className="rounded" />
              Billing address is the same as shipping address
            </label>
          </div>

          {/* STEP 3: Delivery Speed */}
          <div className="wp-card p-6 rounded-2xl bg-white space-y-4 border border-slate-200">
            <h2 className="font-heading font-extrabold text-base text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-mono text-xs flex items-center justify-center font-bold">3</span>
              Delivery Speed & Method
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label onClick={() => setDeliveryMethod('standard')} className={`p-4 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${deliveryMethod === 'standard' ? 'bg-emerald-50 border-emerald-600 text-slate-900 shadow-xs' : 'bg-white border-slate-300 text-slate-700'}`}>
                <Truck className="w-6 h-6 text-emerald-700 shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-heading font-bold text-xs">Standard Express Delivery</h4>
                    {subtotal >= 499 ? <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">FREE</span> : <span className="text-xs font-bold">₹40</span>}
                  </div>
                  <p className="text-[11px] text-slate-500">2–4 Business Days via Bluedart / Delhivery</p>
                </div>
              </label>

              <label onClick={() => setDeliveryMethod('express')} className={`p-4 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${deliveryMethod === 'express' ? 'bg-emerald-50 border-emerald-600 text-slate-900 shadow-xs' : 'bg-white border-slate-300 text-slate-700'}`}>
                <Sparkles className="w-6 h-6 text-amber-500 shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-heading font-bold text-xs">Priority Air Courier (Next Day)</h4>
                    <span className="text-xs font-bold text-slate-900">₹99</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Guaranteed 24-Hour Dispatch & Air Shipping</p>
                </div>
              </label>
            </div>
          </div>

          {/* STEP 4: Payment Option */}
          <div className="wp-card p-6 rounded-2xl bg-white space-y-4 border border-slate-200">
            <h2 className="font-heading font-extrabold text-base text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-mono text-xs flex items-center justify-center font-bold">4</span>
              Payment Option
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label onClick={() => setFormData({ ...formData, payment_method: 'cod' })} className={`p-4 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${formData.payment_method === 'cod' ? 'bg-emerald-50 border-emerald-600 text-slate-900 shadow-xs' : 'bg-white border-slate-300 text-slate-700'}`}>
                <Banknote className="w-6 h-6 text-amber-600 shrink-0" />
                <div>
                  <h4 className="font-heading font-bold text-xs">Cash on Delivery (COD)</h4>
                  <p className="text-[11px] text-slate-500">Pay cash upon door delivery</p>
                </div>
              </label>

              <label onClick={() => setFormData({ ...formData, payment_method: 'prepaid' })} className={`p-4 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${formData.payment_method === 'prepaid' ? 'bg-emerald-50 border-emerald-600 text-slate-900 shadow-xs' : 'bg-white border-slate-300 text-slate-700'}`}>
                <CreditCard className="w-6 h-6 text-emerald-700 shrink-0" />
                <div>
                  <h4 className="font-heading font-bold text-xs">UPI / Debit / Credit Card / NetBanking</h4>
                  <p className="text-[11px] text-slate-500">Instant digital confirmation</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Order Summary Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="wp-card p-6 rounded-2xl bg-white space-y-4 border border-slate-200 sticky top-24">
            <h2 className="font-heading font-extrabold text-base text-slate-900 border-b border-slate-200 pb-3">
              Order Items ({cart.length})
            </h2>

            <div className="space-y-3 max-h-56 overflow-y-auto divide-y divide-slate-100">
              {cart.map((item, i) => (
                <div key={i} className="pt-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <img src={item.image_url} alt={item.name} className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0" />
                    <div className="truncate">
                      <p className="font-bold text-slate-900 truncate">{item.name}</p>
                      <p className="text-[10px] text-slate-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-extrabold text-slate-900 shrink-0">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Coupon Application */}
            <div className="pt-2 border-t border-slate-200 space-y-2">
              <label className="block text-xs font-bold text-slate-700">Promo Voucher Code</label>
              {appliedCoupon ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-mono font-bold text-emerald-800 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> {appliedCoupon.code}</p>
                    <p className="text-[10px] text-emerald-700 font-semibold">Saved ₹{discountAmount}</p>
                  </div>
                  <button type="button" onClick={removeCoupon} className="text-red-600 font-bold text-[11px] hover:underline">Remove</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input type="text" placeholder="WELCOME100" value={couponInput} onChange={e => setCouponInput(e.target.value.toUpperCase())} className="w-full bg-slate-50 uppercase font-mono text-slate-900 text-xs rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700" />
                  <button type="button" onClick={handleApplyCoupon} className="bg-slate-900 text-white font-bold text-xs px-3 py-2 rounded-xl shrink-0">Apply</button>
                </div>
              )}
              {couponMsg && <p className="text-[10px] font-semibold text-emerald-700">{couponMsg}</p>}
            </div>

            {/* Breakdown */}
            <div className="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-200">
              <div className="flex justify-between"><span>Items Subtotal</span><span className="font-semibold text-slate-900">₹{subtotal}</span></div>
              {discountAmount > 0 && <div className="flex justify-between text-emerald-700 font-semibold"><span>Coupon Discount</span><span>-₹{discountAmount}</span></div>}
              <div className="flex justify-between"><span>Shipping Charge</span><span className="font-semibold text-slate-900">{calculatedShipping === 0 ? <span className="text-emerald-700 uppercase font-bold">FREE</span> : `₹${calculatedShipping}`}</span></div>
              <div className="flex justify-between"><span>Estimated Ayush GST (5%)</span><span className="font-semibold text-slate-900">₹{taxEstimate}</span></div>
              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline text-slate-900">
                <span className="font-heading font-extrabold text-sm">Grand Total</span>
                <span className="font-heading font-extrabold text-2xl text-emerald-800">₹{grandTotal}</span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50">
              {loading ? 'Confirming Order & Stock...' : `Place Order Now (₹${grandTotal})`}
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 pt-1">
              <Lock className="w-3 h-3 text-emerald-700" />
              <span>Safe & Encrypted Checkout Guarantee</span>
            </div>
          </div>
        </div>
      </form>

      {/* Add New Address Modal */}
      <Modal isOpen={isAddressModalOpen} onClose={() => setIsAddressModalOpen(false)} title="Add New Delivery Address">
        <form onSubmit={handleSaveNewAddress} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Full Name *</label>
              <input type="text" required value={modalAddr.full_name || ''} onChange={e => setModalAddr({ ...modalAddr, full_name: e.target.value })} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700" />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Mobile Number *</label>
              <input type="text" required value={modalAddr.mobile || ''} onChange={e => setModalAddr({ ...modalAddr, mobile: e.target.value })} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700" />
            </div>
          </div>
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Address Line 1 *</label>
            <input type="text" required value={modalAddr.address_line1 || ''} onChange={e => setModalAddr({ ...modalAddr, address_line1: e.target.value })} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">City *</label>
              <input type="text" required value={modalAddr.city || ''} onChange={e => setModalAddr({ ...modalAddr, city: e.target.value })} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700" />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">State *</label>
              <input type="text" required value={modalAddr.state || ''} onChange={e => setModalAddr({ ...modalAddr, state: e.target.value })} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700" />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Pincode *</label>
              <input type="text" maxLength={6} required value={modalAddr.postal_code || ''} onChange={e => setModalAddr({ ...modalAddr, postal_code: e.target.value })} className="w-full bg-white font-mono text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Address Tag</label>
              <select value={modalAddr.address_type || 'Home'} onChange={e => setModalAddr({ ...modalAddr, address_type: e.target.value as any })} className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700">
                <option value="Home">Home</option>
                <option value="Office">Office</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">GSTIN (Optional)</label>
              <input type="text" placeholder="29AAACH7409R1ZX" value={modalAddr.gst_number || ''} onChange={e => setModalAddr({ ...modalAddr, gst_number: e.target.value.toUpperCase() })} className="w-full bg-white uppercase font-mono text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddressModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm">Save Address</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

function mockAddressesList(): SavedAddress[] {
  return [
    { id: 'addr1', full_name: 'Aarav Sharma', mobile: '+91 9812345678', email: 'aarav@example.com', address_line1: '42 Lotus Heights, MG Road', address_line2: 'Indiranagar', landmark: 'Near Indiranagar Metro Station', city: 'Bengaluru', state: 'Karnataka', country: 'India', postal_code: '560038', address_type: 'Home', is_default: 1, gst_number: '' },
    { id: 'addr2', full_name: 'Aarav Sharma (Office)', mobile: '+91 9812345678', email: 'aarav@company.com', address_line1: 'Building 7, Embassy TechVillage', address_line2: 'Outer Ring Road', landmark: 'Devarabeesanahalli', city: 'Bengaluru', state: 'Karnataka', country: 'India', postal_code: '560103', address_type: 'Office', is_default: 0, gst_number: '29AAACH7409R1ZX' },
  ];
}

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Coupon } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: number, variantId?: number | null) => void;
  updateQuantity: (productId: number, variantId: number | null | undefined, delta: number) => void;
  clearCart: () => void;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; message?: string }>;
  removeCoupon: () => void;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('hm_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
    try {
      const saved = localStorage.getItem('hm_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem('hm_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('hm_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('hm_coupon');
    }
  }, [appliedCoupon]);

  const addToCart = (newItem: CartItem) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.product_id === newItem.product_id && i.variant_id === newItem.variant_id
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += newItem.quantity;
        return updated;
      }
      return [...prev, newItem];
    });
  };

  const removeFromCart = (productId: number, variantId?: number | null) => {
    setCart((prev) => prev.filter((i) => !(i.product_id === productId && i.variant_id === variantId)));
  };

  const updateQuantity = (productId: number, variantId: number | null | undefined, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product_id === productId && item.variant_id === variantId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = appliedCoupon ? appliedCoupon.calculatedDiscount : 0;
  const shippingFee = subtotal > 499 || cart.length === 0 ? 0 : 40;
  const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const applyCoupon = async (code: string) => {
    try {
      const res = await fetch('/api/coupons/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, cartTotal: subtotal }),
      });
      const data: any = await res.json();
      if (data.success) {
        setAppliedCoupon(data.coupon);
        return { success: true };
      }
      return { success: false, message: data.message || 'Failed to apply coupon' };
    } catch {
      // Offline fallback check
      if (code.toUpperCase() === 'WELCOME100' && subtotal >= 499) {
        setAppliedCoupon({ code: 'WELCOME100', discountType: 'flat', discountValue: 100, calculatedDiscount: 100 });
        return { success: true };
      }
      return { success: false, message: 'Invalid code or minimum purchase requirement not met' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        subtotal,
        discountAmount,
        shippingFee,
        totalAmount,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

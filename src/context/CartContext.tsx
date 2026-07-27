import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Coupon, Product } from '../types';

interface WishlistItem {
  id: string;
  product_id: number;
  product_name: string;
  product_price: number;
  image_url: string;
  rating?: number;
  stock?: number;
}

interface CartContextType {
  cart: CartItem[];
  savedForLater: CartItem[];
  wishlist: WishlistItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: number, variantId?: number | null) => void;
  updateQuantity: (productId: number, variantId: number | null | undefined, delta: number) => void;
  saveForLater: (productId: number, variantId?: number | null) => void;
  moveToCartFromSaved: (productId: number, variantId?: number | null) => void;
  clearCart: () => void;

  // Wishlist
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: number) => void;
  moveToCartFromWishlist: (productId: number) => void;
  isInWishlist: (productId: number) => boolean;

  // Coupons & Pricing
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; message?: string }>;
  removeCoupon: () => void;

  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  taxEstimate: number;
  totalAmount: number;
  cartCount: number;
  wishlistCount: number;

  // Mini Cart
  isMiniCartOpen: boolean;
  openMiniCart: () => void;
  closeMiniCart: () => void;
  cartNote: string;
  setCartNote: (note: string) => void;
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

  const [savedForLater, setSavedForLater] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('hm_saved_later');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<WishlistItem[]>(() => {
    try {
      const saved = localStorage.getItem('hm_wishlist');
      return saved ? JSON.parse(saved) : [
        { id: 'wl1', product_id: 1, product_name: 'KSM-66 Ashwagandha Powder', product_price: 499, image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400', rating: 4.8, stock: 45 },
        { id: 'wl2', product_id: 2, product_name: 'Himalayan Tulsi Green Tea', product_price: 299, image_url: 'https://images.unsplash.com/photo-1609501676725-7186f017a4b7?w=400', rating: 4.7, stock: 80 }
      ];
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

  const [isMiniCartOpen, setIsMiniCartOpen] = useState(false);
  const [cartNote, setCartNote] = useState(() => localStorage.getItem('hm_cart_note') || '');

  useEffect(() => { localStorage.setItem('hm_cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('hm_saved_later', JSON.stringify(savedForLater)); }, [savedForLater]);
  useEffect(() => { localStorage.setItem('hm_wishlist', JSON.stringify(wishlist)); }, [wishlist]);
  useEffect(() => { localStorage.setItem('hm_cart_note', cartNote); }, [cartNote]);
  useEffect(() => {
    if (appliedCoupon) localStorage.setItem('hm_coupon', JSON.stringify(appliedCoupon));
    else localStorage.removeItem('hm_coupon');
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

    // Also sync to API asynchronously
    fetch('/api/cart/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: newItem.product_id, variant_id: newItem.variant_id, quantity: newItem.quantity, price: newItem.price })
    }).catch(() => {});

    setIsMiniCartOpen(true);
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

  const saveForLater = (productId: number, variantId?: number | null) => {
    const item = cart.find(i => i.product_id === productId && i.variant_id === variantId);
    if (!item) return;
    setCart(prev => prev.filter(i => !(i.product_id === productId && i.variant_id === variantId)));
    setSavedForLater(prev => [...prev, item]);
  };

  const moveToCartFromSaved = (productId: number, variantId?: number | null) => {
    const item = savedForLater.find(i => i.product_id === productId && i.variant_id === variantId);
    if (!item) return;
    setSavedForLater(prev => prev.filter(i => !(i.product_id === productId && i.variant_id === variantId)));
    addToCart(item);
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  // Wishlist actions
  const addToWishlist = (product: Product) => {
    if (isInWishlist(product.id)) return;
    const newItem: WishlistItem = {
      id: `wl_${Date.now()}`,
      product_id: product.id,
      product_name: product.name,
      product_price: product.price,
      image_url: product.image_url,
      rating: product.avg_rating,
      stock: product.stock
    };
    setWishlist(prev => [newItem, ...prev]);
    fetch('/api/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: product.id })
    }).catch(() => {});
  };

  const removeFromWishlist = (productId: number) => {
    setWishlist(prev => prev.filter(i => i.product_id !== productId));
    fetch(`/api/wishlist/${productId}`, { method: 'DELETE' }).catch(() => {});
  };

  const moveToCartFromWishlist = (productId: number) => {
    const item = wishlist.find(i => i.product_id === productId);
    if (!item) return;
    removeFromWishlist(productId);
    addToCart({
      id: Date.now(),
      product_id: item.product_id,
      name: item.product_name,
      title: item.product_name,
      price: item.product_price,
      quantity: 1,
      image_url: item.image_url,
      image: item.image_url
    });
  };

  const isInWishlist = (productId: number) => wishlist.some(i => i.product_id === productId);

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = appliedCoupon ? (appliedCoupon.calculatedDiscount || 0) : 0;
  const shippingFee = subtotal >= 499 || cart.length === 0 || appliedCoupon?.is_free_shipping ? 0 : 40;
  const taxEstimate = Math.round(subtotal * 0.05); // 5% Ayush GST Estimate
  const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlist.length;

  const applyCoupon = async (code: string) => {
    try {
      const res = await fetch('/api/coupons/validate', {
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
      const c = code.toUpperCase();
      if (c === 'WELCOME100' && subtotal >= 499) {
        setAppliedCoupon({ code: 'WELCOME100', discountType: 'flat', discountValue: 100, calculatedDiscount: 100 });
        return { success: true };
      }
      if (c === 'MONK15' && subtotal >= 799) {
        const disc = Math.min(subtotal * 0.15, 250);
        setAppliedCoupon({ code: 'MONK15', discountType: 'percentage', discountValue: 15, calculatedDiscount: disc });
        return { success: true };
      }
      return { success: false, message: 'Invalid code or minimum order requirement not met' };
    }
  };

  const removeCoupon = () => setAppliedCoupon(null);

  const openMiniCart = () => setIsMiniCartOpen(true);
  const closeMiniCart = () => setIsMiniCartOpen(false);

  return (
    <CartContext.Provider
      value={{
        cart,
        savedForLater,
        wishlist,
        addToCart,
        removeFromCart,
        updateQuantity,
        saveForLater,
        moveToCartFromSaved,
        clearCart,
        addToWishlist,
        removeFromWishlist,
        moveToCartFromWishlist,
        isInWishlist,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        subtotal,
        discountAmount,
        shippingFee,
        taxEstimate,
        totalAmount,
        cartCount,
        wishlistCount,
        isMiniCartOpen,
        openMiniCart,
        closeMiniCart,
        cartNote,
        setCartNote,
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

import React, { useState } from 'react';
import { Heart, ShoppingBag, Trash2, ArrowLeft, Share2, Star, CheckCircle2, Copy } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Button } from '../shared/components/ui/Button';

interface WishlistViewProps {
  onContinueShopping: () => void;
}

export const WishlistView: React.FC<WishlistViewProps> = ({ onContinueShopping }) => {
  const { wishlist, removeFromWishlist, moveToCartFromWishlist, wishlistCount } = useCart();
  const [copiedNotice, setCopiedNotice] = useState(false);

  const handleShareWishlist = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <Heart className="w-7 h-7 text-red-500 fill-red-500" /> My Saved Wishlist
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">{wishlistCount} saved herbal formulations</p>
        </div>
        <div className="flex items-center gap-2">
          {wishlistCount > 0 && (
            <Button variant="outline" size="sm" icon={<Share2 className="w-3.5 h-3.5" />} onClick={handleShareWishlist}>
              {copiedNotice ? 'Link Copied!' : 'Share Wishlist'}
            </Button>
          )}
          <button onClick={onContinueShopping} className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 text-xs font-bold">
            <ArrowLeft className="w-4 h-4" /> Continue Shopping
          </button>
        </div>
      </div>

      {wishlist.length === 0 ? (
        <div className="wp-card p-12 text-center rounded-3xl bg-white max-w-xl mx-auto space-y-4 my-8">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto border border-red-200">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="font-heading font-extrabold text-xl text-slate-900">Your Wishlist is Empty</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Save your favourite Himalayan organic teas, Ashwagandha, and immunity boosters to purchase later!
          </p>
          <div className="pt-2">
            <button onClick={onContinueShopping} className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition-all">
              Explore Product Catalog
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {wishlist.map((item) => (
            <div key={item.id} className="wp-card bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between hover:shadow-md transition-all">
              <div>
                <div className="h-44 bg-slate-100 relative overflow-hidden">
                  <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                  <button onClick={() => removeFromWishlist(item.product_id)} className="absolute top-2 right-2 p-2 rounded-full bg-white/90 text-red-500 hover:bg-red-50 transition-colors shadow-xs">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-4 space-y-1.5">
                  <h3 className="font-heading font-bold text-sm text-slate-900 truncate">{item.product_name}</h3>
                  <div className="flex items-center gap-1 text-xs">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="font-bold text-slate-800">{item.rating || 4.8}</span>
                    <span className="text-slate-400">(Verified)</span>
                  </div>
                  <p className="font-extrabold text-emerald-800 text-base">₹{item.product_price}</p>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 pt-3">
                <button onClick={() => moveToCartFromWishlist(item.product_id)} className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all">
                  <ShoppingBag className="w-3.5 h-3.5" /> Move to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

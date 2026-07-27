import React, { useState } from 'react';
import { Search, ShoppingBag, Heart, Phone, Mail, ShieldCheck, User, Menu, X, SlidersHorizontal } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Category } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categories?: Category[];
  onSelectCategory?: (catId: number | null) => void;
  user?: any;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  categories = [],
  onSelectCategory = () => {},
  user = null,
  onLogout,
}) => {
  const { cart } = useCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* 1. Top Announcement Bar */}
      <div className="bg-emerald-800 text-white text-[11px] font-semibold py-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-4 text-emerald-100 flex-wrap justify-center">
            <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-amber-400" /> +91 98123 45678</span>
            <span className="hidden md:flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-amber-400" /> support@healthymonks.com</span>
            <span className="flex items-center gap-1 text-amber-300 font-bold"><ShieldCheck className="w-3.5 h-3.5" /> 100% Ayush Certified Organic</span>
          </div>

          <div className="flex items-center gap-3 text-emerald-100">
            <span className="bg-emerald-900/60 text-amber-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-emerald-700">
              FREE Shipping on Orders Over ₹499
            </span>
            <span className="text-[10px] text-slate-300 font-medium">Currency: INR (₹)</span>
          </div>
        </div>
      </div>

      {/* 2. Main Brand Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 text-left group"
          >
            <img
              src="/logo.png"
              alt="Healthy Monks"
              className="w-10 h-10 rounded-xl shadow-xs object-cover"
            />
            <div>
              <span className="font-heading font-extrabold text-lg sm:text-xl text-slate-900 leading-none block tracking-tight">
                Healthy Monks
              </span>
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest block mt-0.5">
                Ayurvedic Wellness Store
              </span>
            </div>
          </button>
        </div>

        {/* Desktop Search Bar */}
        <div className="hidden lg:flex flex-1 max-w-xl mx-8">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search Ashwagandha, Tulsi Tea, Chyawanprash..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 text-xs font-medium rounded-xl pl-4 pr-10 py-2.5 border border-slate-300 focus:outline-none focus:border-emerald-700 focus:bg-white transition-all shadow-2xs"
            />
            <button
              onClick={() => setActiveTab('shop')}
              className="absolute right-1 top-1 bottom-1 bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 rounded-lg flex items-center justify-center transition-all"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setActiveTab('wishlist')}
            className="relative flex items-center gap-1.5 p-2 px-3 rounded-xl hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all"
          >
            <Heart className="w-4 h-4 text-emerald-700 fill-emerald-100" />
            <span className="hidden xl:inline">Wishlist</span>
          </button>

          <button
            onClick={() => setActiveTab('cart')}
            className="relative flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 px-3.5 py-2.5 rounded-xl transition-all font-semibold text-xs"
          >
            <ShoppingBag className="w-4 h-4 text-emerald-700" />
            <span className="hidden sm:inline font-bold">Cart</span>
            {totalItems > 0 && (
              <span className="bg-emerald-700 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-2xs">
                {totalItems}
              </span>
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveTab('admin')}
                className="flex items-center gap-1.5 bg-emerald-800 hover:bg-emerald-900 text-white px-3.5 py-2.5 rounded-xl transition-all font-bold text-xs shadow-xs"
              >
                <User className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">{user.name || 'My Account'}</span>
              </button>
              {onLogout && (
                <button
                  onClick={onLogout}
                  title="Log Out"
                  className="bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 px-2.5 py-2.5 rounded-xl transition-all font-bold text-xs"
                >
                  Log Out
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => setActiveTab('login')}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2.5 rounded-xl transition-all font-bold text-xs shadow-xs"
            >
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Sign In / Account</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Mobile Search Input Bar */}
      <div className="lg:hidden px-4 pb-3">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search herbal supplements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl pl-4 pr-9 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
        </div>
      </div>

      {/* 4. Sub-Navigation Category Links */}
      <div className="bg-emerald-900 border-t border-emerald-800 px-4 sm:px-6 lg:px-8 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-2 text-xs font-semibold whitespace-nowrap py-1">
          <button
            onClick={() => {
              onSelectCategory(null);
              setActiveTab('shop');
            }}
            className={`px-3 py-2 rounded-lg transition-all ${
              activeTab === 'shop'
                ? 'bg-white text-emerald-900 font-bold'
                : 'text-emerald-100 hover:text-white hover:bg-emerald-700/60'
            }`}
          >
            All Catalog
          </button>

          {(categories || []).map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                onSelectCategory(cat.id);
                setActiveTab('shop');
              }}
              className="px-3 py-2 rounded-lg text-emerald-100 hover:text-white hover:bg-emerald-700/60 transition-all"
            >
              {cat.name}
            </button>
          ))}

          <button
            onClick={() => setActiveTab('blog')}
            className={`px-3 py-2 rounded-lg transition-all ${
              activeTab === 'blog'
                ? 'bg-white text-emerald-900 font-bold'
                : 'text-emerald-100 hover:text-white hover:bg-emerald-700/60'
            }`}
          >
            Health Blog
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`px-3 py-2 rounded-lg transition-all ${
              activeTab === 'about'
                ? 'bg-white text-emerald-900 font-bold'
                : 'text-emerald-100 hover:text-white hover:bg-emerald-700/60'
            }`}
          >
            About Us
          </button>

          <button
            onClick={() => setActiveTab('contact')}
            className={`px-3 py-2 rounded-lg transition-all ${
              activeTab === 'contact'
                ? 'bg-white text-emerald-900 font-bold'
                : 'text-emerald-100 hover:text-white hover:bg-emerald-700/60'
            }`}
          >
            Contact
          </button>

          <button
            onClick={() => setActiveTab('track')}
            className={`px-3 py-2 rounded-lg transition-all ml-auto ${
              activeTab === 'track'
                ? 'bg-amber-400 text-emerald-950 font-bold'
                : 'text-amber-300 font-bold hover:bg-amber-400/20 hover:text-amber-200'
            }`}
          >
            Track Order
          </button>
        </div>
      </div>
    </header>
  );
};

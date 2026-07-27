import React, { useState } from 'react';
import { ShoppingBag, Search, Download, ShieldCheck, LayoutDashboard, Leaf, Bell, Phone, Mail, User, Heart, ChevronDown } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { usePWA } from '../context/PWAContext';
import { Category } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categories: Category[];
  onSelectCategory: (id: number | null) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  categories,
  onSelectCategory,
}) => {
  const { cartCount, subtotal } = useCart();
  const { isInstallable, promptInstall, isOnline, pushSubscribed, requestPushPermission } = usePWA();
  const [showSearchMobile, setShowSearchMobile] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* 1. WordPress Top Announcement Bar */}
      <div className="wp-topbar py-1.5 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-emerald-300" /> +91 9876543210</span>
            <span className="hidden md:flex items-center gap-1"><Mail className="w-3 h-3 text-emerald-300" /> support@healthymonks.com</span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="font-semibold text-amber-300">🌿 100% Certified Organic & Ayurvedic Remedies</span>
            {!isOnline && (
              <span className="bg-amber-500/20 text-amber-200 text-[10px] px-2 py-0.5 rounded border border-amber-400/30">
                Offline Mode
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. WordPress Main Brand & Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        {/* WordPress Logo */}
        <button
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3 text-left focus:outline-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-800 to-green-600 p-0.5 shadow-md flex items-center justify-center text-white">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                Healthy <span className="text-emerald-700">Monks</span>
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                WooCommerce PWA
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">Pure Wellness & Organic Store</p>
          </div>
        </button>

        {/* WordPress Desktop Search Box */}
        <div className="hidden lg:flex items-center relative flex-1 max-w-lg mx-6">
          <div className="w-full flex items-center bg-slate-50 border border-slate-300 rounded-xl overflow-hidden focus-within:border-emerald-600 focus-within:ring-1 focus-within:ring-emerald-600 transition-all">
            <input
              type="text"
              placeholder="Search KSM-66 Ashwagandha, Green Tea, Triphala..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setActiveTab('shop')}
              className="w-full text-slate-800 placeholder-slate-400 text-xs px-4 py-2.5 bg-transparent border-none focus:outline-none"
            />
            <button
              onClick={() => setActiveTab('shop')}
              className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 text-xs font-bold flex items-center gap-1 transition-colors"
            >
              <Search className="w-4 h-4" /> Search
            </button>
          </div>
        </div>

        {/* Right User Action Widgets */}
        <div className="flex items-center gap-3">
          {/* Mobile Search Icon */}
          <button
            onClick={() => {
              setShowSearchMobile(!showSearchMobile);
              setActiveTab('shop');
            }}
            className="lg:hidden p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* PWA Install Button */}
          {isInstallable && (
            <button
              onClick={promptInstall}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-all"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Install PWA App</span>
            </button>
          )}

          {/* Push Alerts */}
          <button
            onClick={requestPushPermission}
            title={pushSubscribed ? 'Alerts Active' : 'Enable Push Notifications'}
            className={`p-2 rounded-xl border text-xs transition-all ${
              pushSubscribed
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-50 text-slate-500 border-slate-200 hover:text-emerald-700'
            }`}
          >
            <Bell className="w-4 h-4" />
          </button>

          {/* WooCommerce Cart Widget */}
          <button
            onClick={() => setActiveTab('cart')}
            className="flex items-center gap-2.5 bg-slate-900 hover:bg-slate-800 text-white p-2 sm:px-4 sm:py-2 rounded-xl transition-all shadow-xs"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-500 text-slate-950 font-extrabold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
            <div className="hidden sm:block text-left text-xs">
              <span className="text-[10px] text-slate-400 block font-normal leading-none">Cart Total</span>
              <span className="font-extrabold text-white">₹{subtotal}</span>
            </div>
          </button>
        </div>
      </div>

      {/* 3. WordPress Sub-Navigation Bar */}
      <div className="wp-subnav hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <nav className="flex items-center gap-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-4 py-3 hover:text-emerald-700 transition-colors ${
                activeTab === 'home' ? 'text-emerald-700 font-extrabold border-b-2 border-emerald-700 bg-white' : 'text-slate-700'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => {
                onSelectCategory(null);
                setActiveTab('shop');
              }}
              className={`px-4 py-3 hover:text-emerald-700 transition-colors ${
                activeTab === 'shop' ? 'text-emerald-700 font-extrabold border-b-2 border-emerald-700 bg-white' : 'text-slate-700'
              }`}
            >
              Shop Catalog
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.id);
                  setActiveTab('shop');
                }}
                className="px-3 py-3 text-slate-600 hover:text-emerald-700 transition-colors"
              >
                {cat.name}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('track')}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'track' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Track Order Status
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-lg border transition-all ${
                activeTab === 'admin'
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" /> WP Admin Panel
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {showSearchMobile && (
        <div className="lg:hidden p-3 bg-slate-100 border-t border-slate-200">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-slate-900 text-xs rounded-xl pl-9 pr-4 py-2.5 border border-slate-300 focus:outline-none focus:border-emerald-600"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>
        </div>
      )}
    </header>
  );
};

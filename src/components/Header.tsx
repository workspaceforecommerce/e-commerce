import React, { useState } from 'react';
import { ShoppingBag, Search, Download, ShieldCheck, LayoutDashboard, Leaf, Bell } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { usePWA } from '../context/PWAContext';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
}) => {
  const { cartCount } = useCart();
  const { isInstallable, promptInstall, isOnline, pushSubscribed, requestPushPermission } = usePWA();
  const [showSearch, setShowSearch] = useState(false);

  return (
    <header className="sticky top-0 z-40 glass-nav transition-all">
      {/* Top Banner Notice */}
      <div className="bg-emerald-950/80 text-emerald-300 text-xs py-1.5 px-4 text-center border-b border-emerald-800/40 flex items-center justify-center gap-2 font-medium">
        <Leaf className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
        <span>Use Code <strong className="text-amber-400 underline">WELCOME100</strong> for ₹100 Flat OFF on first order!</span>
        {!isOnline && (
          <span className="bg-amber-500/20 text-amber-300 text-[10px] px-2 py-0.5 rounded-full border border-amber-500/30">
            Offline Mode
          </span>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <button
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2.5 text-left group focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-green-500 p-0.5 shadow-lg shadow-emerald-900/30 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
              <Leaf className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-extrabold text-xl tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                Healthy <span className="text-emerald-400">Monks</span>
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                PWA
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">100% Organic & Ayurvedic Nutrition</p>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('home')}
            className={`hover:text-emerald-400 transition-colors ${activeTab === 'home' ? 'text-emerald-400 font-semibold border-b-2 border-emerald-500 pb-1' : 'text-slate-300'}`}
          >
            Home
          </button>
          <button
            onClick={() => setActiveTab('shop')}
            className={`hover:text-emerald-400 transition-colors ${activeTab === 'shop' ? 'text-emerald-400 font-semibold border-b-2 border-emerald-500 pb-1' : 'text-slate-300'}`}
          >
            Shop All
          </button>
          <button
            onClick={() => setActiveTab('track')}
            className={`hover:text-emerald-400 transition-colors ${activeTab === 'track' ? 'text-emerald-400 font-semibold border-b-2 border-emerald-500 pb-1' : 'text-slate-300'}`}
          >
            Track Order
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-all ${
              activeTab === 'admin'
                ? 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-900/40'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Admin Panel
          </button>
        </nav>

        {/* Search Bar Input */}
        <div className="hidden lg:flex items-center relative flex-1 max-w-xs">
          <input
            type="text"
            placeholder="Search Ashwagandha, Green Tea..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setActiveTab('shop')}
            className="w-full bg-slate-800/80 text-slate-200 placeholder-slate-400 text-xs rounded-xl pl-9 pr-4 py-2 border border-slate-700/60 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Mobile Search Toggle */}
          <button
            onClick={() => {
              setShowSearch(!showSearch);
              setActiveTab('shop');
            }}
            className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Push Notification Subscribe */}
          <button
            onClick={requestPushPermission}
            title={pushSubscribed ? 'Push Alerts Enabled' : 'Enable Push Alerts'}
            className={`p-2 rounded-xl transition-all ${
              pushSubscribed
                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                : 'bg-slate-800 text-slate-400 hover:text-amber-300'
            }`}
          >
            <Bell className="w-5 h-5" />
          </button>

          {/* PWA Install Button */}
          {isInstallable && (
            <button
              onClick={promptInstall}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-bold px-3 py-2 rounded-xl shadow-lg shadow-amber-500/20 hover:scale-105 transition-all"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Install App</span>
            </button>
          )}

          {/* Cart Icon */}
          <button
            onClick={() => setActiveTab('cart')}
            className="relative p-2.5 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition-colors"
          >
            <ShoppingBag className="w-5 h-5 text-emerald-400" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Search Input Overlay */}
      {showSearch && (
        <div className="lg:hidden px-4 pb-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 text-white text-xs rounded-xl pl-9 pr-4 py-2.5 border border-emerald-500/50 focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>
        </div>
      )}
    </header>
  );
};

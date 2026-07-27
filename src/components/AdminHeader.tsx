import React, { useState } from 'react';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Globe,
  User,
  LogOut,
  Sliders,
  ChevronDown,
  ShieldCheck
} from 'lucide-react';
import { NotificationDrawer } from './NotificationDrawer';

interface AdminHeaderProps {
  onSearch?: (query: string) => void;
  onLogout?: () => void;
  unreadCount?: number;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onSearch, onLogout, unreadCount = 2 }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unread, setUnread] = useState(unreadCount);

  const notifications = [
    { id: 1, title: 'Order Payment Received', body: 'Order #HM-ORD-1002 payment of ₹599 verified.', unread: true, time: '5m ago' },
    { id: 2, title: 'Low Stock Alert', body: 'Ashwagandha Powder stock reached 15 units.', unread: true, time: '30m ago' },
    { id: 3, title: 'Security Audit Pass', body: 'Daily automated backup & SSL health check completed.', unread: false, time: '2h ago' },
  ];

  return (
    <>
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-2xs">
        {/* Global Search Input */}
        <div className="flex-1 max-w-md relative">
          <input
            type="text"
            placeholder="Global Search (Products, Orders, Customers, Users, Coupons)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (onSearch) onSearch(e.target.value);
            }}
            className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl pl-9 pr-4 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700 transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Dark / Light Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Toggle Dark / Light Mode"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Language Switch */}
          <div className="hidden sm:flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            <Globe className="w-3.5 h-3.5 text-emerald-700" />
            <span>EN (IN)</span>
          </div>

          {/* Notification Bell */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <Bell className="w-4 h-4 text-emerald-700" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                {unread}
              </span>
            )}
          </button>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 p-1.5 pl-2.5 rounded-xl transition-all border border-slate-200"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center">
                SA
              </div>
              <div className="text-left hidden md:block">
                <span className="text-xs font-bold text-slate-900 block leading-tight">Super Admin</span>
                <span className="text-[10px] text-emerald-700 font-semibold block">Role #1</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-40 text-xs space-y-1 animate-in fade-in">
                <div className="px-3 py-2 border-b border-slate-100">
                  <span className="font-bold text-slate-900 block">Super Admin</span>
                  <span className="text-[10px] text-slate-500 block truncate">admin@healthymonks.com</span>
                </div>
                <button
                  onClick={() => setProfileOpen(false)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 flex items-center gap-2 text-slate-700 font-medium"
                >
                  <User className="w-3.5 h-3.5 text-emerald-700" /> My Profile
                </button>
                <button
                  onClick={() => setProfileOpen(false)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 flex items-center gap-2 text-slate-700 font-medium"
                >
                  <Sliders className="w-3.5 h-3.5 text-emerald-700" /> Dashboard Settings
                </button>
                {onLogout && (
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 font-bold flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        notifications={notifications}
        onMarkAllRead={() => setUnread(0)}
      />
    </>
  );
};

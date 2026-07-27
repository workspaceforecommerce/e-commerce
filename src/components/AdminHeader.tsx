import React, { useState } from 'react';
import { Search, Bell, Moon, Sun, User, Command, Globe, Check } from 'lucide-react';
import { NotificationDrawer } from './NotificationDrawer';
import { CommandPalette } from '../shared/components/CommandPalette';
import { useI18n, Language } from '../context/I18nContext';

interface AdminHeaderProps {
  onSearch?: (query: string) => void;
  onNavigateTab?: (tab: string) => void;
  onLogout?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onSearch, onNavigateTab = () => {}, onLogout }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const { language, setLanguage, t } = useI18n();

  const unreadCount = 4;

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'en', name: 'English (US)', flag: '🇺🇸' },
    { code: 'hi', name: 'हिंदी (Hindi)', flag: '🇮🇳' },
    { code: 'es', name: 'Español (Spanish)', flag: '🇪🇸' },
  ];

  return (
    <>
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-2xs">
        {/* Left Global Command Search Bar */}
        <div className="flex-1 max-w-md">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="w-full bg-slate-50 hover:bg-slate-100 text-slate-500 text-xs rounded-xl px-3.5 py-2 border border-slate-300 flex items-center justify-between transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>{t('search_placeholder')}</span>
            </div>
            <kbd className="hidden sm:inline-block bg-slate-200 text-slate-700 text-[10px] font-mono px-1.5 py-0.5 rounded border border-slate-300">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Right Utility Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Multi-Language Selector */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Globe className="w-4 h-4 text-emerald-700" />
              <span className="uppercase">{language}</span>
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 text-xs animate-in fade-in">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.code);
                      setLangMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between font-medium text-slate-800"
                  >
                    <span>
                      {l.flag} {l.name}
                    </span>
                    {language === l.code && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Notification Bell */}
          <button
            onClick={() => setNotificationsOpen(true)}
            className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <Bell className="w-4 h-4 text-slate-700" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Profile Menu */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-emerald-800 text-amber-300 font-extrabold text-xs flex items-center justify-center border border-emerald-600 shadow-2xs">
              AD
            </div>
            <div className="hidden md:block text-left text-xs">
              <p className="font-bold text-slate-900 leading-tight">Admin Master</p>
              <span className="text-[10px] text-emerald-700 font-bold uppercase">Super Admin</span>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                title="Logout Admin"
                className="ml-1 p-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 border border-slate-200 transition-colors flex items-center gap-1 font-bold text-xs"
              >
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Slide-over Notification Drawer */}
      <NotificationDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={[
          { id: 1, type: 'order', title: 'New Order #HM-1029', time: '5 mins ago', read: false },
          { id: 2, type: 'stock', title: 'Low Stock Alert: Tulsi Tea', time: '1 hour ago', read: false },
          { id: 3, type: 'security', title: 'Admin Login from IP 49.207.200.5', time: '3 hours ago', read: true }
        ]}
        onMarkAllRead={() => {}}
      />

      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onSelectAction={(tab) => onNavigateTab(tab)}
      />
    </>
  );
};

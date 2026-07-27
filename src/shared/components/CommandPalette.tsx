import React, { useState, useEffect } from 'react';
import { Search, Package, ShoppingBag, Users, FileText, Settings, Key, X, ArrowRight } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (action: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectAction,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open triggered by parent or listener
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands = [
    { id: 'products', title: 'Product Catalog Master', icon: <Package className="w-4 h-4 text-emerald-700" />, section: 'Modules' },
    { id: 'orders', title: 'Order Master & Shipping', icon: <ShoppingBag className="w-4 h-4 text-amber-700" />, section: 'Modules' },
    { id: 'users-rbac', title: 'User Management & RBAC', icon: <Users className="w-4 h-4 text-blue-700" />, section: 'Admin' },
    { id: 'cms', title: 'Content & Banners CMS', icon: <FileText className="w-4 h-4 text-emerald-700" />, section: 'Modules' },
    { id: 'api-logs', title: 'API Security Logs', icon: <Key className="w-4 h-4 text-purple-700" />, section: 'System' },
    { id: 'settings', title: 'System Settings', icon: <Settings className="w-4 h-4 text-slate-700" />, section: 'System' },
  ];

  const filtered = commands.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full p-4 shadow-2xl space-y-3 border border-slate-200 animate-in zoom-in-95">
        {/* Search Bar */}
        <div className="relative flex items-center border-b border-slate-200 pb-3">
          <Search className="w-4 h-4 text-slate-400 absolute left-3" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command or search... (Esc to exit)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl pl-9 pr-9 py-2.5 focus:outline-none focus:bg-white border border-slate-200 font-medium"
          />
          <button onClick={onClose} className="absolute right-3 p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command Items List */}
        <div className="max-h-72 overflow-y-auto space-y-1 text-xs">
          {filtered.length === 0 ? (
            <p className="text-slate-400 text-center py-6">No matching commands found.</p>
          ) : (
            filtered.map((cmd) => (
              <button
                key={cmd.id}
                onClick={() => {
                  onSelectAction(cmd.id);
                  onClose();
                }}
                className="w-full text-left p-3 rounded-xl hover:bg-slate-100 flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">{cmd.icon}</div>
                  <div>
                    <h4 className="font-bold text-slate-900 group-hover:text-emerald-800">{cmd.title}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">{cmd.section}</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-700 transition-colors" />
              </button>
            ))
          )}
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>Navigate with Arrow keys</span>
          <span>Press Enter to select</span>
        </div>
      </div>
    </div>
  );
};

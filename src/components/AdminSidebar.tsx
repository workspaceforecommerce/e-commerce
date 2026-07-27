import React, { useState } from 'react';
import {
  LayoutDashboard, Package, FolderTree, ShoppingBag, Clock, Sliders,
  Send, Users, ShieldCheck, ChevronLeft, ChevronRight, LogOut,
  Sparkles, MessageSquare, Activity, Images, Tag, Ticket, CreditCard
} from 'lucide-react';

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, setActiveTab, onLogout }) => {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'products', label: 'Product Catalog', icon: Package },
    { id: 'categories', label: 'Categories & Tree', icon: FolderTree },
    { id: 'variants', label: 'Variants & Attributes', icon: Sliders },
    { id: 'brands', label: 'Brands & Collections', icon: Tag },
    { id: 'media', label: 'Media Library', icon: Images },
    { id: 'orders', label: 'Order Fulfillment', icon: ShoppingBag },
    { id: 'users-rbac', label: 'Users & RBAC Roles', icon: ShieldCheck },
    { id: 'abandoned', label: 'Abandoned Carts', icon: Clock },
    { id: 'cms', label: 'CMS & Banner Editor', icon: Sliders },
    { id: 'reviews', label: 'Customer Reviews', icon: MessageSquare },
    { id: 'coupons', label: 'Coupons & Promotions', icon: Ticket },
    { id: 'payments', label: 'Payments & Gateways', icon: CreditCard },
    { id: 'api-logs', label: 'Security & Audit Logs', icon: Activity },
  ];

  return (
    <aside
      className={`bg-slate-900 text-white min-h-screen border-r border-slate-800 flex flex-col justify-between transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div>
        {/* Header Branding */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-700 flex items-center justify-center font-heading font-extrabold text-sm text-white">
                HM
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-sm text-white leading-tight">
                  Healthy Monks
                </h3>
                <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest block">
                  Enterprise Control
                </span>
              </div>
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors mx-auto"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="p-2 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-700 text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile / Logout */}
      <div className="p-3 border-t border-slate-800">
        {!collapsed ? (
          <div className="flex items-center justify-between bg-slate-800/80 p-2.5 rounded-xl text-xs">
            <div className="truncate pr-2">
              <span className="font-bold text-white block truncate">Super Admin</span>
              <span className="text-[10px] text-emerald-400 font-semibold block">Role #1 (RBAC)</span>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={onLogout}
            className="w-full flex justify-center p-2 text-slate-400 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
};

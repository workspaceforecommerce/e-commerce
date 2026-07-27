import React from 'react';
import { X, Bell, CheckCircle, ShieldAlert, ShoppingBag, Clock } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: any[];
  onMarkAllRead: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 animate-in slide-in-from-right">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-700" />
            <h3 className="font-heading font-bold text-sm text-slate-900">System Notifications</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
            <span className="text-slate-500 font-semibold">{notifications.length} Total Alerts</span>
            <button
              onClick={onMarkAllRead}
              className="text-emerald-700 hover:underline font-bold text-[11px]"
            >
              Mark All Read
            </button>
          </div>

          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-3.5 rounded-xl border transition-all text-xs space-y-1 ${
                n.unread
                  ? 'bg-emerald-50/60 border-emerald-200 text-slate-900 shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span className="flex items-center gap-1.5">
                  {n.title.includes('Security') ? (
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                  ) : (
                    <ShoppingBag className="w-3.5 h-3.5 text-emerald-700" />
                  )}
                  {n.title}
                </span>
                <span className="text-[10px] text-slate-400 font-normal">{n.time}</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">{n.body}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 text-center text-xs">
          <span className="text-slate-500 font-medium">Real-Time Event Dispatcher Active</span>
        </div>
      </div>
    </div>
  );
};

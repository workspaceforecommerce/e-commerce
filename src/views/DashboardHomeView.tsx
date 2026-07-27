import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  ShoppingBag,
  Clock,
  AlertTriangle,
  Users,
  TrendingUp,
  Plus,
  ArrowUpRight,
  CheckCircle,
  FileText,
  Activity,
  UserPlus,
  Tag,
  Send,
  Sliders
} from 'lucide-react';

interface DashboardHomeViewProps {
  onQuickAction?: (action: string) => void;
}

export const DashboardHomeView: React.FC<DashboardHomeViewProps> = ({ onQuickAction }) => {
  const [stats, setStats] = useState({
    todays_revenue: 18450.00,
    todays_orders: 14,
    monthly_revenue: 145890.00,
    monthly_orders: 124,
    active_customers: 86,
    total_products: 32,
    pending_orders: 8,
    low_stock_count: 4,
    revenue_growth: 14.8,
  });

  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentCustomers, setRecentCustomers] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [sRes, oRes, cRes, aRes]: [any, any, any, any] = await Promise.all([
          fetch('/api/dashboard/stats').then((r) => r.json()),
          fetch('/api/dashboard/orders').then((r) => r.json()),
          fetch('/api/dashboard/customers').then((r) => r.json()),
          fetch('/api/dashboard/activities').then((r) => r.json()),
        ]);

        if (sRes.success) setStats(sRes.data);
        if (oRes.success && oRes.data?.recent_orders) setRecentOrders(oRes.data.recent_orders);
        if (cRes.success) setRecentCustomers(cRes.data);
        if (aRes.success) setActivities(aRes.data);
      } catch {
        console.log('Using local fallback state for Dashboard');
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* 1. Quick Actions Bar */}
      <div className="wp-card p-4 rounded-2xl flex items-center gap-3 overflow-x-auto scrollbar-none bg-white">
        <span className="text-xs font-extrabold text-slate-900 shrink-0 uppercase tracking-wider flex items-center gap-1.5">
          <Sliders className="w-4 h-4 text-emerald-700" /> Quick Actions:
        </span>
        <div className="flex items-center gap-2">
          {[
            { label: 'Add Product', action: 'add-product', icon: Plus },
            { label: 'Create Coupon', action: 'create-coupon', icon: Tag },
            { label: 'Add Banner', action: 'add-banner', icon: Sliders },
            { label: 'Push Alert', action: 'push-alert', icon: Send },
            { label: 'Create User', action: 'create-user', icon: UserPlus },
          ].map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.action}
                onClick={() => onQuickAction && onQuickAction(act.action)}
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 transition-all shrink-0"
              >
                <Icon className="w-3.5 h-3.5 text-emerald-700" /> {act.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Top Stats Widget Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Revenue */}
        <div className="wp-card p-5 rounded-2xl space-y-3 bg-white border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase">Today's Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900">₹{stats.todays_revenue.toLocaleString()}</span>
            <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> +{stats.revenue_growth}%
            </span>
          </div>
          <p className="text-[11px] text-slate-500">{stats.todays_orders} Orders Received Today</p>
        </div>

        {/* Monthly Sales */}
        <div className="wp-card p-5 rounded-2xl space-y-3 bg-white border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase">Monthly Sales</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900">₹{stats.monthly_revenue.toLocaleString()}</span>
            <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> +8.2%
            </span>
          </div>
          <p className="text-[11px] text-slate-500">{stats.monthly_orders} Orders Completed</p>
        </div>

        {/* Active Customers */}
        <div className="wp-card p-5 rounded-2xl space-y-3 bg-white border-l-4 border-l-blue-600">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase">Active Shoppers</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900">{stats.active_customers}</span>
            <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> +12.4%
            </span>
          </div>
          <p className="text-[11px] text-slate-500">{stats.total_products} Active Products</p>
        </div>

        {/* Inventory Warning */}
        <div className="wp-card p-5 rounded-2xl space-y-3 bg-white border-l-4 border-l-red-600">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase">Low Stock Warnings</span>
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-200">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-red-600">{stats.low_stock_count}</span>
            <span className="text-[11px] font-bold text-amber-700">{stats.pending_orders} Pending</span>
          </div>
          <p className="text-[11px] text-slate-500">Requires Urgent Restock</p>
        </div>
      </div>

      {/* 3. Analytics Charts Mock Banner */}
      <div className="wp-card p-6 rounded-2xl bg-white space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h3 className="font-heading font-bold text-base text-slate-900">Revenue & Sales Growth Trend</h3>
            <p className="text-xs text-slate-500">Monthly breakdown for fiscal year 2026</p>
          </div>
          <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
            Peak: ₹145,890 / Mo
          </span>
        </div>

        {/* Simple CSS Visual Representation of Bar Chart */}
        <div className="grid grid-cols-7 gap-2 items-end h-40 pt-4 px-2">
          {[
            { month: 'Jan', val: 40 },
            { month: 'Feb', val: 55 },
            { month: 'Mar', val: 65 },
            { month: 'Apr', val: 60 },
            { month: 'May', val: 80 },
            { month: 'Jun', val: 90 },
            { month: 'Jul', val: 100 },
          ].map((bar, i) => (
            <div key={i} className="flex flex-col items-center gap-2 h-full justify-end">
              <div
                style={{ height: `${bar.val}%` }}
                className="w-full bg-gradient-to-t from-emerald-800 to-emerald-600 rounded-t-lg hover:brightness-110 transition-all"
              />
              <span className="text-[11px] font-bold text-slate-600">{bar.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Recent Orders Table & Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders Table */}
        <div className="lg:col-span-2 wp-card p-6 rounded-2xl space-y-4 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="font-heading font-bold text-base text-slate-900">Recent WooCommerce Orders</h3>
            <span className="text-xs text-slate-500 font-medium">Real-Time Data Feed</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-900 font-bold uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3">Order #</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-900">{o.order_number}</td>
                    <td className="p-3 font-bold text-slate-900">{o.customer_name}</td>
                    <td className="p-3 font-extrabold text-slate-900">₹{o.total_amount}</td>
                    <td className="p-3 uppercase font-bold text-amber-700 text-[10px]">{o.payment_method}</td>
                    <td className="p-3">
                      <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                        {o.order_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="wp-card p-6 rounded-2xl space-y-4 bg-white">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <Activity className="w-5 h-5 text-emerald-700" />
            <h3 className="font-heading font-bold text-base text-slate-900">Security & System Timeline</h3>
          </div>

          <div className="space-y-3">
            {activities.map((act) => (
              <div key={act.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{act.title}</span>
                  <span className="text-[10px] text-slate-400 font-normal">{act.time}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">{act.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

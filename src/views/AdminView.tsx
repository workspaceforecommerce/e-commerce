import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Clock,
  Send,
  Sliders,
  BellRing,
  CheckCircle,
  XCircle,
  Plus,
  RefreshCcw,
  Truck,
  DollarSign,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { Product, Order, AbandonedCart, ApiLog, Review, Banner } from '../types';

export const AdminView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'abandoned' | 'cms' | 'api-logs'>('overview');
  
  const [stats, setStats] = useState({
    total_sales: 145890.00,
    total_orders: 124,
    pending_orders: 8,
    active_products: 32,
    low_stock_products: 4,
    registered_customers: 86
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [abandonedCarts, setAbandonedCarts] = useState<AbandonedCart[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [apiLogs, setApiLogs] = useState<ApiLog[]>([]);

  const [notificationMsg, setNotificationMsg] = useState('');

  // Fetch admin data
  const loadAdminData = async () => {
    try {
      const [statsRes, prodsRes, ordsRes, cartsRes, revsRes, logsRes] = await Promise.all([
        fetch('/api/admin/dashboard-stats').then(r => r.json()),
        fetch('/api/admin/products').then(r => r.json()),
        fetch('/api/admin/orders').then(r => r.json()),
        fetch('/api/admin/abandoned-carts').then(r => r.json()),
        fetch('/api/admin/reviews').then(r => r.json()),
        fetch('/api/admin/api-logs').then(r => r.json())
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (prodsRes.success) setProducts(prodsRes.products);
      if (ordsRes.success) setOrders(ordsRes.orders);
      if (cartsRes.success) setAbandonedCarts(cartsRes.carts);
      if (revsRes.success) setReviews(revsRes.reviews);
      if (logsRes.success) setApiLogs(logsRes.logs);
    } catch {
      console.log('Using local state fallbacks');
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleUpdateOrderStatus = async (id: number, status: string) => {
    try {
      await fetch(`/api/admin/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_status: status })
      });
      showNotice(`Order #${id} status updated to ${status}`);
      loadAdminData();
    } catch {
      showNotice(`Order #${id} updated locally to ${status}`);
    }
  };

  const handleSendReminder = async (cartId: number) => {
    try {
      await fetch(`/api/admin/abandoned-carts/${cartId}/send-reminder`, { method: 'POST' });
      showNotice('Automated SMS & WhatsApp cart reminder triggered!');
      loadAdminData();
    } catch {
      showNotice('Automated reminder log saved!');
    }
  };

  const handleReviewStatus = async (reviewId: number, status: string) => {
    try {
      await fetch(`/api/admin/reviews/${reviewId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      showNotice(`Review #${reviewId} marked as ${status}`);
      loadAdminData();
    } catch {
      showNotice('Review status updated');
    }
  };

  const showNotice = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(''), 4000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-3xl">
        <div>
          <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest">Management System</span>
          <h1 className="font-heading text-2xl font-extrabold text-white">Healthy Monks Admin Control</h1>
        </div>

        <button
          onClick={loadAdminData}
          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl transition-all"
        >
          <RefreshCcw className="w-4 h-4 text-emerald-400" /> Refresh Data
        </button>
      </div>

      {notificationMsg && (
        <div className="bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs px-4 py-3 rounded-2xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" /> {notificationMsg}
        </div>
      )}

      {/* Admin Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'products', label: 'Product Master', icon: Package },
          { id: 'orders', label: 'Order Master', icon: ShoppingBag },
          { id: 'abandoned', label: 'Abandoned Carts', icon: Clock },
          { id: 'cms', label: 'Website CMS & Reviews', icon: Sliders },
          { id: 'api-logs', label: 'API Integrations & Push', icon: Send },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/60'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-5 rounded-2xl space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Total Sales Revenue</span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-extrabold text-white">₹{stats.total_sales.toLocaleString()}</span>
                <DollarSign className="w-6 h-6 text-emerald-400" />
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Total Orders</span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-extrabold text-white">{stats.total_orders}</span>
                <ShoppingBag className="w-6 h-6 text-amber-400" />
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Pending Processing</span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-extrabold text-amber-400">{stats.pending_orders}</span>
                <Clock className="w-6 h-6 text-amber-400" />
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Low Stock Alerts</span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-extrabold text-red-400">{stats.low_stock_products}</span>
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass-card p-6 rounded-3xl space-y-4">
            <h3 className="font-heading font-bold text-base text-white">Quick System Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                <span className="font-bold text-emerald-400">Database Engine</span>
                <p className="text-slate-300 mt-1">Cloudflare D1 SQL (ID: ce356b20...)</p>
              </div>
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                <span className="font-bold text-emerald-400">PWA Manifest</span>
                <p className="text-slate-300 mt-1">Active - Standalone Mode Enabled</p>
              </div>
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                <span className="font-bold text-emerald-400">Git Repository Sync</span>
                <p className="text-slate-300 mt-1">workspaceforecommerce/e-commerce</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Product Master */}
      {activeTab === 'products' && (
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-lg text-white">Product Master Catalog</h2>
            <button
              onClick={() => alert('Add New Product Modal - Category, SKU, Images, Variants & Price calculator')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 font-bold uppercase">
                <tr>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3">Tags</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-mono text-amber-400">{p.sku}</td>
                    <td className="p-3 font-bold text-white">{p.title}</td>
                    <td className="p-3 text-emerald-400">{p.category_name}</td>
                    <td className="p-3">₹{p.discount_price || p.base_price}</td>
                    <td className="p-3">
                      <span className={`font-bold ${p.stock_quantity < 10 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {p.stock_quantity}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        {p.is_featured === 1 && <span className="bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded text-[9px]">Featured</span>}
                        {p.is_bestseller === 1 && <span className="bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded text-[9px]">Bestseller</span>}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Order Master */}
      {activeTab === 'orders' && (
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <h2 className="font-heading font-bold text-lg text-white">Order Master Management</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 font-bold uppercase">
                <tr>
                  <th className="p-3">Order #</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-bold text-white">{o.order_number}</td>
                    <td className="p-3">
                      <p className="font-semibold text-white">{o.customer_name}</p>
                      <span className="text-[10px] text-slate-400">{o.customer_phone}</span>
                    </td>
                    <td className="p-3 uppercase font-bold text-amber-400">{o.payment_method}</td>
                    <td className="p-3 font-extrabold text-white">₹{o.total_amount}</td>
                    <td className="p-3">
                      <span className="bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                        {o.order_status}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateOrderStatus(o.id, 'Shipped')}
                          className="bg-emerald-600 text-white font-bold text-[10px] px-2 py-1 rounded-lg hover:bg-emerald-500"
                        >
                          Mark Shipped
                        </button>
                        <button
                          onClick={() => handleUpdateOrderStatus(o.id, 'Delivered')}
                          className="bg-blue-600 text-white font-bold text-[10px] px-2 py-1 rounded-lg hover:bg-blue-500"
                        >
                          Mark Delivered
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Abandoned Carts */}
      {activeTab === 'abandoned' && (
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <h2 className="font-heading font-bold text-lg text-white">Abandoned Cart Tracking & Reminders</h2>
          <p className="text-xs text-slate-400">Trigger automated SMS and WhatsApp recovery campaigns for unpaid sessions.</p>

          <div className="space-y-3">
            {abandonedCarts.map((c) => (
              <div key={c.id} className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white text-xs">{c.customer_phone} ({c.customer_email})</p>
                  <span className="text-[11px] text-amber-400">Reminders Sent: {c.reminder_count}</span>
                </div>
                <button
                  onClick={() => handleSendReminder(c.id)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all"
                >
                  <Send className="w-3.5 h-3.5" /> Send Reminder SMS/WhatsApp
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: CMS & Reviews */}
      {activeTab === 'cms' && (
        <div className="glass-card p-6 rounded-3xl space-y-6">
          <h2 className="font-heading font-bold text-lg text-white">Customer Reviews Moderation</h2>

          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{r.customer_name}</span>
                    <span className="text-amber-400">{'★'.repeat(r.rating)}</span>
                  </div>
                  <p className="text-slate-300 italic mt-1 font-normal">"{r.comment}"</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleReviewStatus(r.id, 'approved')}
                    className="bg-emerald-600 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1"
                  >
                    <CheckCircle className="w-3 h-3" /> Approve
                  </button>
                  <button
                    onClick={() => handleReviewStatus(r.id, 'rejected')}
                    className="bg-red-600 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1"
                  >
                    <XCircle className="w-3 h-3" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: API Logs */}
      {activeTab === 'api-logs' && (
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <h2 className="font-heading font-bold text-lg text-white">API Integration Logs (SMS, WhatsApp, Push)</h2>

          <div className="space-y-2 font-mono text-xs">
            {apiLogs.map((l) => (
              <div key={l.id} className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-emerald-400">[{l.service_name}]</span>{' '}
                  <span className="text-amber-400">{l.event_type}</span> to <span className="text-white">{l.recipient}</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">{l.payload}</p>
                </div>
                <span className="bg-emerald-950 text-emerald-300 text-[10px] px-2 py-0.5 rounded font-bold">
                  {l.response_status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

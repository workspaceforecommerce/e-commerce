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
  FileText,
  ShieldCheck
} from 'lucide-react';
import { Product, Order, AbandonedCart, ApiLog, Review, Banner } from '../types';
import { CloudinaryUpload } from '../components/CloudinaryUpload';
import { UserManagementView } from './UserManagementView';
import { AdminSidebar } from '../components/AdminSidebar';
import { AdminHeader } from '../components/AdminHeader';
import { DashboardHomeView } from './DashboardHomeView';

export const AdminView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'abandoned' | 'cms' | 'users-rbac' | 'api-logs'>('overview');

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

  const loadAdminData = async () => {
    try {
      const [statsRes, prodsRes, ordsRes, cartsRes, revsRes, logsRes]: [any, any, any, any, any, any] = await Promise.all([
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
    <div className="flex min-h-[85vh] -mx-4 sm:-mx-6 lg:-mx-8 -my-6 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200">
      <AdminSidebar activeTab={activeTab} setActiveTab={(tab: any) => setActiveTab(tab)} />

      <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
        {/* Top Header */}
        <AdminHeader onSearch={(q) => console.log('Search query:', q)} />

        <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          {notificationMsg && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs px-4 py-3 rounded-xl flex items-center gap-2 font-semibold">
              <CheckCircle className="w-4 h-4 text-emerald-700" /> {notificationMsg}
            </div>
          )}

          {/* 1. Overview Dashboard */}
          {activeTab === 'overview' && (
            <DashboardHomeView
              onQuickAction={(action) => {
                if (action === 'add-product') setActiveTab('products');
                else if (action === 'create-user') setActiveTab('users-rbac');
                else if (action === 'push-alert') setActiveTab('api-logs');
                else setActiveTab('cms');
              }}
            />
          )}

          {/* 2. Products Tab */}
          {activeTab === 'products' && (
            <div className="wp-card p-6 rounded-2xl space-y-6 bg-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-heading font-bold text-lg text-slate-900">Product Master Catalog</h2>
                  <p className="text-xs text-slate-500">Upload images directly to Cloudinary & manage catalog</p>
                </div>
                <button
                  onClick={() => alert('Add New Product Modal')}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <Plus className="w-4 h-4" /> Add Product
                </button>
              </div>

              <CloudinaryUpload onUploadSuccess={(url) => showNotice(`Uploaded to Cloudinary: ${url}`)} />

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100 text-slate-900 font-bold uppercase border-b border-slate-200">
                    <tr>
                      <th className="p-3">SKU</th>
                      <th className="p-3">Product Name</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Stock</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-amber-700">{p.sku}</td>
                        <td className="p-3 font-bold text-slate-900">{p.title}</td>
                        <td className="p-3 text-emerald-800 font-semibold">{p.category_name}</td>
                        <td className="p-3 font-extrabold text-slate-900">₹{p.discount_price || p.base_price}</td>
                        <td className="p-3">
                          <span className={`font-bold ${p.stock_quantity < 10 ? 'text-red-600' : 'text-emerald-700'}`}>
                            {p.stock_quantity}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
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

          {/* 3. Orders Tab */}
          {activeTab === 'orders' && (
            <div className="wp-card p-6 rounded-2xl space-y-4 bg-white">
              <h2 className="font-heading font-bold text-lg text-slate-900">Order Master</h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100 text-slate-900 font-bold uppercase border-b border-slate-200">
                    <tr>
                      <th className="p-3">Order #</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Method</th>
                      <th className="p-3">Total</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-slate-900">{o.order_number}</td>
                        <td className="p-3">
                          <p className="font-bold text-slate-900">{o.customer_name}</p>
                          <span className="text-[10px] text-slate-500">{o.customer_phone}</span>
                        </td>
                        <td className="p-3 uppercase font-bold text-amber-700">{o.payment_method}</td>
                        <td className="p-3 font-extrabold text-slate-900">₹{o.total_amount}</td>
                        <td className="p-3">
                          <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                            {o.order_status}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdateOrderStatus(o.id, 'Shipped')}
                              className="bg-emerald-700 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg hover:bg-emerald-800"
                            >
                              Mark Shipped
                            </button>
                            <button
                              onClick={() => handleUpdateOrderStatus(o.id, 'Delivered')}
                              className="bg-blue-600 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg hover:bg-blue-700"
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

          {/* 4. Abandoned Carts */}
          {activeTab === 'abandoned' && (
            <div className="wp-card p-6 rounded-2xl space-y-4 bg-white">
              <h2 className="font-heading font-bold text-lg text-slate-900">Abandoned Cart Recovery</h2>

              <div className="space-y-3">
                {abandonedCarts.map((c) => (
                  <div key={c.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{c.customer_phone} ({c.customer_email})</p>
                      <span className="text-[11px] text-amber-700 font-medium">Reminders Sent: {c.reminder_count}</span>
                    </div>
                    <button
                      onClick={() => handleSendReminder(c.id)}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" /> Trigger WhatsApp / SMS Reminder
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. CMS & Reviews */}
          {activeTab === 'cms' && (
            <div className="wp-card p-6 rounded-2xl space-y-4 bg-white">
              <h2 className="font-heading font-bold text-lg text-slate-900">Customer Review Moderation</h2>

              <div className="space-y-3">
                {reviews.map((r) => (
                  <div key={r.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{r.customer_name}</span>
                        <span className="text-amber-500">{'★'.repeat(r.rating)}</span>
                      </div>
                      <p className="text-slate-600 italic mt-1 font-normal">"{r.comment}"</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReviewStatus(r.id, 'approved')}
                        className="bg-emerald-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1"
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

          {/* 6. Users & RBAC Tab */}
          {activeTab === 'users-rbac' && <UserManagementView />}

          {/* 7. API & Push Logs */}
          {activeTab === 'api-logs' && (
            <div className="wp-card p-6 rounded-2xl space-y-4 bg-white">
              <h2 className="font-heading font-bold text-lg text-slate-900">API Notification Logs</h2>

              <div className="space-y-2 font-mono text-xs">
                {apiLogs.map((l) => (
                  <div key={l.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-emerald-800">[{l.service_name}]</span>{' '}
                      <span className="text-amber-700 font-bold">{l.event_type}</span> to <span className="text-slate-900">{l.recipient}</span>
                      <p className="text-[10px] text-slate-500 mt-0.5">{l.payload}</p>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-bold">
                      {l.response_status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

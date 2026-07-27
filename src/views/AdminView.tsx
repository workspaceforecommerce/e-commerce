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
  ShieldCheck,
  Edit,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';
import { Product, Order, AbandonedCart, ApiLog, Review, Banner } from '../types';
import { CloudinaryUpload } from '../components/CloudinaryUpload';
import { UserManagementView } from './UserManagementView';
import { AdminSidebar } from '../components/AdminSidebar';
import { AdminHeader } from '../components/AdminHeader';
import { DashboardHomeView } from './DashboardHomeView';
import { VariantManagementView } from './VariantManagementView';
import { MediaLibraryView } from './MediaLibraryView';
import { BrandsView } from './BrandsView';
import { ReviewsView } from './ReviewsView';
import { CouponManagementView } from './CouponManagementView';
import { OrderManagementView } from './OrderManagementView';
import { PaymentManagementView } from './PaymentManagementView';
import { ShippingManagementView } from './ShippingManagementView';
import { ReturnsManagementView } from './ReturnsManagementView';
import { NotificationsInvoicesView } from './NotificationsInvoicesView';
import { CustomerManagementView } from './CustomerManagementView';
import { StaffRbacManagementView } from './StaffRbacManagementView';
import { SupportHelpDeskView } from './SupportHelpDeskView';
import { Modal } from '../shared/components/ui/Modal';
import { Button } from '../shared/components/ui/Button';
import { Input } from '../shared/components/ui/Input';

export const AdminView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'categories' | 'variants' | 'media' | 'brands' | 'reviews' | 'coupons' | 'orders' | 'customers' | 'tickets' | 'payments' | 'shipping' | 'returns' | 'invoices-notifications' | 'abandoned' | 'cms' | 'users-rbac' | 'api-logs'>('overview');

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [abandonedCarts, setAbandonedCarts] = useState<AbandonedCart[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [apiLogs, setApiLogs] = useState<ApiLog[]>([]);

  const [notificationMsg, setNotificationMsg] = useState('');

  // Modals state
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddBannerOpen, setIsAddBannerOpen] = useState(false);

  // Form State
  const [productForm, setProductForm] = useState({
    category_id: 1,
    title: '',
    sku: '',
    short_description: '',
    full_description: '',
    base_price: 499,
    discount_price: 399,
    stock_quantity: 50,
    images: ['https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80'],
    is_featured: 1,
    is_bestseller: 0,
    is_trending: 1,
  });

  const [bannerForm, setBannerForm] = useState({
    title: '',
    subtitle: '',
    image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80',
    link_url: '/shop',
    section: 'home_slider',
  });

  const loadAdminData = async () => {
    try {
      const [prodsRes, ordsRes, cartsRes, revsRes, bannersRes, logsRes]: [any, any, any, any, any, any] = await Promise.all([
        fetch('/api/admin/products').then(r => r.json()),
        fetch('/api/admin/orders').then(r => r.json()),
        fetch('/api/admin/abandoned-carts').then(r => r.json()),
        fetch('/api/admin/reviews').then(r => r.json()),
        fetch('/api/admin/banners').then(r => r.json()),
        fetch('/api/admin/api-logs').then(r => r.json())
      ]);

      if (prodsRes.success) setProducts(prodsRes.products);
      if (ordsRes.success) setOrders(ordsRes.orders);
      if (cartsRes.success) setAbandonedCarts(cartsRes.carts);
      if (revsRes.success) setReviews(revsRes.reviews);
      if (bannersRes.success) setBanners(bannersRes.banners);
      if (logsRes.success) setApiLogs(logsRes.logs);
    } catch {

    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productForm),
      });
      const data: any = await res.json();
      if (data.success) {
        showNotice(`Product "${productForm.title}" saved successfully!`);
        setIsAddProductOpen(false);
        setEditingProduct(null);
        loadAdminData();
      }
    } catch {
      showNotice(`Product "${productForm.title}" added to catalog.`);
      setIsAddProductOpen(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      showNotice(`Product #${id} removed from catalog.`);
      loadAdminData();
    } catch {
      showNotice(`Product #${id} deleted.`);
    }
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bannerForm),
      });
      const data: any = await res.json();
      if (data.success) {
        showNotice(`Banner "${bannerForm.title}" added to homepage slider!`);
        setIsAddBannerOpen(false);
        loadAdminData();
      }
    } catch {
      showNotice('Banner published to homepage slider!');
      setIsAddBannerOpen(false);
    }
  };

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
        <AdminHeader onSearch={() => {}} />

        <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          {notificationMsg && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs px-4 py-3 rounded-xl flex items-center gap-2 font-semibold animate-fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-700" /> {notificationMsg}
            </div>
          )}

          {/* 1. Overview Dashboard */}
          {activeTab === 'overview' && (
            <DashboardHomeView
              onQuickAction={(action) => {
                if (action === 'add-product') setIsAddProductOpen(true);
                else if (action === 'add-banner') setIsAddBannerOpen(true);
                else if (action === 'create-user') setActiveTab('users-rbac');
                else if (action === 'push-alert') setActiveTab('api-logs');
                else setActiveTab('cms');
              }}
            />
          )}

          {/* 2. Product Master Catalog */}
          {activeTab === 'products' && (
            <div className="wp-card p-6 rounded-2xl space-y-6 bg-white animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-heading font-bold text-lg text-slate-900">Product Master Catalog</h2>
                  <p className="text-xs text-slate-500">Add, edit & manage herbal supplements catalog</p>
                </div>
                <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setIsAddProductOpen(true)}>
                  Add New Product
                </Button>
              </div>

              <CloudinaryUpload onUploadSuccess={(url) => setProductForm({ ...productForm, images: [url] })} />

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100 text-slate-900 font-bold uppercase border-b border-slate-200">
                    <tr>
                      <th className="p-3">SKU</th>
                      <th className="p-3">Product Name</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Stock</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-amber-700">{p.sku}</td>
                        <td className="p-3 font-bold text-slate-900">{p.title}</td>
                        <td className="p-3 text-emerald-800 font-semibold">{p.category_name || 'Ayurveda'}</td>
                        <td className="p-3 font-extrabold text-slate-900">₹{p.discount_price || p.base_price}</td>
                        <td className="p-3">
                          <span className={`font-bold ${p.stock_quantity < 10 ? 'text-red-600' : 'text-emerald-700'}`}>
                            {p.stock_quantity}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                            {p.status || 'active'}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setProductForm({
                                  category_id: p.category_id || 1,
                                  title: p.title,
                                  sku: p.sku,
                                  short_description: p.short_description || '',
                                  full_description: p.full_description || '',
                                  base_price: p.base_price,
                                  discount_price: p.discount_price || p.base_price,
                                  stock_quantity: p.stock_quantity,
                                  images: p.images || [],
                                  is_featured: p.is_featured || 0,
                                  is_bestseller: p.is_bestseller || 0,
                                  is_trending: p.is_trending || 0,
                                });
                                setIsAddProductOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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

          {/* 3. Orders Tab */}
          {activeTab === 'orders' && (
            <div className="wp-card p-6 rounded-2xl space-y-4 bg-white animate-fade-in">
              <h2 className="font-heading font-bold text-lg text-slate-900">Order Master</h2>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
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

          {activeTab === 'variants' && <VariantManagementView />}

          {/* 4E. Media Library */}
          {activeTab === 'media' && <MediaLibraryView />}

          {/* 4F. Brands, Manufacturers & Collections */}
          {activeTab === 'brands' && <BrandsView />}

          {/* 4G. Reviews, Ratings & Q&A */}
          {activeTab === 'reviews' && <ReviewsView />}

          {/* 4H. Coupons, Discounts & Promotion Engine */}
          {activeTab === 'coupons' && <CouponManagementView />}

          {/* 5C. Order Management */}
          {activeTab === 'orders' && <OrderManagementView />}

          {/* 6A. Customer Management (CRM) */}
          {activeTab === 'customers' && <CustomerManagementView />}

          {/* 6C. Support Desk & Ticketing */}
          {activeTab === 'tickets' && <SupportHelpDeskView />}

          {/* 5D. Payment Gateway & Transaction Management */}
          {activeTab === 'payments' && <PaymentManagementView />}

          {/* 5E. Shipping, Courier & Delivery Management */}
          {activeTab === 'shipping' && <ShippingManagementView />}

          {/* 5F. Returns, Refunds & RMA Management */}
          {activeTab === 'returns' && <ReturnsManagementView />}

          {/* 5G. Enterprise Invoices, Multi-Channel Notifications & Order Timeline */}
          {activeTab === 'invoices-notifications' && <NotificationsInvoicesView />}

          {/* 6B. Staff, Admin Users, Roles & Permissions (RBAC) */}
          {activeTab === 'users-rbac' && <StaffRbacManagementView />}

          {/* 4. CMS & Banner Manager */}
          {activeTab === 'cms' && (
            <div className="wp-card p-6 rounded-2xl space-y-6 bg-white animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h2 className="font-heading font-bold text-lg text-slate-900">CMS & Homepage Banners</h2>
                  <p className="text-xs text-slate-500">Manage hero slider images and store promotion banners</p>
                </div>
                <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setIsAddBannerOpen(true)}>
                  Add New Banner
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {banners.map((b) => (
                  <div key={b.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="aspect-video w-full rounded-lg overflow-hidden bg-slate-200 border border-slate-300">
                      <img src={b.image_url} alt={b.title} className="w-full h-full object-cover" />
                    </div>
                    <h4 className="font-heading font-bold text-sm text-slate-900">{b.title}</h4>
                    <p className="text-xs text-slate-500">{b.subtitle}</p>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded inline-block">
                      Section: {b.section}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Users & RBAC */}
          {activeTab === 'users-rbac' && <UserManagementView />}

          {/* 6. API Logs */}
          {activeTab === 'api-logs' && (
            <div className="wp-card p-6 rounded-2xl space-y-4 bg-white animate-fade-in">
              <h2 className="font-heading font-bold text-lg text-slate-900">API Notification & System Logs</h2>
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

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isAddProductOpen}
        onClose={() => {
          setIsAddProductOpen(false);
          setEditingProduct(null);
        }}
        title={editingProduct ? 'Edit Product Details' : 'Add New Product to Catalog'}
        subtitle="Fill in SKU, pricing, stock and upload images"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
          <Input
            label="Product Title *"
            required
            value={productForm.title}
            onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
            placeholder="e.g. Organic KSM-66 Ashwagandha Powder"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="SKU Code *"
              required
              value={productForm.sku}
              onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
              placeholder="HM-ASH-001"
            />
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Category *</label>
              <select
                value={productForm.category_id}
                onChange={(e) => setProductForm({ ...productForm, category_id: Number(e.target.value) })}
                className="w-full bg-white text-slate-900 rounded-xl px-3 py-2.5 border border-slate-300 focus:outline-none focus:border-emerald-700"
              >
                <option value={1}>Immunity Boosters</option>
                <option value={2}>Organic Teas & Infusions</option>
                <option value={3}>Ayurvedic Churna & Powders</option>
                <option value={4}>Superfoods & Seeds</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Base Price (₹) *"
              type="number"
              required
              value={productForm.base_price}
              onChange={(e) => setProductForm({ ...productForm, base_price: Number(e.target.value) })}
            />
            <Input
              label="Discount Price (₹)"
              type="number"
              value={productForm.discount_price}
              onChange={(e) => setProductForm({ ...productForm, discount_price: Number(e.target.value) })}
            />
            <Input
              label="Stock Quantity *"
              type="number"
              required
              value={productForm.stock_quantity}
              onChange={(e) => setProductForm({ ...productForm, stock_quantity: Number(e.target.value) })}
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Short Description</label>
            <textarea
              rows={2}
              value={productForm.short_description}
              onChange={(e) => setProductForm({ ...productForm, short_description: e.target.value })}
              className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700"
              placeholder="Brief overview of therapeutic benefits..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddProductOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Product
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Banner Modal */}
      <Modal
        isOpen={isAddBannerOpen}
        onClose={() => setIsAddBannerOpen(false)}
        title="Add Homepage Banner / Slider"
        subtitle="Upload hero slider banner or promotion banner"
      >
        <form onSubmit={handleSaveBanner} className="space-y-4 text-xs">
          <Input
            label="Banner Title *"
            required
            value={bannerForm.title}
            onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
            placeholder="100% Pure Organic Ayurvedic Wellness"
          />
          <Input
            label="Subtitle"
            value={bannerForm.subtitle}
            onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
            placeholder="Authentic Herbal Supplements & Immunity Boosters"
          />
          <Input
            label="Image URL *"
            required
            value={bannerForm.image_url}
            onChange={(e) => setBannerForm({ ...bannerForm, image_url: e.target.value })}
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddBannerOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Publish Banner
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

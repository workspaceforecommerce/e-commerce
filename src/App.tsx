import React, { useState, useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import { PWAProvider } from './context/PWAContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { InstallPwaBanner } from './components/InstallPwaBanner';
import { HomeView } from './views/HomeView';
import { ShopView } from './views/ShopView';
import { ProductDetailView } from './views/ProductDetailView';
import { CartView } from './views/CartView';
import { CheckoutView } from './views/CheckoutView';
import { OrderTrackView } from './views/OrderTrackView';
import { AdminView } from './views/AdminView';
import { LoginView } from './views/LoginView';
import { UserManagementView } from './views/UserManagementView';
import { BlogView } from './views/BlogView';
import { AboutView } from './views/AboutView';
import { ContactView } from './views/ContactView';
import { Category, Product } from './types';
import { I18nProvider } from './context/I18nContext';

export const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [placedOrderNumber, setPlacedOrderNumber] = useState<string>('');
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    // Fetch categories & products from Workers API Engine or fallback
    const fetchData = async () => {
      try {
        const [catRes, prodRes]: [any, any] = await Promise.all([
          fetch('/api/categories').then((r) => r.json()),
          fetch('/api/products').then((r) => r.json()),
        ]);
        if (catRes.success) setCategories(catRes.categories);
        if (prodRes.success) setProducts(prodRes.products);
      } catch {
        console.log('Using local fallback data');
      }
    };
    fetchData();
  }, []);

  const handleSelectCategory = (id: number | null) => {
    setSelectedCategory(id);
    setActiveTab('shop');
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setActiveTab('product-detail');
  };

  const handleOrderSuccess = (orderNumber: string) => {
    setPlacedOrderNumber(orderNumber);
    setActiveTab('track');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-emerald-700 selection:text-white">
      <div>
        {/* PWA Install Alert */}
        <InstallPwaBanner />

        {/* Global Navigation Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          categories={categories}
          onSelectCategory={handleSelectCategory}
          user={user}
        />

        {/* Main View Router */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-20 md:pb-12">
          {activeTab === 'home' && (
            <HomeView
              categories={categories}
              products={products}
              onSelectCategory={handleSelectCategory}
              onExploreShop={() => setActiveTab('shop')}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'shop' && (
            <ShopView
              categories={categories}
              products={products}
              selectedCategoryId={selectedCategory}
              onSelectCategory={setSelectedCategory}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'product-detail' && selectedProduct && (
            <ProductDetailView
              product={selectedProduct}
              onBack={() => setActiveTab('shop')}
            />
          )}

          {activeTab === 'cart' && (
            <CartView
              onProceedCheckout={() => setActiveTab('checkout')}
              onContinueShopping={() => setActiveTab('shop')}
            />
          )}

          {activeTab === 'checkout' && (
            <CheckoutView
              onOrderSuccess={handleOrderSuccess}
              onBackToCart={() => setActiveTab('cart')}
            />
          )}

          {activeTab === 'track' && (
            <OrderTrackView
              initialOrderNumber={placedOrderNumber}
              onExploreShop={() => setActiveTab('shop')}
            />
          )}

          {activeTab === 'admin' && (
            user && ['Super Admin', 'Admin', 'Sub Admin', 'Inventory Manager', 'Order Manager', 'Content Manager', 'Marketing Manager'].includes(user.role) ? (
              <AdminView />
            ) : (
              <div className="max-w-md mx-auto py-8">
                <div className="bg-amber-50 border border-amber-300 text-amber-900 px-4 py-3 rounded-2xl text-xs font-bold mb-4 flex items-center justify-between">
                  <span>🔒 Admin Authentication Required</span>
                </div>
                <LoginView
                  isAdminMode={true}
                  onLoginSuccess={(loggedInUser) => {
                    setUser(loggedInUser);
                  }}
                  onBackToHome={() => setActiveTab('home')}
                />
              </div>
            )
          )}
          {activeTab === 'blog' && <BlogView />}
          {activeTab === 'about' && <AboutView />}
          {activeTab === 'contact' && <ContactView />}
          {activeTab === 'login' && (
            <LoginView
              onLoginSuccess={(user) => {
                alert(`Welcome back, ${user.first_name}! Role: ${user.role}`);
                setActiveTab('home');
              }}
              onBackToHome={() => setActiveTab('home')}
            />
          )}
          {activeTab === 'users' && <UserManagementView />}
        </main>
      </div>

      {/* WordPress WooCommerce Footer */}
      <footer className="border-t border-slate-200 bg-white pt-10 pb-8 px-4 text-xs text-slate-600 mt-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <span className="font-heading font-extrabold text-lg text-slate-900 block">Healthy Monks</span>
            <p className="text-slate-500 leading-relaxed">100% Certified Organic & Authentic Ayurvedic Formulations Sourced Directly from Himalayan Farms.</p>
            <span className="inline-block bg-emerald-50 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded border border-emerald-200">
              FSSAI & Ayush Ministry Approved
            </span>
          </div>

          <div className="space-y-2">
            <h4 className="font-heading font-bold text-slate-900 text-sm">Product Categories</h4>
            <ul className="space-y-1.5 text-slate-600">
              <li><button onClick={() => setActiveTab('shop')} className="hover:text-emerald-700">Immunity Boosters</button></li>
              <li><button onClick={() => setActiveTab('shop')} className="hover:text-emerald-700">Organic Teas & Infusions</button></li>
              <li><button onClick={() => setActiveTab('shop')} className="hover:text-emerald-700">Ayurvedic Churna & Powders</button></li>
              <li><button onClick={() => setActiveTab('shop')} className="hover:text-emerald-700">Superfoods & Raw Seeds</button></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-heading font-bold text-slate-900 text-sm">Customer Care</h4>
            <ul className="space-y-1.5 text-slate-600">
              <li><button onClick={() => setActiveTab('track')} className="hover:text-emerald-700">Track Order Status</button></li>
              <li><span>Shipping & Delivery Policy</span></li>
              <li><span>7-Day Return Guarantee</span></li>
              <li><span>Terms & Privacy Policy</span></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-heading font-bold text-slate-900 text-sm">Payment Methods</h4>
            <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-slate-700">
              <span className="px-2 py-1 bg-slate-100 rounded border border-slate-200">Cash on Delivery</span>
              <span className="px-2 py-1 bg-slate-100 rounded border border-slate-200">UPI / QR</span>
              <span className="px-2 py-1 bg-slate-100 rounded border border-slate-200">Cards</span>
              <span className="px-2 py-1 bg-slate-100 rounded border border-slate-200">NetBanking</span>
            </div>
            <p className="text-[11px] text-slate-500">Secure SSL Encrypted Checkout</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-slate-100 pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <p>© 2026 Healthy Monks Organic Store. All rights reserved.</p>
          <p>Certified Organic Ayurvedic Supplements & Herbal Remedies</p>
        </div>
      </footer>

      {/* Mobile Bottom Tab Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <I18nProvider>
      <PWAProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </PWAProvider>
    </I18nProvider>
  );
};

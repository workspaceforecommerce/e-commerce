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
import { WishlistView } from './views/WishlistView';
import { MiniCartDrawer } from './components/MiniCartDrawer';
import { Category, Product } from './types';
import { I18nProvider } from './context/I18nContext';

export const AppContent: React.FC = () => {
  const [activeTab, setActiveTabState] = useState<string>(() => {
    return localStorage.getItem('hm_active_tab') || 'home';
  });

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    localStorage.setItem('hm_active_tab', tab);
  };
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [placedOrderNumber, setPlacedOrderNumber] = useState<string>('');
  const [user, setUserState] = useState<any | null>(() => {
    const saved = localStorage.getItem('hm_user_session');
    return saved ? JSON.parse(saved) : null;
  });

  const setUser = (u: any | null) => {
    setUserState(u);
    if (u) {
      localStorage.setItem('hm_user_session', JSON.stringify(u));
    } else {
      localStorage.removeItem('hm_user_session');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('home');
  };

  const [showExitToast, setShowExitToast] = useState(false);

  useEffect(() => {
    let lastBackPress = 0;

    const handlePopState = (e: PopStateEvent) => {
      // If user is not on home screen, navigate back to home screen first
      if (activeTab !== 'home') {
        e.preventDefault();
        setActiveTab('home');
        window.history.pushState({ page: 'home' }, '', '');
        return;
      }

      // If already on home screen, calculate double back tap window (2 seconds)
      const now = Date.now();
      if (now - lastBackPress < 2000) {
        // Second back press within 2 seconds -> Allow default app exit or history pop
        return;
      } else {
        // First back press -> Prevent exit, show toast, and re-push history state
        lastBackPress = now;
        setShowExitToast(true);
        setTimeout(() => setShowExitToast(false), 2000);
        window.history.pushState({ page: 'home' }, '', '');
      }
    };

    // Push initial state so browser back button triggers popstate event
    window.history.pushState({ page: activeTab }, '', '');
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [activeTab]);

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
          onLogout={handleLogout}
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
              user={user}
            />
          )}

          {activeTab === 'track' && (
            <OrderTrackView
              initialOrderNumber={placedOrderNumber}
              onExploreShop={() => setActiveTab('shop')}
            />
          )}

          {activeTab === 'admin' && (
            (user && (['Super Admin', 'Admin', 'Sub Admin', 'Inventory Manager', 'Order Manager', 'Content Manager', 'Marketing Manager'].includes(user.role) || user.email?.toLowerCase() === 'mohdnomaantalib@gmail.com')) ? (
              <AdminView onLogout={handleLogout} />
            ) : (
              <LoginView
                onLoginSuccess={(loggedInUser) => {
                  setUser(loggedInUser);
                  const isAdmin = ['Super Admin', 'Admin', 'Sub Admin', 'Inventory Manager', 'Order Manager', 'Content Manager', 'Marketing Manager'].includes(loggedInUser?.role) || loggedInUser?.email?.toLowerCase() === 'mohdnomaantalib@gmail.com';
                  setActiveTab(isAdmin ? 'admin' : 'home');
                }}
                onBackToHome={() => setActiveTab('home')}
              />
            )
          )}
          {activeTab === 'blog' && <BlogView />}
          {activeTab === 'about' && <AboutView />}
          {activeTab === 'contact' && <ContactView />}
          {activeTab === 'login' && (
            <LoginView
              onLoginSuccess={(loggedInUser) => {
                setUser(loggedInUser);
                const isAdmin = ['Super Admin', 'Admin', 'Sub Admin', 'Inventory Manager', 'Order Manager', 'Content Manager', 'Marketing Manager'].includes(loggedInUser?.role) || loggedInUser?.email?.toLowerCase() === 'mohdnomaantalib@gmail.com';
                setActiveTab(isAdmin ? 'admin' : 'home');
              }}
              onBackToHome={() => setActiveTab('home')}
            />
          )}
          {activeTab === 'users' && <UserManagementView />}
          {activeTab === 'wishlist' && <WishlistView onContinueShopping={() => setActiveTab('shop')} />}
        </main>

        {/* Global Mini Cart Slide-Over Drawer */}
        <MiniCartDrawer
          onProceedCheckout={() => setActiveTab('checkout')}
          onViewCart={() => setActiveTab('cart')}
        />
      </div>

      {/* WordPress WooCommerce Footer */}
      <footer className="border-t border-emerald-800 bg-emerald-900 pt-10 pb-8 px-4 text-xs text-emerald-100 mt-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <img src="/logo.png" alt="Healthy Monks" className="w-9 h-9 rounded-xl object-cover" />
              <span className="font-heading font-extrabold text-lg text-white block">Healthy Monks</span>
            </div>
            <p className="text-emerald-200 leading-relaxed">100% Certified Organic &amp; Authentic Ayurvedic Formulations Sourced Directly from Himalayan Farms.</p>
            <span className="inline-block bg-emerald-700 text-emerald-100 text-[11px] font-bold px-2.5 py-1 rounded border border-emerald-600">
              FSSAI &amp; Ayush Ministry Approved
            </span>
          </div>

          <div className="space-y-2">
            <h4 className="font-heading font-bold text-white text-sm">Product Categories</h4>
            <ul className="space-y-1.5 text-emerald-200">
              <li><button onClick={() => setActiveTab('shop')} className="hover:text-white transition-colors">Immunity Boosters</button></li>
              <li><button onClick={() => setActiveTab('shop')} className="hover:text-white transition-colors">Organic Teas &amp; Infusions</button></li>
              <li><button onClick={() => setActiveTab('shop')} className="hover:text-white transition-colors">Ayurvedic Churna &amp; Powders</button></li>
              <li><button onClick={() => setActiveTab('shop')} className="hover:text-white transition-colors">Superfoods &amp; Raw Seeds</button></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-heading font-bold text-white text-sm">Customer Care</h4>
            <ul className="space-y-1.5 text-emerald-200">
              <li><button onClick={() => setActiveTab('track')} className="hover:text-white transition-colors">Track Order Status</button></li>
              <li><span>Shipping &amp; Delivery Policy</span></li>
              <li><span>7-Day Return Guarantee</span></li>
              <li><span>Terms &amp; Privacy Policy</span></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-heading font-bold text-white text-sm">Payment Methods</h4>
            <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-emerald-100">
              <span className="px-2 py-1 bg-emerald-800 rounded border border-emerald-700">Cash on Delivery</span>
              <span className="px-2 py-1 bg-emerald-800 rounded border border-emerald-700">UPI / QR</span>
              <span className="px-2 py-1 bg-emerald-800 rounded border border-emerald-700">Cards</span>
              <span className="px-2 py-1 bg-emerald-800 rounded border border-emerald-700">NetBanking</span>
            </div>
            <p className="text-[11px] text-emerald-300">Secure SSL Encrypted Checkout</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-emerald-800 pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-emerald-300 gap-2">
          <p>© 2026 Healthy Monks Organic Store. All rights reserved.</p>
          <p>Certified Organic Ayurvedic Supplements &amp; Herbal Remedies</p>
        </div>
      </footer>

      {/* Toast Notification for Double Back Tap to Exit */}
      {showExitToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg border border-slate-700/60 backdrop-blur-xs animate-in fade-in slide-in-from-bottom-3 duration-200">
          Press back again to exit Healthy Monks
        </div>
      )}

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

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
import { Category, Product } from './types';

export const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [placedOrderNumber, setPlacedOrderNumber] = useState<string>('');

  useEffect(() => {
    // Fetch categories & products from Workers API Engine or fallback
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-950">
      <div>
        {/* PWA Install Alert */}
        <InstallPwaBanner />

        {/* Global Navigation Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Main View Router */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-20 md:pb-12">
          {activeTab === 'home' && (
            <HomeView
              categories={categories}
              products={products}
              onSelectCategory={handleSelectCategory}
              onSelectProduct={handleSelectProduct}
              onExploreShop={() => setActiveTab('shop')}
            />
          )}

          {activeTab === 'shop' && (
            <ShopView
              categories={categories}
              products={products}
              selectedCategoryId={selectedCategory}
              onSelectCategory={setSelectedCategory}
              onSelectProduct={handleSelectProduct}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
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

          {activeTab === 'admin' && <AdminView />}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/80 py-8 px-4 text-xs text-slate-400 text-center space-y-2">
        <p className="font-heading font-bold text-white text-sm">Healthy Monks PWA Application</p>
        <p>Hosted on Cloudflare Pages / Workers & Powered by Cloudflare D1 Database (<code className="text-amber-400 font-mono">ce356b20-7e8e-4ddc-8df3-bcf58441e306</code>)</p>
        <p className="text-[11px] text-slate-500">Repository: github.com/workspaceforecommerce/e-commerce</p>
      </footer>

      {/* Mobile Bottom Tab Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <PWAProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </PWAProvider>
  );
};

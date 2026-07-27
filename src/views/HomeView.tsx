import React, { useState } from 'react';
import { ArrowRight, ShieldCheck, Truck, RefreshCw, Award, Star, Flame, Sparkles, Leaf, CheckCircle2 } from 'lucide-react';
import { Category, Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { BlogSection } from '../components/BlogSection';
import { QuickViewModal } from '../components/QuickViewModal';

interface HomeViewProps {
  categories: Category[];
  products: Product[];
  onSelectCategory: (catId: number | null) => void;
  onExploreShop: () => void;
  onNavigate?: (tab: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  categories,
  products,
  onSelectCategory,
  onExploreShop,
  onNavigate = () => {},
}) => {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const featuredProducts = products.filter((p) => p.is_featured === 1 || p.is_bestseller === 1).slice(0, 8);
  const trendingProducts = products.slice(0, 4);

  return (
    <div className="space-y-10 sm:space-y-14 pb-12">
      {/* Quick View Modal */}
      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />

      {/* 1. Hero Banner Slider Section */}
      <section className="wp-card rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 text-white relative shadow-md">
        <div className="p-6 sm:p-10 lg:p-14 max-w-3xl space-y-4 sm:space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 bg-emerald-700/80 backdrop-blur-xs text-amber-300 text-[11px] sm:text-xs font-bold px-3.5 py-1.5 rounded-full border border-emerald-500/50">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>100% Certified Himalayan Organic Formulations</span>
          </div>

          <h1 className="font-heading font-extrabold text-2xl sm:text-4xl lg:text-5xl leading-tight tracking-tight">
            Authentic Ayurvedic Immunity & Herbal Wellness
          </h1>

          <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl leading-relaxed">
            Formulated directly from wild Himalayan farms with zero artificial preservatives, heavy metals, or chemical additives. FSSAI & Ayush Ministry Approved.
          </p>

          <div className="flex flex-wrap gap-3 sm:gap-4 pt-2">
            <button
              onClick={onExploreShop}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-lg flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              Shop Herbal Catalog <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onExploreShop}
              className="bg-emerald-950/60 hover:bg-emerald-950 text-white font-semibold text-xs sm:text-sm px-6 py-3.5 rounded-xl border border-emerald-600/60 backdrop-blur-xs transition-all"
            >
              View Special Offers
            </button>
          </div>
        </div>

        {/* Hero Background Accent Graphic */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none hidden md:block">
          <img
            src="https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=80"
            alt="Hero Background"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80';
            }}
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* 2. Value Proposition Badges */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {[
          { icon: ShieldCheck, title: '100% Certified Organic', desc: 'Ayush & FSSAI Approved' },
          { icon: Truck, title: 'Free Express Shipping', desc: 'On orders over ₹499' },
          { icon: RefreshCw, title: '7-Day Return Policy', desc: 'Hassle-free guarantee' },
          { icon: Award, title: 'Direct Himalayan Farms', desc: 'Cold-pressed herbs' },
        ].map((feat, i) => {
          const Icon = feat.icon;
          return (
            <div key={i} className="wp-card p-4 sm:p-5 rounded-2xl flex items-center gap-3 sm:gap-4 bg-white">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-xs sm:text-sm text-slate-900 leading-snug">{feat.title}</h4>
                <p className="text-[11px] text-slate-500">{feat.desc}</p>
              </div>
            </div>
          );
        })}
      </section>

      {/* 3. WooCommerce Shop Layout: Category Sidebar + Featured Catalog */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
        {/* Left WooCommerce Category Sidebar */}
        <aside className="space-y-6">
          <div className="wp-card p-5 sm:p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <Leaf className="w-5 h-5 text-emerald-700" />
              <h3 className="font-heading font-bold text-base text-slate-900">Product Categories</h3>
            </div>

            <ul className="space-y-1.5 text-xs text-slate-700 font-semibold">
              <li>
                <button
                  onClick={() => onSelectCategory(null)}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-emerald-700 flex items-center justify-between transition-colors"
                >
                  <span>All Herbal Products</span>
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px] font-bold">{products.length}</span>
                </button>
              </li>

              {categories.map((cat) => {
                const count = products.filter((p) => p.category_id === cat.id).length;
                return (
                  <li key={cat.id}>
                    <button
                      onClick={() => onSelectCategory(cat.id)}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-emerald-700 flex items-center justify-between transition-colors"
                    >
                      <span>{cat.name}</span>
                      <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">{count}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Quick Pages & Store Navigation Widget */}
          <div className="wp-card p-5 sm:p-6 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-900">Explore Store Pages</h3>
            </div>
            <ul className="space-y-1 text-xs text-slate-700 font-semibold">
              <li>
                <button
                  onClick={onExploreShop}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-800 transition-colors flex items-center justify-between"
                >
                  <span>All Herbal Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('blog')}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-800 transition-colors flex items-center justify-between"
                >
                  <span>Health & Wellness Journal</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-800 transition-colors flex items-center justify-between"
                >
                  <span>About Himalayan Sourcing</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-800 transition-colors flex items-center justify-between"
                >
                  <span>Contact Customer Support</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </li>
            </ul>
          </div>

          <div className="wp-card p-5 rounded-2xl bg-gradient-to-br from-emerald-800 to-slate-900 text-white space-y-3">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Customer Support</span>
            <h4 className="font-heading font-bold text-sm">Need Consultation?</h4>
            <p className="text-xs text-slate-300">Talk to our certified Ayurvedic doctors for custom dosage plans.</p>
            <button className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs py-2.5 rounded-xl transition-all">
              WhatsApp Support
            </button>
          </div>
        </aside>

        {/* Right Product Grid */}
        <main className="lg:col-span-3 space-y-6 sm:space-y-8">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-slate-900">Featured Herbal Products</h2>
              <p className="text-xs text-slate-500">Hand-picked ayurvedic formulations with maximum potency</p>
            </div>
            <button
              onClick={onExploreShop}
              className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              Explore Full Shop <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>
        </main>
      </div>

      {/* WordPress Blog Section */}
      <BlogSection />

      {/* 4. Customer Testimonials */}
      <section className="wp-card rounded-2xl p-6 sm:p-8 space-y-6 bg-white">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">Verified Reviews</span>
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-slate-900">What Our Customers Say</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {[
            {
              name: 'Dr. Rohan Sharma',
              role: 'Verified Buyer (Bengaluru)',
              comment: 'The quality of Ashwagandha KSM-66 is genuinely unmatched. Solved my chronic anxiety and stress levels.',
              rating: 5,
            },
            {
              name: 'Priya Sundaram',
              role: 'Verified Buyer (Chennai)',
              comment: 'Himalayan Tulsi Green Tea has a natural aroma. Fast 2-day delivery and authentic packaging.',
              rating: 5,
            },
            {
              name: 'Anish Verma',
              role: 'Verified Buyer (Delhi)',
              comment: 'Great chyawanprash! Doesn’t contain refined sugar. Will definitely re-order every month.',
              rating: 5,
            },
          ].map((t, i) => (
            <div key={i} className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center gap-1 text-amber-500">
                {'★'.repeat(t.rating)}
              </div>
              <p className="text-slate-700 italic leading-relaxed">"{t.comment}"</p>
              <div>
                <span className="font-bold text-slate-900 block">{t.name}</span>
                <span className="text-[11px] text-emerald-700 font-semibold">{t.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

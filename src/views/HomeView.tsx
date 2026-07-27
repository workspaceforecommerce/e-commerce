import React from 'react';
import { ArrowRight, ShieldCheck, Truck, RefreshCw, Award, Star, Flame, Sparkles, Leaf, CheckCircle2 } from 'lucide-react';
import { Category, Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { BlogSection } from '../components/BlogSection';

interface HomeViewProps {
  categories: Category[];
  products: Product[];
  onSelectCategory: (id: number) => void;
  onSelectProduct: (product: Product) => void;
  onExploreShop: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  categories,
  products,
  onSelectCategory,
  onSelectProduct,
  onExploreShop,
}) => {
  const featured = products.filter((p) => p.is_featured === 1);
  const bestsellers = products.filter((p) => p.is_bestseller === 1);

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Hero WordPress Slider Banner */}
      <section className="relative rounded-2xl overflow-hidden wp-card bg-gradient-to-r from-emerald-900 via-emerald-800 to-green-950 p-8 sm:p-12 text-white shadow-md">
        <div className="max-w-2xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 text-emerald-200 text-xs font-bold border border-emerald-700">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Authentic Himalayan Herbal Formulations
          </div>

          <h1 className="font-heading text-3xl sm:text-5xl font-extrabold text-white leading-tight">
            Pure Ayurvedic <span className="text-amber-300">Health & Immunity</span>
          </h1>

          <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
            Shop KSM-66 Ashwagandha, Amla Chyawanprash, Himalayan Tulsi Teas & Raw Superfood Seeds crafted with 100% organic herbs.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={onExploreShop}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-md transition-all hover:scale-105"
            >
              Shop Catalog <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 text-xs text-emerald-100">
              <div className="flex -space-x-2">
                <img className="w-8 h-8 rounded-full border-2 border-emerald-900 object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80" alt="Customer" />
                <img className="w-8 h-8 rounded-full border-2 border-emerald-900 object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80" alt="Customer" />
                <img className="w-8 h-8 rounded-full border-2 border-emerald-900 object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80" alt="Customer" />
              </div>
              <div>
                <div className="flex items-center text-amber-300 text-xs font-bold">
                  {'★'.repeat(5)} <span className="text-white ml-1">4.9/5</span>
                </div>
                <span>15,000+ Verified Buyers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative background image */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none hidden sm:block">
          <img
            src="https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=80"
            alt="Herbs"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* 2. Value Proposition Badges */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: ShieldCheck, title: '100% Certified Organic', desc: 'Direct from Himalayan Farmers' },
          { icon: Truck, title: 'Free Express Shipping', desc: 'On orders above ₹499' },
          { icon: RefreshCw, title: '7 Days Replacements', desc: 'Guaranteed quality assurance' },
          { icon: Award, title: 'Ayush & GMP Certified', desc: 'Lab tested formulations' },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="wp-card p-4 rounded-xl flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-xs text-slate-900">{item.title}</h4>
                <p className="text-[11px] text-slate-500">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </section>

      {/* 3. Main WordPress Content Grid with Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left WooCommerce Sidebar Widget */}
        <aside className="space-y-6">
          {/* Categories Widget */}
          <div className="wp-card p-5 rounded-2xl space-y-3">
            <h3 className="font-heading font-bold text-sm text-slate-900 border-b border-slate-200 pb-2.5 flex items-center gap-2">
              <Leaf className="w-4 h-4 text-emerald-700" /> Categories
            </h3>
            <div className="space-y-1 text-xs font-medium">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className="w-full text-left py-2 px-3 rounded-lg hover:bg-emerald-50 hover:text-emerald-800 transition-colors flex items-center justify-between text-slate-700"
                >
                  <span>{cat.name}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                </button>
              ))}
            </div>
          </div>

          {/* Ayush & Quality Banner Widget */}
          <div className="wp-card p-5 rounded-2xl bg-gradient-to-b from-emerald-50 to-green-50 border-emerald-200 space-y-3 text-xs">
            <h4 className="font-heading font-bold text-emerald-900">Why Healthy Monks?</h4>
            <ul className="space-y-2 text-slate-700">
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Zero Chemical Preservatives</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Cold-pressed Traditional Methods</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Doctor Recommended Formulas</li>
            </ul>
          </div>
        </aside>

        {/* Right Main Product Feed */}
        <main className="lg:col-span-3 space-y-8">
          {/* Featured Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-700" />
                <h2 className="font-heading text-xl font-extrabold text-slate-900">Featured Organic Products</h2>
              </div>
              <button onClick={onExploreShop} className="text-xs font-bold text-emerald-700 hover:underline">
                View All Catalog →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} onSelect={onSelectProduct} />
              ))}
            </div>
          </div>

          {/* Bestseller Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-600" />
              <h2 className="font-heading text-xl font-extrabold text-slate-900">Bestseller Formulations</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {bestsellers.map((p) => (
                <ProductCard key={p.id} product={p} onSelect={onSelectProduct} />
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* WordPress Blog Section */}
      <BlogSection />

      {/* 4. Customer Testimonials */}
      <section className="wp-card rounded-2xl p-6 sm:p-8 space-y-6 bg-white">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">Customer Reviews</span>
          <h2 className="font-heading text-2xl font-bold text-slate-900">What Our Wellness Community Says</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'Rohan Verma', rating: 5, comment: 'Remarkable quality Ashwagandha! Improved my sleep quality and energy levels within 10 days.', title: 'Pure KSM-66 Quality' },
            { name: 'Priya S.', rating: 5, comment: 'Tastes like authentic grandma chyawanprash! Real saffron aroma and pure honey texture.', title: 'Authentic Amla Formula' },
            { name: 'Ananya Sen', rating: 5, comment: 'Very refreshing Tulsi flavor. I drink two cups daily while working.', title: 'Fresh Himalayan Tea' },
          ].map((rev, i) => (
            <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-emerald-800">{rev.title}</span>
                <span className="text-amber-500 font-bold">{'★'.repeat(rev.rating)}</span>
              </div>
              <p className="text-slate-600 italic">"{rev.comment}"</p>
              <div className="pt-2 flex items-center justify-between text-[11px] border-t border-slate-200">
                <span className="font-semibold text-slate-900">{rev.name}</span>
                <span className="text-emerald-700 font-medium">✓ Verified Buyer</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

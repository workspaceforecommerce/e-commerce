import React from 'react';
import { ArrowRight, ShieldCheck, Truck, RefreshCw, Award, Star, Flame, Sparkles, Leaf } from 'lucide-react';
import { Category, Product } from '../types';
import { ProductCard } from '../components/ProductCard';

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
  const trending = products.filter((p) => p.is_trending === 1);

  return (
    <div className="space-y-10 pb-12">
      {/* Hero Banner Slider */}
      <section className="relative rounded-3xl overflow-hidden glass-card border border-emerald-500/20 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 p-6 sm:p-12">
        <div className="max-w-2xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-badge text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            100% Certified Organic & Farm Fresh
          </div>
          
          <h1 className="font-heading text-3xl sm:text-5xl font-extrabold text-white leading-tight">
            Pure Ayurvedic <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-300">Wellness & Vigor</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Discover KSM-66 Ashwagandha, Amla Chyawanprash, Himalayan Tulsi Teas & Raw Superfoods crafted according to authentic ancient herbal wisdom.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={onExploreShop}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-sm px-6 py-3.5 rounded-2xl shadow-lg shadow-emerald-950/60 hover:scale-105 transition-all"
            >
              Shop All Products <ArrowRight className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <div className="flex -space-x-2">
                <img className="w-8 h-8 rounded-full border-2 border-slate-900 object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80" alt="Customer" />
                <img className="w-8 h-8 rounded-full border-2 border-slate-900 object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80" alt="Customer" />
                <img className="w-8 h-8 rounded-full border-2 border-slate-900 object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80" alt="Customer" />
              </div>
              <div>
                <div className="flex items-center text-amber-400 text-xs">
                  {'★'.repeat(5)} <span className="text-white font-bold ml-1">4.9/5</span>
                </div>
                <span>15,000+ Happy Customers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative background image */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 lg:opacity-30 pointer-events-none hidden sm:block">
          <img
            src="https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=80"
            alt="Herbal Banner"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Value Proposition Badges */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: ShieldCheck, title: '100% Pure Organic', desc: 'Sourced directly from Himalayan farms' },
          { icon: Truck, title: 'Free Express Delivery', desc: 'On all orders above ₹499' },
          { icon: RefreshCw, title: 'Easy Returns', desc: 'Hassle-free replacement policy' },
          { icon: Award, title: 'Ayush Certified', desc: 'GMP & Lab tested formulations' },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="glass-card p-4 rounded-2xl flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-xs text-white">{item.title}</h4>
                <p className="text-[11px] text-slate-400">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </section>

      {/* Category Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-white">Explore Categories</h2>
            <p className="text-xs text-slate-400">Curated herbal remedies for everyday vitality</p>
          </div>
          <button
            onClick={onExploreShop}
            className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="glass-card rounded-2xl overflow-hidden cursor-pointer group hover:border-emerald-500/50 transition-all p-3"
            >
              <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-800 mb-2">
                <img
                  src={cat.image_url}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="font-heading font-bold text-sm text-white group-hover:text-emerald-400 transition-colors">
                {cat.name}
              </h3>
              <p className="text-[11px] text-slate-400 line-clamp-1">{cat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-white">Featured Organic Products</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} onSelect={onSelectProduct} />
          ))}
        </div>
      </section>

      {/* Bestsellers & Trending Sections */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-400" />
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-white">Bestseller Remedies</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {bestsellers.map((product) => (
            <ProductCard key={product.id} product={product} onSelect={onSelectProduct} />
          ))}
        </div>
      </section>

      {/* Customer Reviews & Testimonials Slider */}
      <section className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Verified Feedback</span>
          <h2 className="font-heading text-2xl font-bold text-white">What Our Wellness Community Says</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'Rohan Verma', rating: 5, comment: 'Remarkable quality Ashwagandha! Improved my sleep quality and energy levels within 10 days.', title: 'Pure KSM-66 Quality' },
            { name: 'Priya S.', rating: 5, comment: 'Tastes like authentic grandma chyawanprash! Real saffron aroma and pure honey texture.', title: 'Authentic Amla Formula' },
            { name: 'Ananya Sen', rating: 5, comment: 'Very refreshing Tulsi flavor. I drink two cups daily while working. Super fast delivery!', title: 'Fresh Himalayan Tea' },
          ].map((rev, i) => (
            <div key={i} className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-xs text-emerald-400">{rev.title}</span>
                <div className="flex text-amber-400 text-xs font-bold">
                  {'★'.repeat(rev.rating)}
                </div>
              </div>
              <p className="text-xs text-slate-300 italic">"{rev.comment}"</p>
              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800">
                <span className="font-medium text-white">{rev.name}</span>
                <span className="text-emerald-400 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Verified Buyer</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

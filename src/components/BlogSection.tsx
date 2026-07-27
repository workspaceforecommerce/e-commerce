import React from 'react';
import { Calendar, User, ArrowRight, BookOpen } from 'lucide-react';

export const BlogSection: React.FC = () => {
  const articles = [
    {
      id: 1,
      title: 'Top 7 Benefits of KSM-66 Ashwagandha for Stress Relief & Stamina',
      date: 'July 24, 2026',
      author: 'Dr. V. Sharma (Ayurvedic Practitioner)',
      excerpt: 'Discover how daily intake of pure Ashwagandha root extract calms anxiety, balances cortisol, and boosts stamina naturally.',
      image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80',
      category: 'Herbal Science'
    },
    {
      id: 2,
      title: 'Himalayan Tulsi Green Tea: The Ultimate Daily Detox Routine',
      date: 'July 20, 2026',
      author: 'Ayush Health Research Team',
      excerpt: 'Learn why blending Rama, Krishna, and Vana Tulsi with whole leaf green tea cleanses toxins and elevates daily immunity.',
      image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
      category: 'Wellness Teas'
    },
    {
      id: 3,
      title: 'Triphala Churna for Gut Health: How Amla & Haritaki Cleanse Naturally',
      date: 'July 18, 2026',
      author: 'Pooja K. (Nutritionist)',
      excerpt: 'An authentic guide to ancient three-fruit Triphala powder for digestive regularity, skin radiance, and colon detoxification.',
      image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
      category: 'Ayurvedic Living'
    }
  ];

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-700" />
          <div>
            <h2 className="font-heading text-xl font-bold text-slate-900">WordPress Wellness Blog & Articles</h2>
            <p className="text-xs text-slate-500">Expert health insights & authentic ayurvedic guides</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map((art) => (
          <article key={art.id} className="wp-card rounded-2xl overflow-hidden group flex flex-col justify-between">
            <div>
              <div className="aspect-video w-full overflow-hidden bg-slate-100 relative">
                <img
                  src={art.image}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-2 left-2 bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  {art.category}
                </span>
              </div>

              <div className="p-4 space-y-2">
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {art.date}</span>
                  <span className="flex items-center gap-1 truncate"><User className="w-3 h-3" /> {art.author}</span>
                </div>

                <h3 className="font-heading font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2">
                  {art.title}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                  {art.excerpt}
                </p>
              </div>
            </div>

            <div className="p-4 pt-0">
              <button className="text-xs font-bold text-emerald-700 group-hover:underline inline-flex items-center gap-1">
                Read Full Article <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

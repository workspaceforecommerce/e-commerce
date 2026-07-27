import React, { useState } from 'react';
import { Calendar, User, ArrowRight, BookOpen, Clock, Tag, Search } from 'lucide-react';

export const BlogView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const articles = [
    {
      id: 1,
      title: 'Top 7 Benefits of KSM-66 Ashwagandha for Stress Relief & Daily Stamina',
      date: 'July 24, 2026',
      author: 'Dr. V. Sharma (Ayurvedic Practitioner)',
      readTime: '5 min read',
      category: 'Herbal Science',
      excerpt: 'Discover how daily intake of pure Ashwagandha root extract calms anxiety, balances cortisol, and boosts stamina naturally.',
      image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80',
      content: `Ashwagandha (Withania somnifera) is revered in traditional Ayurvedic medicine for its profound adaptogenic properties...`
    },
    {
      id: 2,
      title: 'Himalayan Tulsi Green Tea: The Ultimate Daily Immunity Detox Routine',
      date: 'July 20, 2026',
      author: 'Ayush Health Research Team',
      readTime: '4 min read',
      category: 'Wellness Teas',
      excerpt: 'Learn why blending Rama, Krishna, and Vana Tulsi with whole leaf green tea cleanses toxins and elevates daily immunity.',
      image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
      content: `Holy Basil (Tulsi) has been cultivated in Indian households for thousands of years as a potent natural respiratory aid...`
    },
    {
      id: 3,
      title: 'Triphala Churna for Gut Health: How Amla & Haritaki Cleanse Naturally',
      date: 'July 18, 2026',
      author: 'Pooja K. (Nutritionist)',
      readTime: '6 min read',
      category: 'Ayurvedic Living',
      excerpt: 'An authentic guide to ancient three-fruit Triphala powder for digestive regularity, skin radiance, and colon detoxification.',
      image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80',
      content: `Triphala is a traditional Ayurvedic formulation composed of equal parts of three native fruits: Amla, Haritaki, and Bibhitaki...`
    },
    {
      id: 4,
      title: 'Chyawanprash Awaleha: Authentic Saffron & Amla Preparation Secrets',
      date: 'July 12, 2026',
      author: 'Master Herbalist Devraj',
      readTime: '7 min read',
      category: 'Herbal Science',
      excerpt: 'Uncover the traditional copper-vessel slow cooking method behind genuine Chyawanprash without added white sugar.',
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
      content: `Traditional Chyawanprash relies on fresh organic Amla pulp simmered with over 40 therapeutic herbs...`
    }
  ];

  const filtered = articles.filter((a) => {
    const matchesCat = selectedCategory ? a.category === selectedCategory : true;
    const matchesSearch = searchQuery
      ? a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="wp-card p-6 sm:p-10 rounded-3xl bg-gradient-to-r from-emerald-900 to-slate-900 text-white space-y-3">
        <div className="inline-flex items-center gap-2 bg-emerald-800/80 px-3 py-1 rounded-full text-xs font-bold text-amber-300">
          <BookOpen className="w-4 h-4" /> Healthy Monks Wellness Publication
        </div>
        <h1 className="font-heading text-2xl sm:text-4xl font-extrabold">Ayurvedic Health & Herbal Knowledge</h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Evidence-based articles on ancient herbal remedies, daily immunity routines, and certified organic living.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar */}
        <aside className="space-y-6">
          <div className="wp-card p-5 rounded-2xl space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl pl-9 pr-3 py-2 border border-slate-300 focus:outline-none focus:border-emerald-700"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-200">
              <h4 className="font-heading font-bold text-xs text-slate-900 uppercase">Categories</h4>
              <ul className="space-y-1 text-xs text-slate-700 font-semibold">
                <li>
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`w-full text-left px-3 py-2 rounded-xl flex justify-between transition-all ${
                      selectedCategory === null ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-100'
                    }`}
                  >
                    <span>All Articles</span>
                    <span>{articles.length}</span>
                  </button>
                </li>
                {['Herbal Science', 'Wellness Teas', 'Ayurvedic Living'].map((cat) => (
                  <li key={cat}>
                    <button
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-3 py-2 rounded-xl flex justify-between transition-all ${
                        selectedCategory === cat ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-100'
                      }`}
                    >
                      <span>{cat}</span>
                      <span>{articles.filter((a) => a.category === cat).length}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        {/* Article Cards Grid */}
        <main className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((art) => (
            <article key={art.id} className="wp-card rounded-2xl overflow-hidden flex flex-col justify-between group">
              <div>
                <div className="aspect-video w-full overflow-hidden bg-slate-100 relative">
                  <img
                    src={art.image}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    {art.category}
                  </span>
                </div>

                <div className="p-5 space-y-2">
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-emerald-700" /> {art.date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-emerald-700" /> {art.readTime}</span>
                  </div>

                  <h2 className="font-heading font-bold text-base text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2">
                    {art.title}
                  </h2>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {art.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-slate-100 flex justify-between items-center mt-3">
                <span className="text-[11px] font-bold text-slate-500">{art.author}</span>
                <button className="text-xs font-bold text-emerald-700 group-hover:underline flex items-center gap-1">
                  Read Article <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>
          ))}
        </main>
      </div>
    </div>
  );
};

import React from 'react';
import { ShieldCheck, Award, Leaf, Users, CheckCircle, MapPin, HeartHandshake, Microchip, Sparkles, Sprout } from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="space-y-12 pb-16 animate-in fade-in duration-300">
      {/* Hero Header Card */}
      <div className="wp-card p-8 sm:p-14 rounded-3xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-950 text-white text-center space-y-5 shadow-xl relative overflow-hidden border border-emerald-800/60">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <span className="bg-emerald-800/90 text-amber-300 text-xs font-extrabold px-4 py-1.5 rounded-full border border-emerald-700/80 inline-flex items-center gap-1.5 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Authentic Himalayan Ayurvedic Heritage Since 2018
        </span>

        <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Purity Born in the Himalayas,<br />Backed by Modern Science
        </h1>

        <p className="text-xs sm:text-base text-emerald-100/90 max-w-3xl mx-auto leading-relaxed font-medium">
          Healthy Monks bridges 5,000-year-old Vedic botanical wisdom with rigorous modern clinical research. We cultivate, harvest, and craft 100% organic Ayurvedic remedies to restore balance in modern lifestyle routines.
        </p>
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { number: '50,000+', label: 'Happy Customers Across India', sub: '4.8/5 Star Rated' },
          { number: '100%', label: 'Wild-Harvested Himalayan Botanicals', sub: 'Pesticide & Chemical Free' },
          { number: '30+', label: 'Certified Organic Partner Farms', sub: 'Fair-Trade Guaranteed' },
          { number: '0%', label: 'Synthetic Fillers or Heavy Metals', sub: 'AYUSH Ministry Compliant' },
        ].map((stat, i) => (
          <div key={i} className="wp-card p-5 rounded-2xl bg-white text-center border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all">
            <p className="font-heading font-extrabold text-2xl sm:text-3xl text-emerald-900">{stat.number}</p>
            <p className="font-bold text-xs text-slate-800 mt-1">{stat.label}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Core Mission Cards Grid */}
      <div className="space-y-4">
        <div className="text-center space-y-1">
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900">Our Core Pillars & Commitment</h2>
          <p className="text-xs text-slate-500">How we deliver absolute purity and efficacy from farm to bottle</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="wp-card p-7 rounded-2xl space-y-4 bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
            <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/80 group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-extrabold text-lg text-slate-900">High-Altitude Himalayan Sourcing</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our herbs—including KSM-66 Ashwagandha, Shilajit resin, and Shatavari—are cultivated in pristine high-altitude Himalayan micro-climates where soil mineral density peaks naturally without synthetic fertilizers.
            </p>
            <ul className="space-y-1.5 text-xs text-slate-700 font-semibold pt-1">
              <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Sustainable wild-harvesting</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Zero pesticide contamination</li>
            </ul>
          </div>

          <div className="wp-card p-7 rounded-2xl space-y-4 bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
            <div className="w-13 h-13 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/80 group-hover:scale-105 transition-transform">
              <Microchip className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-extrabold text-lg text-slate-900">Triple-Tested Lab Standardisation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every production batch undergoes HPLC testing to guarantee exact bio-active alkaloid percentages (e.g. 5% Withanolides in Ashwagandha), along with heavy metal testing in NABL-accredited ISO laboratories.
            </p>
            <ul className="space-y-1.5 text-xs text-slate-700 font-semibold pt-1">
              <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> AYUSH Premium Mark Quality</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Full batch transparency & COA</li>
            </ul>
          </div>

          <div className="wp-card p-7 rounded-2xl space-y-4 bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
            <div className="w-13 h-13 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200/80 group-hover:scale-105 transition-transform">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-extrabold text-lg text-slate-900">Ethical Farmer Partnerships</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We partner directly with over 30 indigenous farming families across Himachal Pradesh and Uttarakhand. By eliminating middlemen, we ensure fair-trade pricing, direct farmer support, and community welfare.
            </p>
            <ul className="space-y-1.5 text-xs text-slate-700 font-semibold pt-1">
              <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> 100% Direct Fair-Trade wages</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Eco-friendly biodegradable packaging</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Detailed Story & Philosophy Section */}
      <div className="wp-card p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-6">
        <div className="max-w-3xl space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Our Journey & Philosophy
          </span>
          <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900">
            Restoring Authentic Ayurveda to Daily Modern Wellness
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Founded in 2018, Healthy Monks began with a simple observation: modern wellness markets were flooded with heavily diluted herbal powders containing synthetic additives and artificial preservatives. We set out to change that by reviving authentic Samhita recipes using slow cold-milling and copper vessel extraction techniques.
          </p>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Today, our range spans adaptogenic herbs, wellness teas, raw seeds, and restorative supplements—crafted without compromise for health-conscious individuals who value genuine purity.
          </p>
        </div>
      </div>
    </div>
  );
};

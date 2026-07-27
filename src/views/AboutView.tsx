import React from 'react';
import { ShieldCheck, Award, Leaf, Users, CheckCircle, MapPin } from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="space-y-10 pb-12">
      {/* Hero Section */}
      <div className="wp-card p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 text-white text-center space-y-4">
        <span className="bg-emerald-800 text-amber-300 text-xs font-extrabold px-3 py-1 rounded-full border border-emerald-600 inline-block">
          Authentic Himalayan Heritage Since 2018
        </span>
        <h1 className="font-heading text-3xl sm:text-5xl font-extrabold tracking-tight">
          About Healthy Monks
        </h1>
        <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl mx-auto leading-relaxed">
          Bridging ancient Vedic herbal science with modern organic cultivation standards. 100% wild-harvested herbs sourced directly from Himalayan farms.
        </p>
      </div>

      {/* Core Values Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="wp-card p-6 rounded-2xl space-y-3 bg-white">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
            <Leaf className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-bold text-lg text-slate-900">100% Organic Sourcing</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Our roots are harvested at high altitude in pesticide-free soils without chemical growth promoters.
          </p>
        </div>

        <div className="wp-card p-6 rounded-2xl space-y-3 bg-white">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-bold text-lg text-slate-900">Ayush & FSSAI Certified</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every batch undergoes rigorous heavy metal, microbial, and potency testing in ISO-certified laboratories.
          </p>
        </div>

        <div className="wp-card p-6 rounded-2xl space-y-3 bg-white">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-bold text-lg text-slate-900">Traditional Extraction</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            We preserve bioactive alkaloids through cold-press milling and copper vessel decoction techniques.
          </p>
        </div>
      </div>
    </div>
  );
};

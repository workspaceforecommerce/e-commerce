import React from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWA } from '../context/PWAContext';

export const InstallPwaBanner: React.FC = () => {
  const { isInstallable, promptInstall } = usePWA();
  const [dismissed, setDismissed] = React.useState(false);

  if (!isInstallable || dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-emerald-900 via-emerald-950 to-slate-900 border-y border-emerald-700/40 p-4 text-white">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Smartphone className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h4 className="font-heading font-bold text-sm text-white">Install Healthy Monks PWA App</h4>
            <p className="text-xs text-slate-300">Enjoy 1-tap checkout, instant order tracking & offline access.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={promptInstall}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-lg shadow-emerald-900/40"
          >
            <Download className="w-4 h-4" />
            Install Now
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-2 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

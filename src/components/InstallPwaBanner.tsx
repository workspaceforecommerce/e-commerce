import React from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWA } from '../context/PWAContext';

export const InstallPwaBanner: React.FC = () => {
  const { isInstallable, promptInstall } = usePWA();
  const [dismissed, setDismissed] = React.useState(false);

  if (!isInstallable || dismissed) return null;

  return (
    <div className="bg-emerald-900 border-b border-emerald-800 p-3 text-white">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-800 flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <h4 className="font-heading font-bold text-xs text-white">Install Healthy Monks PWA App</h4>
            <p className="text-[11px] text-emerald-100">1-tap checkout, instant order tracking & offline browsing.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={promptInstall}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-xs"
          >
            <Download className="w-4 h-4" />
            Install App
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-2 text-emerald-200 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

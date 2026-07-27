import React from 'react';
import { Download, X } from 'lucide-react';
import { usePWA } from '../context/PWAContext';

export const InstallPwaBanner: React.FC = () => {
  const { isInstallable, promptInstall } = usePWA();
  const [dismissed, setDismissed] = React.useState(false);

  if (!isInstallable || dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-emerald-800 to-slate-900 text-white px-4 py-2.5 shadow-md flex items-center justify-between text-xs animate-in fade-in">
      <div className="flex items-center gap-3">
        <img
          src="/logo.png"
          alt="Healthy Monks"
          className="w-10 h-10 rounded-xl object-cover shrink-0 shadow-sm"
        />
        <div>
          <h4 className="font-heading font-bold text-xs text-white">Install Healthy Monks Official Store App</h4>
          <p className="text-[11px] text-emerald-100">Enjoy one-click orders, instant tracking updates & offline browsing.</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={promptInstall}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-2xs"
        >
          <Download className="w-3.5 h-3.5" /> Install App
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

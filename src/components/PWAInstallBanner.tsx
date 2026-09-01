import React, { useState, useEffect } from 'react';
import { Download, Sparkles, X, Smartphone, ShieldCheck, WifiOff } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem('expensepk_pwa_dismissed') === 'true';
  });

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isDismissed) {
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Show manual banner if not installed and on mobile/desktop after short delay
    const timer = setTimeout(() => {
      if (!isDismissed && !(window.matchMedia('(display-mode: standalone)').matches)) {
        setIsVisible(true);
      }
    }, 2500);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(timer);
    };
  }, [isDismissed]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsVisible(false);
      }
      setDeferredPrompt(null);
    } else {
      alert('To install on iOS: Tap Share ➔ Add to Home Screen.\nOn Android/Desktop: Click Install in browser menu.');
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('expensepk_pwa_dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 z-40 max-w-sm rounded-3xl bg-gradient-to-r from-purple-900/90 via-indigo-900/90 to-slate-900/90 border border-purple-500/30 p-4 shadow-2xl backdrop-blur-2xl animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30">
            <Smartphone className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Install ExpensePK</span>
              <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-extrabold text-emerald-300 border border-emerald-500/30">PWA</span>
            </h4>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Works 100% offline with instant PKR transaction tracking on home screen.
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="rounded-full bg-white/10 p-1 text-slate-400 hover:text-white"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-3 flex items-center justify-end gap-2">
        <button
          onClick={handleDismiss}
          className="rounded-xl px-3 py-1.5 text-[11px] font-medium text-slate-400 hover:text-white"
        >
          Maybe later
        </button>
        <button
          onClick={handleInstall}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-3.5 py-1.5 text-[11px] font-bold text-white shadow-lg shadow-purple-600/30 active:scale-95 transition-all"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Add to Home Screen</span>
        </button>
      </div>
    </div>
  );
};

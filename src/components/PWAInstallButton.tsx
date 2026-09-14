import React, { useState } from 'react';
import { Download, Smartphone, X, Check, Apple } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed standalone PWA / TWA, show tiny indicator or null
  if (isInstalled) {
    return (
      <div className="hidden lg:flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
        <Check className="h-3.5 w-3.5 text-emerald-600" />
        <span>Installed App</span>
      </div>
    );
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        id="pwa-install-btn"
        onClick={install}
        className="flex items-center gap-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 px-2.5 py-1.5 text-xs font-bold text-white shadow-xs transition-all active:scale-95 animate-pulse"
        title="Install Local Seller Marketplace to your phone or desktop"
      >
        <Download className="h-3.5 w-3.5 text-white" />
        <span className="hidden sm:inline">Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          id="pwa-install-ios-btn"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100 transition-all"
        >
          <Apple className="h-3.5 w-3.5 text-amber-800" />
          <span className="hidden sm:inline">Add to Home Screen</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-stone-200">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-amber-700" />
                  <h3 className="font-bold text-stone-900">Install on iPhone / iPad</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="rounded-lg p-1 text-stone-400 hover:text-stone-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs text-stone-600">
                <div className="flex items-start gap-3 rounded-xl bg-stone-50 p-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-700 text-white font-bold text-[10px]">1</span>
                  <p>
                    Tap the <strong>Share</strong> button at the bottom of your Safari screen.
                  </p>
                </div>
                <div className="flex items-start gap-3 rounded-xl bg-stone-50 p-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-700 text-white font-bold text-[10px]">2</span>
                  <p>
                    Scroll down in the options menu and select <strong>Add to Home Screen</strong>.
                  </p>
                </div>
                <div className="flex items-start gap-3 rounded-xl bg-stone-50 p-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-700 text-white font-bold text-[10px]">3</span>
                  <p>
                    Tap <strong>Add</strong> in the top-right corner. The app will launch like a native mobile app!
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-stone-900 py-2.5 text-xs font-bold text-white hover:bg-stone-800 transition-all"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

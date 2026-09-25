'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Check } from 'lucide-react';

export default function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showIosPrompt, setShowIosPrompt] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if running as installed standalone app
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      return;
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    } else {
      // If iOS Safari or unsupported prompt, show instructions
      setShowIosPrompt(true);
    }
  };

  if (installed) return null;

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950/40 transition-all hover:scale-105"
        title="Install TurfBook App on your device"
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Install App</span>
        <span className="sm:hidden">App</span>
      </button>

      {/* iOS / Manual Add to Home Screen Instructions Modal */}
      {showIosPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">📲</span>
                <h3 className="font-bold text-white text-sm">Install TurfBook App</h3>
              </div>
              <button
                onClick={() => setShowIosPrompt(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-300 leading-relaxed">
              To install TurfBook on your iPhone or Android:
            </p>

            <div className="space-y-2 bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-slate-300">
              <p className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 font-bold flex items-center justify-center text-[10px]">
                  1
                </span>
                <span>Tap the <strong>Share</strong> button (⎋) in Safari or menu (⋮) in Chrome</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 font-bold flex items-center justify-center text-[10px]">
                  2
                </span>
                <span>Scroll down and select <strong>"Add to Home Screen"</strong></span>
              </p>
              <p className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 font-bold flex items-center justify-center text-[10px]">
                  3
                </span>
                <span>Open TurfBook directly from your home screen like any native app!</span>
              </p>
            </div>

            <button
              onClick={() => setShowIosPrompt(false)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
            >
              Got It!
            </button>
          </div>
        </div>
      )}
    </>
  );
}

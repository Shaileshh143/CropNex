'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, CheckCircle2, Share } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('[PWA] Service Worker registered with scope:', reg.scope);
          })
          .catch((err) => {
            console.warn('[PWA] Service Worker registration failed:', err);
          });
      });
    }

    // 2. Check if already running in standalone mode (installed)
    const isApp =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isApp);

    if (isApp) return;

    // 3. Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Check if dismissed recently (within 24 hours)
    const dismissedTime = localStorage.getItem('cropnex_pwa_dismissed');
    if (dismissedTime && Date.now() - parseInt(dismissedTime) < 24 * 60 * 60 * 1000) {
      return;
    }

    // 4. Capture beforeinstallprompt for Android, Chrome, Edge
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show prompt after a short delay so user has seen the landing page
      setTimeout(() => setShowPrompt(true), 2500);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // 5. Detect app installed event
    const handleAppInstalled = () => {
      setInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      console.log('[PWA] CropNex successfully installed!');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // 6. Listen for manual trigger button clicks
    const handleManualTrigger = () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult: any) => {
          if (choiceResult.outcome === 'accepted') {
            setShowPrompt(false);
          }
          setDeferredPrompt(null);
        });
      } else if (isIosDevice) {
        setShowIOSGuide(true);
      } else {
        alert('To install CropNex: Click the browser menu (⋮ or Share) and select "Install app" or "Add to Home Screen".');
      }
    };

    window.addEventListener('cropnex-install-pwa', handleManualTrigger);

    // If on iOS and not dismissed, show guide prompt
    if (isIosDevice && !isApp && !dismissedTime) {
      setTimeout(() => setShowPrompt(true), 4000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('cropnex-install-pwa', handleManualTrigger);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('cropnex_pwa_dismissed', Date.now().toString());
  };

  if (isStandalone || installed || !showPrompt) return null;

  return (
    <>
      {/* 1. FLOATING PWA INSTALL BANNER */}
      <div className="fixed bottom-20 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-40 bg-[#0e2a1b]/95 backdrop-blur-md text-white p-3.5 sm:p-4 rounded-2xl shadow-2xl border border-emerald-500/40 animate-in fade-in slide-in-from-bottom duration-300">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src="/images/cropnex_logo.png"
              alt="CropNex App"
              className="w-11 h-11 rounded-full object-cover shadow-md border-2 border-[#f59e0b] shrink-0"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-black text-sm text-white">Install CropNex App</h4>
                <span className="text-[9px] font-bold bg-[#f59e0b] text-slate-900 px-1.5 py-0.2 rounded-full">
                  PWA
                </span>
              </div>
              <p className="text-[11px] text-emerald-100/90 leading-tight mt-0.5">
                Fast loading, offline ready &amp; direct farm produce on your Home Screen.
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 text-emerald-300 hover:text-white rounded-lg transition"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={handleDismiss}
            className="flex-1 py-2 px-3 rounded-xl border border-emerald-700/60 text-emerald-200 hover:bg-white/5 font-semibold text-xs text-center transition"
          >
            Not Now
          </button>
          <button
            onClick={handleInstallClick}
            className="flex-1 py-2 px-3 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 font-black text-xs shadow-md flex items-center justify-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Install App</span>
          </button>
        </div>
      </div>

      {/* 2. iOS INSTALLATION GUIDE MODAL */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 text-gray-900 space-y-4 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <img src="/images/cropnex_logo.png" alt="CropNex" className="w-8 h-8 rounded-full border border-[#f59e0b]" />
                <h3 className="font-black text-sm">Install on iPhone / iPad</h3>
              </div>
              <button onClick={() => setShowIOSGuide(false)} className="p-1 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Apple Safari me install karne ke liye bas 2 steps follow karein:
            </p>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                <div className="w-6 h-6 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                  1
                </div>
                <div>
                  <p className="font-bold text-gray-900">Share Button tap karein</p>
                  <p className="text-gray-500 text-[11px]">Niche browser bar me <Share className="w-3 h-3 inline text-blue-600 mx-0.5" /> icon par click karein.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                <div className="w-6 h-6 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                  2
                </div>
                <div>
                  <p className="font-bold text-gray-900">&quot;Add to Home Screen&quot; chunein</p>
                  <p className="text-gray-500 text-[11px]">Menu me scroll karke <strong>Add to Home Screen</strong> dabayein.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md"
            >
              Samajh Gaya (Done)
            </button>
          </div>
        </div>
      )}
    </>
  );
}

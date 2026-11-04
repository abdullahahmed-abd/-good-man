import React, { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, CheckCircle2, X } from 'lucide-react';
import sounds from '../../utils/soundEffects';

export default function PwaUpdateToast() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker
  } = useRegisterSW({
    onRegistered(r) {
      if (r) {
        console.log('SW Registered successfully:', r.scope);
      }
    },
    onRegisterError(error) {
      console.warn('SW registration note:', error);
    }
  });

  // Auto-dismiss offlineReady toast after 4 seconds
  useEffect(() => {
    if (offlineReady) {
      sounds.playSuccess ? sounds.playSuccess() : sounds.playTap();
      const timer = setTimeout(() => {
        setOfflineReady(false);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [offlineReady, setOfflineReady]);

  const handleUpdate = () => {
    sounds.playTap();
    updateServiceWorker(true);
  };

  const handleDismissUpdate = () => {
    sounds.playTap();
    setNeedRefresh(false);
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-50 max-w-sm pointer-events-none">
      <AnimatePresence>
        {/* 1. Offline Ready Toast */}
        {offlineReady && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="p-3.5 rounded-2xl spatial-glass border border-emerald-500/30 bg-slate-950/90 shadow-2xl flex items-center space-x-3 pointer-events-auto mb-2 text-xs"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-white">Offline Ready</p>
              <p className="text-[11px] text-slate-300">Sanctuary is cached and works without internet.</p>
            </div>
            <button
              onClick={() => setOfflineReady(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
              aria-label="Dismiss offline notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}

        {/* 2. New Version Available Update Prompt */}
        {needRefresh && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="p-4 rounded-3xl spatial-glass border border-amber-500/30 bg-slate-950/95 shadow-2xl flex items-start space-x-3 pointer-events-auto text-xs"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <RefreshCw className="w-4 h-4 animate-spin" />
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <p className="font-bold text-white">New Version Available</p>
                <p className="text-[11px] text-slate-300">A new update for Insaan has arrived.</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleUpdate}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs tracking-wide shadow-md transition-all cursor-pointer"
                >
                  Tap to update
                </button>
                <button
                  onClick={handleDismissUpdate}
                  className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs transition-colors"
                >
                  Later
                </button>
              </div>
            </div>
            <button
              onClick={handleDismissUpdate}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
              aria-label="Close update notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

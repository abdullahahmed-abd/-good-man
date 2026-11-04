import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Sparkles, Smartphone, ShieldCheck } from 'lucide-react';
import usePwaInstall from '../../hooks/usePwaInstall';
import PwaInstallModal from '../../components/common/PwaInstallModal';
import sounds from '../../utils/soundEffects';

const DISMISSAL_STORAGE_KEY = 'insaan_install_banner_dismissed';
const VISIT_COUNT_STORAGE_KEY = 'insaan_visit_count';
const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;

export default function PwaInstallBanner() {
  const {
    isInstalled,
    canInstall,
    isIos,
    isIosSafari,
    isIosOther,
    promptInstall,
    showIosModal,
    setShowIosModal,
    showFallbackModal,
    setShowFallbackModal
  } = usePwaInstall();

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // If already installed, never show the banner
    if (isInstalled) {
      setIsVisible(false);
      return;
    }

    try {
      // 1. Visit count check (show on/after 2nd visit)
      const rawCount = localStorage.getItem(VISIT_COUNT_STORAGE_KEY);
      let count = rawCount ? parseInt(rawCount, 10) : 0;
      if (isNaN(count)) count = 0;

      // Increment session visit counter (use sessionStorage guard to only increment once per session)
      if (!sessionStorage.getItem('insaan_session_visited')) {
        sessionStorage.setItem('insaan_session_visited', '1');
        count += 1;
        localStorage.setItem(VISIT_COUNT_STORAGE_KEY, count.toString());
      }

      if (count < 2) {
        setIsVisible(false);
        return;
      }

      // 2. Check 14-day dismissal window
      const dismissedTimestamp = localStorage.getItem(DISMISSAL_STORAGE_KEY);
      if (dismissedTimestamp) {
        const dismissedAt = parseInt(dismissedTimestamp, 10);
        if (!isNaN(dismissedAt) && Date.now() - dismissedAt < FOURTEEN_DAYS_MS) {
          setIsVisible(false);
          return;
        }
      }

      // Visible if visit >= 2 and not recently dismissed
      setIsVisible(true);
    } catch (e) {
      // Fallback if localStorage is disabled or restricted
      setIsVisible(false);
    }
  }, [isInstalled]);

  const handleDismiss = () => {
    sounds.playTap();
    setIsVisible(false);
    try {
      localStorage.setItem(DISMISSAL_STORAGE_KEY, Date.now().toString());
    } catch (e) {
      // Ignore storage errors
    }
  };

  const handleInstallClick = async () => {
    sounds.playTap();
    await promptInstall();
  };

  if (!isVisible || isInstalled) return null;

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.98 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="relative overflow-hidden p-5 sm:p-6 rounded-3xl spatial-glass border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-teal-950/40 shadow-2xl mb-6"
        >
          {/* Ambient Glow Orb */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-[2px] shadow-neon-emerald flex-shrink-0">
                <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-xl">
                  🧘‍♂️
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                    Standalone Experience
                  </span>
                </div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Install Insaan to Your Home Screen
                </h3>
                <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                  Enjoy instant offline launch, zero browser address bar distractions, and background pedometer reliability.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2.5 self-start sm:self-auto flex-shrink-0">
              <button
                onClick={handleInstallClick}
                className="py-2.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-emerald-500/20 transition-all flex items-center space-x-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Install Now</span>
              </button>

              <button
                onClick={handleDismiss}
                className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                title="Dismiss for 14 days"
                aria-label="Dismiss install banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <PwaInstallModal
        isOpen={showIosModal || showFallbackModal}
        onClose={() => {
          setShowIosModal(false);
          setShowFallbackModal(false);
        }}
        isIos={isIos}
        isIosSafari={isIosSafari}
        isIosOther={isIosOther}
      />
    </>
  );
}


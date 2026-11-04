import React from 'react';
import { Download, Sparkles, Smartphone, Check } from 'lucide-react';
import usePwaInstall from '../../hooks/usePwaInstall';
import PwaInstallModal from './PwaInstallModal';
import sounds from '../../utils/soundEffects';

export default function PwaInstallButton({ variant = 'compact', className = '' }) {
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

  // If already running in standalone PWA, hide install triggers
  if (isInstalled) {
    if (variant === 'card') {
      return (
        <div className={`p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs text-emerald-300 ${className}`}>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Check className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <span className="font-bold text-white block">Insaan Installed</span>
              <span className="text-[11px] text-emerald-400/80">Operating in standalone PWA mode</span>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
            Active
          </span>
        </div>
      );
    }
    return null;
  }

  // If neither canInstall nor iOS, don't show the header button to avoid clutter
  if (variant === 'compact' && !canInstall) {
    return null;
  }

  const handleClick = async () => {
    sounds.playTap();
    await promptInstall();
  };

  return (
    <>
      {variant === 'compact' ? (
        <button
          onClick={handleClick}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-500/20 to-teal-500/15 border border-emerald-500/40 text-emerald-300 hover:from-emerald-500/30 hover:to-teal-500/25 transition-all shadow-glass-sm cursor-pointer group ${className}`}
          title="Install Insaan app to your device for offline sanctuary and full-screen experience"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-y-0.5 transition-transform" />
          <span className="font-bold">Install App</span>
        </button>
      ) : (
        /* Full card variant for Sidebar or Settings */
        <div className={`p-5 rounded-3xl spatial-glass border border-emerald-500/20 space-y-3 ${className}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-[2px] flex-shrink-0">
                <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center text-lg">
                  📲
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Install Insaan PWA</h4>
                <p className="text-xs text-slate-400">Offline sanctuary, faster load, zero browser chrome</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Install to your home screen or desktop for continuous pedometer tracking and distraction-free philosophy study.
          </p>

          <button
            onClick={handleClick}
            className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Install Application</span>
          </button>
        </div>
      )}

      {/* iOS & Fallback Instruction Modal */}
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


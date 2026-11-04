import React, { useState } from 'react';
import Modal from './Modal';
import { Share, PlusSquare, Check, Copy, ExternalLink, Smartphone, AlertCircle, Sparkles } from 'lucide-react';
import sounds from '../../utils/soundEffects';

export default function PwaInstallModal({
  isOpen,
  onClose,
  isIos = false,
  isIosSafari = false,
  isIosOther = false
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    sounds.playTap();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.origin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const getTitle = () => {
    if (isIosSafari) return 'Install Insaan on iOS';
    if (isIosOther) return 'Open in Safari to Install';
    return 'Browser Installation Guide';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getTitle()}
      icon={<Sparkles className="w-5 h-5 text-amber-400" />}
      maxWidth="max-w-md"
    >
      <div className="space-y-5 text-slate-200">
        {/* iOS Safari Guide */}
        {isIosSafari && (
          <div className="space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              Install Insaan to your home screen for full-screen view, offline sanctuary access, and zero address bar clutter:
            </p>

            <div className="space-y-3">
              {/* Step 1 */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start space-x-3.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Share className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">1. Tap the Share button</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Located in the Safari toolbar at the bottom of your iPhone (or top bar on iPad).
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start space-x-3.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">2. Select "Add to Home Screen"</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Scroll down through the share sheet options and tap <strong>Add to Home Screen</strong>.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start space-x-3.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-black">3</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">3. Confirm by tapping "Add"</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Tap <strong>Add</strong> in the top-right corner to place Insaan onto your home screen.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* iOS Non-Safari Guide (e.g. Chrome/Firefox on iOS) */}
        {isIosOther && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-start space-x-3 text-amber-200 text-xs">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <p>
                Apple restricts Progressive Web App (PWA) installation to <strong>Safari</strong> on iOS devices.
              </p>
            </div>

            <p className="text-xs text-slate-300">
              Please copy the link below and open it inside Apple Safari to install Insaan:
            </p>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={typeof window !== 'undefined' ? window.location.origin : 'https://insaan.pages.dev'}
                className="flex-1 px-3.5 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white text-xs outline-none select-all"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2.5 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold border border-emerald-500/30 transition-all flex items-center space-x-1.5 flex-shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Desktop Browser Fallback (e.g. Firefox desktop) */}
        {!isIos && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-start space-x-3 text-blue-200 text-xs">
              <Smartphone className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-white mb-1">Direct Installation Notice</h4>
                <p>
                  Your current browser does not support automated 1-click installation. For the native install experience:
                </p>
              </div>
            </div>

            <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
              <li>
                Open Insaan in <strong>Google Chrome</strong>, <strong>Microsoft Edge</strong>, or <strong>Brave</strong> to install on desktop.
              </li>
              <li>
                Open Insaan on your mobile phone (Safari on iOS or Chrome on Android) for the portable pedometer and offline sanctuary.
              </li>
            </ul>

            <div className="pt-2">
              <button
                onClick={handleCopyLink}
                className="w-full py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 flex items-center justify-center space-x-2 transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Link Copied to Clipboard!' : 'Copy Application Link'}</span>
              </button>
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-2xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-slate-200 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </Modal>
  );
}

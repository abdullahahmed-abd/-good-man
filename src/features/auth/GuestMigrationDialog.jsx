import React from 'react';
import Modal from '../../components/common/Modal';
import useAuthStore from '../../store/useAuthStore';
import sounds from '../../utils/soundEffects';
import { Database, Cloud, ArrowRight, ShieldCheck, Check } from 'lucide-react';

export default function GuestMigrationDialog() {
  const { showGuestMigrationDialog, confirmGuestMigration } = useAuthStore();

  if (!showGuestMigrationDialog) return null;

  const handleMerge = () => {
    sounds.playSuccess();
    confirmGuestMigration(true);
  };

  const handleSkip = () => {
    sounds.playTap();
    confirmGuestMigration(false);
  };

  return (
    <Modal
      isOpen={showGuestMigrationDialog}
      onClose={() => confirmGuestMigration(true)}
      title="Sanctuary Sync Options"
      icon="✨"
      maxWidth="max-w-lg"
    >
      <div className="space-y-5">
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-xs flex items-start space-x-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-white mb-1">Welcome to your Insaan Account!</p>
            <p className="text-slate-300 leading-relaxed">
              We detected existing records from your guest session (steps, books, notes, and habits).
              How would you like to handle your existing local data?
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Option 1: Merge Local into Cloud (Recommended) */}
          <button
            onClick={handleMerge}
            className="w-full p-4 rounded-2xl bg-white/5 hover:bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-500/50 text-left transition-all group cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 group-hover:scale-105 transition-transform">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-bold text-white">Merge Guest Data to Account</h4>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Upload all your local steps, habits, reflections, and notes into your cloud account without losing anything.
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-emerald-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all flex-shrink-0 ml-2 mt-2" />
            </div>
          </button>

          {/* Option 2: Cloud Data Only */}
          <button
            onClick={handleSkip}
            className="w-full p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all group cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="p-2.5 rounded-xl bg-slate-700/30 text-slate-300 group-hover:scale-105 transition-transform">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-200">Use Cloud Data Only</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Ignore local guest records and pull whatever is currently saved in your cloud account.
                  </p>
                </div>
              </div>
            </div>
          </button>
        </div>

        <div className="pt-2 text-center text-xs text-slate-500">
          Insaan utilizes end-to-end multi-device synchronization with automatic conflict resolution.
        </div>
      </div>
    </Modal>
  );
}

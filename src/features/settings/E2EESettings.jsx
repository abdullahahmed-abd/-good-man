import React, { useState } from 'react';
import SpatialCard from '../../components/common/SpatialCard';
import cryptoE2EE from '../../services/security/cryptoE2EE';
import useAuthStore from '../../store/useAuthStore';
import sounds from '../../utils/soundEffects';
import { ShieldCheck, Lock, Unlock, KeyRound, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function E2EESettings() {
  const user = useAuthStore(state => state.user);
  const [isUnlocked, setIsUnlocked] = useState(() => cryptoE2EE.hasKey());
  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEnableE2EE = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!passphrase) {
      setErrorMsg('Please enter a secret encryption passphrase.');
      return;
    }

    if (passphrase.length < 8) {
      setErrorMsg('Passphrase must be at least 8 characters for cryptographic strength.');
      return;
    }

    if (passphrase !== confirmPassphrase) {
      setErrorMsg('Passphrases do not match.');
      return;
    }

    setLoading(true);
    try {
      const userSalt = user?.email || 'insaan_default_user';
      await cryptoE2EE.initializeKey(passphrase, userSalt);
      setIsUnlocked(true);
      setPassphrase('');
      setConfirmPassphrase('');
      sounds.playSuccess();
      setSuccessMsg('Zero-Knowledge E2EE is active. Reflections will be encrypted before syncing.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Key derivation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleLockE2EE = () => {
    sounds.playTap();
    cryptoE2EE.clearKey();
    setIsUnlocked(false);
    setSuccessMsg('Encryption key cleared from volatile memory.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <SpatialCard>
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Zero-Knowledge Journal Encryption</h3>
            <p className="text-xs text-slate-400">Client-side Web Crypto AES-GCM (256-bit) + PBKDF2</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isUnlocked ? (
            <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>E2EE Active</span>
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-white/5 text-slate-400 border border-white/10">
              Not Encrypted
            </span>
          )}
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300 leading-relaxed space-y-2">
          <p>
            When enabled, your personal reflections and journal entries are encrypted directly in your browser using 
            AES-256-GCM before syncing to the cloud. 
          </p>
          <p className="text-slate-400">
            <strong>Volatile Key Storage:</strong> Your key is never written to disk or localStorage. When you close the app or refresh, 
            simply re-enter your passphrase to unlock your journal reflections.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {isUnlocked ? (
          <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <KeyRound className="w-5 h-5 text-purple-400 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">Encryption Key Active in Memory</p>
                <p className="text-[11px] text-slate-400">New journal entries will sync as encrypted ciphertext.</p>
              </div>
            </div>
            <button
              onClick={handleLockE2EE}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-slate-200 border border-white/10 transition-all cursor-pointer"
            >
              Lock / Clear Key
            </button>
          </div>
        ) : (
          <form onSubmit={handleEnableE2EE} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Passphrase
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    placeholder="Enter passphrase"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 focus:border-purple-500/50 text-white text-xs outline-none transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Confirm Passphrase
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={confirmPassphrase}
                    onChange={(e) => setConfirmPassphrase(e.target.value)}
                    placeholder="Confirm passphrase"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 focus:border-purple-500/50 text-white text-xs outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="py-2.5 px-4 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              <Unlock className="w-4 h-4" />
              <span>{loading ? 'Deriving Key (600k rounds)...' : 'Unlock / Enable Zero-Knowledge E2EE'}</span>
            </button>
          </form>
        )}
      </div>
    </SpatialCard>
  );
}

import React, { useState } from 'react';
import Modal from '../../components/common/Modal';
import useAuthStore from '../../store/useAuthStore';
import apiClient from '../../services/api/apiClient';
import sounds from '../../utils/soundEffects';
import { Mail, Lock, User, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

export default function AuthModal() {
  const { authModal, closeAuthModal, openAuthModal, login, signup } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!authModal) return null;

  const resetForm = () => {
    setErrorMsg('');
    setSuccessMsg('');
    setPassword('');
  };

  const handleSwitchTab = (tab) => {
    sounds.playTap();
    resetForm();
    openAuthModal(tab);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (authModal === 'login') {
        await login(email, password);
        // AuthStore sets showGuestMigrationDialog, and closes authModal
      } else if (authModal === 'signup') {
        if (password.length < 10) {
          throw new Error('Password must be at least 10 characters long.');
        }
        await signup(email, password, name || undefined);
      } else if (authModal === 'forgot') {
        await apiClient.post('/auth/forgot-password', { email });
        sounds.playSuccess();
        setSuccessMsg('If an account exists for this email, a password reset link has been sent.');
      } else if (authModal === 'verify') {
        await apiClient.post('/auth/resend-verification', { email });
        sounds.playSuccess();
        setSuccessMsg('A new verification email has been sent. Please check your inbox.');
      }
    } catch (err) {
      sounds.playFailure ? sounds.playFailure() : sounds.playTap();
      setErrorMsg(err.message || 'Authentication request failed.');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (authModal) {
      case 'signup': return 'Create Sanctuary Account';
      case 'forgot': return 'Reset Your Password';
      case 'verify': return 'Verify Email Address';
      default: return 'Sign In to Insaan';
    }
  };

  const getIcon = () => {
    switch (authModal) {
      case 'signup': return '✨';
      case 'forgot': return '🔑';
      case 'verify': return '✉️';
      default: return '🔐';
    }
  };

  return (
    <Modal
      isOpen={Boolean(authModal)}
      onClose={closeAuthModal}
      title={getTitle()}
      icon={getIcon()}
      maxWidth="max-w-md"
    >
      <div className="space-y-5">
        {/* Guest Reassurance Notice */}
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-start space-x-3 text-xs text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <p>
            {authModal === 'signup'
              ? 'All your existing offline steps, habits, and journals will be preserved and linked to your new account.'
              : 'Sign in to sync your character growth, pedometer logs, and reflections across all your devices.'}
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">{errorMsg}</div>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">{successMsg}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field (Signup only) */}
          {authModal === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Full Name or Alias (Optional)
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Marcus"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 text-white text-sm placeholder-slate-500 transition-all outline-none"
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 text-white text-sm placeholder-slate-500 transition-all outline-none"
              />
            </div>
          </div>

          {/* Password Field (Login & Signup) */}
          {(authModal === 'login' || authModal === 'signup') && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
                {authModal === 'login' && (
                  <button
                    type="button"
                    onClick={() => handleSwitchTab('forgot')}
                    className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={authModal === 'signup' ? 'Min. 10 characters' : '••••••••••••'}
                  minLength={authModal === 'signup' ? 10 : 1}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 text-white text-sm placeholder-slate-500 transition-all outline-none"
                />
              </div>
              {authModal === 'signup' && (
                <p className="mt-1 text-[11px] text-slate-400">
                  Must be at least 10 characters and not be a common dictionary password.
                </p>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm tracking-wide flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>
                  {authModal === 'signup'
                    ? 'Create Free Account'
                    : authModal === 'login'
                    ? 'Sign In'
                    : authModal === 'forgot'
                    ? 'Send Reset Link'
                    : 'Resend Email'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Toggle */}
        <div className="pt-3 border-t border-white/10 text-center text-xs text-slate-400">
          {authModal === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => handleSwitchTab('signup')}
                className="text-emerald-400 hover:text-emerald-300 font-semibold hover:underline"
              >
                Sign up free
              </button>
            </p>
          ) : authModal === 'signup' ? (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => handleSwitchTab('login')}
                className="text-emerald-400 hover:text-emerald-300 font-semibold hover:underline"
              >
                Sign in
              </button>
            </p>
          ) : (
            <p>
              Remember your password?{' '}
              <button
                type="button"
                onClick={() => handleSwitchTab('login')}
                className="text-emerald-400 hover:text-emerald-300 font-semibold hover:underline"
              >
                Back to sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}

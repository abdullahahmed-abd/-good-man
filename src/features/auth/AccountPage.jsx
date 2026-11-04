import React, { useState, useEffect } from 'react';
import SpatialCard from '../../components/common/SpatialCard';
import useAuthStore from '../../store/useAuthStore';
import apiClient from '../../services/api/apiClient';
import syncEngine, { SyncStatus } from '../../services/sync/syncEngine';
import sounds from '../../utils/soundEffects';
import E2EESettings from '../settings/E2EESettings';
import { 
  User, 
  Mail, 
  ShieldCheck, 
  AlertTriangle, 
  KeyRound, 
  Smartphone, 
  Download, 
  LogOut, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  Laptop, 
  Clock, 
  Lock 
} from 'lucide-react';

export default function AccountPage() {
  const { user, isAuthenticated, logout, logoutAll, openAuthModal } = useAuthStore();
  
  // Sessions
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  
  // Change password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');

  // Delete account modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Resend email verification
  const [resendStatus, setResendStatus] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  // Sync state
  const [syncState, setSyncState] = useState(() => syncEngine.getSnapshot());

  useEffect(() => {
    const unsub = syncEngine.subscribe(setSyncState);
    return unsub;
  }, []);

  const fetchSessions = async () => {
    if (!isAuthenticated) return;
    setLoadingSessions(true);
    try {
      const res = await apiClient.get('/auth/sessions');
      if (res.sessions) {
        setSessions(res.sessions);
      }
    } catch (err) {
      console.warn('Failed to load sessions:', err);
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [isAuthenticated]);

  const handleRevokeSession = async (sessionId) => {
    sounds.playTap();
    try {
      await apiClient.delete(`/auth/sessions/${sessionId}`);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch (err) {
      alert(err.message || 'Failed to revoke session');
    }
  };

  const handleResendVerification = async () => {
    if (!user?.email) return;
    sounds.playTap();
    setResendLoading(true);
    setResendStatus('');
    try {
      await apiClient.post('/auth/resend-verification', { email: user.email });
      setResendStatus('Verification link sent! Check your inbox.');
      sounds.playSuccess();
    } catch (err) {
      setResendStatus(err.message || 'Failed to send verification email.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');

    if (newPassword.length < 10) {
      setPwError('New password must be at least 10 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match.');
      return;
    }

    setPwLoading(true);
    try {
      await apiClient.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
      sounds.playSuccess();
      setPwSuccess('Password changed successfully. Other sessions have been signed out.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      fetchSessions();
    } catch (err) {
      sounds.playFailure ? sounds.playFailure() : sounds.playTap();
      setPwError(err.message || 'Failed to change password.');
    } finally {
      setPwLoading(false);
    }
  };

  const handleExportCloudData = async () => {
    sounds.playTap();
    try {
      const res = await apiClient.get('/sync/export');
      const blob = new Blob([JSON.stringify(res, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `insaan-cloud-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      sounds.playSuccess();
    } catch (err) {
      alert(err.message || 'Cloud export failed.');
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setDeleteError('');
    setDeleteLoading(true);
    try {
      await apiClient.delete('/account', { password: deletePassword });
      sounds.playSuccess();
      setShowDeleteModal(false);
      window.location.href = '/';
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete account.');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Account & Cloud Backup</h2>
          <p className="text-sm text-slate-400">Manage your sync, security, and multi-device identity</p>
        </div>

        <SpatialCard className="p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-3xl">
            🧘‍♂️
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Guest Sanctuary Active</h3>
            <p className="text-sm text-slate-300 max-w-md mx-auto mt-1 leading-relaxed">
              You are currently using Insaan 100% offline. All your steps, habits, reflections, and book notes are stored locally in IndexedDB.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => openAuthModal('login')}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-emerald-500/20 transition-all cursor-pointer inline-flex items-center space-x-2"
            >
              <User className="w-4 h-4" />
              <span>Sign In / Create Free Account</span>
            </button>
          </div>
        </SpatialCard>

        {/* E2EE Settings are also available in guest mode */}
        <E2EESettings />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Account & Cloud Sanctuary</h2>
          <p className="text-sm text-slate-400">Authenticated as {user?.email}</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => syncEngine.triggerSync()}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 flex items-center space-x-2 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncState.isSyncing ? 'animate-spin text-emerald-400' : 'text-slate-400'}`} />
            <span>{syncState.isSyncing ? 'Syncing...' : 'Sync Now'}</span>
          </button>
          <button
            onClick={logout}
            className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-semibold text-rose-300 flex items-center space-x-2 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Profile Overview Card */}
      <SpatialCard>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-[2px]">
              <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center text-2xl">
                🧘‍♂️
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">{user?.name || 'Insaan Seeker'}</h3>
                {user?.isEmailVerified ? (
                  <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>Verified</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Unverified Email
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Account created {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'recently'}
              </p>
            </div>
          </div>

          {!user?.isEmailVerified && (
            <div className="text-left sm:text-right">
              <button
                onClick={handleResendVerification}
                disabled={resendLoading}
                className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-xs font-semibold text-amber-200 transition-all cursor-pointer"
              >
                {resendLoading ? 'Sending...' : 'Resend Verification Email'}
              </button>
              {resendStatus && (
                <p className="text-[11px] text-emerald-400 mt-1">{resendStatus}</p>
              )}
            </div>
          )}
        </div>
      </SpatialCard>

      {/* E2EE Zero Knowledge Section */}
      <E2EESettings />

      {/* Active Sessions Card */}
      <SpatialCard>
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Active Sessions & Devices</h3>
              <p className="text-xs text-slate-400">Devices signed into your cloud sanctuary</p>
            </div>
          </div>
          <button
            onClick={logoutAll}
            className="text-xs text-rose-400 hover:text-rose-300 font-semibold transition-colors"
          >
            Logout all devices
          </button>
        </div>

        <div className="space-y-3 pt-3">
          {loadingSessions ? (
            <div className="text-center py-4 text-xs text-slate-400">Loading active devices...</div>
          ) : sessions.length === 0 ? (
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-400 text-center">
              Current session active
            </div>
          ) : (
            sessions.map((sess) => (
              <div
                key={sess.id}
                className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center space-x-3">
                  <Smartphone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-white">{sess.deviceLabel || 'Browser Session'}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Last active: {sess.lastUsedAt ? new Date(sess.lastUsedAt).toLocaleString() : 'Just now'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRevokeSession(sess.id)}
                  className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-[11px] font-semibold border border-rose-500/20 transition-all cursor-pointer"
                >
                  Revoke
                </button>
              </div>
            ))
          )}
        </div>
      </SpatialCard>

      {/* Change Password Card */}
      <SpatialCard>
        <div className="flex items-center space-x-3 pb-3 border-b border-white/10">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Change Password</h3>
            <p className="text-xs text-slate-400">Update your credentials to secure your account</p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4 pt-3">
          {pwError && (
            <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{pwError}</span>
            </div>
          )}
          {pwSuccess && (
            <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{pwSuccess}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                New Password (min 10)
              </label>
              <input
                type="password"
                required
                minLength={10}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 10 characters"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                minLength={10}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={pwLoading}
            className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-bold text-white transition-all cursor-pointer"
          >
            {pwLoading ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>
      </SpatialCard>

      {/* Cloud Data Export & Danger Zone */}
      <SpatialCard>
        <div className="flex items-center space-x-3 pb-3 border-b border-white/10">
          <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Data Portability & Account Termination</h3>
            <p className="text-xs text-slate-400">GDPR compliance: export full data or permanently delete</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <h4 className="text-xs font-bold text-white">Full Cloud Data Archive</h4>
            <p className="text-xs text-slate-400">
              Download a single JSON file containing every record stored under your account across all 17 tables.
            </p>
            <button
              onClick={handleExportCloudData}
              className="py-2 px-3 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/30 text-teal-300 text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Cloud JSON Archive</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-2">
            <h4 className="text-xs font-bold text-rose-300">Permanent Account Deletion</h4>
            <p className="text-xs text-slate-400">
              Permanently purges your account, all cloud database records, and active sessions. This action cannot be undone.
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="py-2 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Account & Data</span>
            </button>
          </div>
        </div>
      </SpatialCard>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-3xl spatial-glass border border-rose-500/30 space-y-4">
            <div className="flex items-center space-x-3 text-rose-400">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <h3 className="text-base font-bold text-white">Permanently Delete Account?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This will hard-delete your account and every record from the cloud database. Your local offline database will remain until you clear it separately.
            </p>

            {deleteError && (
              <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-200 text-xs">
                {deleteError}
              </div>
            )}

            <form onSubmit={handleDeleteAccount} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Enter password to confirm:
                </label>
                <input
                  type="password"
                  required
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Your password"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-rose-500/50"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleteLoading}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white transition-colors flex items-center space-x-1.5"
                >
                  {deleteLoading ? 'Deleting...' : 'Confirm Delete Everything'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

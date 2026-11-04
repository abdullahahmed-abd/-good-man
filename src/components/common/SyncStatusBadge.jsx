import React, { useState, useEffect } from 'react';
import { Cloud, CloudOff, RefreshCw, CheckCircle2, AlertCircle, Server } from 'lucide-react';
import syncEngine, { SyncStatus } from '../../services/sync/syncEngine';
import useAuthStore from '../../store/useAuthStore';
import sounds from '../../utils/soundEffects';

export default function SyncStatusBadge({ className = '' }) {
  const { isAuthenticated, isWakingServer, openAuthModal } = useAuthStore();
  const [syncState, setSyncState] = useState(() => syncEngine.getSnapshot());
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    const unsubscribe = syncEngine.subscribe((snapshot) => {
      setSyncState(snapshot);
    });
    return unsubscribe;
  }, []);

  // Format relative time since last sync
  useEffect(() => {
    const updateRelativeTime = () => {
      if (!syncState.lastSyncedAt) {
        setTimeAgo('');
        return;
      }
      const diffSec = Math.floor((Date.now() - new Date(syncState.lastSyncedAt).getTime()) / 1000);
      if (diffSec < 10) setTimeAgo('Just now');
      else if (diffSec < 60) setTimeAgo(`${diffSec}s ago`);
      else if (diffSec < 3600) setTimeAgo(`${Math.floor(diffSec / 60)}m ago`);
      else setTimeAgo(`${Math.floor(diffSec / 3600)}h ago`);
    };

    updateRelativeTime();
    const interval = setInterval(updateRelativeTime, 15000);
    return () => clearInterval(interval);
  }, [syncState.lastSyncedAt]);

  const handleClick = () => {
    sounds.playTap();
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    syncEngine.triggerSync();
  };

  // 1. Server cold start wakeup indicator (Render free tier / cold container)
  if (isWakingServer) {
    return (
      <button
        onClick={handleClick}
        className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 border border-amber-500/40 text-amber-300 animate-pulse transition-all ${className}`}
        title="Server waking up from cold standby... (Render free tier sleep). Offline data is fully preserved."
      >
        <Server className="w-3.5 h-3.5 animate-bounce text-amber-400" />
        <span className="hidden sm:inline">Waking Cloud...</span>
      </button>
    );
  }

  // 2. Guest Mode (100% offline, option to sign in & backup)
  if (!isAuthenticated) {
    return (
      <button
        onClick={handleClick}
        className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-slate-300 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-300 transition-all cursor-pointer ${className}`}
        title="Guest Mode: Operating 100% offline. Click to sign in or backup to cloud."
      >
        <Cloud className="w-3.5 h-3.5 text-slate-400" />
        <span className="hidden xs:inline">Guest</span>
        <span className="text-[10px] uppercase font-bold tracking-wider px-1 py-0.2 rounded bg-white/10 text-slate-400">
          Local
        </span>
      </button>
    );
  }

  // 3. Network Offline
  if (syncState.status === SyncStatus.OFFLINE) {
    return (
      <button
        onClick={handleClick}
        className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-300 transition-all ${className}`}
        title="Device is offline. Changes are saved locally and will auto-sync when connection restores."
      >
        <CloudOff className="w-3.5 h-3.5 text-amber-400" />
        <span className="hidden xs:inline">Offline</span>
      </button>
    );
  }

  // 4. Syncing in progress
  if (syncState.status === SyncStatus.SYNCING || syncState.isSyncing) {
    return (
      <button
        onClick={handleClick}
        className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 transition-all ${className}`}
        title="Syncing local changes with your encrypted cloud backup..."
      >
        <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
        <span className="hidden xs:inline">Syncing...</span>
      </button>
    );
  }

  // 5. Sync Error
  if (syncState.status === SyncStatus.ERROR) {
    return (
      <button
        onClick={handleClick}
        className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500/25 transition-all cursor-pointer ${className}`}
        title="Sync paused. Tap to retry manually."
      >
        <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
        <span className="hidden xs:inline">Retry Sync</span>
      </button>
    );
  }

  // 6. Healthy Synced
  return (
    <button
      onClick={handleClick}
      className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 transition-all cursor-pointer group ${className}`}
      title={`Cloud synced. ${timeAgo ? `Last synced: ${timeAgo}. ` : ''}Click to sync now.`}
    >
      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 group-hover:rotate-12 transition-transform" />
      <span className="hidden sm:inline">Synced</span>
      {timeAgo && <span className="hidden md:inline text-[10px] text-slate-400 font-normal">({timeAgo})</span>}
    </button>
  );
}

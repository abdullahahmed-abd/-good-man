import React from 'react';
import { NavLink } from 'react-router-dom';
import { Flame, Sun, Moon, Volume2, VolumeX, Activity, Sparkles, User, Cloud } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { usePedometerStore } from '../../store/usePedometerStore';
import useAuthStore from '../../store/useAuthStore';
import SyncStatusBadge from '../common/SyncStatusBadge';
import PwaInstallButton from '../common/PwaInstallButton';
import { getGreeting } from '../../utils/dateUtils';
import { getLevelInfo } from '../../utils/lifeScore';
import sounds from '../../utils/soundEffects';

export default function TopHeader() {
  const { user, theme, setTheme, language, soundEnabled, setSoundEnabled } = useAppStore();
  const { steps, isRunning, toggleEngine, motionState } = usePedometerStore();
  const { isAuthenticated, user: authUser, openAuthModal } = useAuthStore();

  const greeting = getGreeting(language);
  const levelInfo = getLevelInfo(user.totalXp);

  const handleThemeToggle = () => {
    sounds.playTap();
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleSoundToggle = () => {
    setSoundEnabled(!soundEnabled);
  };

  return (
    <header className="sticky top-0 z-40 w-full px-4 sm:px-8 py-3 backdrop-blur-xl bg-slate-950/40 border-b border-white/10">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: App Logo & User Greeting */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-amber-500 p-[2px] shadow-glass flex-shrink-0">
            <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center text-lg">
              {user.avatar || '🧘‍♂️'}
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-emerald-400">
                {greeting}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-slate-300">
                {levelInfo.title}
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>{user.name}</span>
            </h1>
          </div>
        </div>

        {/* Right: Quick Stats & Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Level & XP Pill */}
          <NavLink
            to="/character"
            className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full spatial-glass-subtle text-xs hover:border-white/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-slate-200">Lvl {levelInfo.level}</span>
            <div className="w-12 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full"
                style={{ width: `${levelInfo.percentToNext}%` }}
              />
            </div>
          </NavLink>

          {/* Live Step Badge */}
          <NavLink
            to="/steps"
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
              isRunning
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Activity className={`w-3.5 h-3.5 ${isRunning ? 'animate-pulse text-emerald-400' : 'text-slate-400'}`} />
            <span>{steps.toLocaleString()}</span>
            {isRunning && (
              <span className="hidden xs:inline text-[10px] uppercase font-bold tracking-wider px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                {motionState}
              </span>
            )}
          </NavLink>

          {/* PWA Install Button (Compact header pill) */}
          <PwaInstallButton variant="compact" />

          {/* Sync Status Badge */}
          <SyncStatusBadge />

          {/* Account Profile / Auth Pill */}
          <NavLink
            to="/account"
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-full spatial-glass-subtle text-xs hover:border-white/20 transition-all text-slate-300 hover:text-white"
            title={isAuthenticated ? `Account: ${authUser?.email || 'Logged In'}` : 'Guest Mode (Click to Sign In)'}
          >
            <User className={`w-3.5 h-3.5 ${isAuthenticated ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span className="hidden md:inline font-medium">
              {isAuthenticated ? (authUser?.name || 'Account') : 'Sign In'}
            </span>
          </NavLink>

          {/* Sound Toggle */}
          <button
            onClick={handleSoundToggle}
            className="p-2 rounded-full spatial-glass-subtle text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title={soundEnabled ? 'Mute Sounds' : 'Enable Sounds'}
            aria-label="Toggle sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={handleThemeToggle}
            className="p-2 rounded-full spatial-glass-subtle text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Toggle Dark/Light Mode"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
          </button>
        </div>
      </div>
    </header>
  );
}


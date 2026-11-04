import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import SpatialCard from '../../components/common/SpatialCard';
import E2EESettings from './E2EESettings';
import useAuthStore from '../../store/useAuthStore';
import { 
  Settings, 
  User, 
  Download, 
  Upload, 
  Trash2, 
  RotateCcw, 
  ShieldCheck, 
  Moon, 
  Sun, 
  Volume2, 
  VolumeX, 
  Globe, 
  Check, 
  Smartphone,
  Sparkles,
  Cloud,
  ArrowRight
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { usePedometerStore } from '../../store/usePedometerStore';
import db from '../../db/database';
import sounds from '../../utils/soundEffects';

const AVATARS = ['🧘‍♂️', '🧘‍♀️', '🏛️', '🦉', '⚡', '🕊️', '🌿', '🦁'];

export default function SettingsPage() {
  const { 
    user, 
    updateUserProfile, 
    theme, 
    setTheme, 
    language, 
    setLanguage, 
    soundEnabled, 
    setSoundEnabled, 
    triggerConfetti 
  } = useAppStore();

  const setUserHeight = usePedometerStore(state => state.setUserHeight);

  const [formData, setFormData] = useState({
    name: user.name || 'Seeker',
    avatar: user.avatar || '🧘‍♂️',
    birthDate: user.birthDate || '1998-01-01',
    expectedLifespan: user.expectedLifespan || 80,
    heightCm: user.heightCm || 175,
    weightKg: user.weightKg || 70,
    stepGoal: user.stepGoal || 8000,
    currency: user.currency || 'INR'
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [backupStatus, setBackupStatus] = useState('');

  const handleProfileSave = (e) => {
    e.preventDefault();
    updateUserProfile(formData);
    setUserHeight(formData.heightCm);
    sounds.playSuccess();
    setSavedSuccess(true);
    triggerConfetti();
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Export full Dexie Database to JSON
  const handleExportBackup = async () => {
    sounds.playTap();
    setBackupStatus('Generating complete offline backup...');

    try {
      const backup = {
        version: 1,
        exportedAt: new Date().toISOString(),
        tables: {
          userProfile: await db.userProfile.toArray(),
          steps: await db.steps.toArray(),
          hourlySteps: await db.hourlySteps.toArray(),
          habits: await db.habits.toArray(),
          habitLogs: await db.habitLogs.toArray(),
          scheduleTasks: await db.scheduleTasks.toArray(),
          pomodoroSessions: await db.pomodoroSessions.toArray(),
          transactions: await db.transactions.toArray(),
          budgets: await db.budgets.toArray(),
          savingsGoals: await db.savingsGoals.toArray(),
          virtueRatings: await db.virtueRatings.toArray(),
          journalEntries: await db.journalEntries.toArray(),
          userBookNotes: await db.userBookNotes.toArray(),
          readingProgress: await db.readingProgress.toArray()
        }
      };

      const jsonString = JSON.stringify(backup, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `insaan-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setBackupStatus('Backup successfully downloaded!');
      sounds.playSuccess();
      setTimeout(() => setBackupStatus(''), 3000);
    } catch (err) {
      console.error('Backup error:', err);
      setBackupStatus('Backup failed: ' + err.message);
    }
  };

  // Import full Dexie Database from JSON
  const handleImportBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    sounds.playTap();
    setBackupStatus('Reading backup file...');
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const backup = JSON.parse(event.target.result);
        if (!backup.tables) throw new Error('Invalid Insaan backup format');

        // Restore each table
        for (const [tableName, records] of Object.entries(backup.tables)) {
          if (db[tableName] && Array.isArray(records)) {
            await db[tableName].clear();
            for (const r of records) {
              await db[tableName].put(r);
            }
          }
        }

        sounds.playSuccess();
        triggerConfetti();
        setBackupStatus('Sanctuary restored successfully! Refreshing...');
        setTimeout(() => window.location.reload(), 1200);
      } catch (err) {
        console.error('Import error:', err);
        setBackupStatus('Import failed: ' + err.message);
      }
    };

    reader.readAsText(file);
  };

  // Reset to initial sample data
  const handleResetData = async () => {
    if (!window.confirm('Are you sure you want to clear your local database and restore pristine factory state?')) {
      return;
    }

    try {
      await db.delete();
      sounds.playSuccess();
      window.location.reload();
    } catch (err) {
      alert('Reset failed: ' + err.message);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Top Banner */}
      <div>
        <div className="flex items-center space-x-2 text-emerald-400 text-xs uppercase font-extrabold tracking-widest">
          <Settings className="w-4 h-4" />
          <span>Application Preferences & Data Sovereign</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
          Settings & Local Data Vault
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Everything in Insaan is 100% offline-first. Your reflections, steps, and finances never leave your device.
        </p>
      </div>

      {/* User Profile Form */}
      <SpatialCard className="p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center space-x-3">
            <User className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base font-bold text-white">Personal Profile & Biometrics</h3>
              <span className="text-xs text-slate-400">Used for pedometer calibration & life clock</span>
            </div>
          </div>

          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <Check className="w-4 h-4" /> Saved!
            </span>
          )}
        </div>

        <form onSubmit={handleProfileSave} className="space-y-4">
          {/* Avatar Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Avatar Emblem</label>
            <div className="flex items-center space-x-2 overflow-x-auto pb-1">
              {AVATARS.map(av => (
                <button
                  key={av}
                  type="button"
                  onClick={() => setFormData({ ...formData, avatar: av })}
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl border transition-all ${
                    formData.avatar === av
                      ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-neon-emerald scale-110'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Name / Title</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="INR" className="bg-slate-900">INR (₹ Indian Rupee)</option>
                <option value="USD" className="bg-slate-900">USD ($ US Dollar)</option>
                <option value="EUR" className="bg-slate-900">EUR (€ Euro)</option>
                <option value="GBP" className="bg-slate-900">GBP (£ British Pound)</option>
                <option value="AED" className="bg-slate-900">AED (د.إ Dirham)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Height (cm)</label>
              <input
                type="number"
                value={formData.heightCm}
                onChange={(e) => setFormData({ ...formData, heightCm: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-2xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Weight (kg)</label>
              <input
                type="number"
                value={formData.weightKg}
                onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-2xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Daily Step Goal</label>
              <input
                type="number"
                value={formData.stepGoal}
                onChange={(e) => setFormData({ ...formData, stepGoal: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-2xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Birth Date</label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                className="w-full px-3 py-2 rounded-2xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-glass"
            >
              Save Profile Updates
            </button>
          </div>
        </form>
      </SpatialCard>

      {/* App Experience Preferences */}
      <SpatialCard className="p-6 space-y-4">
        <h3 className="text-base font-bold text-white border-b border-white/10 pb-3">
          Experience & Themes
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Theme */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <span className="text-xs text-slate-400 font-semibold block">Theme</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTheme('dark')}
                className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  theme === 'dark' ? 'bg-emerald-500 text-slate-950' : 'bg-white/10 text-slate-300'
                }`}
              >
                <Moon className="w-3.5 h-3.5" /> Dark
              </button>
              <button
                onClick={() => setTheme('light')}
                className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  theme === 'light' ? 'bg-amber-400 text-slate-950' : 'bg-white/10 text-slate-300'
                }`}
              >
                <Sun className="w-3.5 h-3.5" /> Light
              </button>
            </div>
          </div>

          {/* Sound */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <span className="text-xs text-slate-400 font-semibold block">Audio Haptics</span>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                soundEnabled ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-white/10 text-slate-400'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span>{soundEnabled ? 'Synthesizer Active' : 'Muted'}</span>
            </button>
          </div>

          {/* Language */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <span className="text-xs text-slate-400 font-semibold block">Tone Style</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setLanguage('en')}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  language === 'en' ? 'bg-emerald-500 text-slate-950' : 'bg-white/10 text-slate-300'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('hinglish')}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  language === 'hinglish' ? 'bg-emerald-500 text-slate-950' : 'bg-white/10 text-slate-300'
                }`}
              >
                Hinglish
              </button>
            </div>
          </div>
        </div>
      </SpatialCard>

      {/* Cloud Sanctuary & Multi-Device Sync Card */}
      <SpatialCard className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Cloud Sanctuary & Sync</h3>
              <p className="text-xs text-slate-400">
                Multi-device synchronization, automated cloud backup, and active device sessions.
              </p>
            </div>
          </div>
          <NavLink
            to="/account"
            className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-all flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <span>Manage Cloud Account</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </NavLink>
        </div>
      </SpatialCard>

      {/* Zero Knowledge E2EE */}
      <E2EESettings />

      {/* Data Backup & Restore (JSON) */}
      <SpatialCard className="p-6 space-y-4">
        <div>
          <h3 className="text-base font-bold text-white">Full Local Database Vault</h3>
          <p className="text-xs text-slate-400">
            Export a complete JSON snapshot of all IndexedDB tables, or restore an earlier backup.
          </p>
        </div>

        {backupStatus && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 font-semibold">
            {backupStatus}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Export JSON */}
          <button
            onClick={handleExportBackup}
            className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left space-y-1 transition-all group"
          >
            <Download className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <h4 className="text-xs font-bold text-white">Export JSON Backup</h4>
            <span className="text-[10px] text-slate-400 block">Save entire sanctuary locally</span>
          </button>

          {/* Import JSON */}
          <label className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left space-y-1 transition-all cursor-pointer group">
            <Upload className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
            <h4 className="text-xs font-bold text-white">Restore from Backup</h4>
            <span className="text-[10px] text-slate-400 block">Select .json backup file</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>

          {/* Clear Data */}
          <button
            onClick={handleResetData}
            className="p-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-left space-y-1 transition-all group"
          >
            <RotateCcw className="w-5 h-5 text-rose-400 group-hover:rotate-180 transition-transform" />
            <h4 className="text-xs font-bold text-rose-300">Factory Reset Database</h4>
            <span className="text-[10px] text-slate-400 block">Clear and reseed initial data</span>
          </button>
        </div>
      </SpatialCard>

      {/* PWA & Architecture Information */}
      <div className="p-4 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center space-x-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <div>
            <span className="font-bold text-slate-200 block">Insaan v1.0.0 (Production PWA)</span>
            <span>React + Vite PWA · Dexie IndexedDB · Offline Engine</span>
          </div>
        </div>
        <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          Installable Offline
        </span>
      </div>
    </div>
  );
}


import { create } from 'zustand';
import confetti from 'canvas-confetti';
import db from '../db/database';
import sounds from '../utils/soundEffects';
import { getLevelInfo } from '../utils/lifeScore';

export const useAppStore = create((set, get) => ({
  // User Profile
  user: {
    id: 'primary',
    name: 'Traveler',
    avatar: '🧘‍♂️',
    totalXp: 320,
    heightCm: 175,
    weightKg: 72,
    stepGoal: 8000,
    currency: 'INR',
    birthDate: '1998-05-15',
    expectedLifespan: 80,
    isOnboarded: false
  },

  // App Settings
  theme: 'dark', // 'dark' | 'light'
  language: 'en', // 'en' | 'hinglish'
  soundEnabled: true,
  spatialBlur: 'high', // 'high' | 'medium' | 'minimal'
  showOnboarding: false,

  // Load from Dexie or localStorage
  initApp: async () => {
    try {
      // Check stored profile in IndexedDB
      const profile = await db.userProfile.get('primary');
      if (profile) {
        set({
          user: { ...get().user, ...profile },
          theme: profile.theme || 'dark',
          language: profile.language || 'en'
        });
      } else {
        // Show onboarding on first launch
        set({ showOnboarding: true });
        await db.userProfile.put({ ...get().user, id: 'primary', theme: 'dark', language: 'en' });
      }

      // Sync dark mode class
      const theme = get().theme;
      if (typeof document !== 'undefined') {
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    } catch (e) {
      console.warn('Init app storage error:', e);
    }
  },

  setTheme: (theme) => {
    set({ theme });
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    db.userProfile.update('primary', { theme }).catch(() => {});
  },

  setLanguage: (language) => {
    set({ language });
    db.userProfile.update('primary', { language }).catch(() => {});
  },

  setSoundEnabled: (enabled) => {
    set({ soundEnabled: enabled });
    sounds.setEnabled(enabled);
  },

  updateUserProfile: async (updates) => {
    const updated = { ...get().user, ...updates };
    set({ user: updated });
    await db.userProfile.put({ ...updated, id: 'primary' });
  },

  completeOnboarding: async (formData) => {
    const updated = {
      ...get().user,
      ...formData,
      isOnboarded: true
    };
    set({ user: updated, showOnboarding: false });
    await db.userProfile.put({ ...updated, id: 'primary' });
    get().triggerConfetti();
    sounds.playSuccess();
  },

  addXp: async (amount, reason = '') => {
    const currentXp = get().user.totalXp;
    const oldLevel = getLevelInfo(currentXp).level;
    const newXp = currentXp + amount;
    const newLevel = getLevelInfo(newXp).level;

    const updatedUser = { ...get().user, totalXp: newXp };
    set({ user: updatedUser });
    await db.userProfile.update('primary', { totalXp: newXp }).catch(() => {});

    sounds.playTap();

    // Check if leveled up!
    if (newLevel > oldLevel) {
      sounds.playSuccess();
      get().triggerConfetti();
    }
  },

  triggerConfetti: () => {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.65 },
        colors: ['#22c55e', '#eab308', '#6366f1', '#38bdf8']
      });
    }
  }
}));

export default useAppStore;


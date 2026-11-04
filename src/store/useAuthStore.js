import { create } from 'zustand';
import apiClient from '../services/api/apiClient';
import syncEngine from '../services/sync/syncEngine';
import sounds from '../utils/soundEffects';

export const useAuthStore = create((set, get) => {
  // Bind server wakeup state
  apiClient.setServerWakeupHandler((isWaking) => {
    set({ isWakingServer: isWaking });
  });

  // Bind auth failure handler
  apiClient.setAuthFailureHandler(() => {
    set({ user: null, isAuthenticated: false });
    syncEngine.setAuthenticated(false);
  });

  return {
    user: null, // null = Guest Mode (100% offline functionality)
    isAuthenticated: false,
    isLoading: true,
    isWakingServer: false,
    authModal: null, // 'login' | 'signup' | 'forgot' | 'verify' | null
    showGuestMigrationDialog: false,
    pendingAuthResult: null,

    initAuth: async () => {
      try {
        const refreshed = await apiClient.silentRefresh();
        if (refreshed) {
          const res = await apiClient.get('/auth/me');
          if (res.user) {
            set({ user: res.user, isAuthenticated: true });
            syncEngine.setAuthenticated(true);
          }
        }
      } catch (err) {
        // Guest mode remains active
      } finally {
        set({ isLoading: false });
      }
    },

    openAuthModal: (modalName = 'login') => {
      sounds.playTap();
      set({ authModal: modalName });
    },

    closeAuthModal: () => {
      set({ authModal: null });
    },

    login: async (email, password) => {
      const res = await apiClient.post('/auth/login', { email, password });
      apiClient.setAccessToken(res.accessToken);
      
      set({
        user: res.user,
        isAuthenticated: true,
        authModal: null,
        showGuestMigrationDialog: true,
        pendingAuthResult: res
      });

      syncEngine.setAuthenticated(true);
      sounds.playSuccess();
      return res;
    },

    signup: async (email, password, name) => {
      const res = await apiClient.post('/auth/signup', { email, password, name });
      apiClient.setAccessToken(res.accessToken);

      set({
        user: res.user,
        isAuthenticated: true,
        authModal: null,
        showGuestMigrationDialog: true,
        pendingAuthResult: res
      });

      syncEngine.setAuthenticated(true);
      sounds.playSuccess();
      return res;
    },

    logout: async () => {
      sounds.playTap();
      try {
        await apiClient.post('/auth/logout', {});
      } catch (e) {
        // Ignore network errors on logout
      }
      apiClient.setAccessToken(null);
      set({ user: null, isAuthenticated: false });
      syncEngine.setAuthenticated(false);
    },

    logoutAll: async () => {
      sounds.playTap();
      await apiClient.post('/auth/logout-all', {});
      apiClient.setAccessToken(null);
      set({ user: null, isAuthenticated: false });
      syncEngine.setAuthenticated(false);
    },

    confirmGuestMigration: async (shouldMigrate = true) => {
      set({ showGuestMigrationDialog: false, pendingAuthResult: null });
      if (shouldMigrate) {
        await syncEngine.migrateGuestDataToAccount();
      } else {
        await syncEngine.triggerSync();
      }
    }
  };
});

export default useAuthStore;

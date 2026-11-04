import { Capacitor } from '@capacitor/core';

// Safe in-memory fallback for environments without hardware keystore
const memoryStore = new Map();

/**
 * Hardware-backed secure storage bridge for native Capacitor Android (EncryptedSharedPreferences / Android Keystore).
 * On web/PWA, this is never used for auth credentials as web relies exclusively on HttpOnly SameSite=Lax cookies.
 */
export const nativeSecureStorage = {
  async setItem(key, value) {
    if (Capacitor.isNativePlatform()) {
      try {
        const { InsaanNativePlugin } = await import('../../plugins/InsaanNativePlugin');
        if (InsaanNativePlugin && typeof InsaanNativePlugin.setSecureItem === 'function') {
          await InsaanNativePlugin.setSecureItem({ key, value });
          return;
        }
      } catch (err) {
        // Fall back to memory store if plugin is still initializing
      }
    }
    memoryStore.set(key, value);
  },

  async getItem(key) {
    if (Capacitor.isNativePlatform()) {
      try {
        const { InsaanNativePlugin } = await import('../../plugins/InsaanNativePlugin');
        if (InsaanNativePlugin && typeof InsaanNativePlugin.getSecureItem === 'function') {
          const res = await InsaanNativePlugin.getSecureItem({ key });
          return res?.value ?? null;
        }
      } catch (err) {
        // Fall back to memory store
      }
    }
    return memoryStore.get(key) ?? null;
  },

  async removeItem(key) {
    if (Capacitor.isNativePlatform()) {
      try {
        const { InsaanNativePlugin } = await import('../../plugins/InsaanNativePlugin');
        if (InsaanNativePlugin && typeof InsaanNativePlugin.removeSecureItem === 'function') {
          await InsaanNativePlugin.removeSecureItem({ key });
          return;
        }
      } catch (err) {
        // Fall back to memory store
      }
    }
    memoryStore.delete(key);
  }
};

export default nativeSecureStorage;

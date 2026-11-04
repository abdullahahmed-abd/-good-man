import { registerPlugin } from '@capacitor/core';

/**
 * TypeScript / JSDoc definition for Insaan Native Android Plugin:
 * - Hardware Keystore Secure Storage (EncryptedSharedPreferences)
 * - Battery Optimization Settings Inspection & Requests
 */
export const InsaanNativePlugin = registerPlugin('InsaanNativePlugin', {
  web: () => ({
    setSecureItem: async () => {},
    getSecureItem: async () => ({ value: null }),
    removeSecureItem: async () => {},
    isBatteryOptimized: async () => ({ isOptimized: false }),
    requestIgnoreBatteryOptimization: async () => ({ success: true }),
    openAppSettings: async () => ({ success: true })
  })
});

export default InsaanNativePlugin;


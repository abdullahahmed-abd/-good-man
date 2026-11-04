import { registerPlugin } from '@capacitor/core';

export const StepPlugin = registerPlugin('StepPlugin', {
  web: () => ({
    start: async () => ({ success: false }),
    stop: async () => ({ success: false }),
    getToday: async () => ({
      steps: 0,
      distanceKm: 0,
      calories: 0,
      activeMinutes: 0,
      goal: 10000,
      goalPercent: 0,
      status: 'Still',
      date: new Date().toISOString().slice(0, 10),
      isServiceRunning: false
    }),
    getHourly: async (options) => ({
      date: options?.date || new Date().toISOString().slice(0, 10),
      hours: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        steps: 0,
        distanceKm: 0,
        calories: 0
      }))
    }),
    getRange: async () => ({ history: {} }),
    setProfile: async () => ({ success: true }),
    getStatus: async () => ({ status: 'Still', isServiceRunning: false }),
    checkPermissions: async () => ({
      activityRecognition: 'granted',
      notifications: 'granted',
      allGranted: true
    }),
    requestPermissions: async () => ({
      activity: 'granted',
      notifications: 'granted'
    }),
    isBatteryOptimized: async () => ({
      isOptimized: false,
      isUnrestricted: true
    }),
    requestIgnoreBatteryOptimization: async () => ({ success: true }),
    openAppSettings: async () => ({ success: true }),
    setSecureItem: async () => ({ success: true }),
    getSecureItem: async () => ({ value: null }),
    removeSecureItem: async () => ({ success: true })
  })
});

export default StepPlugin;

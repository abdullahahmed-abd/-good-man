import { create } from 'zustand';
import pedometerEngine from '../services/pedometer/pedometerEngine';
import wakeLockManager from '../services/pedometer/wakeLock';

export const usePedometerStore = create((set, get) => {
  // Subscribe to engine state
  pedometerEngine.subscribe((snapshot) => {
    set({
      isRunning: snapshot.isRunning,
      steps: snapshot.totalSteps,
      sessionSteps: snapshot.sessionSteps,
      distanceKm: snapshot.distanceKm,
      calories: snapshot.calories,
      activeMinutes: snapshot.activeMinutes,
      motionState: snapshot.motionState,
      speedKmh: snapshot.speedKmh,
      strideLengthM: snapshot.strideLengthM,
      isVehicle: snapshot.isVehicle
    });
  });

  // Subscribe to wake lock
  wakeLockManager.subscribe((isActive) => {
    set({ wakeLockActive: isActive });
  });

  return {
    isRunning: false,
    steps: 0,
    sessionSteps: 0,
    distanceKm: 0,
    calories: 0,
    activeMinutes: 0,
    motionState: 'STILL',
    speedKmh: 0,
    strideLengthM: 0.72,
    isVehicle: false,
    wakeLockActive: false,
    diagnostics: null,

    startEngine: async () => {
      const started = await pedometerEngine.start();
      if (started) {
        await wakeLockManager.request();
      }
      return started;
    },

    stopEngine: async () => {
      pedometerEngine.stop();
      await wakeLockManager.release();
    },

    toggleEngine: async () => {
      if (get().isRunning) {
        await get().stopEngine();
      } else {
        await get().startEngine();
      }
    },

    manualSetSteps: (count) => {
      pedometerEngine.manualSetSteps(count);
    },

    setUserHeight: (heightCm) => {
      pedometerEngine.setUserHeight(heightCm);
    },

    toggleWakeLock: async () => {
      if (get().wakeLockActive) {
        await wakeLockManager.release();
      } else {
        await wakeLockManager.request();
      }
    }
  };
});

export default usePedometerStore;


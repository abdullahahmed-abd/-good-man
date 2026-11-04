import { create } from 'zustand';
import { Capacitor } from '@capacitor/core';
import pedometerEngine from '../services/pedometer/pedometerEngine';
import wakeLockManager from '../services/pedometer/wakeLock';
import nativeStepService from '../services/pedometer/nativeStepService';

const isNative = Capacitor.isNativePlatform();

export const usePedometerStore = create((set, get) => {
  if (isNative) {
    // Native Android Step Tracking
    nativeStepService.subscribe((snapshot) => {
      set({
        isRunning: snapshot.isServiceRunning,
        steps: snapshot.steps,
        sessionSteps: snapshot.steps,
        distanceKm: snapshot.distanceKm,
        calories: snapshot.calories,
        activeMinutes: snapshot.activeMinutes,
        motionState: snapshot.status?.toUpperCase() || 'STILL',
        speedKmh: 0,
        isVehicle: snapshot.status === 'In Vehicle' || snapshot.status === 'Bicycle',
        isNativePlatform: true
      });
    });
  } else {
    // Web / PWA Accelerometer Fallback
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
        isVehicle: snapshot.isVehicle,
        isNativePlatform: false
      });
    });

    wakeLockManager.subscribe((isActive) => {
      set({ wakeLockActive: isActive });
    });
  }

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
    isNativePlatform: isNative,
    diagnostics: null,

    startEngine: async () => {
      if (isNative) {
        return await nativeStepService.start();
      } else {
        const started = await pedometerEngine.start();
        if (started) {
          await wakeLockManager.request();
        }
        return started;
      }
    },

    stopEngine: async () => {
      if (isNative) {
        return await nativeStepService.stop();
      } else {
        pedometerEngine.stop();
        await wakeLockManager.release();
      }
    },

    toggleEngine: async () => {
      if (get().isRunning) {
        await get().stopEngine();
      } else {
        await get().startEngine();
      }
    },

    manualSetSteps: (count) => {
      if (!isNative) {
        pedometerEngine.manualSetSteps(count);
      }
    },

    setUserHeight: (heightCm) => {
      if (isNative) {
        nativeStepService.setProfile({ heightCm });
      } else {
        pedometerEngine.setUserHeight(heightCm);
      }
    },

    toggleWakeLock: async () => {
      if (!isNative) {
        if (get().wakeLockActive) {
          await wakeLockManager.release();
        } else {
          await wakeLockManager.request();
        }
      }
    }
  };
});

export default usePedometerStore;

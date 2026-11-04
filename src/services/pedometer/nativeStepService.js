import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { StepPlugin } from '../../plugins/StepPlugin';
import db from '../../db/database';
import { getTodayStr } from '../../utils/dateUtils';

class NativeStepService {
  constructor() {
    this.isNative = Capacitor.isNativePlatform();
    this.isRunning = false;
    this.subscribers = new Set();
    this.appStateListener = null;
    this.stepEventListener = null;

    this.latestSnapshot = {
      steps: 0,
      distanceKm: 0,
      calories: 0,
      activeMinutes: 0,
      goal: 10000,
      goalPercent: 0,
      status: 'Still',
      date: getTodayStr(),
      isServiceRunning: false
    };

    if (this.isNative) {
      this.init();
    }
  }

  async init() {
    if (!this.isNative) return;

    try {
      // 1. Initial snapshot from native Kotlin engine
      const today = await StepPlugin.getToday();
      this.updateSnapshot(today);
      await this.persistToDexie(today);

      // 2. Listen to real-time step events broadcast from StepService
      this.stepEventListener = await StepPlugin.addListener('stepsUpdated', async (data) => {
        this.updateSnapshot({
          ...data,
          date: getTodayStr(),
          isServiceRunning: true
        });
        await this.persistToDexie(data);
      });

      // 3. Listen to Android App Resume: pull latest cumulative state
      this.appStateListener = await App.addListener('appStateChange', async ({ isActive }) => {
        if (isActive) {
          const freshData = await StepPlugin.getToday();
          this.updateSnapshot(freshData);
          await this.persistToDexie(freshData);
          await this.syncHourlyFromNative();
        }
      });
    } catch (err) {
      console.warn('NativeStepService init warning:', err);
    }
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    callback(this.latestSnapshot);
    return () => this.subscribers.delete(callback);
  }

  notifySubscribers() {
    for (const cb of this.subscribers) {
      try {
        cb(this.latestSnapshot);
      } catch (e) {
        console.error('Subscriber error:', e);
      }
    }
  }

  updateSnapshot(data) {
    this.latestSnapshot = {
      ...this.latestSnapshot,
      ...data,
      isServiceRunning: data.isServiceRunning ?? this.latestSnapshot.isServiceRunning
    };
    this.isRunning = this.latestSnapshot.isServiceRunning;
    this.notifySubscribers();
  }

  /**
   * Writes the native step totals into Dexie (steps and hourlySteps)
   * marking rows as dirty so the cloud sync engine automatically pushes them.
   */
  async persistToDexie(data) {
    try {
      const today = getTodayStr();
      const existing = await db.steps.where('date').equals(today).first();

      const stepRecord = {
        id: existing?.id || crypto.randomUUID(),
        date: today,
        steps: Number(data.steps) || 0,
        distanceKm: Number(data.distanceKm) || 0,
        calories: Number(data.calories) || 0,
        activeMinutes: Number(data.activeMinutes) || 0,
        timestamp: Date.now(),
        _dirty: 1, // Marks row for Cloud Sync Outbox
        updatedAt: new Date().toISOString()
      };

      if (existing) {
        await db.steps.update(existing.id, stepRecord);
      } else {
        await db.steps.add(stepRecord);
      }

      // Record in current hour bucket
      const currentHour = new Date().getHours();
      const existingHourly = await db.hourlySteps
        .where('date').equals(today)
        .and(item => item.hour === currentHour)
        .first();

      const hourlyRecord = {
        id: existingHourly?.id || crypto.randomUUID(),
        date: today,
        hour: currentHour,
        steps: Number(data.steps) || 0,
        _dirty: 1,
        updatedAt: new Date().toISOString()
      };

      if (existingHourly) {
        await db.hourlySteps.update(existingHourly.id, hourlyRecord);
      } else {
        await db.hourlySteps.add(hourlyRecord);
      }
    } catch (e) {
      console.warn('NativeStepService persistToDexie error:', e);
    }
  }

  /**
   * Pulls all 24 hour buckets from native SQLite/SharedPreferences into Dexie
   */
  async syncHourlyFromNative() {
    try {
      const today = getTodayStr();
      const res = await StepPlugin.getHourly({ date: today });
      if (res?.hours && Array.isArray(res.hours)) {
        for (const item of res.hours) {
          const existing = await db.hourlySteps
            .where('date').equals(today)
            .and(h => h.hour === item.hour)
            .first();

          const record = {
            id: existing?.id || crypto.randomUUID(),
            date: today,
            hour: item.hour,
            steps: item.steps,
            _dirty: 1,
            updatedAt: new Date().toISOString()
          };

          if (existing) {
            await db.hourlySteps.update(existing.id, record);
          } else {
            await db.hourlySteps.add(record);
          }
        }
      }
    } catch (e) {
      console.warn('syncHourlyFromNative error:', e);
    }
  }

  async start() {
    if (!this.isNative) return false;
    try {
      const res = await StepPlugin.start();
      this.isRunning = true;
      const today = await StepPlugin.getToday();
      this.updateSnapshot({ ...today, isServiceRunning: true });
      return res.success;
    } catch (err) {
      console.error('Failed to start native pedometer:', err);
      return false;
    }
  }

  async stop() {
    if (!this.isNative) return false;
    try {
      const res = await StepPlugin.stop();
      this.isRunning = false;
      this.updateSnapshot({ isServiceRunning: false });
      return res.success;
    } catch (err) {
      console.error('Failed to stop native pedometer:', err);
      return false;
    }
  }

  async setProfile({ heightCm, weightKg, goal }) {
    if (!this.isNative) return;
    try {
      await StepPlugin.setProfile({ heightCm, weightKg, goal });
      const fresh = await StepPlugin.getToday();
      this.updateSnapshot(fresh);
    } catch (e) {
      console.warn('setProfile error:', e);
    }
  }

  async checkPermissions() {
    if (!this.isNative) return { allGranted: true, activityRecognition: 'granted', notifications: 'granted' };
    try {
      return await StepPlugin.checkPermissions();
    } catch (e) {
      return { allGranted: false };
    }
  }

  async requestPermissions() {
    if (!this.isNative) return { activity: 'granted', notifications: 'granted' };
    try {
      return await StepPlugin.requestPermissions();
    } catch (e) {
      return {};
    }
  }

  async checkBatteryOptimization() {
    if (!this.isNative) return { isOptimized: false, isUnrestricted: true };
    try {
      return await StepPlugin.isBatteryOptimized();
    } catch (e) {
      return { isOptimized: false, isUnrestricted: true };
    }
  }

  async requestIgnoreBatteryOptimization() {
    if (!this.isNative) return;
    try {
      await StepPlugin.requestIgnoreBatteryOptimization();
    } catch (e) {
      console.warn('requestIgnoreBatteryOptimization error:', e);
    }
  }

  async openAppSettings() {
    if (!this.isNative) return;
    try {
      await StepPlugin.openAppSettings();
    } catch (e) {
      console.warn('openAppSettings error:', e);
    }
  }
}

export const nativeStepService = new NativeStepService();
export default nativeStepService;

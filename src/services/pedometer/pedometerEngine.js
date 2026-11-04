/**
 * Insaan High-Accuracy Pedometer Engine
 * - 3D Orientation-Independent Magnitude
 * - Low-pass + High-pass Gravity Isolation
 * - Adaptive Peak Detection with Dynamic Hysteresis
 * - Step Buffer & Confidence Verification (Rejects false single bumps)
 * - Vehicle Rejection integration
 * - iOS & Android DeviceMotion Permission Handling
 */

import { VehicleDetector, MotionState } from './vehicleDetector';
import { calculateStrideLength, calculateDistanceKm, calculateCalories, calculateActiveMinutes } from './strideCalculator';
import db from '../../db/database';

export class PedometerEngine {
  constructor(options = {}) {
    this.options = {
      sampleRate: 50, // Approx 50 Hz
      minStepIntervalMs: 260, // Max cadence ~3.8 steps/sec
      maxStepIntervalMs: 2000, // Min cadence ~0.5 steps/sec
      basePeakThreshold: 1.15, // m/s² above gravity baseline
      stepBufferThreshold: 4, // Must take 4 continuous rhythmic steps to commit
      ...options
    };

    // Sensor State
    this.isRunning = false;
    this.totalSteps = 0;
    this.sessionSteps = 0;
    this.bufferedSteps = 0;
    this.lastStepTime = 0;
    this.stepTimestamps = [];
    
    // Filters & Baseline
    this.gravity = 9.80665;
    this.lowPassAlpha = 0.22; // Low pass filter factor
    this.filteredMag = 9.80665;
    this.recentMagnitudes = [];
    this.maxWindowSize = 100; // ~2 seconds of samples
    
    // Adaptive Peak Detection
    this.recentPeaks = [11.5];
    this.recentValleys = [8.2];
    this.dynamicThreshold = 10.2;
    this.isAboveThreshold = false;
    this.lastPeakVal = 0;
    this.lastValleyVal = 9.8;

    // Vehicle Detector
    this.vehicleDetector = new VehicleDetector();
    this.geoWatchId = null;

    // Calibration
    this.calibrationMode = false;
    this.calibrationStepsTarget = 20;
    this.calibrationStepsCounted = 0;
    this.calibrationPeakSum = 0;
    this.userSensitivityFactor = 1.0;
    this.userStrideLength = 0.72; // in meters

    // Listeners for UI state update
    this.subscribers = new Set();
    this.diagnosticsSubscribers = new Set();
    
    // Today date string YYYY-MM-DD
    this.todayStr = new Date().toISOString().split('T')[0];

    // Bound event handler
    this.handleDeviceMotion = this.handleDeviceMotion.bind(this);
  }

  /**
   * Request iOS 13+ or standard mobile motion permissions
   */
  async requestPermission() {
    if (typeof window === 'undefined') return false;

    // Check iOS DeviceMotionEvent.requestPermission
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        const response = await DeviceMotionEvent.requestPermission();
        if (response !== 'granted') {
          console.warn('DeviceMotionEvent permission denied by user.');
          return false;
        }
      } catch (err) {
        console.error('Error requesting DeviceMotionEvent permission:', err);
        return false;
      }
    }

    // Geolocation permission for speed check
    if ('geolocation' in navigator) {
      try {
        navigator.geolocation.getCurrentPosition(
          () => {},
          (err) => console.log('Geolocation status for pedometer:', err.message),
          { timeout: 5000 }
        );
      } catch (e) {
        // ignore
      }
    }

    return true;
  }

  /**
   * Start the pedometer engine
   */
  async start() {
    if (this.isRunning) return true;

    const permitted = await this.requestPermission();
    if (!permitted) {
      return false;
    }

    // Load today's persisted steps from IndexedDB
    await this.loadPersistedTodaySteps();

    // Start motion listener
    window.addEventListener('devicemotion', this.handleDeviceMotion, { passive: true });

    // Start GPS watcher for vehicle detection
    if ('geolocation' in navigator) {
      try {
        this.geoWatchId = navigator.geolocation.watchPosition(
          (pos) => {
            if (pos.coords && pos.coords.speed !== null) {
              this.vehicleDetector.updateGpsSpeed(pos.coords.speed);
            }
          },
          (err) => console.log('Pedometer GPS watcher note:', err.message),
          { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
        );
      } catch (e) {
        console.warn('Geolocation watch not available:', e);
      }
    }

    this.isRunning = true;
    this.notifySubscribers();
    return true;
  }

  /**
   * Stop the pedometer engine
   */
  stop() {
    if (!this.isRunning) return;

    if (typeof window !== 'undefined') {
      window.removeEventListener('devicemotion', this.handleDeviceMotion);
    }

    if (this.geoWatchId !== null && 'geolocation' in navigator) {
      navigator.geolocation.clearWatch(this.geoWatchId);
      this.geoWatchId = null;
    }

    this.isRunning = false;
    this.commitBufferedSteps();
    this.persistSteps();
    this.notifySubscribers();
  }

  /**
   * Core Device Motion Handler
   */
  handleDeviceMotion(event) {
    const acc = event.accelerationIncludingGravity || event.acceleration;
    if (!acc || acc.x === null || acc.y === null || acc.z === null) {
      return;
    }

    const now = performance.now();
    const x = acc.x || 0;
    const y = acc.y || 0;
    const z = acc.z || 0;

    // 1. Calculate orientation-independent magnitude: sqrt(x^2 + y^2 + z^2)
    const rawMag = Math.sqrt(x * x + y * y + z * z);

    // 2. Low-Pass Smoothing Filter to remove high-frequency noise/sensor jitter
    this.filteredMag = this.filteredMag + this.lowPassAlpha * (rawMag - this.filteredMag);

    // Maintain recent magnitudes window for periodic analysis
    this.recentMagnitudes.push(this.filteredMag);
    if (this.recentMagnitudes.length > this.maxWindowSize) {
      this.recentMagnitudes.shift();
    }

    // 3. Process Peak Detection
    const stepDetected = this.processSample(this.filteredMag, now);

    // 4. Periodically evaluate Vehicle & Motion State (every ~20 samples / 400ms)
    if (this.recentMagnitudes.length % 20 === 0) {
      const recentCadence = this.calculateRecentCadence(now);
      const evalResult = this.vehicleDetector.evaluateState(
        this.recentMagnitudes,
        this.options.sampleRate,
        recentCadence
      );

      // If in vehicle, discard any tentative buffered steps
      if (evalResult.isVehicle) {
        this.bufferedSteps = 0;
      }
    }

    // 5. Diagnostics dispatch (lightweight throttle)
    if (this.diagnosticsSubscribers.size > 0 && Math.random() < 0.25) {
      this.notifyDiagnostics({
        rawMag: Number(rawMag.toFixed(2)),
        filteredMag: Number(this.filteredMag.toFixed(2)),
        dynamicThreshold: Number(this.dynamicThreshold.toFixed(2)),
        currentState: this.vehicleDetector.currentState,
        speedKmh: this.vehicleDetector.speedKmh,
        stepCount: this.totalSteps
      });
    }
  }

  /**
   * Sample Processor with Adaptive Peak Detection
   */
  processSample(mag, now) {
    let stepCounted = false;

    // Update dynamic peak/valley tracker
    if (mag > this.lastPeakVal) {
      this.lastPeakVal = mag;
    }
    if (mag < this.lastValleyVal) {
      this.lastValleyVal = mag;
    }

    // Check if wave crosses above dynamic threshold
    if (!this.isAboveThreshold && mag > this.dynamicThreshold) {
      this.isAboveThreshold = true;
      
      // We found a peak candidate
      const timeSinceLastStep = now - this.lastStepTime;
      
      // Validate step timing constraints (260ms <= interval <= 2000ms)
      if (timeSinceLastStep >= this.options.minStepIntervalMs) {
        // Vehicle rejection check: Do NOT count if vehicle detector marked vehicle
        if (this.vehicleDetector.currentState !== MotionState.VEHICLE) {
          
          if (timeSinceLastStep <= this.options.maxStepIntervalMs) {
            // Consecutive rhythmic step
            this.stepTimestamps.push(now);
            if (this.stepTimestamps.length > 8) this.stepTimestamps.shift();

            // Buffering check
            if (this.bufferedSteps < this.options.stepBufferThreshold) {
              this.bufferedSteps++;
              // Once buffer threshold reached (e.g. 4 rhythmic steps), commit all buffered steps
              if (this.bufferedSteps === this.options.stepBufferThreshold) {
                this.totalSteps += this.options.stepBufferThreshold;
                this.sessionSteps += this.options.stepBufferThreshold;
                stepCounted = true;
                this.onStepsAdded(this.options.stepBufferThreshold);
              }
            } else {
              // Normal step committed immediately
              this.totalSteps++;
              this.sessionSteps++;
              stepCounted = true;
              this.onStepsAdded(1);
            }
          } else {
            // Too much time elapsed: Reset buffer, treat as step 1 of new walk
            this.bufferedSteps = 1;
            this.stepTimestamps = [now];
          }

          this.lastStepTime = now;

          // Calibration hook
          if (this.calibrationMode) {
            this.handleCalibrationStep(mag);
          }
        }
      }

      // Record peak for adaptive threshold
      this.recentPeaks.push(this.lastPeakVal);
      if (this.recentPeaks.length > 10) this.recentPeaks.shift();
      this.lastValleyVal = mag; // reset valley tracker
    } 
    else if (this.isAboveThreshold && mag < this.dynamicThreshold) {
      this.isAboveThreshold = false;
      
      // Record valley for adaptive threshold
      this.recentValleys.push(this.lastValleyVal);
      if (this.recentValleys.length > 10) this.recentValleys.shift();
      this.lastPeakVal = mag; // reset peak tracker

      // Recompute Dynamic Threshold
      const avgPeak = this.recentPeaks.reduce((a, b) => a + b, 0) / this.recentPeaks.length;
      const avgValley = this.recentValleys.reduce((a, b) => a + b, 0) / this.recentValleys.length;
      
      // Midpoint weighted by user sensitivity
      const rawMidpoint = (avgPeak + avgValley) / 2;
      const spread = Math.max(0.6, (avgPeak - avgValley) * 0.25);
      this.dynamicThreshold = (rawMidpoint + spread * 0.15) * this.userSensitivityFactor;
    }

    return stepCounted;
  }

  calculateRecentCadence(now) {
    if (this.stepTimestamps.length < 3) return 0;
    const oldest = this.stepTimestamps[0];
    const durationSec = (now - oldest) / 1000;
    if (durationSec <= 0) return 0;
    return this.stepTimestamps.length / durationSec;
  }

  commitBufferedSteps() {
    this.bufferedSteps = 0;
  }

  onStepsAdded(count) {
    this.notifySubscribers();
    // Debounced persist to IndexedDB
    this.scheduleDbSave();
  }

  scheduleDbSave() {
    if (this._dbSaveTimer) return;
    this._dbSaveTimer = setTimeout(() => {
      this._dbSaveTimer = null;
      this.persistSteps();
    }, 1500);
  }

  async loadPersistedTodaySteps() {
    try {
      this.todayStr = new Date().toISOString().split('T')[0];
      const record = await db.steps.where('date').equals(this.todayStr).first();
      if (record && record.steps) {
        this.totalSteps = record.steps;
      }
    } catch (e) {
      console.warn('Could not load steps from DB:', e);
    }
  }

  async persistSteps() {
    try {
      this.todayStr = new Date().toISOString().split('T')[0];
      const dist = calculateDistanceKm(this.totalSteps, this.userStrideLength);
      const isRunning = this.vehicleDetector.currentState === MotionState.RUNNING;
      const cals = calculateCalories(this.totalSteps, 70, isRunning);
      const mins = calculateActiveMinutes(this.totalSteps);

      const existing = await db.steps.where('date').equals(this.todayStr).first();
      if (existing) {
        await db.steps.update(existing.id, {
          steps: this.totalSteps,
          distanceKm: dist,
          calories: cals,
          activeMinutes: mins,
          timestamp: Date.now()
        });
      } else {
        await db.steps.add({
          date: this.todayStr,
          timestamp: Date.now(),
          steps: this.totalSteps,
          distanceKm: dist,
          calories: cals,
          activeMinutes: mins
        });
      }

      // Record in current hour bucket
      const currentHour = new Date().getHours();
      const existingHourly = await db.hourlySteps
        .where('date').equals(this.todayStr)
        .and(item => item.hour === currentHour)
        .first();

      if (existingHourly) {
        await db.hourlySteps.update(existingHourly.id, { steps: this.totalSteps });
      } else {
        await db.hourlySteps.add({ date: this.todayStr, hour: currentHour, steps: this.totalSteps });
      }
    } catch (e) {
      console.warn('Error saving steps to IndexedDB:', e);
    }
  }

  manualSetSteps(newCount) {
    this.totalSteps = Math.max(0, Number(newCount) || 0);
    this.persistSteps();
    this.notifySubscribers();
  }

  setUserHeight(heightCm) {
    this.userStrideLength = calculateStrideLength(heightCm);
    this.notifySubscribers();
  }

  // Calibration routine (Walk 20 steps)
  startCalibration(targetSteps = 20) {
    this.calibrationMode = true;
    this.calibrationStepsTarget = targetSteps;
    this.calibrationStepsCounted = 0;
    this.calibrationPeakSum = 0;
  }

  handleCalibrationStep(mag) {
    this.calibrationStepsCounted++;
    this.calibrationPeakSum += mag;
    if (this.calibrationStepsCounted >= this.calibrationStepsTarget) {
      this.finishCalibration();
    }
  }

  finishCalibration() {
    this.calibrationMode = false;
    const avgMag = this.calibrationPeakSum / (this.calibrationStepsCounted || 1);
    // If average walking peak is softer (e.g. gentle walker ~10.5) or harder (~13.0),
    // adjust sensitivity factor:
    const baselineWalkPeak = 11.2;
    this.userSensitivityFactor = Math.max(0.75, Math.min(1.35, avgMag / baselineWalkPeak));
    return {
      calibratedSteps: this.calibrationStepsCounted,
      sensitivityFactor: Number(this.userSensitivityFactor.toFixed(2))
    };
  }

  getSnapshot() {
    const isRunning = this.vehicleDetector.currentState === MotionState.RUNNING;
    const distanceKm = calculateDistanceKm(this.totalSteps, this.userStrideLength);
    const calories = calculateCalories(this.totalSteps, 70, isRunning);
    const activeMinutes = calculateActiveMinutes(this.totalSteps);

    return {
      isRunning: this.isRunning,
      totalSteps: this.totalSteps,
      sessionSteps: this.sessionSteps,
      distanceKm,
      calories,
      activeMinutes,
      motionState: this.vehicleDetector.currentState,
      speedKmh: this.vehicleDetector.speedKmh,
      strideLengthM: Number(this.userStrideLength.toFixed(2)),
      sensitivityFactor: Number(this.userSensitivityFactor.toFixed(2)),
      isVehicle: this.vehicleDetector.currentState === MotionState.VEHICLE
    };
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    callback(this.getSnapshot());
    return () => this.subscribers.delete(callback);
  }

  notifySubscribers() {
    const snapshot = this.getSnapshot();
    this.subscribers.forEach(cb => cb(snapshot));
  }

  subscribeDiagnostics(callback) {
    this.diagnosticsSubscribers.add(callback);
    return () => this.diagnosticsSubscribers.delete(callback);
  }

  notifyDiagnostics(diagData) {
    this.diagnosticsSubscribers.forEach(cb => cb(diagData));
  }
}

export const pedometerEngine = new PedometerEngine();
export default pedometerEngine;


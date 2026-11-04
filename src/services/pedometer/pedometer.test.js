import { describe, it, expect, beforeEach } from 'vitest';
import { calculateStrideLength, calculateDistanceKm, calculateCalories, calculateActiveMinutes } from './strideCalculator';
import { VehicleDetector, MotionState, computeAutocorrelation } from './vehicleDetector';
import { PedometerEngine } from './pedometerEngine';

describe('Stride and Calorie Calculations', () => {
  it('calculates human stride length proportionally from height', () => {
    const stride170 = calculateStrideLength(170); // 170 * 0.414 / 100 = 0.7038
    expect(stride170).toBeCloseTo(0.704, 2);

    const stride185 = calculateStrideLength(185);
    expect(stride185).toBeCloseTo(0.766, 2);
  });

  it('calculates distance correctly in kilometers', () => {
    // 1000 steps * 0.75m = 750m = 0.75 km
    const dist = calculateDistanceKm(1000, 0.75);
    expect(dist).toBe(0.75);

    // 0 steps = 0 km
    expect(calculateDistanceKm(0, 0.75)).toBe(0);
  });

  it('calculates calories burned with body weight scaling', () => {
    const cal70kg = calculateCalories(1000, 70); // ~42 kcal
    expect(cal70kg).toBeGreaterThanOrEqual(40);
    expect(cal70kg).toBeLessThanOrEqual(45);

    // Heavier person burns proportionally more
    const cal90kg = calculateCalories(1000, 90);
    expect(cal90kg).toBeGreaterThan(cal70kg);
  });
});

describe('Vehicle Detector & Periodicity via Autocorrelation', () => {
  it('detects strong autocorrelation in periodic rhythmic walking wave', () => {
    // Generate synthetic 2 Hz walking wave sampled at 50 Hz (period = 25 samples)
    const sampleRate = 50;
    const samples = [];
    for (let i = 0; i < 150; i++) {
      // 9.8 + 2.0 * sin(2 * pi * 2 * t) + slight random noise
      const t = i / sampleRate;
      const val = 9.8 + 2.0 * Math.sin(2 * Math.PI * 2.0 * t) + (Math.random() - 0.5) * 0.2;
      samples.push(val);
    }

    const { maxCorrelation, peakLag } = computeAutocorrelation(samples, 14, 35);
    expect(maxCorrelation).toBeGreaterThan(0.5); // Very strong periodicity
    expect(peakLag).toBeCloseTo(25, 2); // 50 Hz / 2 Hz = 25 samples
  });

  it('detects low autocorrelation in irregular vehicle engine vibrations', () => {
    // High frequency noisy vibration
    const samples = [];
    for (let i = 0; i < 150; i++) {
      const noise = 9.8 + (Math.random() - 0.5) * 0.5; // low amplitude irregular jitter
      samples.push(noise);
    }

    const { maxCorrelation } = computeAutocorrelation(samples, 14, 35);
    expect(maxCorrelation).toBeLessThan(0.3); // No rhythmic walking cadence
  });

  it('marks VEHICLE state when sustained GPS speed exceeds threshold without rhythmic step gait', () => {
    const detector = new VehicleDetector({ vehicleDebounceSec: 3 });
    // Driving in car at 40 km/h (11.1 m/s)
    detector.updateGpsSpeed(11.1);
    expect(detector.speedKmh).toBeCloseTo(40, 0);

    // Feed vehicle engine noise
    const noiseSamples = Array.from({ length: 100 }, () => 9.8 + (Math.random() - 0.5) * 0.3);

    let state;
    for (let i = 0; i < 5; i++) {
      state = detector.evaluateState(noiseSamples, 50, 0);
    }

    expect(state.isVehicle).toBe(true);
    expect(detector.currentState).toBe(MotionState.VEHICLE);
  });

  it('maintains vehicle state through brief red-light stops due to debounce hysteresis', () => {
    const detector = new VehicleDetector({ vehicleDebounceSec: 2, walkRestoreSec: 3 });
    detector.updateGpsSpeed(12.0); // 43.2 km/h
    const noiseSamples = Array.from({ length: 100 }, () => 9.8 + (Math.random() - 0.5) * 0.2);

    for (let i = 0; i < 3; i++) {
      detector.evaluateState(noiseSamples, 50, 0);
    }
    expect(detector.currentState).toBe(MotionState.VEHICLE);

    // Car stops at red light: speed drops to 0 m/s
    detector.updateGpsSpeed(0);
    const stopResult = detector.evaluateState(noiseSamples, 50, 0);
    // Should NOT immediately flip to WALKING just because speed dropped to 0!
    expect(stopResult.state).toBe(MotionState.VEHICLE);
    expect(detector.currentState).toBe(MotionState.VEHICLE);
  });
});

describe('Pedometer Engine Step Detection & Buffer Confidence', () => {
  let engine;

  beforeEach(() => {
    engine = new PedometerEngine({
      minStepIntervalMs: 250,
      maxStepIntervalMs: 1500,
      stepBufferThreshold: 4
    });
  });

  it('rejects isolated pocket bumps (fewer than 4 rhythmic steps)', () => {
    // Simulate 2 quick accidental shakes
    let now = 1000;
    
    // Bump 1
    engine.processSample(12.5, now);
    engine.processSample(8.0, now + 100);

    // Bump 2
    now += 400;
    engine.processSample(12.8, now);
    engine.processSample(8.2, now + 100);

    // Step buffer should be 2, but total committed steps MUST BE 0
    expect(engine.bufferedSteps).toBe(2);
    expect(engine.totalSteps).toBe(0);
  });

  it('commits all steps once rhythmic cadence threshold (4 steps) is verified', () => {
    let now = 1000;
    const stepInterval = 550; // ~109 steps/min normal walking pace

    for (let i = 0; i < 5; i++) {
      // Peak
      engine.processSample(12.2, now);
      // Valley
      engine.processSample(8.4, now + 250);
      now += stepInterval;
    }

    // After 5 rhythmic steps, all 5 must be committed
    expect(engine.totalSteps).toBe(5);
  });

  it('pauses step counting completely when vehicle is detected', () => {
    // Put vehicle detector into vehicle state
    engine.vehicleDetector.currentState = MotionState.VEHICLE;
    
    let now = 2000;
    for (let i = 0; i < 6; i++) {
      engine.processSample(12.5, now);
      engine.processSample(8.0, now + 200);
      now += 500;
    }

    // In vehicle state, NO steps should be counted
    expect(engine.totalSteps).toBe(0);
  });
});

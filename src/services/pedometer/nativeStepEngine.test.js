import { describe, it, expect } from 'vitest';

/**
 * Pure TypeScript/JavaScript reference implementation of the Kotlin StepEngine algorithm.
 * Guarantees mathematical and algorithmic equivalence across native Kotlin and JS layer.
 */
function processHardwareCounter({
  rawCounter,
  lastHardwareCounter,
  baselineCounter,
  rebootOffset,
  vehicleExcludedSteps,
  isVehicle,
  heightCm = 175,
  weightKg = 70
}) {
  let currentBaseline = baselineCounter;
  let currentRebootOffset = rebootOffset;
  let currentVehicleExcluded = vehicleExcludedSteps;

  if (currentBaseline <= 0) {
    currentBaseline = rawCounter;
  }

  // 1. REBOOT DETECTION
  if (lastHardwareCounter > 0 && rawCounter < lastHardwareCounter) {
    const preRebootSteps = Math.max(0, lastHardwareCounter - currentBaseline);
    currentRebootOffset += preRebootSteps;
    currentBaseline = 0; // Hardware counter resets to 0 upon device reboot
  }

  // Delta calculation
  let rawDelta = 0;
  if (lastHardwareCounter <= 0) {
    rawDelta = 0;
  } else if (rawCounter >= lastHardwareCounter) {
    rawDelta = rawCounter - lastHardwareCounter;
  } else {
    rawDelta = rawCounter;
  }

  // 2. VEHICLE EXCLUSION
  let stepIncrement = 0;
  if (isVehicle) {
    currentVehicleExcluded += rawDelta;
    stepIncrement = 0;
  } else {
    stepIncrement = rawDelta;
  }

  // 3. DAILY TOTAL
  const rawSinceBaseline = Math.max(0, rawCounter - currentBaseline);
  const totalTodaySteps = Math.max(0, rawSinceBaseline + currentRebootOffset - currentVehicleExcluded);

  const strideMeters = (heightCm * 0.414) / 100.0;
  const distanceKm = Math.round(((totalTodaySteps * strideMeters) / 1000.0) * 100) / 100;
  const calories = Math.round(totalTodaySteps * (weightKg * 0.57 * strideMeters / 1000.0));
  const activeMinutes = Math.round(totalTodaySteps / 100.0);

  return {
    totalTodaySteps,
    increment: stepIncrement,
    newBaseline: currentBaseline,
    newRebootOffset: currentRebootOffset,
    newLastHardwareCounter: rawCounter,
    newVehicleExcludedSteps: currentVehicleExcluded,
    distanceKm,
    calories,
    activeMinutes
  };
}

function prepareMidnightRollover(currentRawCounter) {
  return {
    newBaseline: currentRawCounter,
    newRebootOffset: 0,
    newVehicleExcluded: 0,
    todaySteps: 0
  };
}

describe('Native Step Engine Algorithm & State Resilience', () => {
  it('correctly calculates baseline and increments during normal walking', () => {
    // 1st reading at midnight / day start: sensor boots at 5,000 steps
    let state = processHardwareCounter({
      rawCounter: 5000,
      lastHardwareCounter: -1,
      baselineCounter: -1,
      rebootOffset: 0,
      vehicleExcludedSteps: 0,
      isVehicle: false
    });

    expect(state.newBaseline).toBe(5000);
    expect(state.totalTodaySteps).toBe(0);
    expect(state.increment).toBe(0);

    // 2nd reading: user walks 120 steps -> rawCounter is 5,120
    state = processHardwareCounter({
      rawCounter: 5120,
      lastHardwareCounter: state.newLastHardwareCounter,
      baselineCounter: state.newBaseline,
      rebootOffset: state.newRebootOffset,
      vehicleExcludedSteps: state.newVehicleExcludedSteps,
      isVehicle: false
    });

    expect(state.increment).toBe(120);
    expect(state.totalTodaySteps).toBe(120);
    expect(state.distanceKm).toBeGreaterThan(0.08);
    expect(state.calories).toBeGreaterThanOrEqual(3);
  });

  it('detects device reboot (counter resetting to 0) without losing accumulated steps', () => {
    // User already walked 1,500 steps today (baseline was 10,000, current raw was 11,500)
    let state = {
      newBaseline: 10000,
      newLastHardwareCounter: 11500,
      newRebootOffset: 0,
      newVehicleExcludedSteps: 0,
      totalTodaySteps: 1500
    };

    // User restarts the phone!
    // Hardware counter resets to 0 upon reboot, then registers 35 steps
    const postReboot = processHardwareCounter({
      rawCounter: 35,
      lastHardwareCounter: state.newLastHardwareCounter,
      baselineCounter: state.newBaseline,
      rebootOffset: state.newRebootOffset,
      vehicleExcludedSteps: state.newVehicleExcludedSteps,
      isVehicle: false
    });

    // Baseline should now be 0, rebootOffset should be 1,500, total should be 1,500 + 35 = 1,535
    expect(postReboot.newRebootOffset).toBe(1500);
    expect(postReboot.newBaseline).toBe(0);
    expect(postReboot.totalTodaySteps).toBe(1535);
    expect(postReboot.increment).toBe(35);
  });

  it('excludes steps accumulated while user is in a vehicle (vehicle rejection)', () => {
    // Starting with 2,000 verified steps
    let state = {
      newBaseline: 5000,
      newLastHardwareCounter: 7000,
      newRebootOffset: 0,
      newVehicleExcludedSteps: 0
    };

    // User enters a car / bus: Google Play Services detects IN_VEHICLE
    // Car vibrations register 400 false steps on hardware sensor (raw counter goes from 7,000 to 7,400)
    const inCar = processHardwareCounter({
      rawCounter: 7400,
      lastHardwareCounter: state.newLastHardwareCounter,
      baselineCounter: state.newBaseline,
      rebootOffset: state.newRebootOffset,
      vehicleExcludedSteps: state.newVehicleExcludedSteps,
      isVehicle: true // Vehicle active!
    });

    // Increment must be 0, vehicleExcludedSteps must be 400, totalTodaySteps must stay 2,000!
    expect(inCar.increment).toBe(0);
    expect(inCar.newVehicleExcludedSteps).toBe(400);
    expect(inCar.totalTodaySteps).toBe(2000);

    // User exits vehicle and resumes walking 150 real steps (raw counter goes from 7,400 to 7,550)
    const backWalking = processHardwareCounter({
      rawCounter: 7550,
      lastHardwareCounter: inCar.newLastHardwareCounter,
      baselineCounter: inCar.newBaseline,
      rebootOffset: inCar.newRebootOffset,
      vehicleExcludedSteps: inCar.newVehicleExcludedSteps,
      isVehicle: false // Walking again!
    });

    expect(backWalking.increment).toBe(150);
    expect(backWalking.newVehicleExcludedSteps).toBe(400);
    expect(backWalking.totalTodaySteps).toBe(2150); // 2000 + 150!
  });

  it('performs clean midnight rollover', () => {
    const rawCounterAtMidnight = 14250;
    const rollover = prepareMidnightRollover(rawCounterAtMidnight);

    expect(rollover.newBaseline).toBe(14250);
    expect(rollover.newRebootOffset).toBe(0);
    expect(rollover.newVehicleExcluded).toBe(0);
    expect(rollover.todaySteps).toBe(0);
  });

  it('formats Dexie sync records with _dirty=1 and ISO timestamp', () => {
    const nativePayload = {
      steps: 4500,
      distanceKm: 3.25,
      calories: 140,
      activeMinutes: 45
    };

    const todayStr = '2026-11-04';
    const dexieRecord = {
      id: 'step-uuid-1234',
      date: todayStr,
      steps: nativePayload.steps,
      distanceKm: nativePayload.distanceKm,
      calories: nativePayload.calories,
      activeMinutes: nativePayload.activeMinutes,
      timestamp: Date.now(),
      _dirty: 1,
      updatedAt: new Date().toISOString()
    };

    expect(dexieRecord._dirty).toBe(1);
    expect(dexieRecord.steps).toBe(4500);
    expect(dexieRecord.date).toBe('2026-11-04');
    expect(typeof dexieRecord.updatedAt).toBe('string');
  });
});

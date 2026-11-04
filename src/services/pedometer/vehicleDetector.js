/**
 * Vehicle and Cadence Detector
 * Distinguishes true walking/running from cars, buses, bikes, trains, and still states.
 */

export const MotionState = {
  STILL: 'STILL',
  WALKING: 'WALKING',
  RUNNING: 'RUNNING',
  VEHICLE: 'VEHICLE'
};

/**
 * Computes normalized autocorrelation of a signal at lag k.
 * Used to detect rhythmic periodicity of human gait vs random/vibrational noise.
 */
export function computeAutocorrelation(samples, minLag, maxLag) {
  const n = samples.length;
  if (n < maxLag * 2) return { maxCorrelation: 0, peakLag: 0 };

  // Calculate mean
  let sum = 0;
  for (let i = 0; i < n; i++) sum += samples[i];
  const mean = sum / n;

  // Calculate variance
  let variance = 0;
  for (let i = 0; i < n; i++) {
    const diff = samples[i] - mean;
    variance += diff * diff;
  }

  if (variance < 0.0001) return { maxCorrelation: 0, peakLag: 0 };

  let maxCorrelation = -1;
  let peakLag = 0;

  for (let lag = minLag; lag <= maxLag; lag++) {
    let crossSum = 0;
    const len = n - lag;
    for (let i = 0; i < len; i++) {
      crossSum += (samples[i] - mean) * (samples[i + lag] - mean);
    }
    const r = crossSum / variance;
    if (r > maxCorrelation) {
      maxCorrelation = r;
      peakLag = lag;
    }
  }

  return { maxCorrelation, peakLag };
}

export class VehicleDetector {
  constructor(options = {}) {
    this.speedKmh = 0;
    this.lastSpeedTimestamp = 0;
    this.currentState = MotionState.STILL;
    
    // Hysteresis counters (in seconds / update counts)
    this.vehicleScore = 0; // accumulated evidence for vehicle
    this.walkingScore = 0; // accumulated evidence for walking
    this.stillScore = 0;

    this.options = {
      speedVehicleThresholdKmh: options.speedVehicleThresholdKmh || 7.0,
      speedHardVehicleKmh: options.speedHardVehicleKmh || 25.0, // faster than any sustained human sprint
      minWalkAutocorrelation: options.minWalkAutocorrelation || 0.32,
      vehicleDebounceSec: options.vehicleDebounceSec || 10,
      walkRestoreSec: options.walkRestoreSec || 4,
      ...options
    };
  }

  updateGpsSpeed(speedMps) {
    if (speedMps === null || speedMps === undefined || isNaN(speedMps)) {
      return;
    }
    // Convert m/s to km/h
    this.speedKmh = Math.max(0, speedMps * 3.6);
    this.lastSpeedTimestamp = Date.now();
  }

  /**
   * Evaluates the window of accelerometer magnitudes and returns the inferred motion state.
   * @param {number[]} magSamples Recent array of acceleration magnitudes (filtered)
   * @param {number} sampleRate Approximate sample rate in Hz (e.g. 50Hz)
   * @param {number} recentStepCadence Steps per second over last few seconds
   */
  evaluateState(magSamples, sampleRate = 50, recentStepCadence = 0) {
    // 1. Check signal variance / energy
    let sum = 0;
    for (let i = 0; i < magSamples.length; i++) sum += magSamples[i];
    const mean = sum / (magSamples.length || 1);
    
    let variance = 0;
    for (let i = 0; i < magSamples.length; i++) {
      const diff = magSamples[i] - mean;
      variance += diff * diff;
    }
    variance = variance / (magSamples.length || 1);
    const standardDeviation = Math.sqrt(variance);

    // 2. Periodicity via Autocorrelation
    // Typical human step cadence: 1.0 Hz (walking) to 3.5 Hz (sprinting)
    // Lags corresponding to 0.5 Hz to 3.5 Hz at sampleRate:
    const minLag = Math.max(5, Math.floor(sampleRate / 3.5)); // fast cadence
    const maxLag = Math.min(Math.floor(magSamples.length / 2), Math.floor(sampleRate / 0.5)); // slow cadence
    
    const { maxCorrelation, peakLag } = computeAutocorrelation(magSamples, minLag, maxLag);
    
    // Inferred cadence from peak lag:
    const inferredFreq = peakLag > 0 ? sampleRate / peakLag : 0;
    const hasRhythmicGait = maxCorrelation >= this.options.minWalkAutocorrelation && inferredFreq >= 0.8 && inferredFreq <= 3.8;

    // 3. Vehicle evaluation
    // Speed over threshold:
    const isAboveWalkSpeed = this.speedKmh > this.options.speedVehicleThresholdKmh;
    const isHardVehicleSpeed = this.speedKmh >= this.options.speedHardVehicleKmh;

    // Vehicle condition: High speed AND (no rhythmic gait OR low variance irregular vibration)
    const isVehicleCandidate = isHardVehicleSpeed || (isAboveWalkSpeed && !hasRhythmicGait);

    // 4. Update Hysteresis
    if (isVehicleCandidate) {
      this.vehicleScore = Math.min(30, this.vehicleScore + 1);
      this.walkingScore = Math.max(0, this.walkingScore - 1);
      this.stillScore = 0;
    } else if (hasRhythmicGait && standardDeviation > 0.8) {
      this.walkingScore = Math.min(30, this.walkingScore + 1);
      this.vehicleScore = Math.max(0, this.vehicleScore - 1.5);
      this.stillScore = 0;
    } else if (standardDeviation < 0.25 && this.speedKmh < 2.0) {
      this.stillScore = Math.min(30, this.stillScore + 1);
      // Notice: If vehicle stopped at traffic light, don't immediately clear vehicleScore!
      if (this.currentState !== MotionState.VEHICLE) {
        this.walkingScore = 0;
      }
    }

    // 5. State transitions with debounce
    if (this.vehicleScore >= this.options.vehicleDebounceSec) {
      this.currentState = MotionState.VEHICLE;
    } else if (this.walkingScore >= this.options.walkRestoreSec) {
      // Determine walking vs running
      if (inferredFreq > 2.6 || recentStepCadence > 2.6 || standardDeviation > 3.0) {
        this.currentState = MotionState.RUNNING;
      } else {
        this.currentState = MotionState.WALKING;
      }
    } else if (this.stillScore >= 5 && this.currentState !== MotionState.VEHICLE) {
      this.currentState = MotionState.STILL;
    }

    return {
      state: this.currentState,
      isVehicle: this.currentState === MotionState.VEHICLE,
      speedKmh: Number(this.speedKmh.toFixed(1)),
      correlation: Number(maxCorrelation.toFixed(2)),
      cadenceHz: Number(inferredFreq.toFixed(2)),
      stdDev: Number(standardDeviation.toFixed(2))
    };
  }

  reset() {
    this.speedKmh = 0;
    this.vehicleScore = 0;
    this.walkingScore = 0;
    this.stillScore = 0;
    this.currentState = MotionState.STILL;
  }
}

export default VehicleDetector;


/**
 * Stride and Energy Expenditure Calculations
 */

export function calculateStrideLength(heightCm, userCalibrationFactor = 1.0) {
  const height = Number(heightCm) || 172;
  // Average human stride length is approximately 0.414 * height for men, 0.413 for women
  const baseStrideMeters = (height * 0.414) / 100;
  return baseStrideMeters * (userCalibrationFactor || 1.0);
}

export function calculateDistanceKm(steps, strideLengthMeters) {
  if (!steps || steps <= 0) return 0;
  const meters = steps * (strideLengthMeters || 0.72);
  return Number((meters / 1000).toFixed(2));
}

/**
 * Calculates estimated active calories burned based on body weight, steps, and activity type
 * Walking is ~3.5 METs, Running is ~8.0 METs
 */
export function calculateCalories(steps, weightKg = 70, isRunning = false) {
  if (!steps || steps <= 0) return 0;
  // A standard step burns approx 0.04 kcal for a 70kg person walking, higher if running
  const weightFactor = (Number(weightKg) || 70) / 70;
  const basePerStep = isRunning ? 0.065 : 0.042;
  return Math.round(steps * basePerStep * weightFactor);
}

/**
 * Estimates active minutes based on steps and average cadence (approx 100-115 steps/min)
 */
export function calculateActiveMinutes(steps, averageCadence = 105) {
  if (!steps || steps <= 0) return 0;
  return Math.max(1, Math.round(steps / averageCadence));
}


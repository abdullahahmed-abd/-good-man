package com.insaan.app

import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import kotlin.math.roundToInt

data class StepCalculationResult(
    val totalTodaySteps: Long,
    val increment: Long,
    val newBaseline: Long,
    val newRebootOffset: Long,
    val newLastHardwareCounter: Long,
    val newVehicleExcludedSteps: Long,
    val distanceKm: Double,
    val calories: Int,
    val activeMinutes: Int
)

data class StepMetrics(
    val steps: Long,
    val distanceKm: Double,
    val calories: Int,
    val activeMinutes: Int,
    val goalPercent: Int
)

/**
 * Pure calculation engine for pedometer mathematics, hardware counter baseline management,
 * device reboot handling, and vehicle step exclusion.
 * Designed without Android framework dependencies so it can be thoroughly unit tested.
 */
object StepEngine {

    fun calculateStrideLengthMeters(heightCm: Int): Double {
        val safeHeight = if (heightCm in 100..250) heightCm else 175
        return (safeHeight * 0.414) / 100.0
    }

    fun calculateDistanceKm(steps: Long, strideMeters: Double): Double {
        if (steps <= 0) return 0.0
        val distKm = (steps * strideMeters) / 1000.0
        return (distKm * 100.0).roundToInt() / 100.0
    }

    fun calculateCaloriesBurned(steps: Long, weightKg: Int, strideMeters: Double): Int {
        if (steps <= 0) return 0
        val safeWeight = if (weightKg in 30..300) weightKg else 70
        // Standard ACSM metabolic formula: ~0.57 cal per kg per meter walked
        val kcal = steps * (safeWeight * 0.57 * strideMeters / 1000.0)
        return kcal.roundToInt()
    }

    fun calculateActiveMinutes(steps: Long): Int {
        if (steps <= 0) return 0
        // Standard moderate cadence: ~100 steps per active minute
        return (steps / 100.0).roundToInt()
    }

    fun calculateMetrics(steps: Long, heightCm: Int, weightKg: Int, goal: Long): StepMetrics {
        val stride = calculateStrideLengthMeters(heightCm)
        val distance = calculateDistanceKm(steps, stride)
        val calories = calculateCaloriesBurned(steps, weightKg, stride)
        val activeMins = calculateActiveMinutes(steps)
        val safeGoal = if (goal > 0) goal else 10000L
        val percent = ((steps.toDouble() / safeGoal.toDouble()) * 100.0).coerceIn(0.0, 999.0).roundToInt()

        return StepMetrics(
            steps = steps,
            distanceKm = distance,
            calories = calories,
            activeMinutes = activeMins,
            goalPercent = percent
        )
    }

    /**
     * Processes a new cumulative hardware counter reading (`Sensor.TYPE_STEP_COUNTER`).
     * 
     * @param rawCounter The raw cumulative steps since device boot from hardware sensor
     * @param lastHardwareCounter The previous raw reading stored
     * @param baselineCounter Hardware reading at start of day (00:00 or when tracking initialized)
     * @param rebootOffset Steps accumulated prior to device reboots on the current day
     * @param vehicleExcludedSteps Steps discarded due to confirmed vehicular movement
     * @param isVehicle Whether current activity is classified as IN_VEHICLE or ON_BICYCLE
     */
    fun processHardwareCounter(
        rawCounter: Long,
        lastHardwareCounter: Long,
        baselineCounter: Long,
        rebootOffset: Long,
        vehicleExcludedSteps: Long,
        isVehicle: Boolean,
        heightCm: Int = 175,
        weightKg: Int = 70
    ): StepCalculationResult {
        var currentBaseline = baselineCounter
        var currentRebootOffset = rebootOffset
        var currentVehicleExcluded = vehicleExcludedSteps

        // Initial setup for first reading ever
        if (currentBaseline <= 0L) {
            currentBaseline = rawCounter
        }

        // 1. REBOOT DETECTION:
        // Hardware step counter resets to 0 upon device reboot.
        // If rawCounter < lastHardwareCounter, device was rebooted!
        if (lastHardwareCounter > 0L && rawCounter < lastHardwareCounter) {
            // Steps accumulated before reboot = lastHardwareCounter - currentBaseline
            val preRebootSteps = (lastHardwareCounter - currentBaseline).coerceAtLeast(0L)
            currentRebootOffset += preRebootSteps
            currentBaseline = 0L // Hardware counter resets to 0 upon device reboot
        }

        // Calculate delta since last reading
        val rawDelta = if (lastHardwareCounter <= 0L) {
            0L
        } else if (rawCounter >= lastHardwareCounter) {
            rawCounter - lastHardwareCounter
        } else {
            rawCounter // Post-reboot delta from 0
        }

        // 2. VEHICLE EXCLUSION:
        // If user is currently driving/riding a vehicle, exclude this increment
        val stepIncrement = if (isVehicle) {
            currentVehicleExcluded += rawDelta
            0L
        } else {
            rawDelta
        }

        // 3. DAILY TOTAL:
        // Total steps = (current hardware count - baseline) + rebootOffset - vehicleExcluded
        val rawSinceBaseline = (rawCounter - currentBaseline).coerceAtLeast(0L)
        val calculatedTotal = (rawSinceBaseline + currentRebootOffset - currentVehicleExcluded).coerceAtLeast(0L)

        val stride = calculateStrideLengthMeters(heightCm)
        val distance = calculateDistanceKm(calculatedTotal, stride)
        val calories = calculateCaloriesBurned(calculatedTotal, weightKg, stride)
        val activeMinutes = calculateActiveMinutes(calculatedTotal)

        return StepCalculationResult(
            totalTodaySteps = calculatedTotal,
            increment = stepIncrement,
            newBaseline = currentBaseline,
            newRebootOffset = currentRebootOffset,
            newLastHardwareCounter = rawCounter,
            newVehicleExcludedSteps = currentVehicleExcluded,
            distanceKm = distance,
            calories = calories,
            activeMinutes = activeMinutes
        )
    }

    /**
     * Resets day state for midnight rollover.
     */
    fun prepareMidnightRollover(currentRawCounter: Long): Triple<Long, Long, Long> {
        // baseline = currentRawCounter, rebootOffset = 0, vehicleExcluded = 0
        return Triple(currentRawCounter, 0L, 0L)
    }

    fun getTodayDateString(): String {
        val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.US)
        return sdf.format(Date())
    }

    fun getCurrentHour(): Int {
        val sdf = SimpleDateFormat("H", Locale.US)
        return sdf.format(Date()).toIntOrNull() ?: 0
    }
}

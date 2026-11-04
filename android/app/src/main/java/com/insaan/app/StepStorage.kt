package com.insaan.app

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class StepStorage(private val context: Context) {

    private val prefs: SharedPreferences = context.getSharedPreferences("insaan_step_data", Context.MODE_PRIVATE)

    // Hardware-backed encrypted shared preferences for auth tokens
    private val securePrefs: SharedPreferences by lazy {
        try {
            val masterKey = MasterKey.Builder(context)
                .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
                .build()

            EncryptedSharedPreferences.create(
                context,
                "insaan_keystore_secure_vault",
                masterKey,
                EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
                EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
            )
        } catch (e: Exception) {
            // Fallback to mode private if hardware keystore unavailable
            context.getSharedPreferences("insaan_fallback_secure_vault", Context.MODE_PRIVATE)
        }
    }

    // --- SECURE STORAGE (Capacitor Auth Tokens) ---

    fun setSecureItem(key: String, value: String) {
        securePrefs.edit().putString(key, value).apply()
    }

    fun getSecureItem(key: String): String? {
        return securePrefs.getString(key, null)
    }

    fun removeSecureItem(key: String) {
        securePrefs.edit().remove(key).apply()
    }

    // --- USER PROFILE & GOAL ---

    var heightCm: Int
        get() = prefs.getInt("profile_height_cm", 175)
        set(value) = prefs.edit().putInt("profile_height_cm", value).apply()

    var weightKg: Int
        get() = prefs.getInt("profile_weight_kg", 70)
        set(value) = prefs.edit().putInt("profile_weight_kg", value).apply()

    var dailyGoal: Long
        get() = prefs.getLong("profile_daily_goal", 10000L)
        set(value) = prefs.edit().putLong("profile_daily_goal", value).apply()

    var isServiceRunning: Boolean
        get() = prefs.getBoolean("service_running", false)
        set(value) = prefs.edit().putBoolean("service_running", value).apply()

    var motionStatus: String
        get() = prefs.getString("motion_status", "Still") ?: "Still"
        set(value) = prefs.edit().putString("motion_status", value).apply()

    // --- DAILY COUNTERS & ROLLOVER ---

    var dateKey: String
        get() = prefs.getString("day_date_key", StepEngine.getTodayDateString()) ?: StepEngine.getTodayDateString()
        set(value) = prefs.edit().putString("day_date_key", value).apply()

    var baselineCounter: Long
        get() = prefs.getLong("baseline_counter", -1L)
        set(value) = prefs.edit().putLong("baseline_counter", value).apply()

    var lastHardwareCounter: Long
        get() = prefs.getLong("last_hardware_counter", -1L)
        set(value) = prefs.edit().putLong("last_hardware_counter", value).apply()

    var rebootOffset: Long
        get() = prefs.getLong("reboot_offset", 0L)
        set(value) = prefs.edit().putLong("reboot_offset", value).apply()

    var vehicleExcludedSteps: Long
        get() = prefs.getLong("vehicle_excluded_steps", 0L)
        set(value) = prefs.edit().putLong("vehicle_excluded_steps", value).apply()

    var todaySteps: Long
        get() = prefs.getLong("today_steps", 0L)
        set(value) = prefs.edit().putLong("today_steps", value).apply()

    // --- HOURLY BUCKETS (0..23) ---

    fun getHourlyStepsJson(date: String = dateKey): JSONObject {
        val raw = prefs.getString("hourly_${date}", null)
        return if (raw != null) {
            try {
                JSONObject(raw)
            } catch (e: Exception) {
                initHourlyJson()
            }
        } else {
            initHourlyJson()
        }
    }

    private fun initHourlyJson(): JSONObject {
        val json = JSONObject()
        for (h in 0..23) {
            json.put(h.toString(), 0L)
        }
        return json
    }

    fun addHourlySteps(hour: Int, stepIncrement: Long, date: String = dateKey) {
        if (stepIncrement <= 0) return
        val json = getHourlyStepsJson(date)
        val current = json.optLong(hour.toString(), 0L)
        json.put(hour.toString(), current + stepIncrement)
        prefs.edit().putString("hourly_${date}", json.toString()).apply()
    }

    // --- MIDNIGHT ARCHIVING & ROLLOVER ---

    fun checkAndPerformMidnightRollover(): Boolean {
        val today = StepEngine.getTodayDateString()
        val currentSavedDate = dateKey

        if (today != currentSavedDate) {
            // Archive previous day record
            archiveDay(currentSavedDate)

            // Rollover: Reset baseline to current hardware counter
            val currentLast = lastHardwareCounter
            val (newBaseline, newOffset, newExcluded) = StepEngine.prepareMidnightRollover(currentLast)

            prefs.edit()
                .putString("day_date_key", today)
                .putLong("baseline_counter", newBaseline)
                .putLong("reboot_offset", newOffset)
                .putLong("vehicle_excluded_steps", newExcluded)
                .putLong("today_steps", 0L)
                .putString("hourly_${today}", initHourlyJson().toString())
                .apply()

            return true
        }
        return false
    }

    private fun archiveDay(date: String) {
        val steps = todaySteps
        val metrics = StepEngine.calculateMetrics(steps, heightCm, weightKg, dailyGoal)
        val historyJsonStr = prefs.getString("history_archive", "{}") ?: "{}"
        try {
            val history = JSONObject(historyJsonStr)
            val dayObj = JSONObject().apply {
                put("date", date)
                put("steps", steps)
                put("distanceKm", metrics.distanceKm)
                put("calories", metrics.calories)
                put("activeMinutes", metrics.activeMinutes)
            }
            history.put(date, dayObj)
            prefs.edit().putString("history_archive", history.toString()).apply()
        } catch (e: Exception) {
            // Log/ignore
        }
    }

    fun getHistoryRange(fromDate: String, toDate: String): JSONObject {
        val historyJsonStr = prefs.getString("history_archive", "{}") ?: "{}"
        val result = JSONObject()
        try {
            val history = JSONObject(historyJsonStr)
            val keys = history.keys()
            while (keys.hasNext()) {
                val key = keys.next()
                if (key in fromDate..toDate) {
                    result.put(key, history.getJSONObject(key))
                }
            }
            // Include today if in range
            val today = dateKey
            if (today in fromDate..toDate) {
                val metrics = StepEngine.calculateMetrics(todaySteps, heightCm, weightKg, dailyGoal)
                val todayObj = JSONObject().apply {
                    put("date", today)
                    put("steps", todaySteps)
                    put("distanceKm", metrics.distanceKm)
                    put("calories", metrics.calories)
                    put("activeMinutes", metrics.activeMinutes)
                }
                result.put(today, todayObj)
            }
        } catch (e: Exception) {
            // Return empty
        }
        return result
    }
}

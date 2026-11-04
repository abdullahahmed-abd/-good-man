package com.insaan.app

import android.content.Context
import android.content.SharedPreferences

class PomodoroStorage(context: Context) {

    private val prefs: SharedPreferences = context.getSharedPreferences("insaan_pomodoro_data", Context.MODE_PRIVATE)

    var isRunning: Boolean
        get() = prefs.getBoolean("is_running", false)
        set(value) = prefs.edit().putBoolean("is_running", value).apply()

    var isPaused: Boolean
        get() = prefs.getBoolean("is_paused", false)
        set(value) = prefs.edit().putBoolean("is_paused", value).apply()

    var isBreak: Boolean
        get() = prefs.getBoolean("is_break", false)
        set(value) = prefs.edit().putBoolean("is_break", value).apply()

    var taskTitle: String
        get() = prefs.getString("task_title", "Deep Work") ?: "Deep Work"
        set(value) = prefs.edit().putString("task_title", value).apply()

    var totalDurationSeconds: Long
        get() = prefs.getLong("total_duration_sec", 25 * 60L)
        set(value) = prefs.edit().putLong("total_duration_sec", value).apply()

    var remainingSecondsOnPause: Long
        get() = prefs.getLong("remaining_sec_paused", 25 * 60L)
        set(value) = prefs.edit().putLong("remaining_sec_paused", value).apply()

    var startTimeMillis: Long
        get() = prefs.getLong("start_time_millis", 0L)
        set(value) = prefs.edit().putLong("start_time_millis", value).apply()

    var targetEndTimeMillis: Long
        get() = prefs.getLong("target_end_time_millis", 0L)
        set(value) = prefs.edit().putLong("target_end_time_millis", value).apply()

    fun getRemainingSeconds(): Long {
        if (!isRunning) return totalDurationSeconds
        if (isPaused) return remainingSecondsOnPause
        val now = System.currentTimeMillis()
        val remainingMs = targetEndTimeMillis - now
        return (remainingMs / 1000L).coerceAtLeast(0L)
    }

    fun clear() {
        prefs.edit()
            .putBoolean("is_running", false)
            .putBoolean("is_paused", false)
            .putLong("target_end_time_millis", 0L)
            .apply()
    }
}


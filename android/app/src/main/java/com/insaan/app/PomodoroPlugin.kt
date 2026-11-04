package com.insaan.app

import android.content.Context
import android.content.Intent
import android.os.Build
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

@CapacitorPlugin(name = "PomodoroPlugin")
class PomodoroPlugin : Plugin() {

    private lateinit var storage: PomodoroStorage

    override fun load() {
        super.load()
        storage = PomodoroStorage(context)
        activePlugin = this
    }

    @PluginMethod
    fun start(call: PluginCall) {
        val taskTitle = call.getString("taskTitle") ?: "Deep Work"
        val durationSeconds = call.getInt("durationSeconds")?.toLong() ?: (25 * 60L)
        val isBreak = call.getBoolean("isBreak") ?: false

        val intent = Intent(context, PomodoroService::class.java).apply {
            action = PomodoroService.ACTION_START
            putExtra("task_title", taskTitle)
            putExtra("duration_sec", durationSeconds)
            putExtra("is_break", isBreak)
        }

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
            call.resolve(JSObject().put("success", true))
        } catch (e: Exception) {
            call.reject("Failed to start Pomodoro service: ${e.message}", e)
        }
    }

    @PluginMethod
    fun pause(call: PluginCall) {
        val intent = Intent(context, PomodoroService::class.java).apply {
            action = PomodoroService.ACTION_PAUSE
        }
        try {
            context.startService(intent)
            call.resolve(JSObject().put("success", true))
        } catch (e: Exception) {
            call.reject("Failed to pause Pomodoro service: ${e.message}", e)
        }
    }

    @PluginMethod
    fun resume(call: PluginCall) {
        val intent = Intent(context, PomodoroService::class.java).apply {
            action = PomodoroService.ACTION_RESUME
        }
        try {
            context.startService(intent)
            call.resolve(JSObject().put("success", true))
        } catch (e: Exception) {
            call.reject("Failed to resume Pomodoro service: ${e.message}", e)
        }
    }

    @PluginMethod
    fun stop(call: PluginCall) {
        val intent = Intent(context, PomodoroService::class.java).apply {
            action = PomodoroService.ACTION_STOP
        }
        try {
            context.stopService(intent)
            storage.clear()
            call.resolve(JSObject().put("success", true))
        } catch (e: Exception) {
            call.reject("Failed to stop Pomodoro service: ${e.message}", e)
        }
    }

    @PluginMethod
    fun getState(call: PluginCall) {
        val remaining = storage.getRemainingSeconds()
        val ret = JSObject().apply {
            put("isRunning", storage.isRunning)
            put("isPaused", storage.isPaused)
            put("isBreak", storage.isBreak)
            put("taskTitle", storage.taskTitle)
            put("totalDurationSeconds", storage.totalDurationSeconds)
            put("remainingSeconds", remaining)
            put("startTimeMillis", storage.startTimeMillis)
            put("targetEndTimeMillis", storage.targetEndTimeMillis)
        }
        call.resolve(ret)
    }

    companion object {
        private var activePlugin: PomodoroPlugin? = null

        fun broadcastTick(
            context: Context,
            remainingSeconds: Long,
            totalDurationSeconds: Long,
            isPaused: Boolean,
            isBreak: Boolean
        ) {
            val data = JSObject().apply {
                put("remainingSeconds", remainingSeconds)
                put("totalDurationSeconds", totalDurationSeconds)
                put("isPaused", isPaused)
                put("isBreak", isBreak)
            }
            activePlugin?.notifyListeners("pomodoroTick", data)
        }

        fun broadcastCompleted(
            context: Context,
            taskTitle: String,
            durationMinutes: Int,
            isBreak: Boolean
        ) {
            val data = JSObject().apply {
                put("taskTitle", taskTitle)
                put("durationMinutes", durationMinutes)
                put("isBreak", isBreak)
                put("completedAt", System.currentTimeMillis())
            }
            activePlugin?.notifyListeners("pomodoroCompleted", data)
        }
    }
}


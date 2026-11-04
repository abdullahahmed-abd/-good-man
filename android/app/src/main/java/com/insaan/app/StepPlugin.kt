package com.insaan.app

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.PowerManager
import android.provider.Settings
import androidx.core.content.ContextCompat
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.getcapacitor.annotation.Permission

@CapacitorPlugin(
    name = "StepPlugin",
    permissions = [
        Permission(
            alias = "activity",
            strings = [Manifest.permission.ACTIVITY_RECOGNITION]
        ),
        Permission(
            alias = "notifications",
            strings = [Manifest.permission.POST_NOTIFICATIONS]
        )
    ]
)
class StepPlugin : Plugin() {

    private lateinit var storage: StepStorage

    override fun load() {
        super.load()
        storage = StepStorage(context)
        activePluginInstance = this
    }

    @PluginMethod
    override fun checkPermissions(call: PluginCall) {
        val actGranted = ContextCompat.checkSelfPermission(context, Manifest.permission.ACTIVITY_RECOGNITION) == PackageManager.PERMISSION_GRANTED
        val notifGranted = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED
        } else {
            true
        }
        val ret = JSObject().apply {
            put("activityRecognition", if (actGranted) "granted" else "denied")
            put("notifications", if (notifGranted) "granted" else "denied")
            put("allGranted", actGranted && notifGranted)
        }
        call.resolve(ret)
    }

    @PluginMethod
    fun start(call: PluginCall) {
        storage.isServiceRunning = true

        val serviceIntent = Intent(context, StepService::class.java).apply {
            action = StepService.ACTION_START
        }

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(serviceIntent)
            } else {
                context.startService(serviceIntent)
            }
            call.resolve(JSObject().put("success", true))
        } catch (e: Exception) {
            call.reject("Failed to start step service: ${e.message}", e)
        }
    }

    @PluginMethod
    fun stop(call: PluginCall) {
        storage.isServiceRunning = false

        val serviceIntent = Intent(context, StepService::class.java).apply {
            action = StepService.ACTION_STOP
        }

        try {
            context.stopService(serviceIntent)
            WatchdogWorker.cancel(context)
            call.resolve(JSObject().put("success", true))
        } catch (e: Exception) {
            call.reject("Failed to stop step service: ${e.message}", e)
        }
    }

    @PluginMethod
    fun getToday(call: PluginCall) {
        storage.checkAndPerformMidnightRollover()

        val steps = storage.todaySteps
        val metrics = StepEngine.calculateMetrics(steps, storage.heightCm, storage.weightKg, storage.dailyGoal)

        val ret = JSObject().apply {
            put("steps", steps)
            put("distanceKm", metrics.distanceKm)
            put("calories", metrics.calories)
            put("activeMinutes", metrics.activeMinutes)
            put("goal", storage.dailyGoal)
            put("goalPercent", metrics.goalPercent)
            put("status", storage.motionStatus)
            put("date", storage.dateKey)
            put("isServiceRunning", storage.isServiceRunning)
        }
        call.resolve(ret)
    }

    @PluginMethod
    fun getHourly(call: PluginCall) {
        val date = call.getString("date") ?: storage.dateKey
        val json = storage.getHourlyStepsJson(date)

        val hoursArray = JSArray()
        for (h in 0..23) {
            val stepCount = json.optLong(h.toString(), 0L)
            val stride = StepEngine.calculateStrideLengthMeters(storage.heightCm)
            val dist = StepEngine.calculateDistanceKm(stepCount, stride)
            val cal = StepEngine.calculateCaloriesBurned(stepCount, storage.weightKg, stride)

            val hourObj = JSObject().apply {
                put("hour", h)
                put("steps", stepCount)
                put("distanceKm", dist)
                put("calories", cal)
            }
            hoursArray.put(hourObj)
        }

        val ret = JSObject().apply {
            put("date", date)
            put("hours", hoursArray)
        }
        call.resolve(ret)
    }

    @PluginMethod
    fun getRange(call: PluginCall) {
        val fromDate = call.getString("from")
        val toDate = call.getString("to")

        if (fromDate == null || toDate == null) {
            call.reject("Missing required 'from' or 'to' date parameters (YYYY-MM-DD)")
            return
        }

        val json = storage.getHistoryRange(fromDate, toDate)
        val historyObj = JSObject()
        val keys = json.keys()
        while (keys.hasNext()) {
            val k = keys.next()
            val dayJson = json.getJSONObject(k)
            val dayJS = JSObject().apply {
                put("date", dayJson.optString("date"))
                put("steps", dayJson.optLong("steps"))
                put("distanceKm", dayJson.optDouble("distanceKm"))
                put("calories", dayJson.optInt("calories"))
                put("activeMinutes", dayJson.optInt("activeMinutes"))
            }
            historyObj.put(k, dayJS)
        }

        call.resolve(JSObject().put("history", historyObj))
    }

    @PluginMethod
    fun setProfile(call: PluginCall) {
        val height = call.getInt("heightCm")
        val weight = call.getInt("weightKg")
        val goal = call.getInt("goal")

        if (height != null && height in 100..250) {
            storage.heightCm = height
        }
        if (weight != null && weight in 30..300) {
            storage.weightKg = weight
        }
        if (goal != null && goal > 0) {
            storage.dailyGoal = goal.toLong()
        }

        // Trigger immediate notification refresh
        val serviceIntent = Intent(context, StepService::class.java).apply {
            action = StepService.ACTION_UPDATE_NOTIFICATION
        }
        try {
            context.startService(serviceIntent)
        } catch (e: Exception) {}

        call.resolve(JSObject().put("success", true))
    }

    @PluginMethod
    fun getStatus(call: PluginCall) {
        val ret = JSObject().apply {
            put("status", storage.motionStatus)
            put("isServiceRunning", storage.isServiceRunning)
        }
        call.resolve(ret)
    }

    @PluginMethod
    fun isBatteryOptimized(call: PluginCall) {
        val pm = context.getSystemService(Context.POWER_SERVICE) as? PowerManager
        val isIgnoring = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && pm != null) {
            pm.isIgnoringBatteryOptimizations(context.packageName)
        } else {
            true
        }

        val ret = JSObject().apply {
            put("isOptimized", !isIgnoring) // true if restricted
            put("isUnrestricted", isIgnoring)
        }
        call.resolve(ret)
    }

    @PluginMethod
    fun requestIgnoreBatteryOptimization(call: PluginCall) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            try {
                val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
                    data = Uri.parse("package:${context.packageName}")
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                context.startActivity(intent)
                call.resolve(JSObject().put("success", true))
            } catch (e: Exception) {
                // Some OEMs do not support direct request intent; fallback to application settings
                openAppSettings(call)
            }
        } else {
            call.resolve(JSObject().put("success", true))
        }
    }

    @PluginMethod
    fun openAppSettings(call: PluginCall) {
        try {
            val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                data = Uri.fromParts("package", context.packageName, null)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)
            call.resolve(JSObject().put("success", true))
        } catch (e: Exception) {
            call.reject("Failed to open app settings: ${e.message}", e)
        }
    }

    // --- SECURE KEYSTORE STORAGE ---

    @PluginMethod
    fun setSecureItem(call: PluginCall) {
        val key = call.getString("key")
        val value = call.getString("value")
        if (key != null && value != null) {
            storage.setSecureItem(key, value)
            call.resolve(JSObject().put("success", true))
        } else {
            call.reject("Key and value must be provided")
        }
    }

    @PluginMethod
    fun getSecureItem(call: PluginCall) {
        val key = call.getString("key")
        if (key != null) {
            val value = storage.getSecureItem(key)
            call.resolve(JSObject().put("value", value))
        } else {
            call.reject("Key must be provided")
        }
    }

    @PluginMethod
    fun removeSecureItem(call: PluginCall) {
        val key = call.getString("key")
        if (key != null) {
            storage.removeSecureItem(key)
            call.resolve(JSObject().put("success", true))
        } else {
            call.reject("Key must be provided")
        }
    }

    companion object {
        private var activePluginInstance: StepPlugin? = null

        fun broadcastStepsUpdated(
            context: Context,
            steps: Long,
            distanceKm: Double,
            calories: Int,
            activeMinutes: Int,
            motionStatus: String
        ) {
            val data = JSObject().apply {
                put("steps", steps)
                put("distanceKm", distanceKm)
                put("calories", calories)
                put("activeMinutes", activeMinutes)
                put("status", motionStatus)
                put("timestamp", System.currentTimeMillis())
            }
            activePluginInstance?.notifyListeners("stepsUpdated", data)
        }
    }
}

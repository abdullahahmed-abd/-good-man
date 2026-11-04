package com.insaan.app

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import androidx.core.app.ServiceCompat
import com.google.android.gms.location.ActivityRecognition
import com.google.android.gms.location.ActivityTransition
import com.google.android.gms.location.ActivityTransitionRequest
import com.google.android.gms.location.DetectedActivity
import java.text.NumberFormat
import java.util.Locale

class StepService : Service(), SensorEventListener {

    private lateinit var sensorManager: SensorManager
    private lateinit var storage: StepStorage
    private var stepCounterSensor: Sensor? = null
    private var stepDetectorSensor: Sensor? = null

    private var lastNotificationUpdateTime = 0L
    private var lastNotificationSteps = 0L

    override fun onCreate() {
        super.onCreate()
        storage = StepStorage(this)
        sensorManager = getSystemService(Context.SENSOR_SERVICE) as SensorManager

        createNotificationChannel()
        registerActivityTransitions()
        registerSensors()

        // Ensure midnight alarm is scheduled
        MidnightAlarmReceiver.scheduleMidnightAlarm(this)
        WatchdogWorker.schedule(this)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val action = intent?.action

        if (action == ACTION_STOP) {
            storage.isServiceRunning = false
            stopForeground(STOP_FOREGROUND_REMOVE)
            stopSelf()
            return START_NOT_STICKY
        }

        storage.isServiceRunning = true

        val notification = buildForegroundNotification()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            ServiceCompat.startForeground(
                this,
                NOTIFICATION_ID,
                notification,
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
                    ServiceInfo.FOREGROUND_SERVICE_TYPE_HEALTH
                } else {
                    ServiceInfo.FOREGROUND_SERVICE_TYPE_HEALTH
                }
            )
        } else {
            startForeground(NOTIFICATION_ID, notification)
        }

        if (action == ACTION_UPDATE_NOTIFICATION || action == ACTION_STATUS_CHANGED) {
            updateNotificationNow()
        }

        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        super.onDestroy()
        try {
            sensorManager.unregisterListener(this)
            unregisterActivityTransitions()
        } catch (e: Exception) {
            // Ignore
        }
    }

    // --- SENSORS ---

    private fun registerSensors() {
        stepCounterSensor = sensorManager.getDefaultSensor(Sensor.TYPE_STEP_COUNTER)
        if (stepCounterSensor != null) {
            sensorManager.registerListener(
                this,
                stepCounterSensor,
                SensorManager.SENSOR_DELAY_NORMAL
            )
        } else {
            // Fallback to step detector if hardware step counter not present
            stepDetectorSensor = sensorManager.getDefaultSensor(Sensor.TYPE_STEP_DETECTOR)
            if (stepDetectorSensor != null) {
                sensorManager.registerListener(
                    this,
                    stepDetectorSensor,
                    SensorManager.SENSOR_DELAY_NORMAL
                )
            }
        }
    }

    override fun onSensorChanged(event: SensorEvent) {
        if (event.sensor.type == Sensor.TYPE_STEP_COUNTER) {
            val rawCounter = event.values[0].toLong()
            handleStepCounterEvent(rawCounter)
        } else if (event.sensor.type == Sensor.TYPE_STEP_DETECTOR) {
            // Step detector returns 1.0 for each step detected
            if (event.values[0] == 1.0f) {
                handleStepDetectorEvent()
            }
        }
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}

    private fun handleStepCounterEvent(rawCounter: Long) {
        // 1. Midnight rollover check
        storage.checkAndPerformMidnightRollover()

        val isVehicle = storage.motionStatus == "In Vehicle" || storage.motionStatus == "Bicycle"

        val result = StepEngine.processHardwareCounter(
            rawCounter = rawCounter,
            lastHardwareCounter = storage.lastHardwareCounter,
            baselineCounter = storage.baselineCounter,
            rebootOffset = storage.rebootOffset,
            vehicleExcludedSteps = storage.vehicleExcludedSteps,
            isVehicle = isVehicle,
            heightCm = storage.heightCm,
            weightKg = storage.weightKg
        )

        // Save updated state
        storage.baselineCounter = result.newBaseline
        storage.rebootOffset = result.newRebootOffset
        storage.lastHardwareCounter = result.newLastHardwareCounter
        storage.vehicleExcludedSteps = result.newVehicleExcludedSteps
        storage.todaySteps = result.totalTodaySteps

        if (result.increment > 0L) {
            storage.addHourlySteps(StepEngine.getCurrentHour(), result.increment)
        }

        // Throttle notification updates (at most once every 3s or every 15 steps)
        val now = System.currentTimeMillis()
        if (now - lastNotificationUpdateTime >= 3000L || Math.abs(result.totalTodaySteps - lastNotificationSteps) >= 15L) {
            updateNotificationNow()
            lastNotificationUpdateTime = now
            lastNotificationSteps = result.totalTodaySteps
        }

        // Broadcast to JavaScript listeners
        StepPlugin.broadcastStepsUpdated(this, result.totalTodaySteps, result.distanceKm, result.calories, result.activeMinutes, storage.motionStatus)
    }

    private fun handleStepDetectorEvent() {
        storage.checkAndPerformMidnightRollover()
        val isVehicle = storage.motionStatus == "In Vehicle" || storage.motionStatus == "Bicycle"

        if (!isVehicle) {
            val newTotal = storage.todaySteps + 1L
            storage.todaySteps = newTotal
            storage.addHourlySteps(StepEngine.getCurrentHour(), 1L)

            val now = System.currentTimeMillis()
            if (now - lastNotificationUpdateTime >= 3000L) {
                updateNotificationNow()
                lastNotificationUpdateTime = now
            }

            val metrics = StepEngine.calculateMetrics(newTotal, storage.heightCm, storage.weightKg, storage.dailyGoal)
            StepPlugin.broadcastStepsUpdated(this, newTotal, metrics.distanceKm, metrics.calories, metrics.activeMinutes, storage.motionStatus)
        }
    }

    // --- ACTIVITY RECOGNITION (VEHICLE REJECTION) ---

    private fun registerActivityTransitions() {
        val transitions = mutableListOf<ActivityTransition>()

        val activities = listOf(
            DetectedActivity.IN_VEHICLE,
            DetectedActivity.ON_BICYCLE,
            DetectedActivity.WALKING,
            DetectedActivity.RUNNING,
            DetectedActivity.STILL
        )

        for (activity in activities) {
            transitions.add(
                ActivityTransition.Builder()
                    .setActivityType(activity)
                    .setActivityTransition(ActivityTransition.ACTIVITY_TRANSITION_ENTER)
                    .build()
            )
            transitions.add(
                ActivityTransition.Builder()
                    .setActivityType(activity)
                    .setActivityTransition(ActivityTransition.ACTIVITY_TRANSITION_EXIT)
                    .build()
            )
        }

        val request = ActivityTransitionRequest(transitions)
        val intent = Intent(this, ActivityTransitionReceiver::class.java)
        val pendingIntent = PendingIntent.getBroadcast(
            this,
            2001,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_MUTABLE
        )

        try {
            ActivityRecognition.getClient(this).requestActivityTransitionUpdates(request, pendingIntent)
        } catch (e: SecurityException) {
            // Permission ACTIVITY_RECOGNITION not granted yet
        } catch (e: Exception) {
            // Google Play Services unavailable
        }
    }

    private fun unregisterActivityTransitions() {
        val intent = Intent(this, ActivityTransitionReceiver::class.java)
        val pendingIntent = PendingIntent.getBroadcast(
            this,
            2001,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_MUTABLE
        )
        try {
            ActivityRecognition.getClient(this).removeActivityTransitionUpdates(pendingIntent)
        } catch (e: Exception) {
            // Ignore
        }
    }

    // --- NOTIFICATION ---

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Insaan Pedometer Service",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Live step counting, distance, calories, and daily goal progress"
                setShowBadge(false)
                enableLights(false)
                enableVibration(false)
                setSound(null, null)
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager?.createNotificationChannel(channel)
        }
    }

    private fun buildForegroundNotification(): Notification {
        val steps = storage.todaySteps
        val metrics = StepEngine.calculateMetrics(steps, storage.heightCm, storage.weightKg, storage.dailyGoal)

        val nf = NumberFormat.getNumberInstance(Locale.US)
        val formattedSteps = nf.format(steps)
        val statusText = if (storage.motionStatus == "In Vehicle") " 🚗 Vehicle" else ""

        val contentText = "Today: $formattedSteps steps | ${metrics.distanceKm} km | ${metrics.calories} kcal | Goal ${metrics.goalPercent}%$statusText"

        val openAppIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            openAppIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Insaan — Character & Vitality")
            .setContentText(contentText)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .build()
    }

    private fun updateNotificationNow() {
        val manager = getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager ?: return
        manager.notify(NOTIFICATION_ID, buildForegroundNotification())
    }

    companion object {
        const val NOTIFICATION_ID = 8001
        const val CHANNEL_ID = "insaan_health_steps_v1"

        const val ACTION_START = "com.insaan.app.action.START_STEP_SERVICE"
        const val ACTION_STOP = "com.insaan.app.action.STOP_STEP_SERVICE"
        const val ACTION_UPDATE_NOTIFICATION = "com.insaan.app.action.UPDATE_NOTIFICATION"
        const val ACTION_STATUS_CHANGED = "com.insaan.app.action.STATUS_CHANGED"
        const val ACTION_WATCHDOG_PING = "com.insaan.app.action.WATCHDOG_PING"
    }
}


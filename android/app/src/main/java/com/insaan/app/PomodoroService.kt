package com.insaan.app

import android.app.AlarmManager
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import androidx.core.app.NotificationCompat
import androidx.core.app.ServiceCompat

class PomodoroService : Service() {

    private lateinit var storage: PomodoroStorage
    private val handler = Handler(Looper.getMainLooper())
    private var isUpdating = false

    private val tickerRunnable = object : Runnable {
        override fun run() {
            if (storage.isRunning && !storage.isPaused) {
                val remaining = storage.getRemainingSeconds()
                if (remaining <= 0) {
                    // Alarm will fire or trigger completion
                    return
                }

                updateNotification()
                PomodoroPlugin.broadcastTick(
                    this@PomodoroService,
                    remaining,
                    storage.totalDurationSeconds,
                    storage.isPaused,
                    storage.isBreak
                )
                handler.postDelayed(this, 1000L)
            }
        }
    }

    override fun onCreate() {
        super.onCreate()
        storage = PomodoroStorage(this)
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val action = intent?.action

        when (action) {
            ACTION_START -> {
                val taskTitle = intent.getStringExtra("task_title") ?: "Deep Work"
                val durationSec = intent.getLongExtra("duration_sec", 25 * 60L)
                val isBreak = intent.getBooleanExtra("is_break", false)

                val now = System.currentTimeMillis()
                val targetEnd = now + (durationSec * 1000L)

                storage.isRunning = true
                storage.isPaused = false
                storage.isBreak = isBreak
                storage.taskTitle = taskTitle
                storage.totalDurationSeconds = durationSec
                storage.startTimeMillis = now
                storage.targetEndTimeMillis = targetEnd

                scheduleExactAlarm(targetEnd)
                startForegroundServiceCompat()
                startTicker()
            }
            ACTION_PAUSE -> {
                if (storage.isRunning && !storage.isPaused) {
                    val remaining = storage.getRemainingSeconds()
                    storage.isPaused = true
                    storage.remainingSecondsOnPause = remaining
                    cancelExactAlarm()
                    stopTicker()
                    updateNotification()
                    PomodoroPlugin.broadcastTick(this, remaining, storage.totalDurationSeconds, true, storage.isBreak)
                }
            }
            ACTION_RESUME -> {
                if (storage.isRunning && storage.isPaused) {
                    val remaining = storage.remainingSecondsOnPause
                    val now = System.currentTimeMillis()
                    val targetEnd = now + (remaining * 1000L)

                    storage.isPaused = false
                    storage.startTimeMillis = now
                    storage.targetEndTimeMillis = targetEnd

                    scheduleExactAlarm(targetEnd)
                    startTicker()
                    updateNotification()
                    PomodoroPlugin.broadcastTick(this, remaining, storage.totalDurationSeconds, false, storage.isBreak)
                }
            }
            ACTION_STOP -> {
                storage.clear()
                cancelExactAlarm()
                stopTicker()
                stopForeground(STOP_FOREGROUND_REMOVE)
                stopSelf()
                return START_NOT_STICKY
            }
        }

        return START_NOT_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        super.onDestroy()
        stopTicker()
    }

    private fun startTicker() {
        if (!isUpdating) {
            isUpdating = true
            handler.post(tickerRunnable)
        }
    }

    private fun stopTicker() {
        isUpdating = false
        handler.removeCallbacks(tickerRunnable)
    }

    private fun scheduleExactAlarm(targetTimeMillis: Long) {
        val alarmManager = getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return
        val intent = Intent(this, PomodoroAlarmReceiver::class.java)
        val pendingIntent = PendingIntent.getBroadcast(
            this,
            ALARM_REQ_CODE,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setExactAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    targetTimeMillis,
                    pendingIntent
                )
            } else {
                alarmManager.setExact(
                    AlarmManager.RTC_WAKEUP,
                    targetTimeMillis,
                    pendingIntent
                )
            }
        } catch (e: SecurityException) {
            alarmManager.set(
                AlarmManager.RTC_WAKEUP,
                targetTimeMillis,
                pendingIntent
            )
        }
    }

    private fun cancelExactAlarm() {
        val alarmManager = getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return
        val intent = Intent(this, PomodoroAlarmReceiver::class.java)
        val pendingIntent = PendingIntent.getBroadcast(
            this,
            ALARM_REQ_CODE,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        alarmManager.cancel(pendingIntent)
    }

    private fun startForegroundServiceCompat() {
        val notification = buildNotification()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            ServiceCompat.startForeground(
                this,
                NOTIFICATION_ID,
                notification,
                ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE
            )
        } else {
            startForeground(NOTIFICATION_ID, notification)
        }
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Insaan Focus Timer",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Shows live chronometer and remaining minutes during focus sessions"
                setShowBadge(false)
                enableVibration(false)
                setSound(null, null)
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager?.createNotificationChannel(channel)
        }
    }

    private fun buildNotification(): Notification {
        val remaining = storage.getRemainingSeconds()
        val mins = remaining / 60
        val secs = remaining % 60
        val timeStr = String.format("%02d:%02d", mins, secs)

        val mode = if (storage.isBreak) "Break" else "Focus"
        val stateText = if (storage.isPaused) " (Paused)" else ""
        val title = "$mode $timeStr left — ${storage.taskTitle}$stateText"

        val openAppIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val contentPendingIntent = PendingIntent.getActivity(
            this,
            1,
            openAppIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Actions: Pause / Resume / Stop
        val builder = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(title)
            .setContentText("Keep going! Pure discipline transforms potential into virtue.")
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentIntent(contentPendingIntent)
            .setOngoing(!storage.isPaused)
            .setOnlyAlertOnce(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_PROGRESS)

        if (storage.isPaused) {
            val resumeIntent = Intent(this, PomodoroService::class.java).apply { action = ACTION_RESUME }
            val resumePending = PendingIntent.getService(this, 10, resumeIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
            builder.addAction(android.R.drawable.ic_media_play, "Resume", resumePending)
        } else {
            val pauseIntent = Intent(this, PomodoroService::class.java).apply { action = ACTION_PAUSE }
            val pausePending = PendingIntent.getService(this, 11, pauseIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
            builder.addAction(android.R.drawable.ic_media_pause, "Pause", pausePending)
        }

        val stopIntent = Intent(this, PomodoroService::class.java).apply { action = ACTION_STOP }
        val stopPending = PendingIntent.getService(this, 12, stopIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        builder.addAction(android.R.drawable.ic_menu_close_clear_cancel, "Stop", stopPending)

        return builder.build()
    }

    private fun updateNotification() {
        val manager = getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager ?: return
        manager.notify(NOTIFICATION_ID, buildNotification())
    }

    companion object {
        const val NOTIFICATION_ID = 8002
        const val CHANNEL_ID = "insaan_pomodoro_channel_v1"
        const val ALARM_REQ_CODE = 4001

        const val ACTION_START = "com.insaan.app.action.START_POMODORO"
        const val ACTION_PAUSE = "com.insaan.app.action.PAUSE_POMODORO"
        const val ACTION_RESUME = "com.insaan.app.action.RESUME_POMODORO"
        const val ACTION_STOP = "com.insaan.app.action.STOP_POMODORO"
    }
}

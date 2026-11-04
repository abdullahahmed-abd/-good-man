package com.insaan.app

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.media.RingtoneManager
import android.os.Build
import androidx.core.app.NotificationCompat

class PomodoroAlarmReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val storage = PomodoroStorage(context)
        val taskTitle = storage.taskTitle
        val isBreak = storage.isBreak
        val durationMins = (storage.totalDurationSeconds / 60L).toInt()

        // Clear active timer state
        storage.clear()

        // Stop foreground service
        val stopIntent = Intent(context, PomodoroService::class.java).apply {
            action = PomodoroService.ACTION_STOP
        }
        context.stopService(stopIntent)

        // Show High Priority Alert Notification
        showCompletionNotification(context, taskTitle, isBreak, durationMins)

        // Broadcast to JS plugin
        PomodoroPlugin.broadcastCompleted(context, taskTitle, durationMins, isBreak)
    }

    private fun showCompletionNotification(
        context: Context,
        taskTitle: String,
        isBreak: Boolean,
        durationMins: Int
    ) {
        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager ?: return

        val channelId = "insaan_pomodoro_alert_v1"
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "Focus & Break Completion Alerts",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Sounds and vibrations when a focus or break session finishes"
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 500, 250, 500)
            }
            manager.createNotificationChannel(channel)
        }

        val openAppIntent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val pendingIntent = PendingIntent.getActivity(
            context,
            5001,
            openAppIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val soundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
        val title = if (isBreak) "Break Finished! ⚡" else "Deep Work Completed! 🏆"
        val message = if (isBreak) {
            "Ready to resume focus and make progress?"
        } else {
            "Great job finishing $durationMins min on \"$taskTitle\". Take a well-deserved break!"
        }

        val notification = NotificationCompat.Builder(context, channelId)
            .setContentTitle(title)
            .setContentText(message)
            .setStyle(NotificationCompat.BigTextStyle().bigText(message))
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setSound(soundUri)
            .setVibrate(longArrayOf(0, 500, 250, 500))
            .build()

        manager.notify(7001, notification)
    }
}


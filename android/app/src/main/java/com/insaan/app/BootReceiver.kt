package com.insaan.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build

class BootReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action
        if (action == Intent.ACTION_BOOT_COMPLETED ||
            action == Intent.ACTION_MY_PACKAGE_REPLACED ||
            action == "android.intent.action.QUICKBOOT_POWERON"
        ) {
            val storage = StepStorage(context)

            // Reschedule midnight alarm
            MidnightAlarmReceiver.scheduleMidnightAlarm(context)

            // Start StepService if user had it running
            if (storage.isServiceRunning) {
                val serviceIntent = Intent(context, StepService::class.java).apply {
                    this.action = StepService.ACTION_START
                }
                try {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        context.startForegroundService(serviceIntent)
                    } else {
                        context.startService(serviceIntent)
                    }
                } catch (e: Exception) {
                    // Ignore background launch restrictions
                }

                // Schedule watchdog worker
                WatchdogWorker.schedule(context)
            }
        }
    }
}


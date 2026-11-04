package com.insaan.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.google.android.gms.location.ActivityTransition
import com.google.android.gms.location.ActivityTransitionResult
import com.google.android.gms.location.DetectedActivity

class ActivityTransitionReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        if (!ActivityTransitionResult.hasResult(intent)) return

        val result = ActivityTransitionResult.extractResult(intent) ?: return
        val storage = StepStorage(context)

        for (event in result.transitionEvents) {
            val isEnter = event.transitionType == ActivityTransition.ACTIVITY_TRANSITION_ENTER

            when (event.activityType) {
                DetectedActivity.IN_VEHICLE -> {
                    if (isEnter) {
                        storage.motionStatus = "In Vehicle"
                    } else {
                        // Exited vehicle -> transition to Still temporarily (debounced)
                        if (storage.motionStatus == "In Vehicle") {
                            storage.motionStatus = "Still"
                        }
                    }
                }
                DetectedActivity.ON_BICYCLE -> {
                    if (isEnter) {
                        storage.motionStatus = "Bicycle"
                    } else if (storage.motionStatus == "Bicycle") {
                        storage.motionStatus = "Still"
                    }
                }
                DetectedActivity.WALKING -> {
                    if (isEnter) storage.motionStatus = "Walking"
                }
                DetectedActivity.RUNNING -> {
                    if (isEnter) storage.motionStatus = "Running"
                }
                DetectedActivity.STILL -> {
                    if (isEnter && storage.motionStatus != "In Vehicle") {
                        storage.motionStatus = "Still"
                    }
                }
            }
        }

        // Notify StepService of motion status change to update notification
        val updateIntent = Intent(context, StepService::class.java).apply {
            action = StepService.ACTION_STATUS_CHANGED
        }
        try {
            context.startService(updateIntent)
        } catch (e: Exception) {
            // Service might be running or background restrictions apply
        }
    }
}

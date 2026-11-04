# Insaan Application Specific ProGuard Rules
-keepattributes SourceFile,LineNumberTable,*Annotation*,Signature,InnerClasses,EnclosingMethod

# Keep Insaan native classes, plugins, and services
-keep class com.insaan.app.** { *; }
-keepclassmembers class com.insaan.app.** { *; }

# Keep Capacitor Core & Plugins
-keep class com.getcapacitor.** { *; }
-keepclassmembers class com.getcapacitor.** { *; }
-keep class * extends com.getcapacitor.Plugin { *; }
-keepclassmembers class * extends com.getcapacitor.Plugin {
    @com.getcapacitor.PluginMethod public *;
}

# Keep Google Play Services Location & Activity Recognition
-keep class com.google.android.gms.location.** { *; }
-dontwarn com.google.android.gms.**

# Keep AndroidX WorkManager and Security Crypto
-keep class androidx.work.** { *; }
-keep class androidx.security.crypto.** { *; }
-dontwarn androidx.security.crypto.**

# Keep Kotlin Coroutines
-keepclassmembers class kotlinx.coroutines.** { *; }


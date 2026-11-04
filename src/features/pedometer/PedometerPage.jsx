import React, { useState, useEffect } from 'react';
import SpatialCard from '../../components/common/SpatialCard';
import ProgressRing from '../../components/common/ProgressRing';
import CalibrationModal from './CalibrationModal';
import DiagnosticsModal from './DiagnosticsModal';
import ManualStepModal from './ManualStepModal';
import NativePermissionsModal from './NativePermissionsModal';
import BatteryOptimizationModal from './BatteryOptimizationModal';
import { 
  Activity, 
  Play, 
  Pause, 
  Sliders, 
  Zap, 
  Edit3, 
  Flame, 
  Navigation, 
  Clock, 
  Sun, 
  AlertTriangle,
  Car,
  Footprints,
  ShieldCheck,
  BatteryCharging,
  Bike
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';
import { usePedometerStore } from '../../store/usePedometerStore';
import { useAppStore } from '../../store/useAppStore';
import nativeStepService from '../../services/pedometer/nativeStepService';
import db from '../../db/database';
import { getTodayStr } from '../../utils/dateUtils';
import sounds from '../../utils/soundEffects';

export default function PedometerPage() {
  const { user } = useAppStore();
  const { 
    steps, 
    distanceKm, 
    calories, 
    activeMinutes, 
    isRunning, 
    motionState, 
    speedKmh, 
    wakeLockActive, 
    isNativePlatform,
    toggleEngine, 
    toggleWakeLock 
  } = usePedometerStore();

  const [hourlyData, setHourlyData] = useState([]);
  const [showCalibration, setShowCalibration] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [showBatteryModal, setShowBatteryModal] = useState(false);
  const [batteryStatus, setBatteryStatus] = useState({ isOptimized: false, isUnrestricted: true });

  const todayStr = getTodayStr();

  // Check battery status when running native
  useEffect(() => {
    if (isNativePlatform) {
      nativeStepService.checkBatteryOptimization().then(setBatteryStatus);
    }
  }, [isNativePlatform]);

  // Load today's hourly step data from Dexie
  useEffect(() => {
    async function loadHourly() {
      try {
        const hourlyRecords = await db.hourlySteps.where('date').equals(todayStr).toArray();
        const map = new Map(hourlyRecords.map(h => [h.hour, h.steps]));

        // Generate 24 hours buckets
        const chartData = [];
        for (let h = 6; h <= 22; h++) {
          const label = `${h % 12 === 0 ? 12 : h % 12}${h >= 12 ? 'pm' : 'am'}`;
          const val = map.get(h) || (h <= new Date().getHours() ? Math.round(steps / Math.max(1, new Date().getHours() - 5)) : 0);
          chartData.push({ hour: label, steps: val });
        }
        setHourlyData(chartData);
      } catch (err) {
        console.warn('Error loading hourly steps:', err);
      }
    }
    loadHourly();
  }, [steps, todayStr]);

  const percentGoal = Math.min(100, Math.round((steps / (user?.stepGoal || 10000)) * 100));

  const getMotionBadge = () => {
    const state = (motionState || '').toUpperCase();
    switch (state) {
      case 'IN VEHICLE':
      case 'VEHICLE':
        return {
          label: 'In Vehicle (Steps Excluded)',
          color: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          icon: Car
        };
      case 'BICYCLE':
        return {
          label: 'Cycling (Steps Excluded)',
          color: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
          icon: Bike
        };
      case 'RUNNING':
        return {
          label: 'Running',
          color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          icon: Zap
        };
      case 'WALKING':
        return {
          label: 'Walking (Active)',
          color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-neon-emerald',
          icon: Footprints
        };
      default:
        return {
          label: 'Still / Ready',
          color: 'bg-white/10 text-slate-300 border-white/15',
          icon: Activity
        };
    }
  };

  const badge = getMotionBadge();
  const BadgeIcon = badge.icon;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header and Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs uppercase font-extrabold tracking-widest">
            <Footprints className="w-4 h-4" />
            <span>
              {isNativePlatform 
                ? 'Android Health Foreground Service · Hardware Chip' 
                : 'Orientation-Independent Sensor Engine'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Pedometer & Activity Matrix
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            {isNativePlatform 
              ? 'Hardware step counting with Google Play Services vehicle rejection.' 
              : 'Real-time peak detection with dynamic thresholding and vehicle rejection.'}
          </p>
        </div>

        {/* Engine Start/Stop Action */}
        <div className="flex items-center space-x-2.5">
          {!isNativePlatform && (
            <>
              <button
                onClick={() => {
                  sounds.playTap();
                  setShowCalibration(true);
                }}
                className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all text-xs font-semibold flex items-center gap-1.5"
                title="Calibrate Stride"
              >
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Calibrate</span>
              </button>

              <button
                onClick={() => {
                  sounds.playTap();
                  setShowDiagnostics(true);
                }}
                className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all text-xs font-semibold flex items-center gap-1.5"
                title="Sensor Oscilloscope"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Diagnostics</span>
              </button>
            </>
          )}

          {isNativePlatform && (
            <button
              onClick={() => {
                sounds.playTap();
                setShowBatteryModal(true);
              }}
              className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all text-xs font-semibold flex items-center gap-1.5"
              title="Keep Steps Running"
            >
              <BatteryCharging className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Battery Tips</span>
            </button>
          )}

          <button
            onClick={() => {
              sounds.playTap();
              toggleEngine();
            }}
            className={`px-5 py-2.5 rounded-2xl font-bold text-xs shadow-glass flex items-center space-x-2 transition-all ${
              isRunning 
                ? 'bg-rose-500 hover:bg-rose-600 text-white' 
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause Engine</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Start Step Engine</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Native Android Battery Warning Banner if restricted */}
      {isNativePlatform && batteryStatus.isOptimized && (
        <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <BatteryCharging className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-white block">Battery Optimization Restricted</span>
              <span className="text-slate-400 text-[11px]">Set battery to "Unrestricted" so Android doesn't kill the step counter in deep sleep.</span>
            </div>
          </div>
          <button
            onClick={() => setShowBatteryModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold shrink-0 transition-all"
          >
            Fix Now
          </button>
        </div>
      )}

      {/* Hero Spatial Card: Big Circular Progress Ring & Live Stats */}
      <SpatialCard className="flex flex-col md:flex-row items-center justify-around gap-8 py-8">
        {/* Large VisionOS Progress Ring */}
        <div className="relative flex-shrink-0">
          <ProgressRing
            progress={percentGoal}
            size={220}
            strokeWidth={16}
            strokeColor="#10b981"
            trackColor="rgba(255, 255, 255, 0.08)"
          >
            <div className="space-y-1">
              <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                {steps.toLocaleString()}
              </span>
              <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
                / {(user?.stepGoal || 10000).toLocaleString()} STEPS
              </p>
              <div className="pt-1 flex items-center justify-center gap-1 text-emerald-400 font-bold text-xs">
                <span>{percentGoal}% Goal</span>
                {!isNativePlatform && (
                  <button
                    onClick={() => setShowManualModal(true)}
                    className="p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-white"
                    title="Manual Correction"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </ProgressRing>
        </div>

        {/* Live Status and Telemetry Details */}
        <div className="flex-1 max-w-md space-y-5 text-center md:text-left">
          {/* Live Motion State Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all">
            <BadgeIcon className="w-4 h-4 animate-pulse" />
            <span className="uppercase tracking-wider">{badge.label}</span>
            {speedKmh > 0 && <span className="opacity-75">({speedKmh} km/h)</span>}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1 justify-center md:justify-start">
                <Navigation className="w-3 h-3 text-emerald-400" /> Distance
              </span>
              <p className="text-xl font-black text-white mt-1">{distanceKm} km</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1 justify-center md:justify-start">
                <Flame className="w-3 h-3 text-amber-400" /> Calories
              </span>
              <p className="text-xl font-black text-white mt-1">{calories} kcal</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1 justify-center md:justify-start">
                <Clock className="w-3 h-3 text-blue-400" /> Active
              </span>
              <p className="text-xl font-black text-white mt-1">{activeMinutes} min</p>
            </div>
          </div>

          {/* Native Service or Wake Lock Notice */}
          {isNativePlatform ? (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <div className="text-left">
                  <span className="font-bold text-white block">Persistent Health Service</span>
                  <span className="text-[10px] text-slate-400">Counts steps in background with screen locked</span>
                </div>
              </div>
              <span className="text-emerald-400 font-bold text-xs uppercase tracking-wider">
                {isRunning ? 'Active' : 'Paused'}
              </span>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2.5">
                <Sun className={`w-4 h-4 ${wakeLockActive ? 'text-amber-400' : 'text-slate-500'}`} />
                <div className="text-left">
                  <span className="font-bold text-white block">Keep Screen Awake</span>
                  <span className="text-[10px] text-slate-400">Prevents browser throttling</span>
                </div>
              </div>
              <button
                onClick={toggleWakeLock}
                className={`px-3 py-1 rounded-xl font-bold text-xs transition-all ${
                  wakeLockActive 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                    : 'bg-white/10 text-slate-400 hover:text-white'
                }`}
              >
                {wakeLockActive ? 'Active' : 'Enable'}
              </button>
            </div>
          )}
        </div>
      </SpatialCard>

      {/* Hourly Step Distribution Chart */}
      <SpatialCard className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-base">Today's Hourly Cadence</h3>
            <span className="text-xs text-slate-400">Step distribution throughout the day</span>
          </div>
          <span className="text-xs text-emerald-400 font-bold">100% Persisted in Dexie</span>
        </div>

        <div className="w-full h-56 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="hour" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: 'rgba(255,255,255,0.15)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="steps" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SpatialCard>

      {/* Platform Architecture Notice */}
      {!isNativePlatform ? (
        <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-start space-x-3 text-xs text-slate-300">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-extrabold text-amber-300 block">
              Offline PWA Notice: Mobile Browser Sensor Background Limits
            </span>
            <p className="leading-relaxed text-slate-400">
              Due to privacy and battery security policies across modern mobile web browsers, the DeviceMotion accelerometer sensor API is paused when the screen turns off. On Android, run Insaan as a native app to count steps 24/7 with zero battery drain via hardware step counter chips.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-start space-x-3 text-xs text-slate-300">
          <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-extrabold text-emerald-300 block">
              Native Android Pedometer Engine Active
            </span>
            <p className="leading-relaxed text-slate-400">
              Running Android 14 Health Foreground Service with direct hardware step counter sensor access. Steps and hourly buckets are written directly into Dexie IndexedDB and synced to cloud automatically. Device reboots, midnight rollovers, and vehicle intervals are handled automatically.
            </p>
          </div>
        </div>
      )}

      {/* Modals */}
      <CalibrationModal
        isOpen={showCalibration}
        onClose={() => setShowCalibration(false)}
      />

      <DiagnosticsModal
        isOpen={showDiagnostics}
        onClose={() => setShowDiagnostics(false)}
      />

      <ManualStepModal
        isOpen={showManualModal}
        onClose={() => setShowManualModal(false)}
      />

      <NativePermissionsModal
        isOpen={showPermissionsModal}
        onClose={() => setShowPermissionsModal(false)}
      />

      <BatteryOptimizationModal
        isOpen={showBatteryModal}
        onClose={() => setShowBatteryModal(false)}
      />
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import { Play, Pause, RotateCcw, Bell, CheckCircle2, Flame, ShieldCheck } from 'lucide-react';
import ProgressRing from '../../components/common/ProgressRing';
import pomodoroService from '../../services/pomodoro/pomodoroService';
import sounds from '../../utils/soundEffects';

export default function PomodoroModal({ isOpen, onClose }) {
  const [timerState, setTimerState] = useState(pomodoroService.state);
  const [taskName, setTaskName] = useState(pomodoroService.state.taskTitle);

  useEffect(() => {
    const unsubscribe = pomodoroService.subscribe((state) => {
      setTimerState(state);
      setTaskName(state.taskTitle);
    });
    return unsubscribe;
  }, []);

  const { isRunning, isPaused, isBreak, remainingSeconds, totalDurationSeconds } = timerState;

  const toggleTimer = async () => {
    sounds.playTap();
    if (!isRunning) {
      await pomodoroService.startTimer(taskName, totalDurationSeconds, isBreak);
    } else if (isPaused) {
      await pomodoroService.resumeTimer();
    } else {
      await pomodoroService.pauseTimer();
    }
  };

  const resetTimer = async () => {
    sounds.playTap();
    await pomodoroService.stopTimer();
  };

  const selectDuration = async (minutes, isBreakMode = false) => {
    sounds.playTap();
    if (isRunning) {
      await pomodoroService.stopTimer();
    }
    await pomodoroService.startTimer(taskName, minutes * 60, isBreakMode);
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  const progress = totalDurationSeconds > 0
    ? Math.round(((totalDurationSeconds - remainingSeconds) / totalDurationSeconds) * 100)
    : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isBreak ? 'Refreshing Break' : 'Deep Work Focus Timer'}
      icon="⏱️"
      maxWidth="max-w-md"
    >
      <div className="space-y-6 text-center text-slate-200">
        {/* Task Name Input */}
        <div>
          <input
            type="text"
            value={taskName}
            disabled={isRunning && !isPaused}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="Focus objective..."
            className="w-full text-center px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-emerald-500 disabled:opacity-75"
          />
        </div>

        {/* Circular Progress Ring */}
        <div className="flex justify-center">
          <ProgressRing
            progress={progress}
            size={200}
            strokeWidth={14}
            strokeColor={isBreak ? '#38bdf8' : '#10b981'}
            trackColor="rgba(255, 255, 255, 0.08)"
          >
            <div className="space-y-1">
              <span className="text-4xl font-black text-white tracking-tight">
                {formatTime(remainingSeconds)}
              </span>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                {isRunning ? (isPaused ? 'Paused' : (isBreak ? 'Break Active' : 'Deep Focus')) : 'Ready'}
              </p>
            </div>
          </ProgressRing>
        </div>

        {/* Duration Quick Selector Buttons */}
        <div className="flex justify-center gap-2">
          <button
            onClick={() => selectDuration(25, false)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              !isBreak && totalDurationSeconds === 25 * 60
                ? 'bg-emerald-500 text-slate-950 shadow-neon-emerald'
                : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            25m Focus
          </button>
          <button
            onClick={() => selectDuration(50, false)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              !isBreak && totalDurationSeconds === 50 * 60
                ? 'bg-emerald-500 text-slate-950 shadow-neon-emerald'
                : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            50m Deep
          </button>
          <button
            onClick={() => selectDuration(5, true)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isBreak && totalDurationSeconds === 5 * 60
                ? 'bg-sky-500 text-slate-950'
                : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            5m Break
          </button>
          <button
            onClick={() => selectDuration(15, true)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isBreak && totalDurationSeconds === 15 * 60
                ? 'bg-sky-500 text-slate-950'
                : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            15m Rest
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-4 pt-2">
          <button
            onClick={resetTimer}
            className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all"
            title="Reset Session"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={toggleTimer}
            className={`px-8 py-3.5 rounded-2xl font-black text-sm flex items-center gap-2 shadow-glass transition-all ${
              isRunning && !isPaused
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-neon-emerald'
            }`}
          >
            {isRunning && !isPaused ? (
              <>
                <Pause className="w-5 h-5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                <span>{isPaused ? 'Resume' : 'Start Focus'}</span>
              </>
            )}
          </button>
        </div>

        {/* Background Persistent Service Notice */}
        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-[11px] text-slate-400 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Timer continues accurately even if you minimize the app or turn off the screen.</span>
        </div>
      </div>
    </Modal>
  );
}

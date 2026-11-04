import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import { Play, Pause, RotateCcw, Bell, CheckCircle2, Flame } from 'lucide-react';
import ProgressRing from '../../components/common/ProgressRing';
import db from '../../db/database';
import sounds from '../../utils/soundEffects';
import { useAppStore } from '../../store/useAppStore';
import { getTodayStr } from '../../utils/dateUtils';

export default function PomodoroModal({ isOpen, onClose }) {
  const addXp = useAppStore(state => state.addXp);
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [taskName, setTaskName] = useState('Deep Philosophy Reading & Focus');

  useEffect(() => {
    let timer = null;
    if (isActive && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isActive) {
      // Completed timer!
      setIsActive(false);
      sounds.playBowl();

      if (!isBreak) {
        // Record completed session
        const durationMins = Math.round(totalSeconds / 60);
        db.pomodoroSessions.add({
          date: getTodayStr(),
          durationMinutes: durationMins,
          taskTitle: taskName,
          completedAt: Date.now()
        }).catch(() => {});

        addXp(40, `Finished ${durationMins}m Deep Work session`);

        // Switch to 5 min break
        setIsBreak(true);
        setTotalSeconds(5 * 60);
        setSecondsLeft(5 * 60);
      } else {
        // Switch back to 25 min work
        setIsBreak(false);
        setTotalSeconds(25 * 60);
        setSecondsLeft(25 * 60);
      }
    }
    return () => clearInterval(timer);
  }, [isActive, secondsLeft, isBreak, totalSeconds, taskName, addXp]);

  const toggleTimer = () => {
    sounds.playTap();
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    sounds.playTap();
    setIsActive(false);
    setSecondsLeft(totalSeconds);
  };

  const selectDuration = (minutes, isBreakMode = false) => {
    sounds.playTap();
    setIsActive(false);
    setIsBreak(isBreakMode);
    setTotalSeconds(minutes * 60);
    setSecondsLeft(minutes * 60);
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  const progress = Math.round(((totalSeconds - secondsLeft) / totalSeconds) * 100);

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
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="Focus objective..."
            className="w-full text-center px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Circular Countdown Progress Ring */}
        <div className="flex justify-center py-2">
          <ProgressRing
            progress={progress}
            size={200}
            strokeWidth={12}
            strokeColor={isBreak ? '#38bdf8' : '#10b981'}
            trackColor="rgba(255, 255, 255, 0.08)"
          >
            <div className="space-y-1">
              <span className="text-4xl font-black text-white tracking-wider font-mono">
                {formatTime(secondsLeft)}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-widest">
                {isBreak ? 'Pause & Breathe' : 'Unbroken Focus'}
              </span>
            </div>
          </ProgressRing>
        </div>

        {/* Quick Presets */}
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => selectDuration(25, false)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              totalSeconds === 25 * 60 && !isBreak
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            25m Focus
          </button>
          <button
            onClick={() => selectDuration(50, false)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              totalSeconds === 50 * 60 && !isBreak
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            50m Deep
          </button>
          <button
            onClick={() => selectDuration(5, true)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              totalSeconds === 5 * 60 && isBreak
                ? 'bg-sky-500/20 border-sky-500/50 text-sky-300'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            5m Break
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-3 pt-2">
          <button
            onClick={resetTimer}
            className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Reset"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={toggleTimer}
            className={`px-8 py-3.5 rounded-2xl font-black text-sm shadow-glass flex items-center space-x-2 transition-all ${
              isActive 
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' 
                : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
            }`}
          >
            {isActive ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Start Session</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}


import { Capacitor } from '@capacitor/core';
import { PomodoroPlugin } from '../../plugins/PomodoroPlugin';
import db from '../../db/database';
import { getTodayStr } from '../../utils/dateUtils';
import { useAppStore } from '../../store/useAppStore';
import sounds from '../../utils/soundEffects';

class PomodoroService {
  constructor() {
    this.isNative = Capacitor.isNativePlatform();
    this.subscribers = new Set();
    this.webTimer = null;

    this.state = {
      isRunning: false,
      isPaused: false,
      isBreak: false,
      taskTitle: 'Deep Philosophy Reading & Focus',
      totalDurationSeconds: 25 * 60,
      remainingSeconds: 25 * 60,
      startTimeMillis: 0,
      targetEndTimeMillis: 0
    };

    if (this.isNative) {
      this.initNative();
    }
  }

  async initNative() {
    try {
      const current = await PomodoroPlugin.getState();
      if (current.isRunning) {
        this.updateState({
          ...current,
          remainingSeconds: current.remainingSeconds
        });
      }

      await PomodoroPlugin.addListener('pomodoroTick', (data) => {
        this.updateState({
          remainingSeconds: data.remainingSeconds,
          totalDurationSeconds: data.totalDurationSeconds,
          isPaused: data.isPaused,
          isBreak: data.isBreak,
          isRunning: true
        });
      });

      await PomodoroPlugin.addListener('pomodoroCompleted', async (session) => {
        await this.handleSessionCompleted(session.taskTitle, session.durationMinutes, session.isBreak);
        this.updateState({
          isRunning: false,
          isPaused: false,
          remainingSeconds: this.state.totalDurationSeconds
        });
      });
    } catch (e) {
      console.warn('PomodoroService native init warning:', e);
    }
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    callback(this.state);
    return () => this.subscribers.delete(callback);
  }

  notify() {
    for (const cb of this.subscribers) {
      try {
        cb(this.state);
      } catch (e) {
        console.error(e);
      }
    }
  }

  updateState(partial) {
    this.state = { ...this.state, ...partial };
    this.notify();
  }

  async startTimer(taskTitle, durationSeconds, isBreak = false) {
    const now = Date.now();
    const targetEnd = now + (durationSeconds * 1000);

    this.updateState({
      isRunning: true,
      isPaused: false,
      isBreak,
      taskTitle: taskTitle || this.state.taskTitle,
      totalDurationSeconds: durationSeconds,
      remainingSeconds: durationSeconds,
      startTimeMillis: now,
      targetEndTimeMillis: targetEnd
    });

    if (this.isNative) {
      await PomodoroPlugin.start({
        taskTitle: this.state.taskTitle,
        durationSeconds,
        isBreak
      });
    } else {
      this.startWebTicker();
    }
  }

  async pauseTimer() {
    if (this.isNative) {
      await PomodoroPlugin.pause();
    } else {
      this.stopWebTicker();
    }
    this.updateState({ isPaused: true });
  }

  async resumeTimer() {
    const remaining = this.state.remainingSeconds;
    const now = Date.now();
    const targetEnd = now + (remaining * 1000);

    this.updateState({
      isPaused: false,
      startTimeMillis: now,
      targetEndTimeMillis: targetEnd
    });

    if (this.isNative) {
      await PomodoroPlugin.resume();
    } else {
      this.startWebTicker();
    }
  }

  async stopTimer() {
    if (this.isNative) {
      await PomodoroPlugin.stop();
    } else {
      this.stopWebTicker();
    }

    this.updateState({
      isRunning: false,
      isPaused: false,
      remainingSeconds: this.state.totalDurationSeconds,
      targetEndTimeMillis: 0
    });
  }

  startWebTicker() {
    this.stopWebTicker();
    this.webTimer = setInterval(() => {
      if (!this.state.isRunning || this.state.isPaused) return;

      const now = Date.now();
      const remaining = Math.max(0, Math.round((this.state.targetEndTimeMillis - now) / 1000));

      this.updateState({ remainingSeconds: remaining });

      if (remaining <= 0) {
        this.stopWebTicker();
        sounds.playBowl();
        const durationMins = Math.round(this.state.totalDurationSeconds / 60);
        this.handleSessionCompleted(this.state.taskTitle, durationMins, this.state.isBreak);

        // Switch modes
        const nextIsBreak = !this.state.isBreak;
        const nextDuration = nextIsBreak ? 5 * 60 : 25 * 60;
        this.updateState({
          isRunning: false,
          isPaused: false,
          isBreak: nextIsBreak,
          totalDurationSeconds: nextDuration,
          remainingSeconds: nextDuration
        });
      }
    }, 1000);
  }

  stopWebTicker() {
    if (this.webTimer) {
      clearInterval(this.webTimer);
      this.webTimer = null;
    }
  }

  async handleSessionCompleted(taskTitle, durationMinutes, isBreak) {
    if (!isBreak) {
      try {
        await db.pomodoroSessions.add({
          id: crypto.randomUUID(),
          date: getTodayStr(),
          durationMinutes,
          taskTitle,
          completedAt: Date.now(),
          _dirty: 1, // Marks row for Cloud Sync Outbox
          updatedAt: new Date().toISOString()
        });

        // Award 40 XP to user profile
        useAppStore.getState().addXp(40, `Finished ${durationMinutes}m Deep Work session`);
      } catch (err) {
        console.warn('Failed to persist pomodoro session:', err);
      }
    }
  }
}

export const pomodoroService = new PomodoroService();
export default pomodoroService;

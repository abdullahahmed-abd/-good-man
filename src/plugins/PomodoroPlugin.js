import { registerPlugin } from '@capacitor/core';

export const PomodoroPlugin = registerPlugin('PomodoroPlugin', {
  web: () => ({
    start: async () => ({ success: true }),
    pause: async () => ({ success: true }),
    resume: async () => ({ success: true }),
    stop: async () => ({ success: true }),
    getState: async () => ({
      isRunning: false,
      isPaused: false,
      isBreak: false,
      taskTitle: 'Deep Work',
      totalDurationSeconds: 25 * 60,
      remainingSeconds: 25 * 60,
      startTimeMillis: 0,
      targetEndTimeMillis: 0
    })
  })
});

export default PomodoroPlugin;


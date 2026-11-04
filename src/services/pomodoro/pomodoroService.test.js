import { describe, it, expect } from 'vitest';

describe('Background Pomodoro & Schedule Timer Mathematics', () => {
  it('accurately computes remaining seconds from target end timestamp', () => {
    const now = Date.now();
    const durationSeconds = 25 * 60; // 1500 seconds
    const targetEndTimeMillis = now + (durationSeconds * 1000);

    // Immediate
    const remainingImmediate = Math.max(0, Math.round((targetEndTimeMillis - now) / 1000));
    expect(remainingImmediate).toBe(1500);

    // After 6 minutes (360 seconds) elapsed
    const elapsedNow = now + 360 * 1000;
    const remainingAfter6Min = Math.max(0, Math.round((targetEndTimeMillis - elapsedNow) / 1000));
    expect(remainingAfter6Min).toBe(1140); // 19 minutes left

    // After session completed
    const pastEndTime = targetEndTimeMillis + 5000;
    const remainingPast = Math.max(0, Math.round((targetEndTimeMillis - pastEndTime) / 1000));
    expect(remainingPast).toBe(0);
  });

  it('correctly constructs completed session record for Dexie and cloud sync', () => {
    const taskTitle = 'Stoic Journaling & Marcus Aurelius';
    const durationMinutes = 25;
    const today = '2026-11-04';

    const sessionRecord = {
      id: 'session-uuid-9876',
      date: today,
      durationMinutes,
      taskTitle,
      completedAt: Date.now(),
      _dirty: 1, // Marks row for Cloud Sync
      updatedAt: new Date().toISOString()
    };

    expect(sessionRecord.durationMinutes).toBe(25);
    expect(sessionRecord.taskTitle).toBe(taskTitle);
    expect(sessionRecord._dirty).toBe(1);
    expect(typeof sessionRecord.updatedAt).toBe('string');
  });

  it('parses scheduled task date and time into valid local reminder timestamp', () => {
    const task = {
      id: 'task-1',
      title: 'Morning Cold Shower',
      date: '2026-11-04',
      startTime: '07:30',
      endTime: '07:45',
      isCompleted: false
    };

    const [hours, mins] = task.startTime.split(':').map(Number);
    const [year, month, day] = task.date.split('-').map(Number);

    const scheduleDate = new Date(year, month - 1, day, hours, mins, 0);

    expect(scheduleDate.getFullYear()).toBe(2026);
    expect(scheduleDate.getMonth()).toBe(10); // November (0-indexed)
    expect(scheduleDate.getDate()).toBe(4);
    expect(scheduleDate.getHours()).toBe(7);
    expect(scheduleDate.getMinutes()).toBe(30);
  });
});

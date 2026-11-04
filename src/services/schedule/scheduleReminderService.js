import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import db from '../../db/database';

function hashStringToNumber(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash % 100000);
}

class ScheduleReminderService {
  constructor() {
    this.isNative = Capacitor.isNativePlatform();
  }

  async checkPermission() {
    if (!this.isNative) return true;
    try {
      const status = await LocalNotifications.checkPermissions();
      if (status.display === 'granted') return true;
      const requested = await LocalNotifications.requestPermissions();
      return requested.display === 'granted';
    } catch (e) {
      return false;
    }
  }

  /**
   * Schedules a local notification for a task at its designated date and startTime.
   */
  async scheduleTaskReminder(task) {
    if (!this.isNative || !task.date || !task.startTime || task.isCompleted) return;

    try {
      const hasPermission = await this.checkPermission();
      if (!hasPermission) return;

      const [hours, mins] = task.startTime.split(':').map(Number);
      const [year, month, day] = task.date.split('-').map(Number);

      const scheduleDate = new Date(year, month - 1, day, hours, mins, 0);

      // Only schedule if time is in future
      if (scheduleDate.getTime() <= Date.now()) return;

      const notificationId = hashStringToNumber(task.id || task.title);

      await LocalNotifications.schedule({
        notifications: [
          {
            id: notificationId,
            title: `Task Time: ${task.title}`,
            body: `Scheduled time block begins now (${task.startTime}). Stay focused!`,
            schedule: { at: scheduleDate, allowWhileIdle: true },
            sound: 'beep.wav',
            smallIcon: 'ic_launcher',
            actionTypeId: '',
            extra: { taskId: task.id }
          }
        ]
      });
    } catch (err) {
      console.warn('Failed to schedule local reminder for task:', err);
    }
  }

  async cancelTaskReminder(task) {
    if (!this.isNative || !task) return;
    try {
      const notificationId = hashStringToNumber(task.id || task.title);
      await LocalNotifications.cancel({
        notifications: [{ id: notificationId }]
      });
    } catch (err) {
      console.warn('Failed to cancel task reminder:', err);
    }
  }

  /**
   * Reschedules reminders for all upcoming incomplete tasks from Dexie
   */
  async syncAllUpcomingReminders() {
    if (!this.isNative) return;
    try {
      const tasks = await db.scheduleTasks.toArray();
      const incomplete = tasks.filter(t => !t.isCompleted && !t.deletedAt);
      for (const t of incomplete) {
        await this.scheduleTaskReminder(t);
      }
    } catch (e) {
      console.warn('syncAllUpcomingReminders error:', e);
    }
  }
}

export const scheduleReminderService = new ScheduleReminderService();
export default scheduleReminderService;


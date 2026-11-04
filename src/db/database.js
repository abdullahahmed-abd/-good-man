import Dexie from 'dexie';

export const db = new Dexie('InsaanDatabase');

// Version 1 (Legacy Initial Schema)
db.version(1).stores({
  steps: '++id, date, timestamp, steps, distanceKm, calories, activeMinutes',
  hourlySteps: '++id, date, hour, steps',
  books: 'id, title, author, category, isPublicDomain, coverColor',
  userBookNotes: '++id, [bookId+chapterIndex], bookId, chapterIndex, title, content, updatedAt',
  readingProgress: 'bookId, status, currentChapter, currentPage, totalChapters, percent, rating, updatedAt',
  habits: 'id, title, identity, cue, craving, response, reward, twoMinuteRule, category, frequency, targetDaysPerWeek, createdAt, archived',
  habitLogs: '++id, [habitId+date], habitId, date, completed, value',
  scheduleTasks: 'id, title, category, date, startTime, endTime, isRecurring, recurringDays, isCompleted, priority',
  pomodoroSessions: '++id, date, durationMinutes, taskTitle, completedAt',
  transactions: 'id, type, amount, category, date, note, paymentMethod',
  budgets: 'category, monthlyLimit',
  savingsGoals: 'id, title, targetAmount, currentAmount, targetDate, color',
  virtueRatings: 'id, date, honesty, patience, kindness, courage, gratitude, humility, reflection',
  journalEntries: 'id, date, type, title, content, mood, tags, createdAt',
  moodLogs: 'id, date, timestamp, score, note, emotionTags',
  achievements: 'badgeId, unlockedAt, progress',
  userProfile: 'id, name, level, xp, heightCm, weightKg, stepGoal, waterGoal, theme, language'
});

// Version 2 (Production Cloud Sync Upgrade)
// Adds client UUIDs, _dirty outbox index, updatedAt ISO string, deletedAt tombstone, syncedAt
db.version(2).stores({
  // Sync Meta Table (Pull cursors & last sync timestamps per table)
  syncMeta: 'key, value',

  // Sync Entities (Each has indexed _dirty for instant outbox querying)
  userProfile: 'id, _dirty, updatedAt, deletedAt',
  steps: 'id, date, _dirty, updatedAt, deletedAt',
  hourlySteps: 'id, date, hour, _dirty, updatedAt, deletedAt',
  customBooks: 'id, _dirty, updatedAt, deletedAt',
  books: 'id, title, author, category, isPublicDomain', // Local bundled static cache
  userBookNotes: 'id, bookId, chapterIndex, [bookId+chapterIndex], _dirty, updatedAt, deletedAt',
  readingProgress: 'id, bookId, _dirty, updatedAt, deletedAt',
  habits: 'id, category, _dirty, updatedAt, deletedAt',
  habitLogs: 'id, habitId, date, [habitId+date], _dirty, updatedAt, deletedAt',
  scheduleTasks: 'id, date, _dirty, updatedAt, deletedAt',
  pomodoroSessions: 'id, date, _dirty, updatedAt, deletedAt',
  transactions: 'id, date, type, _dirty, updatedAt, deletedAt',
  budgets: 'id, category, _dirty, updatedAt, deletedAt',
  savingsGoals: 'id, _dirty, updatedAt, deletedAt',
  virtueRatings: 'id, date, _dirty, updatedAt, deletedAt',
  journalEntries: 'id, date, type, createdAt, _dirty, updatedAt, deletedAt',
  moodLogs: 'id, date, _dirty, updatedAt, deletedAt',
  achievements: 'id, badgeId, _dirty, updatedAt, deletedAt'
}).upgrade(async (tx) => {
  // Safe migration: ensure all rows have valid UUIDs, _dirty=1 for initial sync, and valid updatedAt
  const now = new Date().toISOString();
  const tables = [
    'steps', 'hourlySteps', 'userBookNotes', 'readingProgress', 'habits',
    'habitLogs', 'scheduleTasks', 'pomodoroSessions', 'transactions', 'budgets',
    'savingsGoals', 'virtueRatings', 'journalEntries', 'moodLogs', 'achievements', 'userProfile'
  ];

  for (const table of tables) {
    try {
      await tx.table(table).toCollection().modify((row) => {
        if (!row.id || typeof row.id === 'number' || !String(row.id).includes('-')) {
          row.id = crypto.randomUUID();
        }
        if (row._dirty === undefined) row._dirty = 1;
        if (!row.updatedAt) row.updatedAt = now;
        if (row.deletedAt === undefined) row.deletedAt = null;
      });
    } catch (e) {
      // Table upgrade fallback
    }
  }
});

// Helper for soft delete
export async function softDeleteRow(tableName, id) {
  const now = new Date().toISOString();
  await db[tableName].update(id, {
    deletedAt: now,
    updatedAt: now,
    _dirty: 1
  });
}

// Helper to query non-deleted active records
export async function getActiveRows(tableName, filterFn) {
  const all = await db[tableName].toArray();
  const active = all.filter(r => !r.deletedAt);
  return filterFn ? active.filter(filterFn) : active;
}

export default db;

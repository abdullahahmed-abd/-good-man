import { 
  pgTable, 
  uuid, 
  varchar, 
  text, 
  boolean, 
  integer, 
  doublePrecision, 
  timestamp, 
  index, 
  check, 
  uniqueIndex 
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// ==========================================
// 1. CORE AUTHENTICATION TABLES
// ==========================================

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  isEmailVerified: boolean('is_email_verified').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => [
  uniqueIndex('users_email_unique_idx').on(table.email)
]);

export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  tokenHash: varchar('token_hash', { length: 64 }).notNull(),
  familyId: uuid('family_id').notNull(),
  deviceLabel: varchar('device_label', { length: 255 }).default('Unknown Device').notNull(),
  userAgent: text('user_agent'),
  ipHash: varchar('ip_hash', { length: 64 }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  replacedBy: varchar('replaced_by', { length: 64 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => [
  uniqueIndex('refresh_tokens_hash_idx').on(table.tokenHash),
  index('refresh_tokens_user_family_idx').on(table.userId, table.familyId)
]);

export const emailTokens = pgTable('email_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  tokenHash: varchar('token_hash', { length: 64 }).notNull(),
  type: varchar('type', { length: 32 }).notNull(), // 'verify_email' | 'password_reset'
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  usedAt: timestamp('used_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => [
  uniqueIndex('email_tokens_hash_idx').on(table.tokenHash),
  index('email_tokens_user_type_idx').on(table.userId, table.type)
]);

// ==========================================
// 2. HELPER TO CREATE REUSABLE SYNC COLUMNS
// ==========================================

const baseSyncColumns = () => ({
  id: uuid('id').primaryKey(), // Generated client-side for offline-first support
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  clientUpdatedAt: timestamp('client_updated_at', { withTimezone: true }).notNull(),
  serverUpdatedAt: timestamp('server_updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }) // Soft delete tombstone
});

// ==========================================
// 3. THE 17 SYNC TABLES (Dexie Entities)
// ==========================================

// 1. User Profile
export const userProfile = pgTable('user_profile', {
  ...baseSyncColumns(),
  name: varchar('name', { length: 100 }).notNull(),
  avatar: varchar('avatar', { length: 32 }).default('🧘‍♂️').notNull(),
  totalXp: integer('total_xp').default(0).notNull(),
  heightCm: doublePrecision('height_cm').default(175).notNull(),
  weightKg: doublePrecision('weight_kg').default(70).notNull(),
  stepGoal: integer('step_goal').default(8000).notNull(),
  currency: varchar('currency', { length: 10 }).default('INR').notNull(),
  birthDate: varchar('birth_date', { length: 32 }),
  expectedLifespan: integer('expected_lifespan').default(80).notNull(),
  language: varchar('language', { length: 20 }).default('en').notNull(),
  theme: varchar('theme', { length: 20 }).default('dark').notNull()
}, (table) => [
  index('sync_user_profile_cursor_idx').on(table.userId, table.serverUpdatedAt, table.id),
  check('chk_user_profile_xp', sql`${table.totalXp} >= 0`),
  check('chk_user_profile_height', sql`${table.heightCm} > 0`),
  check('chk_user_profile_step_goal', sql`${table.stepGoal} > 0`)
]);

// 2. Steps Daily
export const stepsDaily = pgTable('steps_daily', {
  ...baseSyncColumns(),
  date: varchar('date', { length: 10 }).notNull(), // YYYY-MM-DD
  steps: integer('steps').notNull(),
  distanceKm: doublePrecision('distance_km').notNull(),
  calories: integer('calories').notNull(),
  activeMinutes: integer('active_minutes').notNull()
}, (table) => [
  index('sync_steps_daily_cursor_idx').on(table.userId, table.serverUpdatedAt, table.id),
  check('chk_steps_daily_non_neg', sql`${table.steps} >= 0 AND ${table.distanceKm} >= 0 AND ${table.calories} >= 0 AND ${table.activeMinutes} >= 0`)
]);

// 3. Hourly Steps
export const hourlySteps = pgTable('hourly_steps', {
  ...baseSyncColumns(),
  date: varchar('date', { length: 10 }).notNull(),
  hour: integer('hour').notNull(),
  steps: integer('steps').notNull()
}, (table) => [
  index('sync_hourly_steps_cursor_idx').on(table.userId, table.serverUpdatedAt, table.id),
  check('chk_hourly_steps_hour', sql`${table.hour} >= 0 AND ${table.hour} <= 23`),
  check('chk_hourly_steps_count', sql`${table.steps} >= 0`)
]);

// 4. Custom Books
export const customBooks = pgTable('custom_books', {
  ...baseSyncColumns(),
  title: varchar('title', { length: 300 }).notNull(),
  author: varchar('author', { length: 200 }).notNull(),
  category: varchar('category', { length: 100 }).default('Philosophy').notNull(),
  description: text('description').default('').notNull(),
  coverColor: varchar('cover_color', { length: 100 }).default('from-emerald-700 to-indigo-950').notNull(),
  chaptersJson: text('chapters_json').default('[]').notNull()
}, (table) => [
  index('sync_custom_books_cursor_idx').on(table.userId, table.serverUpdatedAt, table.id)
]);

// 5. User Book Notes
export const userBookNotes = pgTable('user_book_notes', {
  ...baseSyncColumns(),
  bookId: varchar('book_id', { length: 100 }).notNull(),
  chapterIndex: integer('chapter_index').notNull(),
  title: varchar('title', { length: 300 }).notNull(),
  content: text('content').notNull()
}, (table) => [
  index('sync_user_book_notes_cursor_idx').on(table.userId, table.serverUpdatedAt, table.id),
  check('chk_user_book_notes_ch_idx', sql`${table.chapterIndex} >= 0`)
]);

// 6. Reading Progress
export const readingProgress = pgTable('reading_progress', {
  ...baseSyncColumns(),
  bookId: varchar('book_id', { length: 100 }).notNull(),
  status: varchar('status', { length: 32 }).default('reading').notNull(),
  currentChapter: integer('current_chapter').default(0).notNull(),
  currentPage: integer('current_page').default(0).notNull(),
  totalChapters: integer('total_chapters').default(1).notNull(),
  percent: integer('percent').default(0).notNull(),
  rating: integer('rating').default(0).notNull()
}, (table) => [
  index('sync_reading_progress_cursor_idx').on(table.userId, table.serverUpdatedAt, table.id),
  check('chk_reading_progress_percent', sql`${table.percent} >= 0 AND ${table.percent} <= 100`),
  check('chk_reading_progress_rating', sql`${table.rating} >= 0 AND ${table.rating} <= 5`)
]);

// 7. Habits
export const habits = pgTable('habits', {
  ...baseSyncColumns(),
  title: varchar('title', { length: 300 }).notNull(),
  identity: varchar('identity', { length: 300 }).default('').notNull(),
  cue: varchar('cue', { length: 300 }).default('').notNull(),
  craving: varchar('craving', { length: 300 }).default('').notNull(),
  response: varchar('response', { length: 300 }).default('').notNull(),
  reward: varchar('reward', { length: 300 }).default('').notNull(),
  twoMinuteRule: varchar('two_minute_rule', { length: 300 }).default('').notNull(),
  category: varchar('category', { length: 100 }).default('Wisdom').notNull(),
  frequency: varchar('frequency', { length: 50 }).default('daily').notNull(),
  targetDaysPerWeek: integer('target_days_per_week').default(7).notNull(),
  archived: integer('archived').default(0).notNull()
}, (table) => [
  index('sync_habits_cursor_idx').on(table.userId, table.serverUpdatedAt, table.id),
  check('chk_habits_days', sql`${table.targetDaysPerWeek} >= 1 AND ${table.targetDaysPerWeek} <= 7`)
]);

// 8. Habit Logs
export const habitLogs = pgTable('habit_logs', {
  ...baseSyncColumns(),
  habitId: uuid('habit_id').notNull(),
  date: varchar('date', { length: 10 }).notNull(),
  completed: boolean('completed').default(true).notNull(),
  value: doublePrecision('value').default(1).notNull()
}, (table) => [
  index('sync_habit_logs_cursor_idx').on(table.userId, table.serverUpdatedAt, table.id)
]);

// 9. Schedule Tasks
export const scheduleTasks = pgTable('schedule_tasks', {
  ...baseSyncColumns(),
  title: varchar('title', { length: 300 }).notNull(),
  category: varchar('category', { length: 100 }).default('Work & Deep Work').notNull(),
  date: varchar('date', { length: 10 }).notNull(),
  startTime: varchar('start_time', { length: 10 }).default('09:00').notNull(),
  endTime: varchar('end_time', { length: 10 }).default('10:00').notNull(),
  isRecurring: boolean('is_recurring').default(false).notNull(),
  recurringDaysJson: text('recurring_days_json').default('[]').notNull(),
  isCompleted: boolean('is_completed').default(false).notNull(),
  priority: varchar('priority', { length: 20 }).default('medium').notNull()
}, (table) => [
  index('sync_schedule_tasks_cursor_idx').on(table.userId, table.serverUpdatedAt, table.id)
]);

// 10. Pomodoro Sessions
export const pomodoroSessions = pgTable('pomodoro_sessions', {
  ...baseSyncColumns(),
  date: varchar('date', { length: 10 }).notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  taskTitle: varchar('task_title', { length: 300 }).notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }).notNull()
}, (table) => [
  index('sync_pomodoro_sessions_cursor_idx').on(table.userId, table.serverUpdatedAt, table.id),
  check('chk_pomodoro_duration', sql`${table.durationMinutes} > 0`)
]);

// 11. Transactions
export const transactions = pgTable('transactions', {
  ...baseSyncColumns(),
  type: varchar('type', { length: 20 }).notNull(), // 'income' | 'expense'
  amount: doublePrecision('amount').notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  date: varchar('date', { length: 10 }).notNull(),
  note: varchar('note', { length: 500 }).default('').notNull(),
  paymentMethod: varchar('payment_method', { length: 100 }).default('UPI / Digital').notNull()
}, (table) => [
  index('sync_transactions_cursor_idx').on(table.userId, table.serverUpdatedAt, table.id),
  check('chk_transactions_amount', sql`${table.amount} > 0`)
]);

// 12. Budgets
export const budgets = pgTable('budgets', {
  ...baseSyncColumns(),
  category: varchar('category', { length: 100 }).notNull(),
  monthlyLimit: doublePrecision('monthly_limit').notNull()
}, (table) => [
  index('sync_budgets_cursor_idx').on(table.userId, table.serverUpdatedAt, table.id),
  check('chk_budgets_limit', sql`${table.monthlyLimit} >= 0`)
]);

// 13. Savings Goals
export const savingsGoals = pgTable('savings_goals', {
  ...baseSyncColumns(),
  title: varchar('title', { length: 300 }).notNull(),
  targetAmount: doublePrecision('target_amount').notNull(),
  currentAmount: doublePrecision('current_amount').default(0).notNull(),
  targetDate: varchar('target_date', { length: 32 }).default('2026-12-31').notNull(),
  color: varchar('color', { length: 32 }).default('#10b981').notNull()
}, (table) => [
  index('sync_savings_goals_cursor_idx').on(table.userId, table.serverUpdatedAt, table.id),
  check('chk_savings_target', sql`${table.targetAmount} > 0`),
  check('chk_savings_current', sql`${table.currentAmount} >= 0`)
]);

// 14. Virtue Ratings
export const virtueRatings = pgTable('virtue_ratings', {
  ...baseSyncColumns(),
  date: varchar('date', { length: 10 }).notNull(),
  honesty: integer('honesty').default(4).notNull(),
  patience: integer('patience').default(4).notNull(),
  kindness: integer('kindness').default(4).notNull(),
  courage: integer('courage').default(4).notNull(),
  gratitude: integer('gratitude').default(4).notNull(),
  humility: integer('humility').default(4).notNull(),
  reflection: text('reflection').default('').notNull()
}, (table) => [
  index('sync_virtue_ratings_cursor_idx').on(table.userId, table.serverUpdatedAt, table.id),
  check('chk_virtues_range', sql`
    ${table.honesty} BETWEEN 1 AND 5 AND
    ${table.patience} BETWEEN 1 AND 5 AND
    ${table.kindness} BETWEEN 1 AND 5 AND
    ${table.courage} BETWEEN 1 AND 5 AND
    ${table.gratitude} BETWEEN 1 AND 5 AND
    ${table.humility} BETWEEN 1 AND 5
  `)
]);

// 15. Journal Entries (Supports optional E2EE ciphertext in content)
export const journalEntries = pgTable('journal_entries', {
  ...baseSyncColumns(),
  date: varchar('date', { length: 10 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  title: varchar('title', { length: 300 }).default('').notNull(),
  content: text('content').notNull(), // Client-side ciphertext if E2EE is enabled!
  mood: varchar('mood', { length: 50 }),
  tagsJson: text('tags_json').default('[]').notNull()
}, (table) => [
  index('sync_journal_entries_cursor_idx').on(table.userId, table.serverUpdatedAt, table.id)
]);

// 16. Mood Logs
export const moodLogs = pgTable('mood_logs', {
  ...baseSyncColumns(),
  date: varchar('date', { length: 10 }).notNull(),
  score: integer('score').notNull(),
  note: text('note').default('').notNull(),
  emotionTagsJson: text('emotion_tags_json').default('[]').notNull()
}, (table) => [
  index('sync_mood_logs_cursor_idx').on(table.userId, table.serverUpdatedAt, table.id),
  check('chk_mood_score', sql`${table.score} BETWEEN 1 AND 10`)
]);

// 17. Achievements
export const achievements = pgTable('achievements', {
  ...baseSyncColumns(),
  badgeId: varchar('badge_id', { length: 100 }).notNull(),
  unlockedAt: timestamp('unlocked_at', { withTimezone: true }).notNull(),
  progress: doublePrecision('progress').default(100).notNull()
}, (table) => [
  index('sync_achievements_cursor_idx').on(table.userId, table.serverUpdatedAt, table.id),
  check('chk_achievements_progress', sql`${table.progress} >= 0 AND ${table.progress} <= 100`)
]);

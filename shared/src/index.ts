import { z } from 'zod';

// ==========================================
// 1. AUTHENTICATION & ACCOUNT SCHEMAS
// ==========================================

export const COMMON_PASSWORDS = new Set([
  'password', 'password123', 'password1234', '1234567890', 'qwertyuiop', 'letmein123',
  'iloveyou12', 'admin12345', 'welcome123', 'monkey1234', 'dragon1234',
  'sunshine12', 'princess12', 'trustnoone1', 'starwars12', 'master1234'
]);

export const EmailSchema = z.string()
  .trim()
  .toLowerCase()
  .email('Invalid email address')
  .max(255, 'Email is too long');

export const PasswordSchema = z.string()
  .min(10, 'Password must be at least 10 characters long')
  .max(128, 'Password cannot exceed 128 characters')
  .refine(
    (pwd) => !COMMON_PASSWORDS.has(pwd.toLowerCase()),
    { message: 'This password is too common and easily guessed. Please choose a more secure password.' }
  );

export const SignupInputSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  name: z.string().trim().max(100).optional().default('Seeker')
});
export type SignupInput = z.infer<typeof SignupInputSchema>;

export const LoginInputSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, 'Password is required').max(128)
});
export type LoginInput = z.infer<typeof LoginInputSchema>;

export const VerifyEmailInputSchema = z.object({
  token: z.string().min(16).max(128)
});
export type VerifyEmailInput = z.infer<typeof VerifyEmailInputSchema>;

export const ResendVerificationInputSchema = z.object({
  email: EmailSchema
});
export type ResendVerificationInput = z.infer<typeof ResendVerificationInputSchema>;

export const ForgotPasswordInputSchema = z.object({
  email: EmailSchema
});
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordInputSchema>;

export const ResetPasswordInputSchema = z.object({
  token: z.string().min(16).max(128),
  newPassword: PasswordSchema
});
export type ResetPasswordInput = z.infer<typeof ResetPasswordInputSchema>;

export const ChangePasswordInputSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: PasswordSchema
});
export type ChangePasswordInput = z.infer<typeof ChangePasswordInputSchema>;

export const DeleteAccountInputSchema = z.object({
  password: z.string().min(1).max(128)
});
export type DeleteAccountInput = z.infer<typeof DeleteAccountInputSchema>;

export const SessionInfoSchema = z.object({
  id: z.string().uuid(),
  deviceLabel: z.string(),
  userAgent: z.string().nullable(),
  ipHash: z.string().nullable(),
  createdAt: z.string(),
  lastUsedAt: z.string(),
  isCurrent: z.boolean()
});
export type SessionInfo = z.infer<typeof SessionInfoSchema>;

export const UserPublicSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().optional(),
  isEmailVerified: z.boolean(),
  createdAt: z.string()
});
export type UserPublic = z.infer<typeof UserPublicSchema>;

// ==========================================
// 2. BASE SYNC ENTITY SCHEMAS
// ==========================================

export const BaseSyncEntitySchema = z.object({
  id: z.string().uuid('Entity ID must be a valid UUID'),
  client_updated_at: z.string().datetime({ message: 'client_updated_at must be an ISO datetime string' }),
  server_updated_at: z.string().datetime().optional(),
  created_at: z.string().datetime().optional(),
  deleted_at: z.string().datetime().nullable().optional()
});

// 1. User Profile Sync
export const UserProfileSyncSchema = BaseSyncEntitySchema.extend({
  name: z.string().max(100),
  avatar: z.string().max(32).default('🧘‍♂️'),
  total_xp: z.number().int().min(0).default(0),
  height_cm: z.number().min(50).max(280).default(175),
  weight_kg: z.number().min(20).max(400).default(70),
  step_goal: z.number().int().min(100).max(100000).default(8000),
  currency: z.string().max(10).default('INR'),
  birth_date: z.string().max(32).nullable().optional(),
  expected_lifespan: z.number().int().min(40).max(120).default(80),
  language: z.string().max(20).default('en'),
  theme: z.string().max(20).default('dark')
});
export type UserProfileSync = z.infer<typeof UserProfileSyncSchema>;

// 2. Steps Daily
export const StepsDailySyncSchema = BaseSyncEntitySchema.extend({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  steps: z.number().int().min(0).max(200000),
  distance_km: z.number().min(0).max(500),
  calories: z.number().int().min(0).max(30000),
  active_minutes: z.number().int().min(0).max(1440)
});
export type StepsDailySync = z.infer<typeof StepsDailySyncSchema>;

// 3. Hourly Steps
export const HourlyStepsSyncSchema = BaseSyncEntitySchema.extend({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  hour: z.number().int().min(0).max(23),
  steps: z.number().int().min(0).max(50000)
});
export type HourlyStepsSync = z.infer<typeof HourlyStepsSyncSchema>;

// 4. Custom Books
export const CustomBooksSyncSchema = BaseSyncEntitySchema.extend({
  title: z.string().min(1).max(300),
  author: z.string().min(1).max(200),
  category: z.string().max(100).default('Philosophy'),
  description: z.string().max(3000).default(''),
  cover_color: z.string().max(100).default('from-emerald-700 to-indigo-950'),
  chapters_json: z.string().max(500000).default('[]') // JSON serialized chapters array
});
export type CustomBooksSync = z.infer<typeof CustomBooksSyncSchema>;

// 5. User Book Notes (Chapter notes)
export const UserBookNotesSyncSchema = BaseSyncEntitySchema.extend({
  book_id: z.string().max(100),
  chapter_index: z.number().int().min(0),
  title: z.string().max(300),
  content: z.string().max(100000)
});
export type UserBookNotesSync = z.infer<typeof UserBookNotesSyncSchema>;

// 6. Reading Progress
export const ReadingProgressSyncSchema = BaseSyncEntitySchema.extend({
  book_id: z.string().max(100),
  status: z.enum(['not_started', 'reading', 'finished']).default('reading'),
  current_chapter: z.number().int().min(0).default(0),
  current_page: z.number().int().min(0).default(0),
  total_chapters: z.number().int().min(1).default(1),
  percent: z.number().int().min(0).max(100).default(0),
  rating: z.number().int().min(0).max(5).default(0)
});
export type ReadingProgressSync = z.infer<typeof ReadingProgressSyncSchema>;

// 7. Habits
export const HabitsSyncSchema = BaseSyncEntitySchema.extend({
  title: z.string().min(1).max(300),
  identity: z.string().max(300).default(''),
  cue: z.string().max(300).default(''),
  craving: z.string().max(300).default(''),
  response: z.string().max(300).default(''),
  reward: z.string().max(300).default(''),
  two_minute_rule: z.string().max(300).default(''),
  category: z.string().max(100).default('Wisdom'),
  frequency: z.string().max(50).default('daily'),
  target_days_per_week: z.number().int().min(1).max(7).default(7),
  archived: z.number().int().min(0).max(1).default(0)
});
export type HabitsSync = z.infer<typeof HabitsSyncSchema>;

// 8. Habit Logs
export const HabitLogsSyncSchema = BaseSyncEntitySchema.extend({
  habit_id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  completed: z.boolean().default(true),
  value: z.number().default(1)
});
export type HabitLogsSync = z.infer<typeof HabitLogsSyncSchema>;

// 9. Schedule Tasks
export const ScheduleTasksSyncSchema = BaseSyncEntitySchema.extend({
  title: z.string().min(1).max(300),
  category: z.string().max(100).default('Work & Deep Work'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  start_time: z.string().max(10).default('09:00'),
  end_time: z.string().max(10).default('10:00'),
  is_recurring: z.boolean().default(false),
  recurring_days_json: z.string().max(200).default('[]'),
  is_completed: z.boolean().default(false),
  priority: z.enum(['low', 'medium', 'high']).default('medium')
});
export type ScheduleTasksSync = z.infer<typeof ScheduleTasksSyncSchema>;

// 10. Pomodoro Sessions
export const PomodoroSessionsSyncSchema = BaseSyncEntitySchema.extend({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  duration_minutes: z.number().int().min(1).max(360),
  task_title: z.string().max(300),
  completed_at: z.string().datetime()
});
export type PomodoroSessionsSync = z.infer<typeof PomodoroSessionsSyncSchema>;

// 11. Transactions
export const TransactionsSyncSchema = BaseSyncEntitySchema.extend({
  type: z.enum(['income', 'expense']),
  amount: z.number().min(0.01).max(100000000),
  category: z.string().max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  note: z.string().max(500).default(''),
  payment_method: z.string().max(100).default('UPI / Digital')
});
export type TransactionsSync = z.infer<typeof TransactionsSyncSchema>;

// 12. Budgets
export const BudgetsSyncSchema = BaseSyncEntitySchema.extend({
  category: z.string().max(100),
  monthly_limit: z.number().min(0).max(100000000)
});
export type BudgetsSync = z.infer<typeof BudgetsSyncSchema>;

// 13. Savings Goals
export const SavingsGoalsSyncSchema = BaseSyncEntitySchema.extend({
  title: z.string().min(1).max(300),
  target_amount: z.number().min(1).max(1000000000),
  current_amount: z.number().min(0).max(1000000000).default(0),
  target_date: z.string().max(32).default('2026-12-31'),
  color: z.string().max(32).default('#10b981')
});
export type SavingsGoalsSync = z.infer<typeof SavingsGoalsSyncSchema>;

// 14. Virtue Ratings
export const VirtueRatingsSyncSchema = BaseSyncEntitySchema.extend({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  honesty: z.number().int().min(1).max(5).default(4),
  patience: z.number().int().min(1).max(5).default(4),
  kindness: z.number().int().min(1).max(5).default(4),
  courage: z.number().int().min(1).max(5).default(4),
  gratitude: z.number().int().min(1).max(5).default(4),
  humility: z.number().int().min(1).max(5).default(4),
  reflection: z.string().max(2000).default('')
});
export type VirtueRatingsSync = z.infer<typeof VirtueRatingsSyncSchema>;

// 15. Journal Entries (Supports optional E2EE ciphertext payload in content)
export const JournalEntriesSyncSchema = BaseSyncEntitySchema.extend({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  type: z.enum(['daily_reflection', 'morning_intention', 'evening_review', 'gratitude', 'kindness', 'free_reflection']),
  title: z.string().max(300).default(''),
  content: z.string().max(100000), // Plaintext or AES-GCM ciphertext
  mood: z.string().max(50).nullable().optional(),
  tags_json: z.string().max(500).default('[]')
});
export type JournalEntriesSync = z.infer<typeof JournalEntriesSyncSchema>;

// 16. Mood Logs
export const MoodLogsSyncSchema = BaseSyncEntitySchema.extend({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  score: z.number().int().min(1).max(10),
  note: z.string().max(1000).default(''),
  emotion_tags_json: z.string().max(500).default('[]')
});
export type MoodLogsSync = z.infer<typeof MoodLogsSyncSchema>;

// 17. Achievements
export const AchievementsSyncSchema = BaseSyncEntitySchema.extend({
  badge_id: z.string().max(100),
  unlocked_at: z.string().datetime(),
  progress: z.number().min(0).max(100).default(100)
});
export type AchievementsSync = z.infer<typeof AchievementsSyncSchema>;

// ==========================================
// 3. TABLE REGISTRY & SYNC PROTOCOL SCHEMAS
// ==========================================

export const SYNC_TABLE_NAMES = [
  'user_profile',
  'steps_daily',
  'hourly_steps',
  'custom_books',
  'user_book_notes',
  'reading_progress',
  'habits',
  'habit_logs',
  'schedule_tasks',
  'pomodoro_sessions',
  'transactions',
  'budgets',
  'savings_goals',
  'virtue_ratings',
  'journal_entries',
  'mood_logs',
  'achievements'
] as const;

export type SyncTableName = typeof SYNC_TABLE_NAMES[number];

export const SYNC_SCHEMAS: Record<SyncTableName, z.ZodTypeAny> = {
  user_profile: UserProfileSyncSchema,
  steps_daily: StepsDailySyncSchema,
  hourly_steps: HourlyStepsSyncSchema,
  custom_books: CustomBooksSyncSchema,
  user_book_notes: UserBookNotesSyncSchema,
  reading_progress: ReadingProgressSyncSchema,
  habits: HabitsSyncSchema,
  habit_logs: HabitLogsSyncSchema,
  schedule_tasks: ScheduleTasksSyncSchema,
  pomodoro_sessions: PomodoroSessionsSyncSchema,
  transactions: TransactionsSyncSchema,
  budgets: BudgetsSyncSchema,
  savings_goals: SavingsGoalsSyncSchema,
  virtue_ratings: VirtueRatingsSyncSchema,
  journal_entries: JournalEntriesSyncSchema,
  mood_logs: MoodLogsSyncSchema,
  achievements: AchievementsSyncSchema
};

// Push Request: Max 200 rows per table
export const SyncPushRequestSchema = z.object({
  changes: z.record(
    z.string(),
    z.array(z.record(z.string(), z.any())).max(200, 'Maximum 200 items per table batch')
  )
});
export type SyncPushRequest = z.infer<typeof SyncPushRequestSchema>;

export const RowResultSchema = z.object({
  id: z.string(),
  status: z.enum(['applied', 'skipped_older', 'rejected']),
  reason: z.string().optional()
});
export type RowResult = z.infer<typeof RowResultSchema>;

export const SyncPushResponseSchema = z.object({
  results: z.record(
    z.string(),
    z.object({
      applied: z.number().int().min(0),
      skipped: z.number().int().min(0),
      rejected: z.number().int().min(0),
      details: z.array(RowResultSchema)
    })
  ),
  serverTimestamp: z.string().datetime()
});
export type SyncPushResponse = z.infer<typeof SyncPushResponseSchema>;

export const SyncPullQuerySchema = z.object({
  table: z.enum(SYNC_TABLE_NAMES),
  cursor: z.string().optional(), // encoded (server_updated_at, id)
  limit: z.coerce.number().int().min(1).max(500).default(200)
});
export type SyncPullQuery = z.infer<typeof SyncPullQuerySchema>;

export const SyncPullResponseSchema = z.object({
  table: z.string(),
  rows: z.array(z.record(z.string(), z.any())),
  nextCursor: z.string().nullable(),
  hasMore: z.boolean(),
  serverTimestamp: z.string().datetime()
});
export type SyncPullResponse = z.infer<typeof SyncPullResponseSchema>;

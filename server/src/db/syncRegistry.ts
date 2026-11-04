import { 
  SYNC_TABLE_NAMES, 
  SYNC_SCHEMAS, 
  type SyncTableName 
} from '@insaan/shared';
import * as schema from './schema.js';
import type { PgTable } from 'drizzle-orm/pg-core';
import type { z } from 'zod';

export interface TableRegistryEntry {
  tableName: SyncTableName;
  drizzleTable: any;
  schema: z.ZodTypeAny;
}

export const SYNC_REGISTRY: Record<SyncTableName, TableRegistryEntry> = {
  user_profile: {
    tableName: 'user_profile',
    drizzleTable: schema.userProfile,
    schema: SYNC_SCHEMAS.user_profile
  },
  steps_daily: {
    tableName: 'steps_daily',
    drizzleTable: schema.stepsDaily,
    schema: SYNC_SCHEMAS.steps_daily
  },
  hourly_steps: {
    tableName: 'hourly_steps',
    drizzleTable: schema.hourlySteps,
    schema: SYNC_SCHEMAS.hourly_steps
  },
  custom_books: {
    tableName: 'custom_books',
    drizzleTable: schema.customBooks,
    schema: SYNC_SCHEMAS.custom_books
  },
  user_book_notes: {
    tableName: 'user_book_notes',
    drizzleTable: schema.userBookNotes,
    schema: SYNC_SCHEMAS.user_book_notes
  },
  reading_progress: {
    tableName: 'reading_progress',
    drizzleTable: schema.readingProgress,
    schema: SYNC_SCHEMAS.reading_progress
  },
  habits: {
    tableName: 'habits',
    drizzleTable: schema.habits,
    schema: SYNC_SCHEMAS.habits
  },
  habit_logs: {
    tableName: 'habit_logs',
    drizzleTable: schema.habitLogs,
    schema: SYNC_SCHEMAS.habit_logs
  },
  schedule_tasks: {
    tableName: 'schedule_tasks',
    drizzleTable: schema.scheduleTasks,
    schema: SYNC_SCHEMAS.schedule_tasks
  },
  pomodoro_sessions: {
    tableName: 'pomodoro_sessions',
    drizzleTable: schema.pomodoroSessions,
    schema: SYNC_SCHEMAS.pomodoro_sessions
  },
  transactions: {
    tableName: 'transactions',
    drizzleTable: schema.transactions,
    schema: SYNC_SCHEMAS.transactions
  },
  budgets: {
    tableName: 'budgets',
    drizzleTable: schema.budgets,
    schema: SYNC_SCHEMAS.budgets
  },
  savings_goals: {
    tableName: 'savings_goals',
    drizzleTable: schema.savingsGoals,
    schema: SYNC_SCHEMAS.savings_goals
  },
  virtue_ratings: {
    tableName: 'virtue_ratings',
    drizzleTable: schema.virtueRatings,
    schema: SYNC_SCHEMAS.virtue_ratings
  },
  journal_entries: {
    tableName: 'journal_entries',
    drizzleTable: schema.journalEntries,
    schema: SYNC_SCHEMAS.journal_entries
  },
  mood_logs: {
    tableName: 'mood_logs',
    drizzleTable: schema.moodLogs,
    schema: SYNC_SCHEMAS.mood_logs
  },
  achievements: {
    tableName: 'achievements',
    drizzleTable: schema.achievements,
    schema: SYNC_SCHEMAS.achievements
  }
};

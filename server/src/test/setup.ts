import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import * as schema from '../db/schema.js';
import { setDb } from '../db/index.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let pgliteInstance: PGlite | null = null;
let testDbInstance: any = null;

export async function initTestDb() {
  if (testDbInstance) return { pglite: pgliteInstance!, testDb: testDbInstance };

  pgliteInstance = new PGlite();
  testDbInstance = drizzle(pgliteInstance, { schema });
  setDb(testDbInstance);

  // Read migration SQL file
  const migrationPath = path.resolve(__dirname, '../../drizzle/0000_amusing_beyonder.sql');
  const sqlContent = fs.readFileSync(migrationPath, 'utf8');

  const statements = sqlContent
    .split('--> statement-breakpoint')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (const stmt of statements) {
    await pgliteInstance.exec(stmt);
  }

  return { pglite: pgliteInstance, testDb: testDbInstance };
}

export async function clearAllTables() {
  if (!pgliteInstance) return;

  const tables = [
    'users',
    'refresh_tokens',
    'email_tokens',
    'achievements',
    'budgets',
    'custom_books',
    'habit_logs',
    'habits',
    'hourly_steps',
    'journal_entries',
    'mood_logs',
    'pomodoro_sessions',
    'reading_progress',
    'savings_goals',
    'schedule_tasks',
    'steps_daily',
    'transactions',
    'user_book_notes',
    'user_profile',
    'virtue_ratings'
  ];

  await pgliteInstance.exec(`TRUNCATE TABLE ${tables.join(', ')} CASCADE;`);
}

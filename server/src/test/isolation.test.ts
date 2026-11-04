import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { app } from '../index.js';
import { initTestDb, clearAllTables } from './setup.js';
import { SYNC_TABLE_NAMES, type SyncTableName } from '@insaan/shared';

// Generate valid sample row for each table
function createSampleRow(tableName: SyncTableName, customId?: string): Record<string, any> {
  const id = customId || crypto.randomUUID();
  const base = {
    id,
    client_updated_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  };

  switch (tableName) {
    case 'user_profile':
      return { ...base, name: 'User A Profile', avatar: '🏛️', height_cm: 180, weight_kg: 75 };
    case 'steps_daily':
      return { ...base, date: '2026-03-01', steps: 10450, distance_km: 7.8, calories: 420, active_minutes: 60 };
    case 'hourly_steps':
      return { ...base, date: '2026-03-01', hour: 14, steps: 1250 };
    case 'custom_books':
      return { ...base, title: 'Discourses', author: 'Epictetus', category: 'Philosophy' };
    case 'user_book_notes':
      return { ...base, book_id: 'meditations', chapter_index: 1, title: 'Book 1 Notes', content: 'Debts and lessons' };
    case 'reading_progress':
      return { ...base, book_id: 'meditations', status: 'reading', current_chapter: 3, total_chapters: 12, percent: 25 };
    case 'habits':
      return { ...base, title: 'Cold Shower', category: 'Health', frequency: 'daily', target_days_per_week: 7 };
    case 'habit_logs':
      return { ...base, habit_id: crypto.randomUUID(), date: '2026-03-01', completed: true, value: 1 };
    case 'schedule_tasks':
      return { ...base, title: 'Morning Deep Work', category: 'Focus', date: '2026-03-01', start_time: '08:00' };
    case 'pomodoro_sessions':
      return { ...base, date: '2026-03-01', duration_minutes: 25, task_title: 'Focus Sprint', completed_at: new Date().toISOString() };
    case 'transactions':
      return { ...base, title: 'Book Purchase', type: 'expense', amount: 450, category: 'Education', date: '2026-03-01' };
    case 'budgets':
      return { ...base, category: 'Education', monthly_limit: 2000 };
    case 'savings_goals':
      return { ...base, title: 'Emergency Fund', target_amount: 100000, current_amount: 25000 };
    case 'virtue_ratings':
      return { ...base, date: '2026-03-01', honesty: 5, patience: 4, kindness: 5, courage: 4, gratitude: 5, humility: 4 };
    case 'journal_entries':
      return { ...base, date: '2026-03-01', type: 'daily_reflection', title: 'Amor Fati', content: 'Embrace all that happens' };
    case 'mood_logs':
      return { ...base, date: '2026-03-01', score: 9, note: 'Grateful & serene' };
    case 'achievements':
      return { ...base, badge_id: 'early_bird', unlocked_at: new Date().toISOString(), progress: 100 };
    default:
      return base;
  }
}

describe('Cross-User Authorization Isolation Across All 17 Tables', () => {
  let userAToken: string;
  let userBToken: string;

  beforeAll(async () => {
    await initTestDb();
  });

  beforeEach(async () => {
    await clearAllTables();

    // 1. Create User A
    const resA = await app.request('/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'user.a@sanctuary.org',
        password: 'password-for-user-a-1234',
        name: 'User A'
      })
    });
    userAToken = ((await resA.json()) as any).accessToken;

    // 2. Create User B
    const resB = await app.request('/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'user.b@sanctuary.org',
        password: 'password-for-user-b-1234',
        name: 'User B'
      })
    });
    userBToken = ((await resB.json()) as any).accessToken;
  });

  for (const tableName of SYNC_TABLE_NAMES) {
    it(`guarantees isolation for table: ${tableName}`, async () => {
      const userARow = createSampleRow(tableName);

      // User A pushes their record
      const pushResA = await app.request('/sync/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userAToken}`
        },
        body: JSON.stringify({
          changes: { [tableName]: [userARow] }
        })
      });
      expect(pushResA.status).toBe(200);

      // 1. User B pulls table -> MUST NOT receive User A's row
      const pullResB = await app.request(`/sync/pull?table=${tableName}`, {
        headers: { 'Authorization': `Bearer ${userBToken}` }
      });
      expect(pullResB.status).toBe(200);
      const pullDataB = (await pullResB.json()) as any;
      const hasUserARow = pullDataB.rows.some((r: any) => r.id === userARow.id);
      expect(hasUserARow).toBe(false);

      // 2. User B attempts to push an update using User A's ID
      const exploitRow = {
        ...userARow,
        client_updated_at: new Date('2028-01-01T00:00:00Z').toISOString(),
        name: 'Hacked by User B',
        title: 'Hacked by User B'
      };
      await app.request('/sync/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userBToken}`
        },
        body: JSON.stringify({
          changes: { [tableName]: [exploitRow] }
        })
      });

      // 3. User A pulls table -> User A's record must NOT be tampered with
      const pullResA = await app.request(`/sync/pull?table=${tableName}`, {
        headers: { 'Authorization': `Bearer ${userAToken}` }
      });
      const pullDataA = (await pullResA.json()) as any;
      const fetchedA = pullDataA.rows.find((r: any) => r.id === userARow.id);
      expect(fetchedA).toBeDefined();
      if (fetchedA.title) {
        expect(fetchedA.title).not.toBe('Hacked by User B');
      }
      if (fetchedA.name) {
        expect(fetchedA.name).not.toBe('Hacked by User B');
      }
    });
  }

  it('guarantees complete isolation in GDPR full cloud export', async () => {
    // User A inserts journal entry
    await app.request('/sync/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userAToken}`
      },
      body: JSON.stringify({
        changes: {
          journal_entries: [{
            id: crypto.randomUUID(),
            date: '2026-03-01',
            type: 'daily_reflection',
            title: 'Top Secret Thoughts of User A',
            content: 'Never let anyone see this private entry.',
            client_updated_at: new Date().toISOString()
          }]
        }
      })
    });

    // User B exports their data
    const exportResB = await app.request('/sync/export', {
      headers: { 'Authorization': `Bearer ${userBToken}` }
    });
    expect(exportResB.status).toBe(200);
    const exportDataB = (await exportResB.json()) as any;

    // Verify User A's entries are absent from User B's export
    const userBJournals = exportDataB.tables.journal_entries || [];
    expect(userBJournals.length).toBe(0);
  });
});

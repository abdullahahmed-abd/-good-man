import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { app } from '../index.js';
import { initTestDb, clearAllTables } from './setup.js';

describe('Sync API & Conflict Resolution Tests', () => {
  let userToken: string;

  beforeAll(async () => {
    await initTestDb();
  });

  beforeEach(async () => {
    await clearAllTables();

    // Create test user and obtain JWT access token
    const signupRes = await app.request('/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'synctest@insaan.app',
        password: 'secure-sync-test-pass-2026',
        name: 'SyncTester'
      })
    });
    const signupData = (await signupRes.json()) as any;
    userToken = signupData.accessToken;
  });

  it('rejects unauthenticated push or pull requests with 401', async () => {
    const unauthPush = await app.request('/sync/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ changes: {} })
    });
    expect(unauthPush.status).toBe(401);

    const unauthPull = await app.request('/sync/pull?table=habits', {
      method: 'GET'
    });
    expect(unauthPull.status).toBe(401);
  });

  it('pushes changes idempotently into the database', async () => {
    const habitId = crypto.randomUUID();
    const habitRow = {
      id: habitId,
      title: 'Morning Cold Shower',
      category: 'Wisdom',
      frequency: 'daily',
      target_days_per_week: 7,
      client_updated_at: new Date('2026-03-01T08:00:00Z').toISOString(),
      created_at: new Date('2026-01-01T00:00:00Z').toISOString()
    };

    // First push
    const res1 = await app.request('/sync/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        changes: {
          habits: [habitRow]
        }
      })
    });

    expect(res1.status).toBe(200);
    const data1 = (await res1.json()) as any;
    expect(data1.results.habits.applied).toBe(1);

    // Second push (idempotent retry with same timestamp)
    const res2 = await app.request('/sync/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        changes: {
          habits: [habitRow]
        }
      })
    });

    expect(res2.status).toBe(200);
    const data2 = (await res2.json()) as any;
    expect(data2.results.habits.skipped).toBe(1);
  });

  it('enforces last-write-wins by client_updated_at', async () => {
    const habitId = crypto.randomUUID();
    const tNewer = new Date('2026-03-05T12:00:00Z').toISOString();
    const tOlder = new Date('2026-03-01T12:00:00Z').toISOString();

    // 1. Push newer version first
    await app.request('/sync/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        changes: {
          habits: [{
            id: habitId,
            title: 'Newer Habit Name',
            client_updated_at: tNewer
          }]
        }
      })
    });

    // 2. Push older version with earlier timestamp
    const olderRes = await app.request('/sync/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        changes: {
          habits: [{
            id: habitId,
            title: 'Older Habit Name',
            client_updated_at: tOlder
          }]
        }
      })
    });

    const olderData = (await olderRes.json()) as any;
    expect(olderData.results.habits.skipped).toBe(1);

    // 3. Pull to verify newer title was preserved
    const pullRes = await app.request('/sync/pull?table=habits', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const pullData = (await pullRes.json()) as any;
    expect(pullData.rows.length).toBe(1);
    expect(pullData.rows[0].title).toBe('Newer Habit Name');
  });

  it('propagates soft-delete tombstones', async () => {
    const taskId = crypto.randomUUID();

    // Create schedule task
    await app.request('/sync/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        changes: {
          schedule_tasks: [{
            id: taskId,
            title: 'Read Marcus Aurelius Book 4',
            date: '2026-03-01',
            client_updated_at: new Date('2026-03-01T10:00:00Z').toISOString()
          }]
        }
      })
    });

    // Soft-delete with tombstone
    const deleteRes = await app.request('/sync/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        changes: {
          schedule_tasks: [{
            id: taskId,
            title: 'Read Marcus Aurelius Book 4',
            date: '2026-03-01',
            deleted_at: new Date('2026-03-01T11:00:00Z').toISOString(),
            client_updated_at: new Date('2026-03-01T11:00:00Z').toISOString()
          }]
        }
      })
    });
    expect(deleteRes.status).toBe(200);

    // Pull from cloud: tombstone must be returned so other devices delete their local record
    const pullRes = await app.request('/sync/pull?table=schedule_tasks', {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const pullData = (await pullRes.json()) as any;
    expect(pullData.rows.length).toBe(1);
    expect(pullData.rows[0].deleted_at).toBeDefined();
    expect(pullData.rows[0].deleted_at).not.toBeNull();
  });

  it('supports cursor-based pull pagination', async () => {
    // Insert 5 mood logs
    const moodRows = Array.from({ length: 5 }, (_, i) => ({
      id: crypto.randomUUID(),
      date: '2026-03-01',
      score: i + 1,
      client_updated_at: new Date(Date.now() + i * 1000).toISOString()
    }));

    await app.request('/sync/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        changes: { mood_logs: moodRows }
      })
    });

    // Pull page 1 with limit 2
    const page1Res = await app.request('/sync/pull?table=mood_logs&limit=2', {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const page1Data = (await page1Res.json()) as any;
    expect(page1Data.rows.length).toBe(2);
    expect(page1Data.hasMore).toBe(true);
    expect(page1Data.nextCursor).toBeDefined();

    // Pull page 2 using cursor
    const page2Res = await app.request(`/sync/pull?table=mood_logs&limit=2&cursor=${encodeURIComponent(page1Data.nextCursor)}`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const page2Data = (await page2Res.json()) as any;
    expect(page2Data.rows.length).toBe(2);
    expect(page2Data.hasMore).toBe(true);

    // Pull page 3 (last)
    const page3Res = await app.request(`/sync/pull?table=mood_logs&limit=2&cursor=${encodeURIComponent(page2Data.nextCursor)}`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const page3Data = (await page3Res.json()) as any;
    expect(page3Data.rows.length).toBe(1);
    expect(page3Data.hasMore).toBe(false);
  });

  it('enforces maximum 200 rows per table per push', async () => {
    const tooManyRows = Array.from({ length: 201 }, () => ({
      id: crypto.randomUUID(),
      title: 'Overflow Habit',
      client_updated_at: new Date().toISOString()
    }));

    const res = await app.request('/sync/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        changes: { habits: tooManyRows }
      })
    });

    expect(res.status).toBe(400);
    const data = (await res.json()) as any;
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects invalid rows and isolates them in details without crashing', async () => {
    const res = await app.request('/sync/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        changes: {
          budgets: [{
            id: crypto.randomUUID(),
            category: 'Dining',
            monthly_limit: -500, // Invalid negative limit violates schema!
            client_updated_at: new Date().toISOString()
          }]
        }
      })
    });

    expect(res.status).toBe(200);
    const data = (await res.json()) as any;
    expect(data.results.budgets.rejected).toBe(1);
    expect(data.results.budgets.details[0].status).toBe('rejected');
  });
});

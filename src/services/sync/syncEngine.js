/**
 * Insaan Production Offline-First Sync Engine
 * - Outbox pattern: queries local Dexie _dirty rows
 * - Bidirectional last-write-wins merge
 * - Pull cursor tracking per table
 * - Triggers on app start, online, visibility change, and debounced writes
 * - Exponential backoff with jitter
 * - Completely non-blocking to the UI
 */

import db from '../../db/database';
import apiClient from '../api/apiClient';
import cryptoE2EE from '../security/cryptoE2EE';

// Map Dexie table names to Server Sync table names
export const DEXIE_TO_SERVER_TABLE_MAP = {
  userProfile: 'user_profile',
  steps: 'steps_daily',
  hourlySteps: 'hourly_steps',
  customBooks: 'custom_books',
  userBookNotes: 'user_book_notes',
  readingProgress: 'reading_progress',
  habits: 'habits',
  habitLogs: 'habit_logs',
  scheduleTasks: 'schedule_tasks',
  pomodoroSessions: 'pomodoro_sessions',
  transactions: 'transactions',
  budgets: 'budgets',
  savingsGoals: 'savings_goals',
  virtueRatings: 'virtue_ratings',
  journalEntries: 'journal_entries',
  moodLogs: 'mood_logs',
  achievements: 'achievements'
};

export const SERVER_TO_DEXIE_TABLE_MAP = Object.fromEntries(
  Object.entries(DEXIE_TO_SERVER_TABLE_MAP).map(([d, s]) => [s, d])
);

// Map local object to server snake_case format
function toServerRow(dexieTable, row) {
  const serverRow = {
    id: row.id,
    client_updated_at: row.updatedAt || new Date().toISOString(),
    created_at: row.createdAt ? new Date(row.createdAt).toISOString() : new Date().toISOString(),
    deleted_at: row.deletedAt || null
  };

  for (const [key, val] of Object.entries(row)) {
    if (['_dirty', 'syncedAt', 'updatedAt', 'deletedAt', 'id', 'createdAt'].includes(key)) continue;
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    
    // JSON fields
    if (key.endsWith('Json') || key === 'chapters' || key === 'recurringDays' || key === 'emotionTags' || key === 'tags') {
      serverRow[snakeKey] = typeof val === 'string' ? val : JSON.stringify(val || []);
    } else {
      serverRow[snakeKey] = val;
    }
  }

  return serverRow;
}

// Map server snake_case row to local Dexie format
function toDexieRow(serverTable, row) {
  const dexieRow = {
    id: row.id,
    updatedAt: row.client_updated_at,
    deletedAt: row.deleted_at || null,
    syncedAt: row.server_updated_at,
    _dirty: 0
  };

  for (const [key, val] of Object.entries(row)) {
    if (['id', 'client_updated_at', 'server_updated_at', 'deleted_at'].includes(key)) continue;
    const camelKey = key.replace(/_([a-z0-9])/g, (_, g) => g.toUpperCase());

    // JSON parsing
    if (key.endsWith('_json') || camelKey.endsWith('Json')) {
      try {
        dexieRow[camelKey] = typeof val === 'string' ? JSON.parse(val) : val;
      } catch (e) {
        dexieRow[camelKey] = val;
      }
    } else {
      dexieRow[camelKey] = val;
    }
  }

  return dexieRow;
}

export const SyncStatus = {
  IDLE: 'IDLE',
  SYNCING: 'SYNCING',
  SYNCED: 'SYNCED',
  OFFLINE: 'OFFLINE',
  ERROR: 'ERROR'
};

class SyncEngine {
  constructor() {
    this.status = SyncStatus.IDLE;
    this.lastSyncedAt = null;
    this.listeners = new Set();
    this.syncInProgress = false;
    this.retryCount = 0;
    this.debounceTimer = null;
    this.isAuthenticated = false;

    // Listen to browser network changes
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.setStatus(SyncStatus.IDLE);
        this.triggerSync();
      });

      window.addEventListener('offline', () => {
        this.setStatus(SyncStatus.OFFLINE);
      });

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && this.isAuthenticated) {
          this.triggerSync();
        }
      });
    }
  }

  setAuthenticated(isAuth) {
    this.isAuthenticated = isAuth;
    if (isAuth) {
      this.triggerSync();
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.getSnapshot());
    return () => this.listeners.delete(listener);
  }

  notify() {
    const snap = this.getSnapshot();
    this.listeners.forEach(cb => cb(snap));
  }

  getSnapshot() {
    return {
      status: !navigator.onLine ? SyncStatus.OFFLINE : this.status,
      lastSyncedAt: this.lastSyncedAt,
      isSyncing: this.syncInProgress,
      retryCount: this.retryCount
    };
  }

  setStatus(status) {
    this.status = status;
    this.notify();
  }

  // Debounced trigger after local user writes
  scheduleLocalSync() {
    if (!this.isAuthenticated || !navigator.onLine) return;
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.triggerSync();
    }, 3000);
  }

  async triggerSync() {
    if (!this.isAuthenticated || !navigator.onLine || this.syncInProgress) {
      return;
    }

    this.syncInProgress = true;
    this.setStatus(SyncStatus.SYNCING);

    try {
      // 1. PUSH DIRTY LOCAL CHANGES
      await this.pushOutbox();

      // 2. PULL SERVER CHANGES PER TABLE
      await this.pullAllTables();

      this.retryCount = 0;
      this.lastSyncedAt = new Date();
      this.setStatus(SyncStatus.SYNCED);
    } catch (err) {
      console.warn('Sync cycle note:', err.message);
      this.retryCount++;
      this.setStatus(SyncStatus.ERROR);

      // Exponential backoff with jitter (max 60s)
      const delay = Math.min(60000, Math.pow(2, this.retryCount) * 1000 + Math.random() * 1000);
      setTimeout(() => this.triggerSync(), delay);
    } finally {
      this.syncInProgress = false;
    }
  }

  // Push local dirty changes to cloud
  async pushOutbox() {
    const changes = {};
    let totalDirtyRows = 0;

    for (const [dexieTable, serverTable] of Object.entries(DEXIE_TO_SERVER_TABLE_MAP)) {
      if (!db[dexieTable]) continue;
      const dirtyRows = await db[dexieTable].where('_dirty').equals(1).toArray();
      if (dirtyRows.length > 0) {
        totalDirtyRows += dirtyRows.length;
        const converted = [];
        for (const row of dirtyRows) {
          // Encrypt journal content if E2EE active
          if (dexieTable === 'journalEntries' && row.content) {
            row.content = await cryptoE2EE.encrypt(row.content);
          }
          converted.push(toServerRow(dexieTable, row));
        }
        changes[serverTable] = converted;
      }
    }

    if (totalDirtyRows === 0) return;

    // Send push request
    const response = await apiClient.post('/sync/push', { changes });

    // Mark applied rows as clean in Dexie
    await db.transaction('rw', Object.keys(DEXIE_TO_SERVER_TABLE_MAP).filter(k => db[k]), async () => {
      for (const [serverTable, result] of Object.entries(response.results || {})) {
        const dexieTable = SERVER_TO_DEXIE_TABLE_MAP[serverTable];
        if (!dexieTable || !db[dexieTable]) continue;

        for (const detail of result.details || []) {
          if (detail.status === 'applied' || detail.status === 'skipped_older') {
            await db[dexieTable].update(detail.id, {
              _dirty: 0,
              syncedAt: response.serverTimestamp
            });
          }
        }
      }
    });
  }

  // Pull latest updates from server using cursor pagination
  async pullAllTables() {
    for (const [dexieTable, serverTable] of Object.entries(DEXIE_TO_SERVER_TABLE_MAP)) {
      if (!db[dexieTable]) continue;

      let hasMore = true;
      while (hasMore) {
        // Read stored cursor for this table
        const cursorRecord = await db.syncMeta.get(`cursor_${serverTable}`);
        const cursor = cursorRecord ? cursorRecord.value : undefined;

        const res = await apiClient.get(`/sync/pull?table=${serverTable}${cursor ? `&cursor=${cursor}` : ''}&limit=200`);

        if (res.rows && res.rows.length > 0) {
          // Merge incoming rows into Dexie transaction
          await db.transaction('rw', db[dexieTable], async () => {
            for (const serverRow of res.rows) {
              const incoming = toDexieRow(serverTable, serverRow);
              const local = await db[dexieTable].get(incoming.id);

              if (local) {
                // Last-write-wins: apply only if incoming is newer OR local is not dirty
                const localClientTime = local.updatedAt ? new Date(local.updatedAt).getTime() : 0;
                const incomingClientTime = new Date(incoming.updatedAt).getTime();

                if (local._dirty === 1 && localClientTime > incomingClientTime) {
                  // Keep local dirty edit!
                  continue;
                }
              }

              // Decrypt journal content if needed
              if (dexieTable === 'journalEntries' && incoming.content) {
                incoming.content = await cryptoE2EE.decrypt(incoming.content);
              }

              await db[dexieTable].put(incoming);
            }
          });
        }

        // Save next cursor
        if (res.nextCursor) {
          await db.syncMeta.put({ key: `cursor_${serverTable}`, value: res.nextCursor });
        }

        hasMore = res.hasMore;
      }
    }
  }

  // Guest-to-Account migration: mark all local rows dirty so they immediately push
  async migrateGuestDataToAccount() {
    for (const dexieTable of Object.keys(DEXIE_TO_SERVER_TABLE_MAP)) {
      if (!db[dexieTable]) continue;
      await db[dexieTable].toCollection().modify((row) => {
        row._dirty = 1;
        if (!row.id || typeof row.id === 'number') {
          row.id = crypto.randomUUID();
        }
      });
    }

    // Clear old pull cursors so cloud data also merges
    await db.syncMeta.clear();

    // Trigger full sync
    await this.triggerSync();
  }
}

export const syncEngine = new SyncEngine();
export default syncEngine;

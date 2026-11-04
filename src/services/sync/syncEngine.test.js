import { describe, it, expect } from 'vitest';
import { 
  toServerRow, 
  toDexieRow, 
  resolveSyncConflict, 
  DEXIE_TO_SERVER_TABLE_MAP, 
  SERVER_TO_DEXIE_TABLE_MAP 
} from './syncEngine';

describe('Client-Side Sync Engine & Data Mapping', () => {
  it('maps all 17 Dexie tables bidirectionally to server tables', () => {
    const dexieTables = Object.keys(DEXIE_TO_SERVER_TABLE_MAP);
    expect(dexieTables.length).toBe(17);

    for (const dexieTable of dexieTables) {
      const serverTable = DEXIE_TO_SERVER_TABLE_MAP[dexieTable];
      expect(serverTable).toBeDefined();
      expect(SERVER_TO_DEXIE_TABLE_MAP[serverTable]).toBe(dexieTable);
    }
  });

  it('converts local Dexie row to server snake_case format and excludes internal fields', () => {
    const localHabit = {
      id: 'a0000000-0000-0000-0000-000000000001',
      title: 'Morning Cold Shower',
      targetDaysPerWeek: 7,
      recurringDays: ['Mon', 'Tue', 'Wed'],
      _dirty: 1,
      syncedAt: '2026-03-01T00:00:00Z',
      updatedAt: '2026-03-01T08:30:00Z',
      createdAt: '2026-01-01T00:00:00Z',
      deletedAt: null
    };

    const serverRow = toServerRow('habits', localHabit);

    expect(serverRow.id).toBe(localHabit.id);
    expect(serverRow.title).toBe('Morning Cold Shower');
    expect(serverRow.target_days_per_week).toBe(7);
    expect(serverRow.client_updated_at).toBe('2026-03-01T08:30:00Z');
    expect(serverRow.deleted_at).toBeNull();

    // JSON fields must be stringified for PostgreSQL storage
    expect(typeof serverRow.recurring_days).toBe('string');
    expect(JSON.parse(serverRow.recurring_days)).toEqual(['Mon', 'Tue', 'Wed']);

    // Internal fields must never be sent to the server
    expect(serverRow._dirty).toBeUndefined();
    expect(serverRow.syncedAt).toBeUndefined();
  });

  it('converts server snake_case row into local Dexie entity and parses JSON', () => {
    const serverRow = {
      id: 'b0000000-0000-0000-0000-000000000002',
      client_updated_at: '2026-03-01T09:00:00Z',
      server_updated_at: '2026-03-01T09:00:01Z',
      deleted_at: null,
      target_days_per_week: 5,
      title: 'Evening Journaling',
      tags_json: JSON.stringify(['mindfulness', 'stoicism'])
    };

    const dexieRow = toDexieRow('habits', serverRow);

    expect(dexieRow.id).toBe(serverRow.id);
    expect(dexieRow.title).toBe('Evening Journaling');
    expect(dexieRow.targetDaysPerWeek).toBe(5);
    expect(dexieRow.updatedAt).toBe('2026-03-01T09:00:00Z');
    expect(dexieRow.syncedAt).toBe('2026-03-01T09:00:01Z');
    expect(dexieRow.deletedAt).toBeNull();
    expect(dexieRow._dirty).toBe(0); // Clean after receiving from server
    expect(dexieRow.tagsJson).toEqual(['mindfulness', 'stoicism']);
  });

  it('preserves local un-synced dirty edits when newer than incoming server record (3-way merge)', () => {
    const localDirtyNewer = {
      id: 'c0000000-0000-0000-0000-000000000003',
      title: 'Local Offline Edit',
      updatedAt: '2026-03-01T12:00:00Z',
      _dirty: 1
    };

    const incomingOlder = {
      id: 'c0000000-0000-0000-0000-000000000003',
      title: 'Server Older Edit',
      updatedAt: '2026-03-01T10:00:00Z'
    };

    // Must KEEP local edit so un-synced user work is never overwritten!
    const decision = resolveSyncConflict(localDirtyNewer, incomingOlder);
    expect(decision).toBe('keep_local');
  });

  it('applies incoming server record when incoming is newer than local edit', () => {
    const localDirtyOlder = {
      id: 'd0000000-0000-0000-0000-000000000004',
      title: 'Local Earlier Edit',
      updatedAt: '2026-03-01T08:00:00Z',
      _dirty: 1
    };

    const incomingNewer = {
      id: 'd0000000-0000-0000-0000-000000000004',
      title: 'Server Newer Edit',
      updatedAt: '2026-03-01T14:00:00Z'
    };

    const decision = resolveSyncConflict(localDirtyOlder, incomingNewer);
    expect(decision).toBe('apply_incoming');
  });

  it('applies incoming server record when local row is already clean (_dirty = 0)', () => {
    const localClean = {
      id: 'e0000000-0000-0000-0000-000000000005',
      title: 'Clean Stored Habit',
      updatedAt: '2026-03-01T10:00:00Z',
      _dirty: 0
    };

    const incoming = {
      id: 'e0000000-0000-0000-0000-000000000005',
      title: 'Cloud Updated Habit',
      updatedAt: '2026-03-01T11:00:00Z'
    };

    const decision = resolveSyncConflict(localClean, incoming);
    expect(decision).toBe('apply_incoming');
  });
});


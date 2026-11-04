import { eq, and, gt, or, asc, sql } from 'drizzle-orm';
import { 
  SYNC_TABLE_NAMES, 
  type SyncTableName, 
  type RowResult 
} from '@insaan/shared';
import { SYNC_REGISTRY } from '../db/syncRegistry.js';
import type { Database } from '../db/index.js';

// Helper to map snake_case client payload keys to camelCase Drizzle model properties
function mapToDbFields(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    // Convert snake_case to camelCase
    const camelKey = key.replace(/_([a-z0-9])/g, (_, g) => g.toUpperCase());
    
    // Parse ISO dates to Date objects if needed
    if (typeof val === 'string' && (key.endsWith('_at') || key === 'date' || key === 'unlocked_at')) {
      if (key.endsWith('_at') || key === 'unlocked_at') {
        result[camelKey] = val ? new Date(val) : null;
      } else {
        result[camelKey] = val;
      }
    } else {
      result[camelKey] = val;
    }
  }
  return result;
}

// Helper to map Drizzle camelCase properties to snake_case client payload
function mapToClientFields(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (key === 'userId') continue; // Do not leak internal userId
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    if (val instanceof Date) {
      result[snakeKey] = val.toISOString();
    } else {
      result[snakeKey] = val;
    }
  }
  return result;
}

// Cursor Encoding: Base64(JSON({ t: timestampMs, id: string }))
export function encodeCursor(serverUpdatedAt: Date, id: string): string {
  const payload = JSON.stringify({ t: serverUpdatedAt.getTime(), id });
  return Buffer.from(payload).toString('base64url');
}

export function decodeCursor(cursorStr?: string): { serverUpdatedAt: Date; id: string } | null {
  if (!cursorStr) return null;
  try {
    const raw = Buffer.from(cursorStr, 'base64url').toString('utf8');
    const parsed = JSON.parse(raw);
    if (typeof parsed.t === 'number' && typeof parsed.id === 'string') {
      return { serverUpdatedAt: new Date(parsed.t), id: parsed.id };
    }
  } catch (err) {
    // Malformed cursor
  }
  return null;
}

export class SyncRepository {
  /**
   * Pushes a batch of changes for a specific table within a database transaction.
   * Strictly enforces user isolation: user_id is ALWAYS supplied from verified token.
   */
  static async pushChanges(
    tx: any,
    tableName: SyncTableName,
    userId: string,
    rawRows: Array<Record<string, any>>
  ): Promise<{ applied: number; skipped: number; rejected: number; details: RowResult[] }> {
    const reg = SYNC_REGISTRY[tableName];
    if (!reg) {
      throw new Error(`Unrecognized sync table: ${tableName}`);
    }

    let applied = 0;
    let skipped = 0;
    let rejected = 0;
    const details: RowResult[] = [];
    const now = new Date();

    for (const rawRow of rawRows) {
      // 1. Zod schema validation
      const validation = reg.schema.safeParse(rawRow);
      if (!validation.success) {
        rejected++;
        details.push({
          id: rawRow.id || 'unknown',
          status: 'rejected',
          reason: validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ')
        });
        continue;
      }

      const validData = validation.data;
      const rowId = validData.id;
      const incomingClientDate = new Date(validData.client_updated_at);
      const dbValues = mapToDbFields(validData);

      // Force authenticated userId
      dbValues.userId = userId;
      dbValues.serverUpdatedAt = now;

      // 2. Fetch existing row for THIS user only
      const [existing] = await tx.select()
        .from(reg.drizzleTable)
        .where(and(
          eq(reg.drizzleTable.id, rowId),
          eq(reg.drizzleTable.userId, userId)
        ))
        .limit(1);

      if (existing) {
        // Last-write-wins conflict rule:
        // Apply only if incoming client_updated_at > stored client_updated_at
        const existingClientDate = new Date(existing.clientUpdatedAt);

        if (incomingClientDate > existingClientDate) {
          await tx.update(reg.drizzleTable)
            .set(dbValues)
            .where(and(
              eq(reg.drizzleTable.id, rowId),
              eq(reg.drizzleTable.userId, userId)
            ));
          applied++;
          details.push({ id: rowId, status: 'applied' });
        } else {
          // Stored row is newer or identical; skip incoming
          skipped++;
          details.push({ id: rowId, status: 'skipped_older' });
        }
      } else {
        // Row does not exist; insert new
        await tx.insert(reg.drizzleTable).values(dbValues);
        applied++;
        details.push({ id: rowId, status: 'applied' });
      }
    }

    return { applied, skipped, rejected, details };
  }

  /**
   * Pulls changes for a table with cursor-based pagination.
   * Scoped strictly by userId.
   */
  static async pullChanges(
    db: any,
    tableName: SyncTableName,
    userId: string,
    cursorStr?: string,
    limit = 200
  ): Promise<{ table: string; rows: Array<Record<string, any>>; nextCursor: string | null; hasMore: boolean }> {
    const reg = SYNC_REGISTRY[tableName];
    if (!reg) {
      throw new Error(`Unrecognized sync table: ${tableName}`);
    }

    const decodedCursor = decodeCursor(cursorStr);
    const fetchLimit = Math.min(500, Math.max(1, limit));

    // Cursor condition: (server_updated_at, id) > (cursor.serverUpdatedAt, cursor.id)
    let whereClause = eq(reg.drizzleTable.userId, userId);

    if (decodedCursor) {
      whereClause = and(
        eq(reg.drizzleTable.userId, userId),
        or(
          gt(reg.drizzleTable.serverUpdatedAt, decodedCursor.serverUpdatedAt),
          and(
            eq(reg.drizzleTable.serverUpdatedAt, decodedCursor.serverUpdatedAt),
            gt(reg.drizzleTable.id, decodedCursor.id)
          )
        )
      ) as any;
    }

    const dbRows = await db.select()
      .from(reg.drizzleTable)
      .where(whereClause)
      .orderBy(asc(reg.drizzleTable.serverUpdatedAt), asc(reg.drizzleTable.id))
      .limit(fetchLimit + 1);

    const hasMore = dbRows.length > fetchLimit;
    const pageRows = hasMore ? dbRows.slice(0, fetchLimit) : dbRows;

    let nextCursor: string | null = null;
    if (pageRows.length > 0) {
      const lastRow = pageRows[pageRows.length - 1];
      nextCursor = encodeCursor(new Date(lastRow.serverUpdatedAt), lastRow.id);
    }

    return {
      table: tableName,
      rows: pageRows.map(mapToClientFields),
      nextCursor: hasMore ? nextCursor : null,
      hasMore
    };
  }

  /**
   * Generates a complete GDPR-style JSON export of all 17 tables for the user.
   */
  static async exportUserData(db: any, userId: string): Promise<Record<string, any>> {
    const result: Record<string, any> = {};

    for (const tableName of SYNC_TABLE_NAMES) {
      const reg = SYNC_REGISTRY[tableName];
      const rows = await db.select()
        .from(reg.drizzleTable)
        .where(eq(reg.drizzleTable.userId, userId));
      result[tableName] = rows.map(mapToClientFields);
    }

    return result;
  }
}

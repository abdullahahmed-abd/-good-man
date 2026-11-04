import { Hono } from 'hono';
import { 
  SyncPushRequestSchema, 
  SyncPullQuerySchema, 
  SYNC_TABLE_NAMES, 
  type SyncTableName 
} from '@insaan/shared';
import { getDb } from '../db/index.js';
import { authMiddleware } from '../middleware/auth.js';
import { SyncRepository } from '../services/syncRepository.js';
import { createRateLimitMiddleware } from '../middleware/rateLimit.js';
import { AppError } from '../middleware/errorHandler.js';

export const syncRouter = new Hono();

// Auth required for all sync routes
syncRouter.use('*', authMiddleware);

// Moderate rate limiting on sync (120 req / min)
syncRouter.use('*', createRateLimitMiddleware({ max: 120, windowMs: 60 * 1000, keyPrefix: 'sync' }));

// 1. POST /sync/push (Single DB Transaction)
syncRouter.post('/push', async (c) => {
  const authUser = c.get('user');
  const body = await c.req.json();
  const input = SyncPushRequestSchema.parse(body);
  const db = getDb();
  const serverTimestamp = new Date().toISOString();

  const results: Record<string, any> = {};

  // Execute entire batch inside a single atomic database transaction
  await db.transaction(async (tx) => {
    for (const [tableKey, rows] of Object.entries(input.changes)) {
      if (!SYNC_TABLE_NAMES.includes(tableKey as SyncTableName)) {
        throw new AppError(`Unknown sync table: ${tableKey}`, 400, 'INVALID_TABLE');
      }

      const tableRes = await SyncRepository.pushChanges(
        tx,
        tableKey as SyncTableName,
        authUser.sub,
        rows
      );

      results[tableKey] = tableRes;
    }
  });

  return c.json({
    results,
    serverTimestamp
  });
});

// 2. GET /sync/pull?table=&cursor=&limit=
syncRouter.get('/pull', async (c) => {
  const authUser = c.get('user');
  const query = c.req.query();
  const input = SyncPullQuerySchema.parse(query);
  const db = getDb();
  const serverTimestamp = new Date().toISOString();

  const pullResult = await SyncRepository.pullChanges(
    db,
    input.table,
    authUser.sub,
    input.cursor,
    input.limit
  );

  return c.json({
    ...pullResult,
    serverTimestamp
  });
});

// 3. GET /sync/export (GDPR-Style Full User Data Export)
syncRouter.get('/export', async (c) => {
  const authUser = c.get('user');
  const db = getDb();

  const userData = await SyncRepository.exportUserData(db, authUser.sub);

  return c.json({
    version: 1,
    exportedAt: new Date().toISOString(),
    user: {
      id: authUser.sub,
      email: authUser.email
    },
    tables: userData
  });
});

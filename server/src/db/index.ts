import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import pg from 'pg';
import { env } from '../config/env.js';
import * as schema from './schema.js';
import logger from '../utils/logger.js';

const { Pool } = pg;

export type Database = ReturnType<typeof drizzle<typeof schema>>;

let pool: pg.Pool | null = null;
let dbInstance: Database | null = null;

export function getDb(): Database {
  if (dbInstance) return dbInstance;

  pool = new Pool({
    connectionString: env.DATABASE_URL,
    ssl: env.DATABASE_URL.includes('sslmode=require') || env.NODE_ENV === 'production' 
      ? { rejectUnauthorized: false } 
      : false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000
  });

  pool.on('error', (err) => {
    logger.error({ err }, 'Unexpected database pool error');
  });

  dbInstance = drizzle(pool, { schema });
  return dbInstance;
}

// Allows injecting a test database (e.g. PGlite or test instance)
export function setDb(customDb: Database) {
  dbInstance = customDb;
}

export async function healthCheck(): Promise<boolean> {
  try {
    const db = getDb();
    // Execute ping
    const res = await db.execute(sql`SELECT 1 as ping`);
    return Array.isArray(res.rows) && res.rows.length > 0;
  } catch (err) {
    logger.warn({ err }, 'Database health check failed');
    return false;
  }
}

export async function closeDb(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    dbInstance = null;
  }
}

export const db = getDb;
export default db;

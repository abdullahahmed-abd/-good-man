import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { getDb, closeDb } from './index.js';
import logger from '../utils/logger.js';
import path from 'path';

export async function runMigrations() {
  logger.info('Running database migrations...');
  const db = getDb();
  const migrationsFolder = path.resolve(process.cwd(), 'drizzle');

  try {
    await migrate(db, { migrationsFolder });
    logger.info('Database migrations applied successfully.');
  } catch (err) {
    logger.error({ err }, 'Failed running database migrations');
    throw err;
  }
}

// Run directly if script entry
if (process.argv[1]?.endsWith('migrate.ts') || process.argv[1]?.endsWith('migrate.js')) {
  runMigrations()
    .then(() => closeDb())
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

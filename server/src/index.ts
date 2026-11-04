import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { healthCheck, closeDb } from './db/index.js';
import { requestIdMiddleware } from './middleware/requestId.js';
import { secureHeadersMiddleware, strictCorsMiddleware, bodyLimitMiddleware } from './middleware/security.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { authRouter } from './routes/auth.js';
import { syncRouter } from './routes/sync.js';

export const app = new Hono();

// Global Middleware Pipeline
app.use('*', requestIdMiddleware);
app.use('*', secureHeadersMiddleware);
app.use('*', strictCorsMiddleware);
app.use('*', bodyLimitMiddleware);

// Structured Request Logger
app.use('*', async (c, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  // Exclude healthcheck from chatty logs if desired
  if (c.req.path !== '/health') {
    logger.info({
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
      durationMs: ms,
      reqId: c.get('requestId')
    }, `${c.req.method} ${c.req.path} -> ${c.res.status} (${ms}ms)`);
  }
});

// GET /health - DB Ping & Uptime
app.get('/health', async (c) => {
  const isDbHealthy = await healthCheck();
  const statusCode = isDbHealthy ? 200 : 503;

  return c.json({
    status: isDbHealthy ? 'ok' : 'degraded',
    uptimeSeconds: Math.floor(process.uptime()),
    database: isDbHealthy ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  }, statusCode);
});

// Mount Routes (both under /auth & /sync and /api/auth & /api/sync for proxy compatibility)
app.route('/auth', authRouter);
app.route('/sync', syncRouter);
app.route('/api/auth', authRouter);
app.route('/api/sync', syncRouter);

// 404 & Centralized Error Handlers
app.notFound(notFoundHandler);
app.onError(errorHandler);

// Start Server (when not imported by Vitest)
let serverInstance: any = null;

if (process.env.NODE_ENV !== 'test') {
  serverInstance = serve({
    fetch: app.fetch,
    port: env.PORT
  }, (info) => {
    logger.info(`✨ Insaan Sovereign Backend listening on http://localhost:${info.port} [${env.NODE_ENV}]`);
  });

  // Graceful Shutdown
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Gracefully shutting down Insaan backend...`);
    if (serverInstance) {
      serverInstance.close();
    }
    await closeDb();
    logger.info('Database pool closed. Process exiting.');
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

export default app;

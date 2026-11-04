import type { MiddlewareHandler } from 'hono';
import crypto from 'crypto';

export const requestIdMiddleware: MiddlewareHandler = async (c, next) => {
  const reqId = c.req.header('x-request-id') || crypto.randomUUID();
  c.set('requestId', reqId);
  c.header('X-Request-ID', reqId);
  await next();
};

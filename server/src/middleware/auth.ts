import type { MiddlewareHandler } from 'hono';
import { verifyAccessToken, type JwtPayload } from '../services/auth.js';
import { AppError } from './errorHandler.js';

declare module 'hono' {
  interface ContextVariableMap {
    user: JwtPayload;
    requestId: string;
  }
}

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Authentication required. Missing Bearer token.', 401, 'UNAUTHORIZED');
  }

  const token = authHeader.substring(7).trim();
  const payload = verifyAccessToken(token);

  if (!payload) {
    throw new AppError('Access token is invalid or has expired.', 401, 'TOKEN_EXPIRED');
  }

  c.set('user', payload);
  await next();
};

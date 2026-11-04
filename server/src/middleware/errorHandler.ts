import type { ErrorHandler, NotFoundHandler } from 'hono';
import { ZodError } from 'zod';
import logger from '../utils/logger.js';

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details?: unknown;

  constructor(message: string, statusCode = 400, code = 'BAD_REQUEST', details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export const errorHandler: ErrorHandler = (err, c) => {
  const reqId = c.get('requestId') || 'unknown';

  // Handle Zod Validation Error
  if (err instanceof ZodError) {
    return c.json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request payload or query parameters.',
        details: err.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }))
      }
    }, 400);
  }

  // Handle Known AppError
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error({ err, reqId }, `Server error: ${err.message}`);
    }
    return c.json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details
      }
    }, err.statusCode as any);
  }

  // Unhandled Unexpected Error
  logger.error({ err, reqId }, `Unhandled internal error: ${err.message}`);
  return c.json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected internal error occurred. Please try again later.'
    }
  }, 500);
};

export const notFoundHandler: NotFoundHandler = (c) => {
  return c.json({
    error: {
      code: 'NOT_FOUND',
      message: `The requested endpoint ${c.req.method} ${c.req.path} does not exist.`
    }
  }, 404);
};

import type { MiddlewareHandler } from 'hono';
import { env } from '../config/env.js';

// Secure HTTP Headers
export const secureHeadersMiddleware: MiddlewareHandler = async (c, next) => {
  await next();
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('Referrer-Policy', 'no-referrer');
  c.header('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none';");
  if (env.NODE_ENV === 'production') {
    c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
};

// Strict CORS Middleware
export const strictCorsMiddleware: MiddlewareHandler = async (c, next) => {
  const origin = c.req.header('origin');
  const allowedOrigin = env.FRONTEND_ORIGIN;

  // Handle preflight
  if (c.req.method === 'OPTIONS') {
    if (origin && (origin === allowedOrigin || allowedOrigin === '*' || env.NODE_ENV === 'development')) {
      c.header('Access-Control-Allow-Origin', origin);
      c.header('Access-Control-Allow-Credentials', 'true');
      c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-Request-ID');
      c.header('Access-Control-Max-Age', '86400');
      return c.body(null, 204);
    }
    return c.body(null, 403);
  }

  // Normal request
  if (origin) {
    if (origin === allowedOrigin || allowedOrigin === '*' || env.NODE_ENV === 'development') {
      c.header('Access-Control-Allow-Origin', origin);
      c.header('Access-Control-Allow-Credentials', 'true');
    }
  }

  await next();
};

// Request Body Size Limit Middleware (1 MB max)
export const bodyLimitMiddleware: MiddlewareHandler = async (c, next) => {
  const contentLength = c.req.header('content-length');
  if (contentLength && parseInt(contentLength, 10) > 1024 * 1024) {
    return c.json({
      error: {
        code: 'PAYLOAD_TOO_LARGE',
        message: 'Request body exceeds the maximum permitted size of 1 MB.'
      }
    }, 413);
  }
  await next();
};

// CSRF Defense for Cookie-authenticated routes
export const csrfProtectionMiddleware: MiddlewareHandler = async (c, next) => {
  const customHeader = c.req.header('x-requested-with');
  const origin = c.req.header('origin');
  
  // Safe methods skip CSRF
  if (c.req.method === 'GET' || c.req.method === 'HEAD' || c.req.method === 'OPTIONS') {
    return await next();
  }

  // Check custom header or origin matching
  if (!customHeader && (!origin || (origin !== env.FRONTEND_ORIGIN && env.NODE_ENV === 'production'))) {
    return c.json({
      error: {
        code: 'CSRF_REJECTED',
        message: 'Invalid cross-site request. Missing required verification header.'
      }
    }, 403);
  }

  await next();
};

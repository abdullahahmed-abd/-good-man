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

// Origin check helper supporting web frontend and Capacitor native apps
export const isAllowedOrigin = (origin: string | undefined): boolean => {
  if (!origin) return false;
  if (origin === env.FRONTEND_ORIGIN || env.FRONTEND_ORIGIN === '*') return true;
  if (env.NODE_ENV === 'development') return true;
  // Allow native Capacitor webview origins
  if (origin === 'https://localhost' || origin === 'capacitor://localhost' || origin === 'http://localhost') {
    return true;
  }
  return false;
};

// Strict CORS Middleware
export const strictCorsMiddleware: MiddlewareHandler = async (c, next) => {
  const origin = c.req.header('origin');

  // Handle preflight
  if (c.req.method === 'OPTIONS') {
    if (isAllowedOrigin(origin)) {
      c.header('Access-Control-Allow-Origin', origin!);
      c.header('Access-Control-Allow-Credentials', 'true');
      c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-Request-ID, X-Refresh-Token');
      c.header('Access-Control-Max-Age', '86400');
      return c.body(null, 204);
    }
    return c.body(null, 403);
  }

  // Normal request
  if (origin && isAllowedOrigin(origin)) {
    c.header('Access-Control-Allow-Origin', origin);
    c.header('Access-Control-Allow-Credentials', 'true');
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
  if (!customHeader && (!origin || (!isAllowedOrigin(origin) && env.NODE_ENV === 'production'))) {
    return c.json({
      error: {
        code: 'CSRF_REJECTED',
        message: 'Invalid cross-site request. Missing required verification header.'
      }
    }, 403);
  }

  await next();
};

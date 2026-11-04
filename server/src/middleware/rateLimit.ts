import type { MiddlewareHandler } from 'hono';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

interface LockoutRecord {
  failures: number;
  lockedUntil: number;
}

class InMemoryRateLimiter {
  private ipLimits = new Map<string, RateLimitRecord>();
  private lockouts = new Map<string, LockoutRecord>();

  // Rate limit check
  check(key: string, maxRequests: number, windowMs: number): { allowed: boolean; retryAfterSec?: number } {
    const now = Date.now();
    const record = this.ipLimits.get(key);

    if (!record || now > record.resetAt) {
      this.ipLimits.set(key, { count: 1, resetAt: now + windowMs });
      return { allowed: true };
    }

    if (record.count >= maxRequests) {
      const retryAfterSec = Math.ceil((record.resetAt - now) / 1000);
      return { allowed: false, retryAfterSec };
    }

    record.count++;
    return { allowed: true };
  }

  // Account Lockout check (for login attempts per email/IP)
  isLocked(identifier: string): { locked: boolean; retryAfterSec?: number } {
    const now = Date.now();
    const record = this.lockouts.get(identifier);
    if (!record) return { locked: false };

    if (now < record.lockedUntil) {
      return { locked: true, retryAfterSec: Math.ceil((record.lockedUntil - now) / 1000) };
    }

    // Lockout expired
    if (record.lockedUntil > 0 && now >= record.lockedUntil) {
      this.lockouts.delete(identifier);
    }

    return { locked: false };
  }

  recordFailure(identifier: string) {
    const now = Date.now();
    const record = this.lockouts.get(identifier) || { failures: 0, lockedUntil: 0 };
    record.failures++;

    // Lockout progression: 5 failures -> 5m, 10 failures -> 15m, 15+ failures -> 60m
    if (record.failures >= 15) {
      record.lockedUntil = now + 60 * 60 * 1000;
    } else if (record.failures >= 10) {
      record.lockedUntil = now + 15 * 60 * 1000;
    } else if (record.failures >= 5) {
      record.lockedUntil = now + 5 * 60 * 1000;
    }

    this.lockouts.set(identifier, record);
  }

  resetFailure(identifier: string) {
    this.lockouts.delete(identifier);
  }
}

export const rateLimiter = new InMemoryRateLimiter();

export function createRateLimitMiddleware(options: { max: number; windowMs: number; keyPrefix?: string }): MiddlewareHandler {
  return async (c, next) => {
    // In test environment, skip rate limiting to avoid test interference
    if (process.env.NODE_ENV === 'test') {
      return await next();
    }

    const ip = c.req.header('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    const key = `${options.keyPrefix || 'global'}:${ip}`;

    const { allowed, retryAfterSec } = rateLimiter.check(key, options.max, options.windowMs);

    if (!allowed) {
      c.header('Retry-After', String(retryAfterSec || 60));
      return c.json({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: `Too many requests. Please slow down and try again in ${retryAfterSec} seconds.`
        }
      }, 429);
    }

    await next();
  };
}

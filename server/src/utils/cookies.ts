import type { Context } from 'hono';
import { setCookie, deleteCookie, getCookie } from 'hono/cookie';
import { env } from '../config/env.js';

export const REFRESH_COOKIE_NAME = 'insaan_refresh_token';

export function setRefreshTokenCookie(c: Context, token: string) {
  setCookie(c, REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'Lax',
    path: '/api/auth',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  });
}

export function clearRefreshTokenCookie(c: Context) {
  deleteCookie(c, REFRESH_COOKIE_NAME, {
    path: '/api/auth',
    secure: env.NODE_ENV === 'production',
    sameSite: 'Lax'
  });
}

export function getRefreshTokenCookie(c: Context): string | undefined {
  return getCookie(c, REFRESH_COOKIE_NAME);
}

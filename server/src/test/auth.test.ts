import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { app } from '../index.js';
import { initTestDb, clearAllTables } from './setup.js';

describe('Auth System & Security Tests', () => {
  beforeAll(async () => {
    await initTestDb();
  });

  beforeEach(async () => {
    await clearAllTables();
  });

  it('rejects passwords shorter than 10 characters or common passwords', async () => {
    // Too short
    const shortRes = await app.request('/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'short@example.com',
        password: 'pass'
      })
    });
    expect(shortRes.status).toBe(400);

    // Common password
    const commonRes = await app.request('/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'common@example.com',
        password: 'password1234'
      })
    });
    expect(commonRes.status).toBe(400);
  });

  it('signs up a new user, hashes with Argon2id, and returns access token', async () => {
    const res = await app.request('/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@insaan.app',
        password: 'secure-philosophy-password-2026',
        name: 'Marcus'
      })
    });

    expect(res.status).toBe(201);
    const data = (await res.json()) as any;
    expect(data.accessToken).toBeDefined();
    expect(data.user.email).toBe('test@insaan.app');
    expect(data.user.name).toBe('Marcus');

    // Verify Set-Cookie header contains refresh token
    const cookieHeader = res.headers.get('set-cookie');
    expect(cookieHeader).toContain('insaan_refresh_token=');
    expect(cookieHeader).toContain('HttpOnly');
    expect(cookieHeader).toContain('Path=/api/auth');
  });

  it('provides uniform error for wrong password or non-existent email (anti-enumeration)', async () => {
    // 1. Create a user
    await app.request('/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'seeker@insaan.app',
        password: 'correct-password-alpha-omega',
        name: 'Seeker'
      })
    });

    // 2. Wrong password
    const wrongPwRes = await app.request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'seeker@insaan.app',
        password: 'incorrect-password-guess'
      })
    });
    expect(wrongPwRes.status).toBe(401);
    const wrongPwData = (await wrongPwRes.json()) as any;
    expect(wrongPwData.error.code).toBe('INVALID_CREDENTIALS');

    // 3. Non-existent email
    const nonExistentRes = await app.request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'ghost@insaan.app',
        password: 'any-password-at-all'
      })
    });
    expect(nonExistentRes.status).toBe(401);
    const nonExistentData = (await nonExistentRes.json()) as any;
    expect(nonExistentData.error.code).toBe('INVALID_CREDENTIALS');
    expect(nonExistentData.error.message).toBe(wrongPwData.error.message);
  });

  it('rotates refresh tokens and detects token reuse (family revocation)', async () => {
    // 1. Signup
    const signupRes = await app.request('/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'rotation@insaan.app',
        password: 'stoic-virtue-strength-999'
      })
    });

    const cookie1 = signupRes.headers.get('set-cookie')!.split(';')[0];
    expect(cookie1).toContain('insaan_refresh_token=');

    // 2. First refresh: valid -> receives rotated cookie 2
    const refresh1Res = await app.request('/auth/refresh', {
      method: 'POST',
      headers: {
        'Cookie': cookie1,
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    expect(refresh1Res.status).toBe(200);
    const refresh1Data = (await refresh1Res.json()) as any;
    expect(refresh1Data.accessToken).toBeDefined();

    const cookie2 = refresh1Res.headers.get('set-cookie')!.split(';')[0];
    expect(cookie2).not.toBe(cookie1);

    // 3. REUSE DETECTION ATTACK SIMULATION:
    // Malicious actor reuses the already-used cookie1!
    const reuseAttackRes = await app.request('/auth/refresh', {
      method: 'POST',
      headers: {
        'Cookie': cookie1,
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    // The server must detect that cookie1 was already revoked/replaced, and revoke the whole family!
    expect(reuseAttackRes.status).toBe(401);
    const reuseData = (await reuseAttackRes.json()) as any;
    expect(reuseData.error.code).toBe('TOKEN_REUSE_DETECTED');

    // 4. Legitimate user tries to use cookie2 now -> rejected because family is revoked!
    const subsequentRes = await app.request('/auth/refresh', {
      method: 'POST',
      headers: {
        'Cookie': cookie2,
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    expect(subsequentRes.status).toBe(401);
  });

  it('supports logout and revokes active session', async () => {
    const signupRes = await app.request('/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'logout@insaan.app',
        password: 'stoic-virtue-strength-888'
      })
    });

    const cookie = signupRes.headers.get('set-cookie')!.split(';')[0];

    const logoutRes = await app.request('/auth/logout', {
      method: 'POST',
      headers: {
        'Cookie': cookie,
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    expect(logoutRes.status).toBe(200);

    // Refreshing with the logged-out cookie must now fail
    const refreshRes = await app.request('/auth/refresh', {
      method: 'POST',
      headers: {
        'Cookie': cookie,
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    expect(refreshRes.status).toBe(401);
  });
});

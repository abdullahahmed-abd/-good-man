import { Hono } from 'hono';
import { eq, and, isNull, desc, ne } from 'drizzle-orm';
import crypto from 'crypto';
import { 
  SignupInputSchema, 
  LoginInputSchema, 
  VerifyEmailInputSchema, 
  ResendVerificationInputSchema, 
  ForgotPasswordInputSchema, 
  ResetPasswordInputSchema, 
  ChangePasswordInputSchema, 
  DeleteAccountInputSchema 
} from '@insaan/shared';
import { getDb } from '../db/index.js';
import { users, refreshTokens, emailTokens, userProfile } from '../db/schema.js';
import { 
  hashPassword, 
  verifyPassword, 
  normalizeEmail, 
  signAccessToken, 
  generateOpaqueToken, 
  hashToken, 
  hashIp 
} from '../services/auth.js';
import { emailService } from '../services/email.js';
import { authMiddleware } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { setRefreshTokenCookie, clearRefreshTokenCookie, getRefreshTokenCookie } from '../utils/cookies.js';
import { csrfProtectionMiddleware } from '../middleware/security.js';
import { rateLimiter, createRateLimitMiddleware } from '../middleware/rateLimit.js';
import logger from '../utils/logger.js';

export const authRouter = new Hono();

// Rate limiting on auth endpoints (15 req / min per IP)
authRouter.use('*', createRateLimitMiddleware({ max: 20, windowMs: 60 * 1000, keyPrefix: 'auth' }));

// 1. SIGNUP
authRouter.post('/signup', async (c) => {
  const body = await c.req.json();
  const input = SignupInputSchema.parse(body);
  const db = getDb();
  const email = normalizeEmail(input.email);

  // Check if user already exists
  const existing = await db.query.users.findFirst({
    where: eq(users.email, email)
  });

  if (existing) {
    // Return generic error or constant-time feel to prevent user enumeration
    throw new AppError('An account with this email address already exists. Please log in or reset your password.', 409, 'EMAIL_EXISTS');
  }

  // Hash password with Argon2id
  const passwordHash = await hashPassword(input.password);

  // Create user
  const [newUser] = await db.insert(users).values({
    email,
    passwordHash,
    isEmailVerified: false
  }).returning();

  // Create initial user_profile record
  await db.insert(userProfile).values({
    id: crypto.randomUUID(),
    userId: newUser.id,
    name: input.name || 'Seeker',
    clientUpdatedAt: new Date()
  });

  // Generate 24h email verification token
  const rawVerifyToken = generateOpaqueToken();
  await db.insert(emailTokens).values({
    userId: newUser.id,
    tokenHash: hashToken(rawVerifyToken),
    type: 'verify_email',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
  });

  // Send verification email in background
  emailService.sendVerificationEmail(email, rawVerifyToken).catch(() => {});

  // Create initial refresh token & session
  const rawRefreshToken = generateOpaqueToken();
  const familyId = crypto.randomUUID();
  const userAgent = c.req.header('user-agent') || 'Unknown';
  const ip = c.req.header('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';

  await db.insert(refreshTokens).values({
    userId: newUser.id,
    tokenHash: hashToken(rawRefreshToken),
    familyId,
    deviceLabel: userAgent.slice(0, 100),
    userAgent,
    ipHash: hashIp(ip),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  });

  // Set HTTP-only cookie and sign JWT
  setRefreshTokenCookie(c, rawRefreshToken);
  const accessToken = signAccessToken({
    sub: newUser.id,
    email: newUser.email,
    isEmailVerified: newUser.isEmailVerified
  });

  return c.json({
    user: {
      id: newUser.id,
      email: newUser.email,
      name: input.name || 'Seeker',
      isEmailVerified: newUser.isEmailVerified,
      createdAt: newUser.createdAt.toISOString()
    },
    accessToken,
    refreshToken: rawRefreshToken
  }, 201);
});

// 2. LOGIN
authRouter.post('/login', async (c) => {
  const body = await c.req.json();
  const input = LoginInputSchema.parse(body);
  const email = normalizeEmail(input.email);
  const ip = c.req.header('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';

  // Check account lockout
  const lockoutCheck = rateLimiter.isLocked(email);
  if (lockoutCheck.locked) {
    throw new AppError(
      `Account temporarily locked due to multiple failed attempts. Please try again in ${lockoutCheck.retryAfterSec} seconds.`,
      429,
      'ACCOUNT_LOCKED'
    );
  }

  const db = getDb();
  const user = await db.query.users.findFirst({
    where: eq(users.email, email)
  });

  // Dummy hash to execute in constant time even if email doesn't exist
  const dummyHash = '$argon2id$v=19$m=19456,t=2,p=1$c29tZXNhbHQ1Njc4OTAxMg$R+sV1g1234567890123456789012345678901234567';

  let isValid = false;
  if (user) {
    isValid = await verifyPassword(input.password, user.passwordHash);
  } else {
    await verifyPassword(input.password, dummyHash);
  }

  if (!user || !isValid) {
    rateLimiter.recordFailure(email);
    rateLimiter.recordFailure(ip);
    throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
  }

  // Login succeeded: reset failure count
  rateLimiter.resetFailure(email);
  rateLimiter.resetFailure(ip);

  // Generate refresh token with new familyId
  const rawRefreshToken = generateOpaqueToken();
  const familyId = crypto.randomUUID();
  const userAgent = c.req.header('user-agent') || 'Unknown';

  await db.insert(refreshTokens).values({
    userId: user.id,
    tokenHash: hashToken(rawRefreshToken),
    familyId,
    deviceLabel: userAgent.slice(0, 100),
    userAgent,
    ipHash: hashIp(ip),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  });

  setRefreshTokenCookie(c, rawRefreshToken);
  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    isEmailVerified: user.isEmailVerified
  });

  const profile = await db.query.userProfile.findFirst({
    where: eq(userProfile.userId, user.id)
  });

  return c.json({
    user: {
      id: user.id,
      email: user.email,
      name: profile?.name || 'Seeker',
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt.toISOString()
    },
    accessToken,
    refreshToken: rawRefreshToken
  });
});

// 3. REFRESH TOKEN (Rotation with Reuse Detection)
authRouter.post('/refresh', csrfProtectionMiddleware, async (c) => {
  let rawRefreshToken: string | undefined = getRefreshTokenCookie(c);
  if (!rawRefreshToken) {
    rawRefreshToken = c.req.header('x-refresh-token') || undefined;
  }
  if (!rawRefreshToken) {
    try {
      const jsonBody = await c.req.json().catch(() => null);
      if (jsonBody && typeof jsonBody.refreshToken === 'string') {
        rawRefreshToken = jsonBody.refreshToken;
      }
    } catch (_) {}
  }

  if (!rawRefreshToken) {
    throw new AppError('No refresh token provided in session cookie or X-Refresh-Token header.', 401, 'NO_REFRESH_TOKEN');
  }

  const tokenHash = hashToken(rawRefreshToken);
  const db = getDb();

  const tokenRecord = await db.query.refreshTokens.findFirst({
    where: eq(refreshTokens.tokenHash, tokenHash)
  });

  if (!tokenRecord) {
    clearRefreshTokenCookie(c);
    throw new AppError('Invalid refresh token.', 401, 'INVALID_REFRESH_TOKEN');
  }

  // REUSE DETECTION: If this token was already revoked, someone is replaying a stolen token!
  if (tokenRecord.revokedAt !== null) {
    logger.warn({ userId: tokenRecord.userId, familyId: tokenRecord.familyId }, 'SECURITY: Refresh token reuse detected! Revoking token family.');
    
    // Revoke all tokens in this family
    await db.update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.familyId, tokenRecord.familyId));

    clearRefreshTokenCookie(c);
    throw new AppError('Security violation: Replay of revoked session token. All sessions revoked for safety.', 401, 'TOKEN_REUSE_DETECTED');
  }

  // Check expiration
  if (tokenRecord.expiresAt < new Date()) {
    clearRefreshTokenCookie(c);
    throw new AppError('Session expired. Please log in again.', 401, 'SESSION_EXPIRED');
  }

  // Fetch active user
  const user = await db.query.users.findFirst({
    where: eq(users.id, tokenRecord.userId)
  });

  if (!user) {
    clearRefreshTokenCookie(c);
    throw new AppError('User not found.', 401, 'USER_NOT_FOUND');
  }

  // TOKEN ROTATION:
  // 1. Generate new refresh token
  const newRawRefreshToken = generateOpaqueToken();
  const newTokenHash = hashToken(newRawRefreshToken);
  const now = new Date();

  // 2. Revoke current token and link replacedBy
  await db.update(refreshTokens)
    .set({
      revokedAt: now,
      replacedBy: newTokenHash
    })
    .where(eq(refreshTokens.id, tokenRecord.id));

  // 3. Insert new token in same family
  await db.insert(refreshTokens).values({
    userId: user.id,
    tokenHash: newTokenHash,
    familyId: tokenRecord.familyId,
    deviceLabel: tokenRecord.deviceLabel,
    userAgent: c.req.header('user-agent') || tokenRecord.userAgent,
    ipHash: hashIp(c.req.header('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1'),
    expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  });

  // 4. Set new cookie and sign new access token
  setRefreshTokenCookie(c, newRawRefreshToken);
  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    isEmailVerified: user.isEmailVerified
  });

  return c.json({
    accessToken,
    refreshToken: newRawRefreshToken,
    user: {
      id: user.id,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt.toISOString()
    }
  });
});

// 4. LOGOUT (Single device)
authRouter.post('/logout', csrfProtectionMiddleware, async (c) => {
  let rawRefreshToken: string | undefined = getRefreshTokenCookie(c);
  if (!rawRefreshToken) {
    rawRefreshToken = c.req.header('x-refresh-token') || undefined;
  }
  if (!rawRefreshToken) {
    try {
      const jsonBody = await c.req.json().catch(() => null);
      if (jsonBody && typeof jsonBody.refreshToken === 'string') {
        rawRefreshToken = jsonBody.refreshToken;
      }
    } catch (_) {}
  }

  if (rawRefreshToken) {
    const db = getDb();
    await db.update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.tokenHash, hashToken(rawRefreshToken)));
  }

  clearRefreshTokenCookie(c);
  return c.json({ success: true, message: 'Logged out successfully.' });
});

// 5. LOGOUT ALL DEVICES
authRouter.post('/logout-all', authMiddleware, async (c) => {
  const authUser = c.get('user');
  const db = getDb();

  await db.update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(eq(refreshTokens.userId, authUser.sub));

  clearRefreshTokenCookie(c);
  return c.json({ success: true, message: 'All active sessions have been terminated.' });
});

// 6. VERIFY EMAIL
authRouter.post('/verify-email', async (c) => {
  const body = await c.req.json();
  const input = VerifyEmailInputSchema.parse(body);
  const tokenHash = hashToken(input.token);
  const db = getDb();

  const record = await db.query.emailTokens.findFirst({
    where: and(
      eq(emailTokens.tokenHash, tokenHash),
      eq(emailTokens.type, 'verify_email'),
      isNull(emailTokens.usedAt)
    )
  });

  if (!record || record.expiresAt < new Date()) {
    throw new AppError('Verification link is invalid or has expired.', 400, 'INVALID_TOKEN');
  }

  // Mark token as used & verify user
  await db.update(emailTokens)
    .set({ usedAt: new Date() })
    .where(eq(emailTokens.id, record.id));

  await db.update(users)
    .set({ isEmailVerified: true, updatedAt: new Date() })
    .where(eq(users.id, record.userId));

  return c.json({ success: true, message: 'Email verified successfully.' });
});

// 7. RESEND VERIFICATION
authRouter.post('/resend-verification', async (c) => {
  const body = await c.req.json();
  const input = ResendVerificationInputSchema.parse(body);
  const email = normalizeEmail(input.email);
  const db = getDb();

  const user = await db.query.users.findFirst({
    where: eq(users.email, email)
  });

  if (user && !user.isEmailVerified) {
    const rawVerifyToken = generateOpaqueToken();
    await db.insert(emailTokens).values({
      userId: user.id,
      tokenHash: hashToken(rawVerifyToken),
      type: 'verify_email',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    emailService.sendVerificationEmail(email, rawVerifyToken).catch(() => {});
  }

  // Generic message prevents user enumeration
  return c.json({ success: true, message: 'If this account exists and is unverified, a new link has been sent.' });
});

// 8. FORGOT PASSWORD
authRouter.post('/forgot-password', async (c) => {
  const body = await c.req.json();
  const input = ForgotPasswordInputSchema.parse(body);
  const email = normalizeEmail(input.email);
  const db = getDb();

  const user = await db.query.users.findFirst({
    where: eq(users.email, email)
  });

  if (user) {
    const rawResetToken = generateOpaqueToken();
    await db.insert(emailTokens).values({
      userId: user.id,
      tokenHash: hashToken(rawResetToken),
      type: 'password_reset',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 min expiry
    });

    emailService.sendPasswordResetEmail(email, rawResetToken).catch(() => {});
  }

  // Generic response prevents email enumeration
  return c.json({ success: true, message: 'If an account exists with this email, a password reset link has been dispatched.' });
});

// 9. RESET PASSWORD (Single-use, expires in 30m, revokes all sessions)
authRouter.post('/reset-password', async (c) => {
  const body = await c.req.json();
  const input = ResetPasswordInputSchema.parse(body);
  const tokenHash = hashToken(input.token);
  const db = getDb();

  const record = await db.query.emailTokens.findFirst({
    where: and(
      eq(emailTokens.tokenHash, tokenHash),
      eq(emailTokens.type, 'password_reset'),
      isNull(emailTokens.usedAt)
    )
  });

  if (!record || record.expiresAt < new Date()) {
    throw new AppError('Password reset link is invalid or has expired.', 400, 'INVALID_TOKEN');
  }

  // Hash new password
  const newPasswordHash = await hashPassword(input.newPassword);

  // Update password
  await db.update(users)
    .set({ passwordHash: newPasswordHash, updatedAt: new Date() })
    .where(eq(users.id, record.userId));

  // Mark token used
  await db.update(emailTokens)
    .set({ usedAt: new Date() })
    .where(eq(emailTokens.id, record.id));

  // Revoke all existing sessions for safety
  await db.update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(eq(refreshTokens.userId, record.userId));

  clearRefreshTokenCookie(c);

  return c.json({ success: true, message: 'Password has been reset successfully. Please log in with your new password.' });
});

// 10. GET /auth/me
authRouter.get('/me', authMiddleware, async (c) => {
  const authUser = c.get('user');
  const db = getDb();

  const user = await db.query.users.findFirst({
    where: eq(users.id, authUser.sub)
  });

  if (!user) {
    throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
  }

  const profile = await db.query.userProfile.findFirst({
    where: eq(userProfile.userId, user.id)
  });

  return c.json({
    user: {
      id: user.id,
      email: user.email,
      name: profile?.name || 'Seeker',
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt.toISOString()
    }
  });
});

// 11. GET /auth/sessions (List active sessions)
authRouter.get('/sessions', authMiddleware, async (c) => {
  const authUser = c.get('user');
  const db = getDb();

  const activeSessions = await db.query.refreshTokens.findMany({
    where: and(
      eq(refreshTokens.userId, authUser.sub),
      isNull(refreshTokens.revokedAt)
    ),
    orderBy: desc(refreshTokens.createdAt)
  });

  const rawCookieToken = getRefreshTokenCookie(c);
  const currentTokenHash = rawCookieToken ? hashToken(rawCookieToken) : null;

  return c.json({
    sessions: activeSessions.map(s => ({
      id: s.id,
      deviceLabel: s.deviceLabel,
      userAgent: s.userAgent,
      ipHash: s.ipHash,
      createdAt: s.createdAt.toISOString(),
      expiresAt: s.expiresAt.toISOString(),
      isCurrent: s.tokenHash === currentTokenHash
    }))
  });
});

// 12. DELETE /auth/sessions/:id (Revoke specific device session)
authRouter.delete('/sessions/:id', authMiddleware, async (c) => {
  const authUser = c.get('user');
  const sessionId = c.req.param('id');
  const db = getDb();

  await db.update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(and(
      eq(refreshTokens.id, sessionId),
      eq(refreshTokens.userId, authUser.sub)
    ));

  return c.json({ success: true, message: 'Session revoked.' });
});

// 13. POST /auth/change-password
authRouter.post('/change-password', authMiddleware, async (c) => {
  const authUser = c.get('user');
  const body = await c.req.json();
  const input = ChangePasswordInputSchema.parse(body);
  const db = getDb();

  const user = await db.query.users.findFirst({
    where: eq(users.id, authUser.sub)
  });

  if (!user) {
    throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
  }

  const isCurrentValid = await verifyPassword(input.currentPassword, user.passwordHash);
  if (!isCurrentValid) {
    throw new AppError('Current password is incorrect.', 400, 'INVALID_PASSWORD');
  }

  const newHash = await hashPassword(input.newPassword);
  await db.update(users)
    .set({ passwordHash: newHash, updatedAt: new Date() })
    .where(eq(users.id, user.id));

  // Revoke other sessions (keep current session)
  const currentToken = getRefreshTokenCookie(c);
  if (currentToken) {
    const currentHash = hashToken(currentToken);
    await db.update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(and(
        eq(refreshTokens.userId, user.id),
        ne(refreshTokens.tokenHash, currentHash)
      ));
  }

  return c.json({ success: true, message: 'Password updated successfully. Other active sessions revoked.' });
});

// 14. DELETE /account (Permanent deletion)
authRouter.delete('/account', authMiddleware, async (c) => {
  const authUser = c.get('user');
  const body = await c.req.json();
  const input = DeleteAccountInputSchema.parse(body);
  const db = getDb();

  const user = await db.query.users.findFirst({
    where: eq(users.id, authUser.sub)
  });

  if (!user) {
    throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
  }

  const isPasswordValid = await verifyPassword(input.password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError('Incorrect password. Account deletion canceled.', 400, 'INVALID_PASSWORD');
  }

  // Hard delete user (ON DELETE CASCADE removes all 17 sync tables, refresh tokens, and email tokens!)
  await db.delete(users).where(eq(users.id, user.id));
  clearRefreshTokenCookie(c);

  return c.json({ success: true, message: 'Your account and all synchronized data have been permanently erased.' });
});

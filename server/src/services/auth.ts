import { hash, verify } from '@node-rs/argon2';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env.js';

export interface JwtPayload {
  sub: string; // user_id
  email: string;
  isEmailVerified: boolean;
  iat?: number;
  exp?: number;
}

// 1. Password Hashing with Argon2id (RFC 9106 recommended sane params)
export async function hashPassword(password: string): Promise<string> {
  return await hash(password, {
    memoryCost: 19456, // 19 MiB
    timeCost: 2,       // 2 iterations
    outputLen: 32,
    parallelism: 1
  });
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  try {
    return await verify(passwordHash, password);
  } catch (err) {
    return false;
  }
}

// 2. Opaque 256-bit Token Generator & SHA-256 Hasher
export function generateOpaqueToken(): string {
  return crypto.randomBytes(32).toString('hex'); // 64 chars hex = 256 bits of entropy
}

export function hashToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

// 3. 15-Minute Access Token (JWT)
export function signAccessToken(payload: { sub: string; email: string; isEmailVerified: boolean }): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: '15m',
    algorithm: 'HS256'
  });
}

export function verifyAccessToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET, { algorithms: ['HS256'] }) as JwtPayload;
  } catch (err) {
    return null;
  }
}

// 4. IP Hashing for privacy-preserving session security
export function hashIp(ip: string): string {
  return crypto.createHash('sha256').update(ip + env.JWT_REFRESH_SECRET).digest('hex').substring(0, 16);
}

// 5. Normalize Email
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

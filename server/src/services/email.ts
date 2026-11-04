import { Resend } from 'resend';
import { env } from '../config/env.js';
import logger from '../utils/logger.js';

export interface EmailService {
  sendVerificationEmail(toEmail: string, token: string): Promise<void>;
  sendPasswordResetEmail(toEmail: string, token: string): Promise<void>;
}

export class ResendEmailService implements EmailService {
  private client: Resend | null = null;

  constructor() {
    if (env.RESEND_API_KEY && env.RESEND_API_KEY.startsWith('re_') && env.RESEND_API_KEY !== 're_placeholder_key_in_dev') {
      this.client = new Resend(env.RESEND_API_KEY);
    }
  }

  async sendVerificationEmail(toEmail: string, token: string): Promise<void> {
    const verifyUrl = `${env.APP_URL}/auth/verify?token=${encodeURIComponent(token)}`;

    if (!this.client || env.NODE_ENV !== 'production') {
      logger.info({ toEmail, verifyUrl }, `[DEV EMAIL] Verification link for ${toEmail}: ${verifyUrl}`);
      return;
    }

    try {
      await this.client.emails.send({
        from: env.EMAIL_FROM,
        to: toEmail,
        subject: 'Verify your Insaan Account',
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; background: #090d16; color: #e2e8f0; border-radius: 16px;">
            <h2 style="color: #4ade80; margin-bottom: 16px;">Welcome to Insaan</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #94a3b8;">
              Thank you for embarking on your journey of self-mastery. Please verify your email to secure your sanctuary:
            </p>
            <div style="margin: 28px 0; text-align: center;">
              <a href="${verifyUrl}" style="background: #10b981; color: #022c22; font-weight: bold; padding: 12px 28px; border-radius: 12px; text-decoration: none; display: inline-block;">
                Verify My Account
              </a>
            </div>
            <p style="font-size: 12px; color: #64748b;">
              This link expires in 24 hours. If you did not create an Insaan account, please ignore this email.
            </p>
          </div>
        `
      });
    } catch (err) {
      logger.error({ err, toEmail }, `Failed to send verification email via Resend`);
    }
  }

  async sendPasswordResetEmail(toEmail: string, token: string): Promise<void> {
    const resetUrl = `${env.APP_URL}/auth/reset-password?token=${encodeURIComponent(token)}`;

    if (!this.client || env.NODE_ENV !== 'production') {
      logger.info({ toEmail, resetUrl }, `[DEV EMAIL] Password reset link for ${toEmail}: ${resetUrl}`);
      return;
    }

    try {
      await this.client.emails.send({
        from: env.EMAIL_FROM,
        to: toEmail,
        subject: 'Reset your Insaan Password',
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; background: #090d16; color: #e2e8f0; border-radius: 16px;">
            <h2 style="color: #f59e0b; margin-bottom: 16px;">Password Reset Request</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #94a3b8;">
              We received a request to reset your password. Click the button below to choose a new password:
            </p>
            <div style="margin: 28px 0; text-align: center;">
              <a href="${resetUrl}" style="background: #f59e0b; color: #451a03; font-weight: bold; padding: 12px 28px; border-radius: 12px; text-decoration: none; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="font-size: 12px; color: #64748b;">
              This link is single-use and expires in 30 minutes. If you did not make this request, your account remains secure.
            </p>
          </div>
        `
      });
    } catch (err) {
      logger.error({ err, toEmail }, `Failed to send password reset email via Resend`);
    }
  }
}

export const emailService: EmailService = new ResendEmailService();

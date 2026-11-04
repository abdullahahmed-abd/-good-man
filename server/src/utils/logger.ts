import pino from 'pino';
import { env } from '../config/env.js';

export const logger = pino({
  level: env.NODE_ENV === 'test' ? 'silent' : env.NODE_ENV === 'production' ? 'info' : 'debug',
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'password',
      'newPassword',
      'currentPassword',
      'token',
      'refreshToken',
      'accessToken',
      'content',
      'reflection',
      'note',
      'body.password',
      'body.newPassword',
      'body.currentPassword',
      'body.token',
      '*.password',
      '*.token',
      '*.content',
      '*.reflection'
    ],
    censor: '[REDACTED]'
  },
  timestamp: pino.stdTimeFunctions.isoTime
});

export default logger;

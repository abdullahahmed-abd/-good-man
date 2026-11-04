import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load .env if present
dotenv.config();

const isTest = process.env.NODE_ENV === 'test' || process.env.VITEST !== undefined;

const EnvSchema = z.object({
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters long'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters long'),
  FRONTEND_ORIGIN: z.string().min(1, 'FRONTEND_ORIGIN is required'),
  APP_URL: z.string().url('APP_URL must be a valid URL').default('http://localhost:5173'),
  RESEND_API_KEY: z.string().default(''),
  EMAIL_FROM: z.string().default('Insaan <noreply@insaan.app>')
});

export type Env = z.infer<typeof EnvSchema>;

let parsedEnv: Env;

// In automated test environments (Vitest / CI), provide safe test defaults for DB and secrets
const envInput = isTest
  ? {
      NODE_ENV: 'test',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/insaan_test',
      JWT_ACCESS_SECRET: 'test-jwt-access-secret-must-be-at-least-32-chars-long!',
      JWT_REFRESH_SECRET: 'test-jwt-refresh-secret-must-be-at-least-32-chars-long!',
      FRONTEND_ORIGIN: 'http://localhost:5173',
      APP_URL: 'http://localhost:5173',
      RESEND_API_KEY: '',
      PORT: 3001,
      ...process.env
    }
  : process.env;

try {
  parsedEnv = EnvSchema.parse(envInput);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('\n❌ FATAL CONFIGURATION ERROR: Missing or invalid environment variables:');
    error.errors.forEach((err) => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
    console.error('\nPlease check your .env file or deployment configuration.\n');
  } else {
    console.error('Fatal error loading environment variables:', error);
  }
  process.exit(1);
}

export const env = parsedEnv;
export default env;

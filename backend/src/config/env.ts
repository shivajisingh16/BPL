import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Centralised, typed access to environment configuration.
 * Everything that reads `process.env` should go through here so the rest of
 * the codebase never touches raw env vars directly.
 */
export const env = {
  port: Number(process.env.PORT ?? 3001),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  corsOrigins: (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  // Where the JSON-file store persists data. Relative paths resolve from the
  // process working directory (the `backend/` folder when running the scripts).
  dataFile: process.env.DATA_FILE
    ? path.resolve(process.env.DATA_FILE)
    : path.resolve(process.cwd(), 'data', 'bpl-db.json'),
  // When set (e.g. in production), the API also serves the built frontend from
  // this directory, so the whole app runs as a single service on one URL.
  clientDir: process.env.CLIENT_DIR ? path.resolve(process.env.CLIENT_DIR) : null,
  auth: {
    allowedDomain: process.env.AUTH_ALLOWED_DOMAIN ?? 'bot.com',
    password: process.env.AUTH_PASSWORD ?? 'secret',
    tokenSecret: process.env.AUTH_TOKEN_SECRET ?? 'change-me-in-production',
    tokenTtlHours: Number(process.env.AUTH_TOKEN_TTL_HOURS ?? 12),
  },
} as const;

export const isProd = env.nodeEnv === 'production';

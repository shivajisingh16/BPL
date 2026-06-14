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
  // MongoDB Atlas connection. `mongoUri` is required to start the server;
  // `mongoDbName` selects the database within the cluster.
  mongoUri: process.env.MONGODB_URI ?? '',
  mongoDbName: process.env.MONGODB_DB ?? 'bpl',
  // When set (e.g. in production), the API also serves the built frontend from
  // this directory, so the whole app runs as a single service on one URL.
  clientDir: process.env.CLIENT_DIR ? path.resolve(process.env.CLIENT_DIR) : null,
  auth: {
    // Domain used to derive each player's admin email (e.g. shivaji@bot.com).
    allowedDomain: process.env.AUTH_ALLOWED_DOMAIN ?? 'bot.com',
    // Shared password seeded for every player-derived admin account.
    password: process.env.AUTH_PASSWORD ?? 'secret',
    tokenSecret: process.env.AUTH_TOKEN_SECRET ?? 'change-me-in-production',
    tokenTtlHours: Number(process.env.AUTH_TOKEN_TTL_HOURS ?? 12),
    // Dedicated super-admin account, seeded alongside the players.
    admin: {
      email: (process.env.ADMIN_EMAIL ?? 'admin@bot.com').trim().toLowerCase(),
      password: process.env.ADMIN_PASSWORD ?? 'admin',
    },
  },
} as const;

export const isProd = env.nodeEnv === 'production';

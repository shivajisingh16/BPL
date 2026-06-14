import fs from 'fs';
import path from 'path';
import express, { type Application } from 'express';
import cors from 'cors';
import { env } from './config/env';
import apiRoutes from './routes';
import { notFound } from './middleware/notFound.middleware';
import { errorHandler } from './middleware/error.middleware';

/**
 * Builds and configures the Express application.
 * Kept separate from `server.ts` so it can be imported by tests without
 * binding to a port.
 */
export function createApp(): Application {
  const app = express();

  app.use(
    cors({
      // A single '*' means reflect any origin (handy for single-host deploys).
      origin: env.corsOrigins.includes('*') || env.corsOrigins.length === 0 ? true : env.corsOrigins,
      credentials: true,
    }),
  );
  app.use(express.json());

  // All API endpoints live under /api
  app.use('/api', apiRoutes);

  const clientDir = env.clientDir;
  if (clientDir && fs.existsSync(clientDir)) {
    // Production single-service mode: serve the built frontend and let the
    // SPA router handle client-side routes (anything that isn't /api).
    app.use(express.static(clientDir));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.join(clientDir, 'index.html'));
    });
  } else {
    // API-only mode (local dev): simple root info.
    app.get('/', (_req, res) => {
      res.json({
        success: true,
        data: { name: 'BPL — Bot Premiere League API', version: '1.0.0', docs: '/api/health' },
      });
    });
  }

  // Fallbacks
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

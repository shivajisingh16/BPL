import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError';
import { isProd } from '../config/env';
import type { ApiError } from '../types';

/**
 * Central error handler. Translates known `AppError`s into clean envelopes and
 * masks unexpected errors with a generic 500 (full detail logged server-side).
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // `next` is required for Express to recognise this as an error handler.
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    const body: ApiError = {
      success: false,
      error: { message: err.message, code: err.code },
    };
    res.status(err.statusCode).json(body);
    return;
  }

  // Unexpected — log and return an opaque 500.
  // eslint-disable-next-line no-console
  console.error('[unhandled error]', err);

  const body: ApiError = {
    success: false,
    error: {
      message: isProd ? 'Something went wrong' : String((err as Error)?.message ?? err),
      code: 'INTERNAL_ERROR',
    },
  };
  res.status(500).json(body);
}

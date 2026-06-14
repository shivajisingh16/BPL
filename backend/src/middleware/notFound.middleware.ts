import type { Request, Response } from 'express';
import type { ApiError } from '../types';

/** Catch-all for unmatched routes — returns the standard error envelope. */
export function notFound(req: Request, res: Response): void {
  const body: ApiError = {
    success: false,
    error: {
      message: `Route ${req.method} ${req.originalUrl} not found`,
      code: 'ROUTE_NOT_FOUND',
    },
  };
  res.status(404).json(body);
}

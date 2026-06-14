import type { NextFunction, Request, Response } from 'express';

type AsyncRoute = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

/**
 * Wraps an async route handler so any thrown/rejected error is forwarded to
 * Express's error middleware instead of crashing the process.
 */
export function asyncHandler(fn: AsyncRoute) {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
}

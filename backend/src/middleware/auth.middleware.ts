import type { NextFunction, Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { AppError } from '../utils/AppError';

/**
 * Guards admin routes. Expects an `Authorization: Bearer <token>` header,
 * validates it, and attaches the resolved user to `req.user`.
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization ?? '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(AppError.unauthorized('Missing bearer token', 'NO_TOKEN'));
  }

  try {
    req.user = authService.verify(token);
    next();
  } catch (err) {
    next(err);
  }
}

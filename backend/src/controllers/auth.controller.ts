import type { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ok } from '../utils/respond';

export const authController = {
  login: asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body ?? {};
    const result = authService.login({ email, password });
    return ok(res, result);
  }),

  /** Returns the user embedded in the bearer token (set by auth middleware). */
  me: asyncHandler(async (req: Request, res: Response) => {
    return ok(res, { user: req.user ?? null });
  }),
};

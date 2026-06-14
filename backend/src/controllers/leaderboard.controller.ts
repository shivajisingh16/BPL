import type { Request, Response } from 'express';
import { leaderboardService } from '../services/leaderboard.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ok } from '../utils/respond';

export const leaderboardController = {
  get: asyncHandler(async (_req: Request, res: Response) => {
    return ok(res, await leaderboardService.getLeaderboard());
  }),
};

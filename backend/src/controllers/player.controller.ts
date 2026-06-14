import type { Request, Response } from 'express';
import { playerService } from '../services/player.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ok } from '../utils/respond';

export const playerController = {
  /** id + name only — handy for admin dropdowns. */
  list: asyncHandler(async (_req: Request, res: Response) => {
    return ok(res, await playerService.getPlayers());
  }),

  /** Full computed statistics for every player. */
  stats: asyncHandler(async (_req: Request, res: Response) => {
    return ok(res, await playerService.getPlayerStats());
  }),

  statsByName: asyncHandler(async (req: Request, res: Response) => {
    const name = decodeURIComponent(req.params.name);
    return ok(res, await playerService.getPlayerStatsByName(name));
  }),
};

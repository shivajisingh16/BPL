import type { Request, Response } from 'express';
import { matchService } from '../services/match.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ok } from '../utils/respond';
import { AppError } from '../utils/AppError';
import type { UpdateMatchInput } from '../types';

function parseId(raw: string): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    throw AppError.badRequest('Match id must be a positive integer', 'INVALID_ID');
  }
  return id;
}

export const matchController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    return ok(res, await matchService.getLeagueMatches());
  }),

  grouped: asyncHandler(async (_req: Request, res: Response) => {
    return ok(res, await matchService.getMatchesGroupedByDay());
  }),

  playoffs: asyncHandler(async (_req: Request, res: Response) => {
    return ok(res, await matchService.getPlayoffMatches());
  }),

  upcoming: asyncHandler(async (req: Request, res: Response) => {
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    return ok(res, await matchService.getUpcomingMatches(limit));
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    return ok(res, await matchService.getMatchById(id));
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    const body = (req.body ?? {}) as UpdateMatchInput;
    const updated = await matchService.updateMatch(id, body);
    return ok(res, updated);
  }),

  summary: asyncHandler(async (_req: Request, res: Response) => {
    return ok(res, await matchService.getSummary());
  }),
};

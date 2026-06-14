import type { Match, MatchStatus, PlayoffMatch, TournamentSummary, UpdateMatchInput } from '../types';
import { store } from '../data/store';
import { stageForDay } from '../data/matches.seed';
import { playoffService } from './playoff.service';
import { AppError } from '../utils/AppError';

const TOURNAMENT_TITLE = 'BPL — Bot Premiere League';
const VALID_STATUSES: MatchStatus[] = ['scheduled', 'completed', 'abandoned'];

/** Matches grouped under a day, with the stage label for that day. */
export interface MatchDayGroup {
  day: number;
  stage: string;
  matches: Match[];
}

function isNonNegativeInt(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

function validateResult(kills: number, headshots: number): void {
  if (!isNonNegativeInt(kills)) {
    throw AppError.badRequest('kills must be a non-negative integer', 'INVALID_KILLS');
  }
  if (!isNonNegativeInt(headshots)) {
    throw AppError.badRequest('headshots must be a non-negative integer', 'INVALID_HEADSHOTS');
  }
  if (headshots > kills) {
    throw AppError.badRequest('headshots cannot exceed kills', 'HEADSHOTS_GT_KILLS');
  }
}

export const matchService = {
  /** League matches only, ordered by day then id. */
  async getLeagueMatches(): Promise<Match[]> {
    const matches = await store.getMatches();
    return matches
      .filter((m) => m.stage === 'league')
      .sort((a, b) => a.day - b.day || a.id - b.id);
  },

  /** Resolved playoff bracket. */
  async getPlayoffMatches(): Promise<PlayoffMatch[]> {
    return playoffService.getPlayoffMatches();
  },

  /** A single match by id. Playoff matches are returned fully resolved. */
  async getMatchById(id: number): Promise<Match | PlayoffMatch> {
    const match = await store.getMatchById(id);
    if (!match) {
      throw AppError.notFound(`Match ${id} not found`, 'MATCH_NOT_FOUND');
    }
    if (match.stage === 'playoff') {
      const view = (await playoffService.getPlayoffMatches()).find((v) => v.id === id);
      if (view) return view;
    }
    return match;
  },

  /** League matches grouped by day (ascending), each tagged with its stage. */
  async getMatchesGroupedByDay(): Promise<MatchDayGroup[]> {
    const matches = await this.getLeagueMatches();
    const byDay = new Map<number, Match[]>();

    for (const match of matches) {
      const bucket = byDay.get(match.day) ?? [];
      bucket.push(match);
      byDay.set(match.day, bucket);
    }

    return [...byDay.entries()]
      .sort(([a], [b]) => a - b)
      .map(([day, dayMatches]) => ({
        day,
        stage: stageForDay(day),
        matches: dayMatches.sort((a, b) => a.id - b.id),
      }));
  },

  /** The next N scheduled league matches in chronological order. */
  async getUpcomingMatches(limit = 8): Promise<Match[]> {
    const matches = await this.getLeagueMatches();
    return matches.filter((m) => m.status === 'scheduled').slice(0, limit);
  },

  /**
   * Updates a match result. Player stats and the leaderboard are always
   * computed from match data, so a successful save propagates everywhere.
   */
  async updateMatch(id: number, input: UpdateMatchInput): Promise<Match> {
    const existing = await store.getMatchById(id);
    if (!existing) {
      throw AppError.notFound(`Match ${id} not found`, 'MATCH_NOT_FOUND');
    }
    if (!VALID_STATUSES.includes(input.status)) {
      throw AppError.badRequest(
        'status must be "scheduled", "completed" or "abandoned"',
        'INVALID_STATUS',
      );
    }

    return existing.stage === 'playoff'
      ? this.updatePlayoffMatch(existing, input)
      : this.updateLeagueMatch(existing, input);
  },

  async updateLeagueMatch(existing: Match, input: UpdateMatchInput): Promise<Match> {
    if (input.status === 'scheduled') {
      return store.saveMatch({
        ...existing,
        status: 'scheduled',
        winner: undefined,
        kills: undefined,
        headshots: undefined,
      });
    }

    if (input.status === 'abandoned') {
      // No result — both players get 1 point via the stats engine.
      return store.saveMatch({
        ...existing,
        status: 'abandoned',
        winner: undefined,
        kills: undefined,
        headshots: undefined,
      });
    }

    // completed
    const winner = input.winner ?? undefined;
    if (!winner) {
      throw AppError.badRequest('A winner is required to complete a match', 'WINNER_REQUIRED');
    }
    if (winner !== existing.player1 && winner !== existing.player2) {
      throw AppError.badRequest(
        `Winner must be either "${existing.player1}" or "${existing.player2}"`,
        'INVALID_WINNER',
      );
    }
    const kills = input.kills ?? 0;
    const headshots = input.headshots ?? 0;
    validateResult(kills, headshots);

    return store.saveMatch({ ...existing, status: 'completed', winner, kills, headshots });
  },

  async updatePlayoffMatch(existing: Match, input: UpdateMatchInput): Promise<Match> {
    if (input.status === 'abandoned') {
      throw AppError.badRequest('Playoff matches cannot be abandoned', 'PLAYOFF_NO_ABANDON');
    }

    if (input.status === 'scheduled') {
      // Reset to undecided — restore the bracket placeholder participants.
      const view = (await playoffService.getPlayoffMatches()).find((v) => v.id === existing.id);
      return store.saveMatch({
        ...existing,
        player1: view?.slot1Label ?? existing.player1,
        player2: view?.slot2Label ?? existing.player2,
        status: 'scheduled',
        winner: undefined,
        kills: undefined,
        headshots: undefined,
      });
    }

    // completed — participants must be decided first.
    const { player1, player2, ready } = await playoffService.resolveParticipants(existing.id);
    if (!ready) {
      throw AppError.badRequest(
        'This playoff match cannot be played yet — its participants are not decided. ' +
          'Complete the league stage and any preceding playoff matches first.',
        'PLAYOFF_NOT_READY',
      );
    }

    const winner = input.winner ?? undefined;
    if (!winner) {
      throw AppError.badRequest('A winner is required to complete a match', 'WINNER_REQUIRED');
    }
    if (winner !== player1 && winner !== player2) {
      throw AppError.badRequest(
        `Winner must be either "${player1}" or "${player2}"`,
        'INVALID_WINNER',
      );
    }
    const kills = input.kills ?? 0;
    const headshots = input.headshots ?? 0;
    validateResult(kills, headshots);

    // Snapshot the resolved participants alongside the result.
    return store.saveMatch({
      ...existing,
      player1,
      player2,
      status: 'completed',
      winner,
      kills,
      headshots,
    });
  },

  /** High-level counters for the dashboard hero/stat cards (league stage). */
  async getSummary(): Promise<TournamentSummary> {
    const [players, allMatches] = await Promise.all([
      store.getPlayers(),
      store.getMatches(),
    ]);
    const matches = allMatches.filter((m) => m.stage === 'league');

    const completed = matches.filter((m) => m.status === 'completed').length;
    const abandoned = matches.filter((m) => m.status === 'abandoned').length;
    const decided = completed + abandoned;
    const totalDays = matches.reduce((max, m) => Math.max(max, m.day), 0);

    return {
      title: TOURNAMENT_TITLE,
      totalPlayers: players.length,
      totalMatches: matches.length,
      matchesCompleted: decided,
      upcomingMatches: matches.length - decided,
      matchesPerPlayer: players.length > 0 ? (matches.length * 2) / players.length : 0,
      matchesPerDay: totalDays > 0 ? matches.length / totalDays : 0,
      totalDays,
    };
  },
};

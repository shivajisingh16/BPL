import type { LeaderboardRow, Match, PlayoffMatch } from '../types';
import { store } from '../data/store';
import { leaderboardService } from './leaderboard.service';
import { PLAYOFFS, type SlotRef } from '../data/playoffs.seed';

/** Resolve a slot to an actual player name, or null if not yet decided. */
function resolveSlot(
  slot: SlotRef,
  standings: LeaderboardRow[],
  leagueComplete: boolean,
  matchById: Map<number, Match>,
): string | null {
  switch (slot.kind) {
    case 'leagueRank':
      // Seeds only lock in once the league stage is fully played.
      return leagueComplete ? standings[slot.rank - 1]?.name ?? null : null;
    case 'winner': {
      const m = matchById.get(slot.of);
      return m && m.status === 'completed' && m.winner ? m.winner : null;
    }
    case 'loser': {
      const m = matchById.get(slot.of);
      if (m && m.status === 'completed' && m.winner) {
        // Completed playoff matches snapshot real names into player1/player2.
        return m.winner === m.player1 ? m.player2 : m.player1;
      }
      return null;
    }
  }
}

/** The league is "done" once no league match is still scheduled. */
function isLeagueComplete(matches: Match[]): boolean {
  const league = matches.filter((m) => m.stage === 'league');
  return league.length > 0 && league.every((m) => m.status !== 'scheduled');
}

/**
 * Resolves the playoff bracket against the current standings + results.
 * Processes rounds in order so winner/loser references see resolved
 * predecessors.
 */
export function buildPlayoffViews(matches: Match[], standings: LeaderboardRow[]): PlayoffMatch[] {
  const matchById = new Map(matches.map((m) => [m.id, m]));
  const leagueComplete = isLeagueComplete(matches);

  return [...PLAYOFFS]
    .sort((a, b) => a.order - b.order)
    .map((cfg) => {
      const stored = matchById.get(cfg.id);
      const status = stored?.status ?? 'scheduled';

      let p1: string | null;
      let p2: string | null;
      if (stored && stored.status === 'completed') {
        p1 = stored.player1; // snapshot taken at completion
        p2 = stored.player2;
      } else {
        p1 = resolveSlot(cfg.slot1, standings, leagueComplete, matchById);
        p2 = resolveSlot(cfg.slot2, standings, leagueComplete, matchById);
      }

      return {
        id: cfg.id,
        day: 0,
        stage: 'playoff',
        round: cfg.round,
        slot1Label: cfg.slot1.label,
        slot2Label: cfg.slot2.label,
        player1: p1 ?? cfg.slot1.label,
        player2: p2 ?? cfg.slot2.label,
        status,
        winner: stored?.winner,
        player1Kills: stored?.player1Kills,
        player1Headshots: stored?.player1Headshots,
        player2Kills: stored?.player2Kills,
        player2Headshots: stored?.player2Headshots,
        ready: p1 !== null && p2 !== null,
      };
    });
}

export const playoffService = {
  async getPlayoffMatches(): Promise<PlayoffMatch[]> {
    const [matches, standings] = await Promise.all([
      store.getMatches(),
      leaderboardService.getLeaderboard(),
    ]);
    return buildPlayoffViews(matches, standings);
  },

  /** Current participants for one playoff match (real names only when ready). */
  async resolveParticipants(
    id: number,
  ): Promise<{ player1: string; player2: string; ready: boolean }> {
    const view = (await this.getPlayoffMatches()).find((v) => v.id === id);
    return {
      player1: view?.player1 ?? '',
      player2: view?.player2 ?? '',
      ready: view?.ready ?? false,
    };
  },
};

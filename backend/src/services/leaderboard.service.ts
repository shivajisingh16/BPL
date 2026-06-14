import type { LeaderboardRow, Match, Player } from '../types';
import { POINTS } from '../types';
import { store } from '../data/store';

/**
 * Internal accumulator used while folding over matches.
 */
interface Aggregate {
  id: number;
  name: string;
  played: number;
  wins: number;
  losses: number;
  abandoned: number;
  kills: number;
  headshots: number;
  points: number;
}

/**
 * The stats engine. Folds the LEAGUE matches into per-player aggregates.
 * Playoff matches never affect league standings, so they are excluded here.
 *
 * Scoring (IPL-style):
 *   - completed  → winner +2 pts, +1 win, +kills/+headshots; loser +1 loss
 *   - abandoned  → both players +1 pt, +1 abandoned (counts as played, no W/L)
 *   - scheduled  → ignored
 */
export function aggregate(players: Player[], matches: Match[]): Aggregate[] {
  const byName = new Map<string, Aggregate>();
  for (const p of players) {
    byName.set(p.name, {
      id: p.id,
      name: p.name,
      played: 0,
      wins: 0,
      losses: 0,
      abandoned: 0,
      kills: 0,
      headshots: 0,
      points: 0,
    });
  }

  for (const match of matches) {
    if (match.stage !== 'league') continue;

    if (match.status === 'abandoned') {
      for (const name of [match.player1, match.player2]) {
        const player = byName.get(name);
        if (player) {
          player.played += 1;
          player.abandoned += 1;
          player.points += POINTS.abandon;
        }
      }
      continue;
    }

    if (match.status !== 'completed' || !match.winner) continue;

    const winner = byName.get(match.winner);
    const loserName = match.winner === match.player1 ? match.player2 : match.player1;
    const loser = byName.get(loserName);

    if (winner) {
      winner.wins += 1;
      winner.played += 1;
      winner.kills += match.kills ?? 0;
      winner.headshots += match.headshots ?? 0;
      winner.points += POINTS.win;
    }
    if (loser) {
      loser.losses += 1;
      loser.played += 1;
      loser.points += POINTS.loss;
    }
  }

  return [...byName.values()];
}

/**
 * Ranking order:
 *   1. Points (desc)
 *   2. Total kills (desc)
 *   3. Headshots (desc)
 * Ties fall back to seed id (asc) for a stable, deterministic ordering.
 */
export function rankAggregates(aggregates: Aggregate[]): Aggregate[] {
  return [...aggregates].sort(
    (a, b) =>
      b.points - a.points ||
      b.kills - a.kills ||
      b.headshots - a.headshots ||
      a.id - b.id,
  );
}

export const leaderboardService = {
  /** Returns the fully ranked leaderboard rows. */
  async getLeaderboard(): Promise<LeaderboardRow[]> {
    const [players, matches] = await Promise.all([
      store.getPlayers(),
      store.getMatches(),
    ]);

    return rankAggregates(aggregate(players, matches)).map((a, index) => ({
      rank: index + 1,
      id: a.id,
      name: a.name,
      points: a.points,
      played: a.played,
      wins: a.wins,
      losses: a.losses,
      abandoned: a.abandoned,
      kills: a.kills,
      headshots: a.headshots,
    }));
  },
};

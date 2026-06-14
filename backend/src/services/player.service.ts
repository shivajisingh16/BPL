import type { PlayerStats } from '../types';
import { store } from '../data/store';
import { aggregate, rankAggregates } from './leaderboard.service';
import { AppError } from '../utils/AppError';

function winRate(wins: number, played: number): number {
  if (played === 0) return 0;
  return Math.round((wins / played) * 1000) / 10; // one decimal place
}

export const playerService = {
  /**
   * Full statistics for every player, ranked. Rank is shared with the
   * leaderboard so the two views never disagree.
   */
  async getPlayerStats(): Promise<PlayerStats[]> {
    const [players, matches] = await Promise.all([
      store.getPlayers(),
      store.getMatches(),
    ]);

    const ranked = rankAggregates(aggregate(players, matches));

    return ranked.map((a, index) => ({
      id: a.id,
      name: a.name,
      matchesPlayed: a.played,
      wins: a.wins,
      losses: a.losses,
      abandoned: a.abandoned,
      totalKills: a.kills,
      totalHeadshots: a.headshots,
      points: a.points,
      winRate: winRate(a.wins, a.played),
      rank: index + 1,
    }));
  },

  /** Plain player list (id + name) — useful for dropdowns. */
  async getPlayers() {
    return store.getPlayers();
  },

  async getPlayerStatsByName(name: string): Promise<PlayerStats> {
    const stats = await this.getPlayerStats();
    const found = stats.find((s) => s.name === name);
    if (!found) {
      throw AppError.notFound(`Player "${name}" not found`, 'PLAYER_NOT_FOUND');
    }
    return found;
  },
};

import type { Match } from '../types';

/**
 * Playoff bracket definition.
 *
 * Participants are NOT fixed players — each slot points at a source that is
 * resolved at runtime against the final league standings and earlier playoff
 * results (see `playoff.service.ts`):
 *
 *   Qualifier 1 : Rank 1            vs Rank 2
 *   Eliminator  : Rank 3            vs Rank 4
 *   Qualifier 2 : Loser Qualifier 1 vs Winner Eliminator
 *   Final       : Winner Qualifier 1 vs Winner Qualifier 2
 */

/** Stable ids for playoff matches (continue after the 56 league matches). */
export const PLAYOFF_IDS = {
  QUALIFIER_1: 57,
  ELIMINATOR: 58,
  QUALIFIER_2: 59,
  FINAL: 60,
} as const;

/** Where a playoff participant comes from. */
export type SlotRef =
  | { kind: 'leagueRank'; rank: number; label: string }
  | { kind: 'winner'; of: number; label: string }
  | { kind: 'loser'; of: number; label: string };

export interface PlayoffConfig {
  id: number;
  round: string;
  /** Display/seed order within the bracket. */
  order: number;
  slot1: SlotRef;
  slot2: SlotRef;
}

export const PLAYOFFS: readonly PlayoffConfig[] = [
  {
    id: PLAYOFF_IDS.QUALIFIER_1,
    round: 'Qualifier 1',
    order: 1,
    slot1: { kind: 'leagueRank', rank: 1, label: 'Rank 1' },
    slot2: { kind: 'leagueRank', rank: 2, label: 'Rank 2' },
  },
  {
    id: PLAYOFF_IDS.ELIMINATOR,
    round: 'Eliminator',
    order: 2,
    slot1: { kind: 'leagueRank', rank: 3, label: 'Rank 3' },
    slot2: { kind: 'leagueRank', rank: 4, label: 'Rank 4' },
  },
  {
    id: PLAYOFF_IDS.QUALIFIER_2,
    round: 'Qualifier 2',
    order: 3,
    slot1: { kind: 'loser', of: PLAYOFF_IDS.QUALIFIER_1, label: 'Loser Qualifier 1' },
    slot2: { kind: 'winner', of: PLAYOFF_IDS.ELIMINATOR, label: 'Winner Eliminator' },
  },
  {
    id: PLAYOFF_IDS.FINAL,
    round: 'Final',
    order: 4,
    slot1: { kind: 'winner', of: PLAYOFF_IDS.QUALIFIER_1, label: 'Winner Qualifier 1' },
    slot2: { kind: 'winner', of: PLAYOFF_IDS.QUALIFIER_2, label: 'Winner Qualifier 2' },
  },
];

/** Builds the freshly-initialised playoff matches (participants = slot labels). */
export function buildPlayoffSeed(): Match[] {
  return PLAYOFFS.map((p) => ({
    id: p.id,
    day: 0,
    stage: 'playoff' as const,
    round: p.round,
    player1: p.slot1.label,
    player2: p.slot2.label,
    status: 'scheduled' as const,
  }));
}

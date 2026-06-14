/**
 * Domain types for BPL — Bot Premiere League.
 *
 * These are intentionally framework-agnostic so they can be reused as-is when
 * the in-memory store is replaced by a real database (PostgreSQL / MongoDB).
 */

/**
 * scheduled  — not played yet
 * completed  — has a winner; kills/headshots credited to the winner (2 pts)
 * abandoned  — no result; both players get 1 point and a "played" credit
 */
export type MatchStatus = 'scheduled' | 'completed' | 'abandoned';

/** Whether a match belongs to the round-robin league or the knockout playoffs. */
export type MatchStage = 'league' | 'playoff';

/** A tournament participant. */
export interface Player {
  id: number;
  name: string;
}

/**
 * A single fixture between two players.
 *
 * `kills` and `headshots` describe the result of the match and are credited to
 * the `winner` when the stats engine recalculates player/leaderboard data.
 * League matches use `day`; playoff matches use `round` (and `day` is 0).
 */
export interface Match {
  id: number;
  day: number;
  stage: MatchStage;
  round?: string;
  player1: string;
  player2: string;
  status: MatchStatus;
  winner?: string;
  kills?: number;
  headshots?: number;
}

/**
 * A playoff fixture with its bracket metadata resolved against the current
 * standings / earlier playoff results.
 */
export interface PlayoffMatch extends Match {
  stage: 'playoff';
  round: string;
  /** Friendly source labels, e.g. "Rank 1", "Winner Eliminator". */
  slot1Label: string;
  slot2Label: string;
  /** True once both participants are decided and the match can be played. */
  ready: boolean;
}

/** Stage labels for the schedule (purely presentational grouping). */
export type StageLabel = 'LEAGUE STAGE – FIRST LEG' | 'REVENGE ARC – SECOND LEG';

/** Points awarded per outcome (IPL-style). */
export const POINTS = { win: 2, abandon: 1, loss: 0 } as const;

/* ----------------------------- Computed views ---------------------------- */

/** Aggregated statistics for a player — always derived, never stored. */
export interface PlayerStats {
  id: number;
  name: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  abandoned: number;
  totalKills: number;
  totalHeadshots: number;
  points: number;
  winRate: number; // 0–100, rounded to 1 decimal
  rank: number; // 1-based position from the leaderboard
}

/** A single row of the leaderboard. */
export interface LeaderboardRow {
  rank: number;
  id: number;
  name: string;
  points: number;
  played: number;
  wins: number;
  losses: number;
  abandoned: number;
  kills: number;
  headshots: number;
}

/** High-level tournament counters for the dashboard. */
export interface TournamentSummary {
  title: string;
  totalPlayers: number;
  totalMatches: number;
  matchesCompleted: number;
  upcomingMatches: number;
  matchesPerPlayer: number;
  matchesPerDay: number;
  totalDays: number;
}

/* ------------------------------- DTOs ------------------------------------ */

/** Payload accepted when an admin updates a match result. */
export interface UpdateMatchInput {
  status: MatchStatus;
  winner?: string | null;
  kills?: number | null;
  headshots?: number | null;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthUser {
  email: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

/** Uniform API envelope returned by every endpoint. */
export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    message: string;
    code: string;
  };
}

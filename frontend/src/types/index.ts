/**
 * Frontend-side mirror of the backend API contracts.
 * Kept intentionally standalone (no shared package) so the two apps stay
 * fully independent, per the architecture requirements.
 */

export type MatchStatus = 'scheduled' | 'completed' | 'abandoned';
export type MatchStage = 'league' | 'playoff';

export interface Player {
  id: number;
  name: string;
}

export interface Match {
  id: number;
  day: number;
  stage: MatchStage;
  round?: string;
  player1: string;
  player2: string;
  status: MatchStatus;
  winner?: string;
  player1Kills?: number;
  player1Headshots?: number;
  player2Kills?: number;
  player2Headshots?: number;
}

/** A playoff fixture with its bracket metadata resolved by the backend. */
export interface PlayoffMatch extends Match {
  stage: 'playoff';
  round: string;
  slot1Label: string;
  slot2Label: string;
  /** True once both participants are decided and the match can be played. */
  ready: boolean;
}

export interface MatchDayGroup {
  day: number;
  stage: string;
  matches: Match[];
}

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
  winRate: number;
  rank: number;
}

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

export interface UpdateMatchInput {
  status: MatchStatus;
  winner?: string | null;
  player1Kills?: number | null;
  player1Headshots?: number | null;
  player2Kills?: number | null;
  player2Headshots?: number | null;
}

export interface AuthUser {
  email: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

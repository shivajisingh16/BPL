import type { Player } from '../types';

/**
 * The 8 tournament participants. Order defines their stable `id`.
 * This is the single source of truth for player identity.
 */
export const PLAYERS: readonly Player[] = [
  { id: 1, name: 'Saurav' },
  { id: 2, name: 'Ramanand' },
  { id: 3, name: 'Love' },
  { id: 4, name: 'Priyansh' },
  { id: 5, name: 'Satyam Karn' },
  { id: 6, name: 'Saksham' },
  { id: 7, name: 'Shivaji' },
  { id: 8, name: 'Prateek' },
] as const;

import type { Match, StageLabel } from '../types';

/**
 * The official BPL — Bot Premiere League schedule.
 *
 * Encoded day-by-day as `[player1, player2]` tuples for readability, then
 * flattened into `Match` records with stable sequential ids (1..56).
 * Days 1–7 are the first leg, days 8–14 the revenge arc (second leg).
 */
type Fixture = readonly [player1: string, player2: string];

const SCHEDULE: ReadonlyArray<readonly Fixture[]> = [
  // ---------------- LEAGUE STAGE – FIRST LEG ----------------
  // Day 1
  [
    ['Ramanand', 'Shivaji'],
    ['Saurav', 'Prateek'],
    ['Love', 'Saksham'],
    ['Priyansh', 'Satyam Karn'],
  ],
  // Day 2
  [
    ['Saurav', 'Shivaji'],
    ['Prateek', 'Saksham'],
    ['Ramanand', 'Satyam Karn'],
    ['Love', 'Priyansh'],
  ],
  // Day 3
  [
    ['Saurav', 'Saksham'],
    ['Shivaji', 'Satyam Karn'],
    ['Prateek', 'Priyansh'],
    ['Ramanand', 'Love'],
  ],
  // Day 4
  [
    ['Saurav', 'Satyam Karn'],
    ['Saksham', 'Priyansh'],
    ['Shivaji', 'Love'],
    ['Prateek', 'Ramanand'],
  ],
  // Day 5
  [
    ['Saurav', 'Priyansh'],
    ['Satyam Karn', 'Love'],
    ['Saksham', 'Ramanand'],
    ['Shivaji', 'Prateek'],
  ],
  // Day 6
  [
    ['Saurav', 'Love'],
    ['Priyansh', 'Ramanand'],
    ['Satyam Karn', 'Prateek'],
    ['Saksham', 'Shivaji'],
  ],
  // Day 7
  [
    ['Saurav', 'Ramanand'],
    ['Love', 'Prateek'],
    ['Priyansh', 'Shivaji'],
    ['Satyam Karn', 'Saksham'],
  ],

  // ---------------- REVENGE ARC – SECOND LEG ----------------
  // Day 8
  [
    ['Prateek', 'Saurav'],
    ['Shivaji', 'Ramanand'],
    ['Saksham', 'Love'],
    ['Satyam Karn', 'Priyansh'],
  ],
  // Day 9
  [
    ['Shivaji', 'Saurav'],
    ['Saksham', 'Prateek'],
    ['Satyam Karn', 'Ramanand'],
    ['Priyansh', 'Love'],
  ],
  // Day 10
  [
    ['Saksham', 'Saurav'],
    ['Satyam Karn', 'Shivaji'],
    ['Priyansh', 'Prateek'],
    ['Love', 'Ramanand'],
  ],
  // Day 11
  [
    ['Satyam Karn', 'Saurav'],
    ['Priyansh', 'Saksham'],
    ['Love', 'Shivaji'],
    ['Ramanand', 'Prateek'],
  ],
  // Day 12
  [
    ['Priyansh', 'Saurav'],
    ['Love', 'Satyam Karn'],
    ['Ramanand', 'Saksham'],
    ['Prateek', 'Shivaji'],
  ],
  // Day 13
  [
    ['Love', 'Saurav'],
    ['Ramanand', 'Priyansh'],
    ['Prateek', 'Satyam Karn'],
    ['Shivaji', 'Saksham'],
  ],
  // Day 14
  [
    ['Ramanand', 'Saurav'],
    ['Prateek', 'Love'],
    ['Shivaji', 'Priyansh'],
    ['Saksham', 'Satyam Karn'],
  ],
];

/** Maps a 1-based day number to its stage label. */
export function stageForDay(day: number): StageLabel {
  return day <= 7 ? 'LEAGUE STAGE – FIRST LEG' : 'REVENGE ARC – SECOND LEG';
}

/** Builds the flat, freshly-initialised list of all 56 league matches. */
export function buildMatchSeed(): Match[] {
  const matches: Match[] = [];
  let id = 1;

  SCHEDULE.forEach((fixtures, dayIndex) => {
    const day = dayIndex + 1;
    for (const [player1, player2] of fixtures) {
      matches.push({
        id: id++,
        day,
        stage: 'league',
        player1,
        player2,
        status: 'scheduled',
      });
    }
  });

  return matches;
}

/**
 * Seeder — (re)writes the persisted data file with a fresh copy of the
 * hardcoded players and the full match schedule.
 *
 * Run with `npm run seed`. Use this after changing the schedule in
 * `matches.seed.ts`, or to reset all recorded results back to the start.
 *
 * ⚠️ This overwrites any results you've entered.
 */
import { store } from './store';
import { env } from '../config/env';

async function seed(): Promise<void> {
  await store.reset();
  const matches = await store.getMatches();
  const players = await store.getPlayers();

  /* eslint-disable no-console */
  console.log('');
  console.log('  🌱  Seeded BPL — Bot Premiere League');
  console.log(`  ➜  Players: ${players.length}`);
  console.log(`  ➜  Matches: ${matches.length}`);
  console.log(`  ➜  File:    ${env.dataFile}`);
  console.log('');
  /* eslint-enable no-console */
}

seed().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Seeding failed:', err);
  process.exit(1);
});

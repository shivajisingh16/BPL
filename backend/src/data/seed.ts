/**
 * Seeder — wipes and re-seeds the MongoDB database with a fresh copy of the
 * players, the full match schedule, and the admin accounts.
 *
 * Run with `npm run seed`. Use this after changing the schedule in
 * `matches.seed.ts`, or to reset all recorded results back to the start.
 *
 * ⚠️ This overwrites any results you've entered.
 */
import { store } from './store';
import { env } from '../config/env';
import { closeDb } from '../config/db';

async function seed(): Promise<void> {
  await store.init();
  await store.reset();
  const matches = await store.getMatches();
  const players = await store.getPlayers();

  /* eslint-disable no-console */
  console.log('');
  console.log('  🌱  Seeded BPL — Bot Premiere League');
  console.log(`  ➜  Players:  ${players.length}`);
  console.log(`  ➜  Matches:  ${matches.length}`);
  console.log(`  ➜  Database: ${env.mongoDbName}`);
  console.log('');
  /* eslint-enable no-console */
}

seed()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Seeding failed:', err);
    process.exitCode = 1;
  })
  .finally(() => closeDb());

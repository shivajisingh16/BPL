import { createApp } from './app';
import { env } from './config/env';
import { store } from './data/store';

async function bootstrap(): Promise<void> {
  // Load persisted data from disk, or seed on first run. Existing results are
  // NOT wiped — use `npm run seed` to force a fresh re-seed.
  await store.init();

  const app = createApp();

  app.listen(env.port, () => {
    /* eslint-disable no-console */
    console.log('');
    console.log('  🏆  BPL — Bot Premiere League — API');
    console.log(`  ➜  http://localhost:${env.port}`);
    console.log(`  ➜  Health: http://localhost:${env.port}/api/health`);
    console.log(`  ➜  Env:    ${env.nodeEnv}`);
    console.log(`  ➜  Data:   ${env.dataFile}`);
    console.log('');
    /* eslint-enable no-console */
  });
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server:', err);
  process.exit(1);
});

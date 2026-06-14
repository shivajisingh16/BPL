import { MongoClient, type Db } from 'mongodb';
import { env } from './env';

/**
 * MongoDB connection manager.
 *
 * A single shared `MongoClient` is created lazily on first use and reused for
 * the lifetime of the process (the driver maintains its own connection pool).
 * Everything that needs database access should go through `getDb()`.
 */
let client: MongoClient | null = null;
let db: Db | null = null;

/** Opens (once) and returns the shared database handle. */
export async function connectDb(): Promise<Db> {
  if (db) return db;

  if (!env.mongoUri) {
    throw new Error(
      'MONGODB_URI is not set. Add your MongoDB Atlas connection string to backend/.env',
    );
  }

  client = new MongoClient(env.mongoUri);
  await client.connect();
  db = client.db(env.mongoDbName);
  return db;
}

/** Returns the connected database, throwing if `connectDb()` has not run yet. */
export function getDb(): Db {
  if (!db) throw new Error('Database not initialised — call connectDb() first');
  return db;
}

/** Gracefully closes the connection (used on shutdown / in tests). */
export async function closeDb(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

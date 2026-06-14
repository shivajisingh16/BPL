import type { Collection } from 'mongodb';
import type { AdminUser, Match, Player } from '../types';
import { connectDb } from '../config/db';
import { PLAYERS } from './players.seed';
import { buildMatchSeed } from './matches.seed';
import { buildPlayoffSeed } from './playoffs.seed';
import { buildUserSeed } from './users.seed';

/**
 * Repository abstraction over persistence.
 *
 * Services depend ONLY on this interface — never on a concrete implementation.
 * The production store is MongoDB (Atlas); an in-memory store is provided for
 * tests. No service or controller code knows which one is in use.
 */
export interface DataStore {
  /** Connect / load data (seeding on an empty database). Call once on startup. */
  init(): Promise<void>;

  getPlayers(): Promise<Player[]>;
  getPlayerByName(name: string): Promise<Player | undefined>;

  getMatches(): Promise<Match[]>;
  getMatchById(id: number): Promise<Match | undefined>;
  /** Persist a full match record (replaces the existing one by id). */
  saveMatch(match: Match): Promise<Match>;

  /** Look up a seeded admin account by email (used for login). */
  getUserByEmail(email: string): Promise<AdminUser | undefined>;

  /** Wipe and re-seed everything to its initial state (seeder / tests). */
  reset(): Promise<void>;
}

/* ------------------------------------------------------------------ */
/* In-memory implementation (no persistence — useful for tests).       */
/* ------------------------------------------------------------------ */
export class InMemoryStore implements DataStore {
  private players: Player[] = [];
  private matches: Match[] = [];
  private users: AdminUser[] = [];

  private async seed(): Promise<void> {
    this.players = PLAYERS.map((p) => ({ ...p }));
    this.matches = [...buildMatchSeed(), ...buildPlayoffSeed()];
    this.users = await buildUserSeed();
  }

  async init(): Promise<void> {
    if (this.players.length === 0) await this.seed();
  }

  async reset(): Promise<void> {
    await this.seed();
  }

  async getPlayers(): Promise<Player[]> {
    return this.players.map((p) => ({ ...p }));
  }

  async getPlayerByName(name: string): Promise<Player | undefined> {
    const found = this.players.find((p) => p.name === name);
    return found ? { ...found } : undefined;
  }

  async getMatches(): Promise<Match[]> {
    return this.matches.map((m) => ({ ...m }));
  }

  async getMatchById(id: number): Promise<Match | undefined> {
    const found = this.matches.find((m) => m.id === id);
    return found ? { ...found } : undefined;
  }

  async saveMatch(match: Match): Promise<Match> {
    const index = this.matches.findIndex((m) => m.id === match.id);
    if (index === -1) throw new Error(`Match ${match.id} not found`);
    this.matches[index] = { ...match };
    return { ...this.matches[index] };
  }

  async getUserByEmail(email: string): Promise<AdminUser | undefined> {
    const found = this.users.find((u) => u.email === email.trim().toLowerCase());
    return found ? { ...found } : undefined;
  }
}

/* ------------------------------------------------------------------ */
/* MongoDB implementation — persists to MongoDB Atlas (default).       */
/*                                                                     */
/* Three collections: `players`, `matches`, `users`. The database is   */
/* seeded automatically the first time it is found empty. Documents    */
/* are stored with their domain `id`/`email` keys; Mongo's internal    */
/* `_id` is projected out so callers only ever see clean domain types. */
/* ------------------------------------------------------------------ */
export class MongoStore implements DataStore {
  private players!: Collection<Player>;
  private matches!: Collection<Match>;
  private users!: Collection<AdminUser>;
  private ready = false;

  async init(): Promise<void> {
    if (this.ready) return;
    const db = await connectDb();
    this.players = db.collection<Player>('players');
    this.matches = db.collection<Match>('matches');
    this.users = db.collection<AdminUser>('users');

    // Unique indexes keep identity keys consistent and make lookups fast.
    await Promise.all([
      this.players.createIndex({ id: 1 }, { unique: true }),
      this.players.createIndex({ name: 1 }, { unique: true }),
      this.matches.createIndex({ id: 1 }, { unique: true }),
      this.users.createIndex({ email: 1 }, { unique: true }),
    ]);

    this.ready = true;

    // Seed an empty database with the initial roster, schedule and accounts.
    const existing = await this.matches.estimatedDocumentCount();
    if (existing === 0) await this.reset();
  }

  async reset(): Promise<void> {
    if (!this.ready) await this.init();

    const players: Player[] = PLAYERS.map((p) => ({ ...p }));
    const matches: Match[] = [...buildMatchSeed(), ...buildPlayoffSeed()];
    const users: AdminUser[] = await buildUserSeed();

    await Promise.all([
      this.players.deleteMany({}),
      this.matches.deleteMany({}),
      this.users.deleteMany({}),
    ]);
    await Promise.all([
      this.players.insertMany(players),
      this.matches.insertMany(matches),
      this.users.insertMany(users),
    ]);
  }

  async getPlayers(): Promise<Player[]> {
    return this.players.find({}, { projection: { _id: 0 } }).sort({ id: 1 }).toArray();
  }

  async getPlayerByName(name: string): Promise<Player | undefined> {
    const found = await this.players.findOne({ name }, { projection: { _id: 0 } });
    return found ?? undefined;
  }

  async getMatches(): Promise<Match[]> {
    return this.matches.find({}, { projection: { _id: 0 } }).sort({ id: 1 }).toArray();
  }

  async getMatchById(id: number): Promise<Match | undefined> {
    const found = await this.matches.findOne({ id }, { projection: { _id: 0 } });
    return found ?? undefined;
  }

  async saveMatch(match: Match): Promise<Match> {
    const result = await this.matches.findOneAndUpdate(
      { id: match.id },
      { $set: match },
      { returnDocument: 'after', projection: { _id: 0 } },
    );
    if (!result) throw new Error(`Match ${match.id} not found`);
    return result as Match;
  }

  async getUserByEmail(email: string): Promise<AdminUser | undefined> {
    const found = await this.users.findOne(
      { email: email.trim().toLowerCase() },
      { projection: { _id: 0 } },
    );
    return found ?? undefined;
  }
}

/**
 * The single store instance used across the app.
 *
 * Default = MongoDB store (data persists in MongoDB Atlas). Swap this line for
 * `new InMemoryStore()` for ephemeral runs/tests.
 */
export const store: DataStore = new MongoStore();

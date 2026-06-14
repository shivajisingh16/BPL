import fs from 'fs';
import path from 'path';
import type { Match, Player } from '../types';
import { env } from '../config/env';
import { PLAYERS } from './players.seed';
import { buildMatchSeed } from './matches.seed';
import { buildPlayoffSeed } from './playoffs.seed';

/**
 * Repository abstraction over persistence.
 *
 * Services depend ONLY on this interface — never on a concrete implementation.
 * To migrate to PostgreSQL/MongoDB later, implement this same interface with a
 * real driver and swap the exported `store` instance at the bottom of the file.
 * No service or controller code needs to change.
 */
export interface DataStore {
  /** Load existing data (or seed if there is none). Call once on startup. */
  init(): Promise<void>;

  getPlayers(): Promise<Player[]>;
  getPlayerByName(name: string): Promise<Player | undefined>;

  getMatches(): Promise<Match[]>;
  getMatchById(id: number): Promise<Match | undefined>;
  /** Persist a full match record (replaces the existing one by id). */
  saveMatch(match: Match): Promise<Match>;

  /** Wipe and re-seed everything to its initial state (seeder / tests). */
  reset(): Promise<void>;
}

/** Shape written to / read from disk by the file store. */
interface PersistedState {
  players: Player[];
  matches: Match[];
}

/* ------------------------------------------------------------------ */
/* In-memory implementation (no persistence — useful for tests).       */
/* ------------------------------------------------------------------ */
export class InMemoryStore implements DataStore {
  private players: Player[] = [];
  private matches: Match[] = [];

  private seed(): void {
    this.players = PLAYERS.map((p) => ({ ...p }));
    this.matches = [...buildMatchSeed(), ...buildPlayoffSeed()];
  }

  async init(): Promise<void> {
    if (this.players.length === 0) this.seed();
  }

  async reset(): Promise<void> {
    this.seed();
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
}

/* ------------------------------------------------------------------ */
/* JSON-file implementation — persists across restarts (default).      */
/*                                                                     */
/* Reads the whole dataset into memory on init(), and writes it back   */
/* atomically (temp file + rename) on every mutation. Zero external    */
/* dependencies; swap for a DB driver when you outgrow a single file.  */
/* ------------------------------------------------------------------ */
export class JsonFileStore implements DataStore {
  private players: Player[] = [];
  private matches: Match[] = [];

  constructor(private readonly file: string = env.dataFile) {}

  async init(): Promise<void> {
    if (this.loadFromDisk()) return;
    // No (valid) file yet → seed and write the first snapshot.
    this.seedInMemory();
    this.persist();
  }

  async reset(): Promise<void> {
    this.seedInMemory();
    this.persist();
  }

  private seedInMemory(): void {
    this.players = PLAYERS.map((p) => ({ ...p }));
    this.matches = [...buildMatchSeed(), ...buildPlayoffSeed()];
  }

  private loadFromDisk(): boolean {
    try {
      if (!fs.existsSync(this.file)) return false;
      const data = JSON.parse(fs.readFileSync(this.file, 'utf8')) as PersistedState;
      if (!data || !Array.isArray(data.players) || !Array.isArray(data.matches)) return false;
      // Schema guard: a file written by an older build (no `stage` on matches)
      // is treated as stale → fall back to re-seeding with the current schema.
      const schemaOk = data.matches.every(
        (m) => typeof m?.id === 'number' && (m.stage === 'league' || m.stage === 'playoff'),
      );
      if (!schemaOk) return false;
      this.players = data.players;
      this.matches = data.matches;
      return true;
    } catch {
      // Corrupt/unreadable file → fall back to re-seeding.
      return false;
    }
  }

  private persist(): void {
    fs.mkdirSync(path.dirname(this.file), { recursive: true });
    const payload: PersistedState = { players: this.players, matches: this.matches };
    const tmp = `${this.file}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(payload, null, 2), 'utf8');
    fs.renameSync(tmp, this.file); // atomic replace
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
    this.persist(); // write-through to disk
    return { ...this.matches[index] };
  }
}

/**
 * The single store instance used across the app.
 *
 * Default = JSON-file store (data persists across restarts at `env.dataFile`).
 * Swap this line for `new InMemoryStore()` for ephemeral runs/tests, or for a
 * future DB-backed implementation of `DataStore`.
 */
export const store: DataStore = new JsonFileStore();

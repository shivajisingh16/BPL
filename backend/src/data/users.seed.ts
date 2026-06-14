import bcrypt from 'bcryptjs';
import type { AdminUser } from '../types';
import { env } from '../config/env';
import { PLAYERS } from './players.seed';

/**
 * Builds the admin accounts seeded into the database.
 *
 * Membership rules (per spec):
 *   - One account per player, addressed by their FIRST name:
 *       "Shivaji"      → shivaji@bot.com
 *       "Satyam Karn"  → satyam@bot.com
 *     Every player account shares the password from `AUTH_PASSWORD`.
 *   - One dedicated super-admin account (`admin@bot.com` / `admin` by default,
 *     overridable via ADMIN_EMAIL / ADMIN_PASSWORD) with identical powers.
 *
 * Only these seeded accounts can sign in — there is no self-registration.
 */

const SALT_ROUNDS = 10;

/** First name → email local part (lowercased, spaces dropped). */
function emailFor(name: string): string {
  const firstName = name.trim().split(/\s+/)[0]?.toLowerCase() ?? 'player';
  return `${firstName}@${env.auth.allowedDomain}`;
}

/** Plaintext (email, name, password) tuples that will be hashed at seed time. */
function seedCredentials(): Array<{ email: string; name: string; password: string }> {
  const players = PLAYERS.map((p) => ({
    email: emailFor(p.name),
    name: p.name,
    password: env.auth.password,
  }));

  const superAdmin = {
    email: env.auth.admin.email,
    name: 'Admin',
    password: env.auth.admin.password,
  };

  // The dedicated admin wins if its email happens to collide with a player's.
  const byEmail = new Map<string, { email: string; name: string; password: string }>();
  for (const c of players) byEmail.set(c.email, c);
  byEmail.set(superAdmin.email, superAdmin);
  return [...byEmail.values()];
}

/** Builds the seed users with bcrypt-hashed passwords. */
export async function buildUserSeed(): Promise<AdminUser[]> {
  const creds = seedCredentials();
  return Promise.all(
    creds.map(async ({ email, name, password }) => ({
      email,
      name,
      passwordHash: await bcrypt.hash(password, SALT_ROUNDS),
    })),
  );
}

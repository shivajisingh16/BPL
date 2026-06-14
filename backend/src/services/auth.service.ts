import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { env } from '../config/env';
import { store } from '../data/store';
import { AppError } from '../utils/AppError';
import type { AuthResponse, AuthUser, LoginInput } from '../types';

/**
 * Stateless auth against the seeded admin accounts.
 *
 * Rules (per spec):
 *  - Only seeded accounts may sign in (one per player by first name, plus the
 *    dedicated `admin@bot.com`). Anyone not in the `users` collection is
 *    rejected — there is no self-registration.
 *  - Passwords are verified against bcrypt hashes stored in the database.
 *  - Every account has identical admin powers.
 *
 * A signed, self-describing token is issued on login (HMAC-SHA256 over the
 * payload). This avoids a server-side session store and is trivial to swap
 * for real JWTs later.
 */

interface TokenPayload extends AuthUser {
  exp: number; // epoch ms
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function fromBase64url(input: string): Buffer {
  const pad = input.length % 4 === 0 ? '' : '='.repeat(4 - (input.length % 4));
  return Buffer.from(input.replace(/-/g, '+').replace(/_/g, '/') + pad, 'base64');
}

function sign(data: string): string {
  return base64url(
    crypto.createHmac('sha256', env.auth.tokenSecret).update(data).digest(),
  );
}

/** Constant-time string comparison to avoid timing leaks. */
function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

function issueToken(user: AuthUser): string {
  const payload: TokenPayload = {
    ...user,
    exp: nowMs() + env.auth.tokenTtlHours * 60 * 60 * 1000,
  };
  const body = base64url(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

/** Pulled into a helper so it is the single clock reference for the module. */
function nowMs(): number {
  return Date.now();
}

export const authService = {
  async login({ email, password }: LoginInput): Promise<AuthResponse> {
    const normalisedEmail = String(email ?? '').trim().toLowerCase();

    if (!EMAIL_RE.test(normalisedEmail)) {
      throw AppError.badRequest('Please enter a valid email address', 'INVALID_EMAIL');
    }

    // Only seeded accounts may sign in. A single generic error for both
    // "unknown account" and "wrong password" avoids leaking which emails exist.
    const account = await store.getUserByEmail(normalisedEmail);
    const passwordOk =
      account !== undefined &&
      (await bcrypt.compare(String(password ?? ''), account.passwordHash));
    if (!account || !passwordOk) {
      throw AppError.unauthorized('Invalid email or password', 'BAD_CREDENTIALS');
    }

    const user: AuthUser = { email: account.email, name: account.name };
    return { token: issueToken(user), user };
  },

  /** Validates a bearer token and returns the embedded user, or throws. */
  verify(token: string): AuthUser {
    const [body, signature] = token.split('.');
    if (!body || !signature || !safeEqual(signature, sign(body))) {
      throw AppError.unauthorized('Invalid session token', 'INVALID_TOKEN');
    }

    let payload: TokenPayload;
    try {
      payload = JSON.parse(fromBase64url(body).toString('utf8'));
    } catch {
      throw AppError.unauthorized('Malformed session token', 'INVALID_TOKEN');
    }

    if (typeof payload.exp !== 'number' || payload.exp < nowMs()) {
      throw AppError.unauthorized('Session expired, please log in again', 'TOKEN_EXPIRED');
    }

    return { email: payload.email, name: payload.name };
  },
};

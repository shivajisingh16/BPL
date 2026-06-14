import crypto from 'crypto';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';
import type { AuthResponse, AuthUser, LoginInput } from '../types';

/**
 * Minimal stateless auth.
 *
 * Rules (per spec):
 *  - Any email of the form `[name]@<AUTH_ALLOWED_DOMAIN>` is an allowed admin.
 *  - The password is a single shared secret (`AUTH_PASSWORD`).
 *  - No registration; password cannot be changed.
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

function deriveName(email: string): string {
  const local = email.split('@')[0] ?? '';
  if (!local) return 'Admin';
  return local.charAt(0).toUpperCase() + local.slice(1);
}

export const authService = {
  login({ email, password }: LoginInput): AuthResponse {
    const normalisedEmail = String(email ?? '').trim().toLowerCase();

    if (!EMAIL_RE.test(normalisedEmail)) {
      throw AppError.badRequest('Please enter a valid email address', 'INVALID_EMAIL');
    }
    if (!normalisedEmail.endsWith(`@${env.auth.allowedDomain}`)) {
      throw AppError.unauthorized(
        `Only @${env.auth.allowedDomain} accounts can sign in`,
        'DOMAIN_NOT_ALLOWED',
      );
    }
    if (!safeEqual(String(password ?? ''), env.auth.password)) {
      throw AppError.unauthorized('Incorrect password', 'BAD_CREDENTIALS');
    }

    const user: AuthUser = { email: normalisedEmail, name: deriveName(normalisedEmail) };
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

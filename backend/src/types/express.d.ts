import type { AuthUser } from './index';

/**
 * Augments Express's Request so authenticated routes can read `req.user`
 * after the auth middleware has validated the bearer token.
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};

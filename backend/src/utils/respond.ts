import type { Response } from 'express';
import type { ApiSuccess } from '../types';

/** Wraps any payload in the standard success envelope and sends it. */
export function ok<T>(res: Response, data: T, status = 200): Response<ApiSuccess<T>> {
  return res.status(status).json({ success: true, data });
}

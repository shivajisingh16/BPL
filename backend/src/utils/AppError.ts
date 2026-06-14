/**
 * Application-level error carrying an HTTP status and a stable error code.
 * Thrown by services/controllers and translated to the API envelope by the
 * central error middleware.
 */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }

  static badRequest(message: string, code = 'BAD_REQUEST'): AppError {
    return new AppError(400, code, message);
  }

  static unauthorized(message = 'Unauthorized', code = 'UNAUTHORIZED'): AppError {
    return new AppError(401, code, message);
  }

  static notFound(message = 'Not found', code = 'NOT_FOUND'): AppError {
    return new AppError(404, code, message);
  }
}

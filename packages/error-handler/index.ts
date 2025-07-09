/**
 * Base application error class extending the built-in Error.
 *
 * Adds custom properties:
 * - statusCode: HTTP status code to send in response
 * - isOperational: marks if the error is expected (vs programmer error)
 * - details: extra info (e.g., validation errors)
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number,
    isOperational = true,
    details?: any
  ) {
    super(message); // sets the message on Error
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    // Captures the stack trace without this constructor showing up in it
    Error.captureStackTrace(this);
  }
}

/**
 * NotFoundError
 *
 * Used when a requested resource (like a database record or endpoint) does not exist.
 * Sends HTTP 404.
 */
export class NotFoundError extends AppError {
  constructor(message = "Resources not found") {
    super(message, 404);
  }
}

/**
 * ValidationError
 *
 * Used for invalid input data (from Joi, Zod, React Hook Form etc).
 * Sends HTTP 400.
 * Optionally accepts `details` to include validation error messages.
 */
export class ValidationError extends AppError {
  constructor(message = "Invalid request data", details?: any) {
    super(message, 400, true, details);
  }
}

/**
 * AuthError
 *
 * Used when authentication fails (e.g., invalid JWT, missing token).
 * Sends HTTP 401.
 */
export class AuthError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

/**
 * ForbiddenError
 *
 * Used when user is authenticated but lacks permissions.
 * Sends HTTP 403.
 */
export class ForbiddenError extends AppError {
  constructor(message = "Forbidden access") {
    super(message, 403);
  }
}

/**
 * DatabaseError
 *
 * Used when there are database failures (e.g., MongoDB, PostgreSQL).
 * Sends HTTP 500 with optional details (like driver errors).
 */
export class DatabaseError extends AppError {
  constructor(message = "Database Error", details?: any) {
    super(message, 500, true, details);
  }
}

/**
 * RateLimitError
 *
 * Used when API rate limits are exceeded.
 * Sends HTTP 429.
 */
export class RateLimitError extends AppError {
  constructor(message = "Too many requests, please try again later") {
    super(message, 429);
  }
}

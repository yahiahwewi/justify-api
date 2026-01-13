/**
 * Custom Error Classes
 *
 * These classes extend the native Error class to provide:
 * - Consistent error structure across the API
 * - Automatic HTTP status code mapping
 * - Type-safe error handling
 *
 * Why custom errors?
 * - They make error handling predictable
 * - They separate business logic errors from system errors
 * - They enable centralized error formatting
 */

/**
 * Base class for all API errors.
 * Ensures every error has a status code and message.
 */
export class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Maintains proper stack trace for debugging
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request
 * Used when client sends invalid data
 */
export class BadRequestError extends ApiError {
  constructor(message = 'Bad Request') {
    super(400, message);
  }
}

/**
 * 401 Unauthorized
 * Used when authentication is missing or invalid
 */
export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized') {
    super(401, message);
  }
}

/**
 * 402 Payment Required
 * Used when rate limit is exceeded
 */
export class PaymentRequiredError extends ApiError {
  constructor(message = 'Payment Required') {
    super(402, message);
  }
}

/**
 * 404 Not Found
 * Used when a resource doesn't exist
 */
export class NotFoundError extends ApiError {
  constructor(message = 'Not Found') {
    super(404, message);
  }
}

/**
 * 500 Internal Server Error
 * Used for unexpected server errors
 */
export class InternalServerError extends ApiError {
  constructor(message = 'Internal Server Error') {
    super(500, message, false); // Not operational - indicates a bug
  }
}

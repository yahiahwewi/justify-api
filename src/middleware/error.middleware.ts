import { type Request, type Response, type NextFunction } from 'express';
import { ApiError } from '../utils/errors.js';

/**
 * Centralized Error Handler Middleware
 *
 * This middleware catches all errors thrown in the application.
 * It must be registered AFTER all routes.
 *
 * Why centralization matters:
 * - Avoids duplicated error handling logic across controllers
 * - Guarantees consistent API responses
 * - Makes debugging easier with centralized logging
 * - Prevents accidental exposure of sensitive error details
 *
 * How errors propagate:
 * 1. Controller/middleware throws or calls next(error)
 * 2. Express skips remaining middleware and routes
 * 3. Error lands here for formatting and response
 */

/**
 * Main error handler.
 * Formats errors into consistent JSON responses.
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  // Default to 500 if not an ApiError
  let statusCode = 500;
  let message = 'Internal Server Error';

  // If it's our custom ApiError, use its properties
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Log the error for debugging (skipped in tests to keep output clean)
  // In production, you'd send this to a logging service
  if (process.env.NODE_ENV !== 'test') {
    console.error('[Error]', {
      statusCode,
      message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  }

  // Send consistent error response
  // We use a simple format: { error: string, message?: string }
  res.status(statusCode).json({
    error: getErrorName(statusCode),
    message,
  });
};

/**
 * Maps HTTP status codes to error names.
 * This provides semantic meaning to status codes.
 */
const getErrorName = (statusCode: number): string => {
  const errorNames: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    402: 'Payment Required',
    403: 'Forbidden',
    404: 'Not Found',
    500: 'Internal Server Error',
  };

  return errorNames[statusCode] || 'Error';
};

/**
 * 404 Not Found Handler
 *
 * Catches requests to undefined routes.
 * Must be registered AFTER all valid routes but BEFORE error handler.
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
};

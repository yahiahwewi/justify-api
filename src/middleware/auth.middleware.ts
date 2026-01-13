/* eslint-disable @typescript-eslint/no-namespace */
import { type Request, type Response, type NextFunction } from 'express';
import { tokenStore } from '../store.js';
import { UnauthorizedError } from '../utils/errors.js';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        email: string;
        token: string;
      };
    }
  }
}

/**
 * Authentication Middleware
 *
 * This middleware protects API endpoints by validating Bearer tokens.
 * It ensures only authenticated users can access protected resources.
 *
 * Flow:
 * 1. Extract token from Authorization header
 * 2. Validate token format (Bearer scheme)
 * 3. Verify token exists in our store
 * 4. Attach user context to request
 * 5. Continue to next handler
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  // Extract the Authorization header
  // This is where clients send their authentication credentials
  const authHeader = req.headers.authorization;

  // Check if the Authorization header is present
  // Without it, we cannot authenticate the request
  if (!authHeader) {
    next(new UnauthorizedError('Please provide an Authorization header with a valid token'));
    return;
  }
  // We expect the token to be sent as a Bearer token
  // This keeps the API stateless and easy to scale
  const parts = authHeader.trim().split(/\s+/);

  // Validate the Authorization header format
  // It must have exactly 2 parts: scheme and token
  if (parts.length !== 2) {
    // Special handling for empty token case (e.g., "Bearer ")
    // which splits to ["Bearer"] after trim()
    if (parts.length === 1 && parts[0] === 'Bearer') {
      if (authHeader === 'Bearer') {
        next(new UnauthorizedError('Authorization header must be in format: Bearer <token>'));
      } else {
        next(new UnauthorizedError('Token cannot be empty'));
      }
      return;
    }

    next(new UnauthorizedError('Authorization header must be in format: Bearer <token>'));
    return;
  }

  const [scheme, token] = parts;

  // Verify the authentication scheme is "Bearer"
  // We only support Bearer tokens for this API
  // Other schemes (Basic, Digest, etc.) are not accepted
  if (scheme !== 'Bearer') {
    next(new UnauthorizedError('Only Bearer token authentication is supported'));
    return;
  }

  // Ensure the token is not empty
  // An empty token is invalid and cannot authenticate a user
  if (!token || token.trim() === '') {
    next(new UnauthorizedError('Token cannot be empty'));
    return;
  }

  // Verify the token exists in our store
  // This confirms the token was previously issued by our /api/token endpoint
  // If the token doesn't exist, it's either invalid or has been revoked
  if (!tokenStore.has(token)) {
    next(new UnauthorizedError('The provided token is not valid. Please request a new token.'));
    return;
  }

  // Retrieve the email associated with this token
  // This gives us the user's identity for this request
  const email = tokenStore.get(token);

  // Attach user context to the request object
  // This allows downstream handlers to know who made the request
  // We use the extended Request type defined above
  req.user = {
    email: email || '',
    token,
  };

  // Authentication successful - proceed to the next middleware/handler
  // The request is now authenticated and can access protected resources
  next();
};

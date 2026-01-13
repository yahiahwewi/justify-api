import { type Request, type Response, type NextFunction } from 'express';
import { checkRateLimit } from '../services/rate-limit.service.js';

/**
 * Rate Limit Middleware
 *
 * Intercepts requests to the justify endpoint to enforce daily limits.
 * It counts words in the request body and validates against the quota.
 */
export const rateLimit = (req: Request, res: Response, next: NextFunction): void => {
  // We assume the body is plain text as per the justify endpoint requirements
  const text = typeof req.body === 'string' ? req.body : '';

  // Calculate word count
  // We split by whitespace to count words, matching standard word count logic
  const wordCount = text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  // Retrieve the token attached by the auth middleware
  // We rely on auth middleware running BEFORE this one
  const user = req.user;

  if (!user || !user.token) {
    // Should typically not happen if auth middleware is present
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  // Check against the rate limit service
  if (!checkRateLimit(user.token, wordCount)) {
    // Return 402 Payment Required as per requirement
    // This indicates the free quota is exceeded
    res.status(402).json({
      error: 'Payment Required',
      message: 'Daily word limit of 80,000 words exceeded.',
    });
    return;
  }

  next();
};

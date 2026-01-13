import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { rateLimit } from '../middleware/rate-limit.middleware.js';
import { justify } from '../controllers/justify.controller.js';

const router = Router();

/**
 * POST /justify
 *
 * Justifies text to exactly 80 characters per line.
 *
 * Middleware order is critical:
 * 1. authenticate - Verifies the user has a valid token
 *    Must come first to identify who is making the request
 *
 * 2. rateLimit - Checks daily word quota for this token
 *    Comes after auth because we need to know which user to track
 *
 * 3. justify - The actual business logic
 *    Only executes if auth and rate limit pass
 *
 * We enforce text/plain content type because:
 * - The justification algorithm works on plain text
 * - JSON or other formats would require parsing overhead
 * - Keeps the API simple and focused
 */
router.post('/justify', authenticate, rateLimit, justify);

export default router;

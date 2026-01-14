import { Router } from 'express';
import { justifier } from '../controllers/justify.controller.js';
import { authentifier } from '../middleware/auth.middleware.js';
import { limiterDebit } from '../middleware/rate-limit.middleware.js';

const router = Router();

/**
 * POST /api/justify
 * Body : text/plain
 * Auth : Bearer Token
 */
router.post('/justify', authentifier, limiterDebit, justifier);

export default router;

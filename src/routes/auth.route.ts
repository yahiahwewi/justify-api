import { Router } from 'express';
import { genererToken } from '../controllers/auth.controller.js';

const router = Router();

/**
 * POST /api/token
 * Corps : { "email": "foo@bar.com" }
 */
router.post('/token', genererToken);

export default router;

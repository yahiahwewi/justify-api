import { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { tokenStore } from '../store.js';
import { BadRequestError } from '../utils/errors.js';

/**
 * Génère un token unique pour une adresse email fournie.
 */
export const genererToken = (req: Request, res: Response, next: NextFunction): void => {
    const { email } = req.body;

    if (!email || typeof email !== 'string' || email.trim() === '') {
        return next(new BadRequestError('Une adresse email valide est requise'));
    }

    const token = randomUUID();
    tokenStore.set(token, email);

    res.json({ token });
};

import { NextFunction, Request, Response } from 'express';
import { tokenStore } from '../store.js';
import { UnauthorizedError } from '../utils/errors.js';

// Extension du type Request d'Express pour inclure les infos utilisateur
declare global {
    namespace Express {
        interface Request {
            user?: {
                token: string;
                email: string;
            };
        }
    }
}

/**
 * Middleware d'authentification par token Bearer.
 */
export const authentifier = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedError('Token manquant ou format invalide (Bearer token requis)');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        throw new UnauthorizedError('Token non fourni');
    }

    const email = tokenStore.get(token);

    if (!email) {
        throw new UnauthorizedError('Token invalide ou expiré');
    }

    // Injection des infos utilisateur dans la requête
    req.user = { token, email };
    next();
};

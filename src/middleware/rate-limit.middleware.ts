import { NextFunction, Request, Response } from 'express';
import { verifierLimiteDebit } from '../services/rate-limit.service.js';
import { PaymentRequiredError, UnauthorizedError, BadRequestError } from '../utils/errors.js';

/**
 * Middleware de limitation du débit basé sur le nombre de mots.
 */
export const limiterDebit = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
        return next(new UnauthorizedError());
    }

    const texte = typeof req.body === 'string' ? req.body : '';

    if (!texte) {
        return next(new BadRequestError('Le corps de la requête doit contenir du texte'));
    }

    // Calcul du nombre de mots
    const nbMots = texte.split(/\s+/).filter(Boolean).length;

    const estAutorise = verifierLimiteDebit(req.user.token, nbMots);

    if (!estAutorise) {
        return next(new PaymentRequiredError('Limite quotidienne de 80 000 mots atteinte'));
    }

    next();
};

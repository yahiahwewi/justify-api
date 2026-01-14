import { NextFunction, Request, Response } from 'express';
import { justifierTexte } from '../utils/textJustifier.js';

/**
 * Gère la requête de justification de texte.
 */
export const justifier = (req: Request, res: Response, next: NextFunction): void => {
    const texteRaw = typeof req.body === 'string' ? req.body : '';

    // L'algorithme de justification
    const texteJustifie = justifierTexte(texteRaw);

    res.setHeader('Content-Type', 'text/plain');
    res.send(texteJustifie);
};

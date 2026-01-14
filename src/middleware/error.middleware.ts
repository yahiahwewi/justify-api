import { NextFunction, Request, Response } from 'express';
import { ApiError, getErrorName } from '../utils/errors.js';

/**
 * Middleware de gestion globale des erreurs.
 */
export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction
): void => {
    let statusCode = 500;
    let message = 'Erreur interne du serveur';

    if (err instanceof ApiError) {
        statusCode = err.statusCode;
        message = err.message;
    }

    // Log de l'erreur (désactivé en test pour un output propre)
    if (process.env.NODE_ENV !== 'test') {
        console.error(`[${new Date().toISOString()}] ${statusCode} - ${message}`);
        if (statusCode === 500) console.error(err.stack);
    }

    res.status(statusCode).json({
        error: getErrorName(statusCode),
        message,
    });
};

/**
 * Middleware pour capturer les routes non définies.
 */
export const notFoundHandler = (req: Request, res: Response): void => {
    res.status(404).json({
        error: 'Not Found',
        message: `La route ${req.method} ${req.path} n'existe pas`,
    });
};

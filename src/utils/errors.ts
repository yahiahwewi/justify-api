/**
 * Classe de base pour les erreurs API personnalisées.
 */
export class ApiError extends Error {
    constructor(
        public statusCode: number,
        message: string
    ) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class BadRequestError extends ApiError {
    constructor(message: string = 'Requête invalide') {
        super(400, message);
    }
}

export class UnauthorizedError extends ApiError {
    constructor(message: string = 'Non autorisé') {
        super(401, message);
    }
}

export class PaymentRequiredError extends ApiError {
    constructor(message: string = 'Paiement requis (Limite de mots atteinte)') {
        super(402, message);
    }
}

export class NotFoundError extends ApiError {
    constructor(message: string = 'Ressource non trouvée') {
        super(404, message);
    }
}

/**
 * Retourne le nom de l'erreur basé sur le code statut.
 */
export const getErrorName = (statusCode: number): string => {
    const names: Record<number, string> = {
        400: 'Bad Request',
        401: 'Unauthorized',
        402: 'Payment Required',
        404: 'Not Found',
        500: 'Internal Server Error',
    };
    return names[statusCode] || 'Error';
};

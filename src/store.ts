/**
 * Structure pour le suivi de l'usage des mots par token.
 */
export interface TokenUsage {
    words: number;
    lastReset: string; // Date au format ISO YYYY-MM-DD
}

/**
 * Store en mémoire pour les tokens (Token -> Email).
 */
export const tokenStore = new Map<string, string>();

/**
 * Store en mémoire pour l'usage quotidien (Token -> TokenUsage).
 */
export const usageStore = new Map<string, TokenUsage>();

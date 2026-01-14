import { usageStore } from '../store.js';

export const MAX_MOTS_PAR_JOUR = 80000;

/**
 * Récupère la date actuelle au format YYYY-MM-DD.
 */
const obtenirDateDuJour = (): string => new Date().toISOString().split('T')[0]!;

/**
 * Vérifie si un token a encore du crédit pour le nombre de mots demandé.
 * Met à jour le compteur si autorisé.
 */
export const verifierLimiteDebit = (token: string, nbMots: number): boolean => {
    const dateDuJour = obtenirDateDuJour();
    const usage = usageStore.get(token) || { words: 0, lastReset: dateDuJour };

    // Reset si la date a changé
    if (usage.lastReset !== dateDuJour) {
        usage.words = 0;
        usage.lastReset = dateDuJour;
    }

    if (usage.words + nbMots > MAX_MOTS_PAR_JOUR) {
        return false;
    }

    // Mise à jour de l'usage
    usage.words += nbMots;
    usageStore.set(token, usage);
    return true;
};

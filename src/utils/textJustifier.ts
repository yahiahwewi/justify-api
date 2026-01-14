/**
 * Utilitaire de justification de texte - Logique Pure (Token-Based)
 * 
 * Cet algorithme traite les espaces comme des tokens à part entière pour préserver 
 * l'espacement sémantique tout en respectant la contrainte des 80 caractères.
 */

const LARGEUR_MAX = 80;

/**
 * Justifie une ligne en distribuant les espaces manquants dans les tokens d'espacement existants.
 */
const justifierLigneTokens = (tokens: string[]): string => {
    // Identification des emplacements d'espaces (indices des tokens qui sont des espaces)
    const indicesEspaces = tokens
        .map((t, i) => (t.trim() === '' ? i : -1))
        .filter((i) => i !== -1);

    const longueurActuelle = tokens.join('').length;

    // Si pas d'espaces (un seul mot long) ou déjà à la largeur cible
    if (indicesEspaces.length === 0 || longueurActuelle >= LARGEUR_MAX) {
        return tokens.join('');
    }

    const espacesAAjouter = LARGEUR_MAX - longueurActuelle;
    const espacesParSlot = Math.floor(espacesAAjouter / indicesEspaces.length);
    let reste = espacesAAjouter % indicesEspaces.length;

    const nouveauxTokens = [...tokens];
    for (const index of indicesEspaces) {
        const supplement = espacesParSlot + (reste > 0 ? 1 : 0);
        nouveauxTokens[index] += ' '.repeat(supplement);
        if (reste > 0) reste--;
    }

    return nouveauxTokens.join('');
};

/**
 * Fonction principale de justification.
 * 1. Normalisation sécurisée (tabulations, fins de ligne).
 * 2. Détection des paragraphes.
 * 3. Tokenisation (préservation des espaces internes).
 * 4. Construction incrémentale des lignes.
 */
export const justifierTexte = (texte: string): string => {
    if (!texte) return '';

    // 1. Normalisation
    const normalise = texte
        .replace(/\t/g, ' ')
        .replace(/\r\n/g, '\n');

    // 2. Détection des paragraphes (séparés par 2+ retours à la ligne)
    const paragraphes = normalise.split(/\n{2,}/);

    const paragraphesJustifies = paragraphes.map((para) => {
        // 3. Tokenisation en préservant tous les espaces
        const tokens = para
            .replace(/\n/g, ' ') // Aplatir les retours à la ligne internes
            .trim()
            .split(/(\s+)/)
            .filter((t) => t !== '');

        if (tokens.length === 0) return '';

        const lignes: string[] = [];
        let tokensLigneActuelle: string[] = [];
        let longueurLigneActuelle = 0;

        // 4. Construction des lignes
        for (const token of tokens) {
            // On ne commence jamais une ligne par un espace
            if (tokensLigneActuelle.length === 0 && token.trim() === '') continue;

            if (longueurLigneActuelle + token.length <= LARGEUR_MAX) {
                tokensLigneActuelle.push(token);
                longueurLigneActuelle += token.length;
            } else {
                // La ligne est pleine. Nettoyage de l'espace final éventuel.
                if (
                    tokensLigneActuelle.length > 0 &&
                    tokensLigneActuelle[tokensLigneActuelle.length - 1]?.trim() === ''
                ) {
                    const retire = tokensLigneActuelle.pop()!;
                    longueurLigneActuelle -= retire.length;
                }

                if (tokensLigneActuelle.length > 0) {
                    lignes.push(justifierLigneTokens(tokensLigneActuelle));
                }

                // Nouvelle ligne avec le mot actuel (on ignore si c'est un espace)
                if (token.trim() !== '') {
                    tokensLigneActuelle = [token];
                    longueurLigneActuelle = token.length;
                } else {
                    tokensLigneActuelle = [];
                    longueurLigneActuelle = 0;
                }
            }
        }

        // 5. Dernière ligne du paragraphe (alignée à gauche)
        if (tokensLigneActuelle.length > 0) {
            if (tokensLigneActuelle[tokensLigneActuelle.length - 1]?.trim() === '') {
                tokensLigneActuelle.pop();
            }
            lignes.push(tokensLigneActuelle.join(''));
        }

        return lignes.join('\n');
    });

    // 6. Reconnexion des paragraphes
    return paragraphesJustifies.filter((p) => p !== '').join('\n\n');
};

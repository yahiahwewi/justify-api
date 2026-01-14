import { justifierTexte } from './textJustifier.js';

describe('Test Unitaire : Logique de Justification', () => {
    it('doit justifier un paragraphe multi-lignes à exactement 80 caractères', () => {
        const entree = "Longtemps, je me suis couché de bonne heure. Parfois, à peine ma bougie éteinte, mes yeux se fermaient si vite que je n’avais pas le temps de me dire: «Je m’endors.»";
        const resultat = justifierTexte(entree);
        const lignes = resultat.split('\n');

        // La première ligne doit faire 80 caractères
        expect(lignes[0]?.length).toBe(80);
        // La dernière ligne (ligne creuse) est alignée à gauche
        expect(lignes[lignes.length - 1]?.length).toBeLessThanOrEqual(80);
    });

    it('doit préserver les espaces sémantiques (doubles espaces)', () => {
        const entree = "Ceci est un  test avec  double espace.";
        const resultat = justifierTexte(entree);
        expect(resultat).toContain("Ceci est un  test avec  double espace.");
    });

    it('doit gérer les paragraphes séparés par des doubles sauts de ligne', () => {
        const entree = "Para 1\n\nPara 2";
        const resultat = justifierTexte(entree);
        expect(resultat).toContain("Para 1\n\nPara 2");
    });

    it('ne doit pas concaténer les mots', () => {
        const entree = "Longtemps, je me suis couché";
        const resultat = justifierTexte(entree);
        expect(resultat).not.toContain("Longtemps,jemesuis");
    });

    it('doit retourner une chaîne vide pour une entrée vide', () => {
        expect(justifierTexte('')).toBe('');
    });
});

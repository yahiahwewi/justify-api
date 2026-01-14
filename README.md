# Justify API

Une API REST professionnelle pour justifier du texte à une largeur fixe de 80 caractères par ligne, avec gestion du débit (rate limit) et authentification par token.

## 🚀 Démarrage Rapide

### Installation
```bash
npm install
```

### Développement
```bash
npm run dev
```

### Tests et Couverture
```bash
npm test
npm run test:coverage
```

### 🌐 Déploiement
L'API est configurée pour être déployée sur **Render** via le fichier `render.yaml`.

**URL Publique :** [https://justify-api-qkyo.onrender.com](https://justify-api-qkyo.onrender.com) (Live)

---

## 🛠 Utilisation de l'API

### 1. Obtenir un Token d'Authentification
Demandez un token unique en utilisant votre email. Ce token est requis pour utiliser le service de justification.

**Endpoint :** `POST https://justify-api-qkyo.onrender.com/api/token`  
**Corps (JSON) :**
```json
{
  "email": "votre@email.com"
}
```

### 2. Justifier du Texte
Justifiez votre texte à exactement 80 caractères par ligne.

**Endpoint :** `POST https://justify-api-qkyo.onrender.com/api/justify`  
**Headers :**
- `Content-Type: text/plain`
- `Authorization: Bearer <votre_token>`

**Corps :** (Contenu texte brut)

**Règles :**
- Les lignes sont justifiées par une distribution uniforme des espaces.
- La dernière ligne de chaque paragraphe reste alignée à gauche.
- Limite quotidienne : **80 000 mots** par token.

---

## 🧠 Algorithme de Justification

L'algorithme utilise une approche basée sur des **tokens** pour garantir une précision typographique maximale.

### Fonctionnement :
1. **Normalisation** : Conversion des tabulations en espaces et uniformisation des fins de ligne.
2. **Identification des Paragraphes** : Découpage du texte en blocs sémantiques.
3. **Tokenisation** : Division de chaque paragraphe en mots et en tokens d'espacement. Cela permet de préserver les doubles espaces originaux (espacement sémantique).
4. **Distribution des Espaces** : 
   - Calcul des espaces nécessaires pour atteindre 80 caractères.
   - Distribution équitable entre les mots.
   - Les espaces restants sont répartis de **gauche à droite** pour un rendu harmonieux.
5. **Respect des Marges** : La dernière ligne de chaque paragraphe est jointe avec des espaces simples pour respecter les conventions typographiques.

---

## 🏗 Décisions de Design

### Gestion Centralisée des Erreurs
Toutes les erreurs (400, 401, 402, 404, 500) sont interceptées par un middleware unique, garantissant une réponse JSON cohérente pour le client.

### Stockage en Mémoire
Pour cette version technique, les tokens et l'usage sont stockés dans des objets `Map` en mémoire. En production, cette couche serait remplacée par une base de données persistante (type Redis).

### Performance
L'usage de `express.text()` permet de traiter directement de gros volumes de texte sans surcharge de parsing JSON inutile.

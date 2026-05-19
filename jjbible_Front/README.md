# JJBible — Frontend

Interface web du pokédex de techniques de JJB : gestion des techniques,
pokédex personnel, profils, et **carte interactive** des enchaînements.

**Stack :** Angular 17 (standalone) · TypeScript · Cytoscape.js

---

## Démarrage rapide (développement)

```bash
npm install
npm start          # http://localhost:4200
```

Le backend doit tourner en parallèle sur `http://localhost:3000`.
Le proxy de développement (`proxy.conf.json`, déjà configuré dans
`angular.json`) redirige automatiquement `/api` vers le backend.

---

## Scripts

| Commande | Effet |
|---|---|
| `npm start` | Serveur de dev (http://localhost:4200) |
| `npm run build` | Build de production dans `dist/jjbible/browser` |

---

## Architecture

Organisation en « feature folders » avec barrels (`index.ts`) et alias
d'import (configurés dans `tsconfig.json`) :

```
src/app/
├── app.component.*        Layout + navigation
├── app.config.ts          Providers (router, HttpClient, intercepteur)
├── app.routes.ts          Routes (lazy-loaded)
├── components/
│   ├── belt-display/  category-pie/  technique-card/  technique-form/
│   └── pages/
│       ├── login/  techniques/  profile/
│       ├── user-profile/  users-search/
│       └── graph/         Carte interactive (Cytoscape)
├── data/          Constantes (libellés/couleurs de maîtrise)
├── guards/        Garde d'authentification
├── interceptors/  Ajout du token JWT aux requêtes
├── models/        Interfaces & types
├── services/      auth · user · technique · theme
├── shared/        Pipe réutilisable (safe-url)
├── store/         État applicatif (utilisateur courant)
└── strategies/    Détection plateforme / embed vidéo
```

Alias disponibles : `@components`, `@pages`, `@services`, `@store`,
`@models`, `@data`, `@guards`, `@interceptors`, `@shared`, `@strategies`.

Exemple : `import { AuthService } from '@services';`

---

## Fonctionnalités clés

- **Techniques** : création/édition avec, dans le même formulaire, l'ajout
  de liaisons (`précède` / `équivaut à` / `suit`) vers d'autres techniques —
  autant que voulu (bouton « + Ajouter une liaison »).
- **Carte** : visualisation en lecture seule du graphe (Cytoscape.js).
  Flèches pleines = enchaînements ; pointillés violets = équivalences ;
  contour doré = favori ; couleur = niveau de maîtrise. Clic sur un nœud
  pour isoler ses connexions. Dispositions multiples (hiérarchique, forces…).

---

## Connexion au backend

- **Dev** : proxy Angular (`/api` → `http://localhost:3000`).
- **Prod (Docker)** : nginx sert le build statique et relaie `/api` vers le
  conteneur backend (voir `nginx.conf` et le guide `DEPLOYMENT.md`).

---

## Déploiement

Voir le guide dédié **`DEPLOYMENT.md`** fourni avec le projet (Docker,
Raspberry Pi + Tailscale, serveur, bonnes pratiques).

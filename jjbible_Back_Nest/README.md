# JJBible — Backend (API)

API REST du « pokédex » de techniques de Jiu-Jitsu Brésilien : comptes,
techniques, pokédex personnel, et **graphe d'enchaînements** entre techniques.

**Stack :** Node.js · NestJS · TypeORM · MySQL · JWT · Swagger

---

## Démarrage rapide (développement)

```bash
npm install
cp .env.example .env        # renseigne MySQL + un JWT_SECRET
# crée la base si besoin :  CREATE DATABASE jjbible CHARACTER SET utf8mb4;
npm run dev                 # http://localhost:3000
```

- Health-check : `GET http://localhost:3000/`
- **Documentation Swagger : http://localhost:3000/docs**
- Toutes les routes métier sont préfixées par `/api`.

> Au premier lancement, `DB_SYNCHRONIZE=true` crée les tables automatiquement.
> Insère ensuite les ceintures :
> ```bash
> npm run seed
> ```

> Sous Windows/XAMPP, mets `DB_HOST=127.0.0.1` (et non `localhost`) dans `.env`
> pour éviter une erreur `ECONNREFUSED` (résolution IPv6).

---

## Configuration (`.env`)

| Variable | Rôle | Défaut |
|---|---|---|
| `PORT` | Port d'écoute | `3000` |
| `DB_HOST` | Hôte MySQL (`127.0.0.1` en local, `db` en Docker) | — |
| `DB_PORT` | Port MySQL | `3306` |
| `DB_USER` / `DB_PASSWORD` | Identifiants MySQL | — |
| `DB_NAME` | Nom de la base | `jjbible` |
| `DB_SYNCHRONIZE` | TypeORM gère le schéma (`false` en prod) | `true` |
| `DB_LOGGING` | Logue le SQL (debug) | `false` |
| `JWT_SECRET` | Secret de signature des tokens | — |
| `JWT_EXPIRES_IN` | Durée de validité du token | `7d` |

---

## Scripts

| Commande | Effet |
|---|---|
| `npm run dev` | Démarre en mode watch |
| `npm run build` | Compile dans `dist/` |
| `npm run start:prod` | Lance la version compilée |
| `npm run seed` | Insère les ceintures initiales |

---

## Structure

```
src/
├── main.ts            Démarrage, CORS, préfixe /api, Swagger
├── app.module.ts      Module racine + config TypeORM/MySQL
├── app.controller.ts  GET / (health-check)
├── entities/          Schéma de la base (TypeORM)
├── common/            Guard JWT + décorateur @CurrentUser
├── auth/              Inscription / connexion (JWT)
├── users/             Profil, ceintures, catégories, recherche
├── techniques/        CRUD techniques + pokédex + liaisons/graphe
└── seed/              Remplissage initial des ceintures
```

Chaque module suit le patron NestJS : `*.controller.ts` (routes + doc Swagger),
`*.service.ts` (logique + accès base), `dto/*.dto.ts` (validation des entrées),
`*.module.ts` (câblage).

---

## Principaux endpoints (préfixe `/api`)

**Auth**

| Méthode | URL |
|---|---|
| POST | `/api/auth/register` |
| POST | `/api/auth/login` |

**Utilisateurs**

| Méthode | URL | Auth |
|---|---|---|
| GET | `/api/users/categories` | non |
| GET | `/api/users/ceintures` | non |
| GET / PUT | `/api/users/me` | oui |
| GET | `/api/users/search?pseudo=` | non |
| GET | `/api/users/:id` | non |

**Techniques** (JWT requis)

| Méthode | URL |
|---|---|
| GET | `/api/techniques/me` |
| GET | `/api/techniques/search?q=&scope=all\|mine\|public` |
| GET | `/api/techniques/graph` |
| POST | `/api/techniques` |
| POST / DELETE | `/api/techniques/:id/add` · `/:id/remove` |
| PATCH | `/api/techniques/:id/favori` · `/:id/maitrise` |
| GET / POST | `/api/techniques/:id/liaisons` |
| DELETE | `/api/techniques/liaisons/:liaisonId` |
| PUT / DELETE | `/api/techniques/:id` |

> **Graphe :** la table `techniques_liaisons` stocke des arêtes orientées
> `source → cible` (« cible s'enchaîne après source »), propres à chaque
> utilisateur. `GET /api/techniques/graph` renvoie `{ nodes, edges }`.

La référence complète et interactive est dans **Swagger** (`/docs`).

---

## Visualiser la base

N'importe quel client MySQL : **phpMyAdmin** (inclus avec XAMPP),
**DBeaver**, **MySQL Workbench**, ou l'extension MySQL de VS Code.
Connexion avec les identifiants du `.env`.

Tables : `ceintures`, `utilisateurs`, `techniques`,
`utilisateurs_techniques` (pokédex), `techniques_liaisons` (graphe).

---

## Déploiement

Voir le guide dédié **`DEPLOYMENT.md`** (Docker, Raspberry Pi + Tailscale,
serveur, bonnes pratiques, sauvegardes).

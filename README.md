# Pet Friendly Locator — Bordeaux

> [English version](./README.en.md)

Application web communautaire pour découvrir et partager les lieux pet-friendly de la région bordelaise : carte interactive, ajout de lieux, profils utilisateurs, avis et modération.

[![CI/CD](https://github.com/Periicles/petfriendlylocator/actions/workflows/ci.yml/badge.svg)](https://github.com/Periicles/petfriendlylocator/actions/workflows/ci.yml)
![Node](https://img.shields.io/badge/node-%E2%89%A524-43853d)
![Next.js](https://img.shields.io/badge/Next.js-16-black)

---

## Stack technique

| Couche           | Technologie                                                                  |
| ---------------- | ---------------------------------------------------------------------------- |
| Framework        | [Next.js 16](https://nextjs.org/) (App Router, Turbopack)                    |
| Langage          | TypeScript 6                                                                 |
| Frontend         | React 19, [Tailwind CSS 4](https://tailwindcss.com/), [MUI 9](https://mui.com/) (Emotion) |
| Carte            | [Mapbox GL JS 3](https://docs.mapbox.com/mapbox-gl-js/)                      |
| Auth             | [Auth.js v5](https://authjs.dev/) (NextAuth, Credentials + JWT)              |
| ORM              | [Prisma 7](https://www.prisma.io/) + `@prisma/adapter-pg`                    |
| Base de données  | PostgreSQL 16 (Prisma Postgres)                                              |
| Tests            | Jest 30, React Testing Library                                               |
| Conteneurisation | Docker, publication automatique sur GHCR                                     |
| CI/CD            | GitHub Actions (lint + gitleaks + build)                                     |

---

## Fonctionnalités

- **Carte interactive** des lieux pet-friendly autour de Bordeaux
- **Recherche** et barre latérale listant les lieux
- **Ajout de lieux** via formulaire flottant (utilisateur connecté)
- **Profil utilisateur** : édition des infos, liste des lieux soumis, liste des avis laissés
- **Système d'avis** : notation + commentaire par lieu
- **Espace admin** (rôle `ADMIN`) : modération des lieux et avis
- **Authentification** par e-mail / mot de passe (NextAuth + bcrypt)

---

## Démarrage rapide

### Prérequis

- Node.js ≥ 24
- Docker & Docker Compose (option recommandée pour la base)
- Un token public Mapbox ([créer un compte](https://account.mapbox.com/))

### 1. Cloner et configurer

```bash
git clone https://github.com/Periicles/petfriendlylocator.git
cd petfriendlylocator
cp .env.example .env
```

Renseigne ensuite les variables dans `.env` — voir [`.env.example`](./.env.example) pour la liste complète (Postgres, `DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_MAPBOX_TOKEN`).

### 2A. Lancer avec Docker (recommandé)

```bash
docker compose up --build
```

L'application est disponible sur [http://localhost:3000](http://localhost:3000), la base PostgreSQL sur le port `5432`.

### 2B. Lancer en local

```bash
npm install
npm run generate   # prisma generate
npm run migrate    # prisma migrate dev
npm run dev
```

---

## Scripts npm

| Script                      | Description                                                   |
| --------------------------- | ------------------------------------------------------------- |
| `npm run dev`               | Serveur de dev Next.js (Turbopack)                            |
| `npm run build`             | Build de production                                           |
| `npm start`                 | Lance le build de production                                  |
| `npm run lint` / `lint:fix` | ESLint (zéro warning toléré en CI)                            |
| `npm run generate`          | `prisma generate`                                             |
| `npm run migrate`           | `prisma migrate dev --name init`                              |
| `npm run seed`              | Compile et exécute `prisma/seed.ts`                           |
| `npm test`                  | Lance Jest (17 suites, ~133 tests)                            |
| `npm run clean`             | Supprime `node_modules`, `.next`, `dist`, `prisma/migrations` |

---

## Documentation

- **[Architecture](./docs/ARCHITECTURE.md)** — arborescence, flux d'auth, modèle de données, CI/CD
- **[API](./docs/API.md)** — référence complète des routes REST
- **[Tests](./__tests__/README.md)** — configuration Jest dual-environment, couverture
- **[Contribuer](./CONTRIBUTING.md)** — workflow git, conventions, checks locaux
- **[Changelog](./CHANGELOG.md)** — historique des versions

---

## Licence

Projet open source. Voir le fichier `LICENSE` (à venir).

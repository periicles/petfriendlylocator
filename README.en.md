# Pet Friendly Locator — Bordeaux

> [Version française](./README.md)

Community-driven web app for discovering and sharing pet-friendly places around Bordeaux: interactive map, place submissions, user profiles, reviews, and moderation.

[![CI/CD](https://github.com/Periicles/petfriendlylocator/actions/workflows/ci.yml/badge.svg)](https://github.com/Periicles/petfriendlylocator/actions/workflows/ci.yml)
![Node](https://img.shields.io/badge/node-%E2%89%A524-43853d)
![Next.js](https://img.shields.io/badge/Next.js-16-black)

---

## Tech stack

| Layer            | Technology                                                                                |
| ---------------- | ----------------------------------------------------------------------------------------- |
| Framework        | [Next.js 16](https://nextjs.org/) (App Router, Turbopack)                                 |
| Language         | TypeScript 6                                                                              |
| Frontend         | React 19, [Tailwind CSS 4](https://tailwindcss.com/), [MUI 9](https://mui.com/) (Emotion) |
| Map              | [Mapbox GL JS 3](https://docs.mapbox.com/mapbox-gl-js/)                                   |
| Auth             | [NextAuth 4](https://next-auth.js.org/) (Credentials + JWT)                               |
| ORM              | [Prisma 7](https://www.prisma.io/) + `@prisma/adapter-pg`                                 |
| Database         | PostgreSQL 16 (Prisma Postgres)                                                           |
| Testing          | Jest 30, React Testing Library                                                            |
| Containerization | Docker, automatic publish to GHCR                                                         |
| CI/CD            | GitHub Actions (lint + gitleaks + build)                                                  |

---

## Features

- **Interactive map** of pet-friendly places around Bordeaux
- **Search** and sidebar listing
- **Submit places** through a floating form (authenticated users)
- **User profile**: edit info, list submitted places, list authored reviews
- **Reviews**: rating + comment per place
- **Admin area** (role `ADMIN`): moderate places and reviews
- **Authentication** with email / password (NextAuth + bcrypt)

---

## Quick start

### Prerequisites

- Node.js ≥ 24
- Docker & Docker Compose (recommended for the database)
- A public Mapbox token ([create an account](https://account.mapbox.com/))

### 1. Clone and configure

```bash
git clone https://github.com/Periicles/petfriendlylocator.git
cd petfriendlylocator
cp .env.example .env
```

Fill in `.env` — see [`.env.example`](./.env.example) for the full list (Postgres, `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXT_PUBLIC_MAPBOX_TOKEN`).

### 2A. Run with Docker (recommended)

```bash
docker compose up --build
```

App available at [http://localhost:3000](http://localhost:3000), Postgres exposed on port `5432`.

### 2B. Run locally

```bash
npm install
npm run generate   # prisma generate
npm run migrate    # prisma migrate dev
npm run dev
```

---

## npm scripts

| Script                      | Description                                                 |
| --------------------------- | ----------------------------------------------------------- |
| `npm run dev`               | Next.js dev server (Turbopack)                              |
| `npm run build`             | Production build                                            |
| `npm start`                 | Run the production build                                    |
| `npm run lint` / `lint:fix` | ESLint (zero warnings tolerated in CI)                      |
| `npm run generate`          | `prisma generate`                                           |
| `npm run migrate`           | `prisma migrate dev --name init`                            |
| `npm run seed`              | Compile and run `prisma/seed.ts`                            |
| `npm test`                  | Run Jest (17 suites, ~133 tests)                            |
| `npm run clean`             | Remove `node_modules`, `.next`, `dist`, `prisma/migrations` |

---

## Documentation

- **[Architecture](./docs/ARCHITECTURE.en.md)** — tree, auth flow, data model, CI/CD
- **[API](./docs/API.en.md)** — complete REST route reference
- **[Tests](./__tests__/README.md)** — Jest dual-environment setup, coverage
- **[Contributing](./CONTRIBUTING.en.md)** — git workflow, conventions, local checks
- **[Changelog](./CHANGELOG.md)** — version history

---

## License

Open source project. See `LICENSE` file (to be added).

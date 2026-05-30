# Architecture

> [English version](./ARCHITECTURE.en.md)

Vue d'ensemble technique de **Pet Friendly Locator**.

---

## Arborescence

```text
.
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── admin/            # Tableau de bord admin
│   │   ├── carte/            # Page carte (fonctionnalité centrale)
│   │   ├── login/            # Connexion
│   │   ├── register/         # Inscription
│   │   ├── profile/          # Profil + sous-pages places/, reviews/
│   │   ├── api/              # Route handlers REST
│   │   │   ├── auth/[...nextauth]/
│   │   │   ├── locations/    # GET, POST + [id]/ : GET, PUT, DELETE
│   │   │   ├── register/
│   │   │   └── user/         # me/ : GET   |   update/ : POST
│   │   ├── layout.tsx        # Root layout (HTML, providers)
│   │   ├── page.tsx          # Landing
│   │   └── globals.css
│   ├── components/           # AddLocationModal, Map, Navbar, LocationsSidebar, LocationsView, ClientNavbarWrapper
│   ├── lib/
│   │   ├── auth.ts           # Config NextAuth
│   │   └── prisma.ts         # Client Prisma (Proxy lazy-init)
│   ├── providers.tsx         # SessionProvider, ThemeProvider
│   ├── types/                # DTO + augmentations next-auth
│   └── utils/                # mapLocationDto
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── __tests__/                # Suites Jest
├── middleware.ts             # Garde de redirection auth
├── next.config.ts
├── docker-compose.yml
├── Dockerfile
└── .github/workflows/ci.yml
```

---

## Modèle de données

Source : `prisma/schema.prisma` (PostgreSQL).

```text
User ────< Location ────< Review
 │                          │
 └──────────< Review ───────┘
```

| Modèle   | Champs clés                                                                                                       |
| -------- | ----------------------------------------------------------------------------------------------------------------- |
| User     | `user_id` (uuid), `pseudo` (unique), `email` (unique), `password` (bcrypt), `roles` (`USER` \| `ADMIN`)           |
| Location | `location_id` (uuid), `name`, `description?`, `address`, `zip_code`, `city`, `latitude`, `longitude`, `location_type` |
| Review   | `review_id` (uuid), `rating`, `title`, `content`, FK `user_id?` + `location_id`                                   |

Enums : `UserRole` = `USER | ADMIN`. `LocationType` = `PARK | RESTAURANT | SHOP | HOTEL | OTHER`.

> **Attention** : le type TS `TCreateLocationInput` (`src/types/createLocationInput.ts`) diverge actuellement de l'enum Prisma — `BEACH` est présent côté TS, `HOTEL` côté DB. À aligner.

---

## Couche d'accès aux données

- **Singleton Prisma** dans `src/lib/prisma.ts`, exposé via un `Proxy` qui **diffère l'instanciation** au premier appel.
  Pourquoi : `next build` est exécuté pendant le `Dockerfile`, sans `DATABASE_URL` accessible — une instanciation eager planterait le build.
- **DTO mapping** dans `src/utils/mapLocationDto.ts` — convertit les modèles Prisma en `LocationDTO` (dates → ISO strings, `null` explicite).
- Pas de tRPC, pas de GraphQL : tout passe par les route handlers Next.js (REST).

---

## Flux d'authentification

```text
┌──────────┐  POST /api/auth/callback/credentials   ┌──────────────┐
│ Client   │ ────────────────────────────────────▶  │ NextAuth     │
└──────────┘                                        │ authorize()  │
                                                    │ → prisma.user│
                                                    │ → bcrypt.cmp │
                                                    └──────┬───────┘
                                                           │ JWT signé (sub = user_id)
                                                           ▼
                                                    ┌──────────────┐
                                                    │ Cookie httpOnly│
                                                    └──────┬───────┘
                                                           │
                                       ┌───────────────────┴─────────────────┐
                                       ▼                                     ▼
                          getToken({ req })   pour routes /api/locations/*  getServerSession(authOptions) pour /api/user/*
```

- **Stratégie** : `session: { strategy: 'jwt' }` (`src/lib/auth.ts`). Pas de table de session en DB.
- **Callback `jwt`** : injecte `user.id` dans `token.sub` au login.
- **Callback `session`** : expose `token.sub` côté client via `session.user.id` (typage dans `src/types/next-auth.d.ts`).
- **Middleware** (`middleware.ts`) : redirige les utilisateurs déjà authentifiés depuis `/login` ou `/register` vers `/`. **Ne protège pas** d'autres routes — la protection se fait dans chaque route handler ou page.

---

## API REST

Référence complète : [API.md](./API.md).

| Route                          | Méthodes        | Auth     |
| ------------------------------ | --------------- | -------- |
| `/api/locations`               | GET, POST       | POST: JWT|
| `/api/locations/[id]`          | GET, PUT, DELETE| Mut: JWT + ownership |
| `/api/register`                | POST            | publique |
| `/api/user/me`                 | GET             | session  |
| `/api/user/update`             | POST            | session  |
| `/api/auth/[...nextauth]`      | GET, POST       | géré par NextAuth |

---

## Frontend

- **App Router** Next.js 16, mix Server / Client Components. Les pages contenant des interactions (carte, formulaires) déclarent `"use client"`.
- **Styles** : Tailwind 4 (config CSS-based, plus de `tailwind.config.js`) + MUI 9 (`@emotion/react` + `@emotion/styled`).
- **Carte** : Mapbox GL JS 3. Token public exposé via `NEXT_PUBLIC_MAPBOX_TOKEN` (preview-only — voir `next.config.ts`).

---

## Tests

- Jest 30 avec **deux projets** : `node` (`.test.ts`) et `jsdom` (`.test.tsx`).
- 17 suites, ~133 tests, ~97 % de couverture de lignes.
- Détail : [`__tests__/README.md`](../__tests__/README.md).

---

## CI/CD

Workflow unique `.github/workflows/ci.yml`, déclenché sur push et PR vers `main`.

| Job               | Rôle                                                                  |
| ----------------- | --------------------------------------------------------------------- |
| `lint`            | `npx eslint . --max-warnings=0`                                       |
| `gitleaks`        | Scan secrets (gitleaks 8.30.1, exit 1 si découverte)                  |
| `build-and-publish` | Sur push `main` uniquement : `docker buildx build` → push GHCR (`sha-...` + `latest`), cache GHA |

Pas de pipeline staging séparé — l'image `ghcr.io/periicles/petfriendlylocator:latest` est la version "production".

---

## Docker

- **Image runtime** : `node:24-alpine` multi-stage (builder + runner). `prisma generate` est exécuté **deux fois** : une fois pour le build, une fois dans l'image finale pour avoir le client à l'exécution.
- **`docker-compose.yml`** : services `app` (image GHCR) et `db` (postgres:16) reliés par `DATABASE_URL`. Volume `pgdata` pour persister la base.

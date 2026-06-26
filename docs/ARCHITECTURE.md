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
│   │   │   ├── admin/        # users/, locations/, reviews/ (+ [id]/) — GET/DELETE ADMIN
│   │   │   ├── auth/[...nextauth]/
│   │   │   ├── locations/    # GET, POST + [id]/ (GET/PUT/DELETE) + [id]/reviews/ (GET/POST)
│   │   │   ├── register/
│   │   │   └── user/         # me/ : GET   |   update/ : POST
│   │   ├── layout.tsx        # Root layout (HTML, providers)
│   │   ├── page.tsx          # Landing
│   │   └── globals.css
│   ├── components/           # composants métier (AddLocationModal, LocationDetailPanel, Map, Navbar, Locations*) + ui/ (primitives shadcn) + mapStyles.ts
│   ├── lib/
│   │   ├── auth.ts           # Instance Auth.js v5 (Node)
│   │   ├── auth.config.ts    # Config Auth.js partagée (Edge-safe)
│   │   ├── prisma.ts         # Client Prisma (Proxy lazy-init)
│   │   ├── requireAdmin.ts   # Garde de route ADMIN
│   │   ├── logger.ts
│   │   └── utils.ts          # Helper cn() (class-merge)
│   ├── providers.tsx         # SessionProvider
│   ├── types/                # DTO + augmentations next-auth
│   └── utils/                # mapLocationDto, mapReviewDto
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

Enums : `UserRole` = `USER | ADMIN`. `LocationType` = `PARK | BEACH | RESTAURANT | SHOP | HOTEL | OTHER` — aligné entre `prisma/schema.prisma`, le type TS `TCreateLocationInput` (`src/types/createLocationInput.ts`) et le formulaire `AddLocationModal`.

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
                          auth() (Auth.js v5) dans chaque route handler → session.user.id / session.user.roles
```

- **Stratégie** : `session: { strategy: 'jwt' }` (config dans `src/lib/auth.config.ts`, instance dans `src/lib/auth.ts`). Pas de table de session en DB.
- **Callback `jwt`** : injecte `user_id` dans `token.sub` et les `roles` au login.
- **Callback `session`** : expose `session.user.id` et `session.user.roles` côté client/serveur (typage dans `src/types/next-auth.d.ts`).
- **Middleware** (`middleware.ts`) : redirige les utilisateurs déjà authentifiés depuis `/login` ou `/register` vers `/`. **Ne protège pas** d'autres routes — la protection se fait dans chaque route handler ou page.

---

## API REST

Référence complète : [API.md](./API.md).

| Route                            | Méthodes        | Auth     |
| -------------------------------- | --------------- | -------- |
| `/api/locations`                 | GET, POST       | POST: session |
| `/api/locations/[id]`            | GET, PUT, DELETE| Mut: session + ownership |
| `/api/locations/[id]/reviews`    | GET, POST       | POST: session |
| `/api/register`                  | POST            | publique |
| `/api/user/me`                   | GET             | session  |
| `/api/user/update`               | POST            | session  |
| `/api/admin/{users,locations,reviews}`        | GET    | `ADMIN`  |
| `/api/admin/{users,locations,reviews}/[id]`   | DELETE | `ADMIN`  |
| `/api/auth/[...nextauth]`        | GET, POST       | géré par Auth.js |

---

## Frontend

- **App Router** Next.js 16, mix Server / Client Components. Les pages contenant des interactions (carte, formulaires) déclarent `"use client"`.
- **Styles** : Tailwind 4 (config CSS-based, plus de `tailwind.config.js`) + [shadcn/ui](https://ui.shadcn.com/). Les primitives (base-ui) vivent dans `src/components/ui/`, le thème est défini par tokens CSS (oklch) dans `globals.css`, les icônes via `lucide-react`, et le helper `cn()` dans `src/lib/utils.ts`.
- **Carte** : Mapbox GL JS 3. Token public exposé via `NEXT_PUBLIC_MAPBOX_TOKEN` (preview-only — voir `next.config.ts`). Le fond de carte est centralisé dans `src/components/mapStyles.ts` (variantes neutre/couleur), markers et popups stylés via les tokens du thème.

---

## Tests

- Jest 30 avec **deux projets** : `node` (`.test.ts`) et `jsdom` (`.test.tsx`).
- 21 suites, 160 tests, ~93 % de couverture de lignes.
- Détail : [`__tests__/README.md`](../__tests__/README.md).

---

## CI/CD

Workflow unique `.github/workflows/ci.yml`, déclenché sur push et PR vers `main`.

| Job               | Rôle                                                                  |
| ----------------- | --------------------------------------------------------------------- |
| `lint`            | `npx eslint . --max-warnings=0`                                       |
| `gitleaks`        | Scan secrets (gitleaks 8.30.1, exit 1 si découverte)                  |
| `test`            | `prisma generate` → `npm run build` (typecheck inclus) → `npm test`   |
| `build-and-publish` | Sur push `main` uniquement (après `lint`, `gitleaks`, `test`) : `docker buildx build` → push GHCR (`sha-...` + `latest`), cache GHA |

Pas de pipeline staging séparé — l'image `ghcr.io/periicles/petfriendlylocator:latest` est la version "production".

---

## Docker

- **Image runtime** : `node:24-alpine` multi-stage (builder + runner). `prisma generate` est exécuté **deux fois** : une fois pour le build, une fois dans l'image finale pour avoir le client à l'exécution.
- **`docker-compose.yml`** : services `app` (image GHCR) et `db` (postgres:16) reliés par `DATABASE_URL`. Volume `pgdata` pour persister la base.

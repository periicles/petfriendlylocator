# Architecture

> [Version française](./ARCHITECTURE.md)

Technical overview of **Pet Friendly Locator**.

---

## Directory tree

```text
.
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── admin/            # Admin dashboard
│   │   ├── carte/            # Map page (core feature)
│   │   ├── login/            # Sign in
│   │   ├── register/         # Sign up
│   │   ├── profile/          # Profile + sub-pages places/, reviews/
│   │   ├── api/              # REST route handlers
│   │   │   ├── admin/        # users/, locations/, reviews/ (+ [id]/) — ADMIN GET/DELETE
│   │   │   ├── auth/[...nextauth]/
│   │   │   ├── locations/    # GET, POST + [id]/ (GET/PUT/DELETE) + [id]/reviews/ (GET/POST)
│   │   │   ├── register/
│   │   │   └── user/         # me/ : GET   |   update/ : POST
│   │   ├── layout.tsx        # Root layout (HTML, providers)
│   │   ├── page.tsx          # Landing
│   │   └── globals.css
│   ├── components/           # feature components (AddLocationModal, LocationDetailPanel, Map, Navbar, Locations*) + ui/ (shadcn primitives) + mapStyles.ts
│   ├── lib/
│   │   ├── auth.ts           # Auth.js v5 instance (Node)
│   │   ├── auth.config.ts    # Auth.js shared config (Edge-safe)
│   │   ├── prisma.ts         # Prisma client (Proxy lazy-init)
│   │   ├── requireAdmin.ts   # ADMIN route guard
│   │   ├── logger.ts
│   │   └── utils.ts          # cn() class-merge helper
│   ├── providers.tsx         # SessionProvider
│   ├── types/                # DTOs + next-auth augmentations
│   └── utils/                # mapLocationDto, mapReviewDto
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── __tests__/                # Jest test suites
├── middleware.ts             # Auth redirect guard
├── next.config.ts
├── docker-compose.yml
├── Dockerfile
└── .github/workflows/ci.yml
```

---

## Data model

Source: `prisma/schema.prisma` (PostgreSQL).

```text
User ────< Location ────< Review
 │                          │
 └──────────< Review ───────┘
```

| Model    | Key fields                                                                                                            |
| -------- | --------------------------------------------------------------------------------------------------------------------- |
| User     | `user_id` (uuid), `pseudo` (unique), `email` (unique), `password` (bcrypt), `roles` (`USER` \| `ADMIN`)               |
| Location | `location_id` (uuid), `name`, `description?`, `address`, `zip_code`, `city`, `latitude`, `longitude`, `location_type` |
| Review   | `review_id` (uuid), `rating`, `title`, `content`, FK `user_id?` + `location_id`                                       |

Enums: `UserRole` = `USER | ADMIN`. `LocationType` = `PARK | BEACH | RESTAURANT | SHOP | HOTEL | OTHER` — aligned across `prisma/schema.prisma`, the TS type `TCreateLocationInput` (`src/types/createLocationInput.ts`), and the `AddLocationModal` form.

---

## Data access layer

- **Prisma singleton** in `src/lib/prisma.ts`, exposed through a `Proxy` that **defers instantiation** until the first call.
  Why: `next build` runs inside `Dockerfile` without `DATABASE_URL`. Eager instantiation would crash the build.
- **DTO mapping** in `src/utils/mapLocationDto.ts` — converts Prisma models into `LocationDTO` (dates → ISO strings, explicit `null`).
- No tRPC, no GraphQL: everything goes through Next.js route handlers (REST).

---

## Authentication flow

```text
┌──────────┐  POST /api/auth/callback/credentials   ┌──────────────┐
│ Client   │ ────────────────────────────────────▶  │ NextAuth     │
└──────────┘                                        │ authorize()  │
                                                    │ → prisma.user│
                                                    │ → bcrypt.cmp │
                                                    └──────┬───────┘
                                                           │ Signed JWT (sub = user_id)
                                                           ▼
                                                    ┌──────────────┐
                                                    │ httpOnly cookie│
                                                    └──────┬───────┘
                                                           │
                                       ┌───────────────────┴─────────────────┐
                                       ▼                                     ▼
                          auth() (Auth.js v5) in each route handler → session.user.id / session.user.roles
```

- **Strategy**: `session: { strategy: 'jwt' }` (config in `src/lib/auth.config.ts`, instance in `src/lib/auth.ts`). No session table in DB.
- **`jwt` callback**: injects `user_id` into `token.sub` and `roles` at sign-in.
- **`session` callback**: exposes `session.user.id` and `session.user.roles` to client/server (typed in `src/types/next-auth.d.ts`).
- **Middleware** (`middleware.ts`): redirects already-authenticated users away from `/login` or `/register`. **Does not protect** other routes — protection lives in each route handler / page.

---

## REST API

Full reference: [API.en.md](./API.en.md).

| Route                            | Methods         | Auth                          |
| -------------------------------- | --------------- | ----------------------------- |
| `/api/locations`                 | GET, POST       | POST: session                 |
| `/api/locations/[id]`            | GET, PUT, DELETE| Mutations: session + ownership |
| `/api/locations/[id]/reviews`    | GET, POST       | POST: session                 |
| `/api/register`                  | POST            | public                        |
| `/api/user/me`                   | GET             | session                       |
| `/api/user/update`               | POST            | session                       |
| `/api/admin/{users,locations,reviews}`        | GET    | `ADMIN`              |
| `/api/admin/{users,locations,reviews}/[id]`   | DELETE | `ADMIN`              |
| `/api/auth/[...nextauth]`        | GET, POST       | handled by Auth.js            |

---

## Frontend

- **Next.js 16 App Router**, mix of Server and Client Components. Pages with interactivity (map, forms) declare `"use client"`.
- **Styles**: Tailwind 4 (CSS-based config, no more `tailwind.config.js`) + [shadcn/ui](https://ui.shadcn.com/). Primitives (base-ui) live in `src/components/ui/`, the theme is defined by CSS tokens (oklch) in `globals.css`, icons via `lucide-react`, and the `cn()` helper in `src/lib/utils.ts`.
- **Map**: Mapbox GL JS 3. Public token exposed via `NEXT_PUBLIC_MAPBOX_TOKEN` (preview-only — see `next.config.ts`). The basemap is centralized in `src/components/mapStyles.ts` (neutral/color variants); markers and popups are styled with theme tokens.

---

## Tests

- Jest 30 with **two projects**: `node` (`.test.ts`) and `jsdom` (`.test.tsx`).
- 21 suites, 160 tests, ~93% line coverage.
- Details: [`__tests__/README.md`](../__tests__/README.md).

---

## CI/CD

Single workflow `.github/workflows/ci.yml`, triggered on push and PR to `main`.

| Job                 | Role                                                                                          |
| ------------------- | --------------------------------------------------------------------------------------------- |
| `lint`              | `npx eslint . --max-warnings=0`                                                               |
| `gitleaks`          | Secret scan (gitleaks 8.30.1, exit 1 on hit)                                                  |
| `test`              | `prisma generate` → `npm run build` (incl. typecheck) → `npm test`                            |
| `build-and-publish` | On `main` push only (after `lint`, `gitleaks`, `test`): `docker buildx build` → push to GHCR (`sha-...` + `latest`), GHA cache  |

No separate staging pipeline — the `ghcr.io/periicles/petfriendlylocator:latest` image is the "production" version.

---

## Docker

- **Runtime image**: `node:24-alpine` multi-stage (builder + runner). `prisma generate` runs **twice**: once during the build, once in the final image so the client is available at runtime.
- **`docker-compose.yml`**: `app` service (GHCR image) and `db` service (postgres:16) connected via `DATABASE_URL`. `pgdata` volume persists the database.

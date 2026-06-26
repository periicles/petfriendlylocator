# Changelog

All notable changes to **Pet Friendly Locator** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Security

- Patched 4 of 5 Dependabot advisories without breaking changes, via `overrides` and a non-forced `npm audit fix`: `postcss` 8.5.15 (XSS), `@hono/node-server` 1.19.14 (middleware bypass, transitive via `@prisma/dev`), `js-yaml` 4.2.0 (DoS), `@babel/core` 7.29.7 (arbitrary file read).
- `uuid` <11.1.1 advisory left in place: its only fix downgrades `next-auth` to v3 (major regression), and the flaw (bounds check in `v3/v5/v6` when `buf` is provided) is unreachable through `next-auth`, which uses `v4` without a `buf` argument. To be cleared by a future `next-auth` upgrade.

### Added

- Review creation: `GET`/`POST /api/locations/[id]/reviews` (authenticated, validated rating/title/content) plus a `LocationDetailPanel` opened by clicking a place in the sidebar or a map marker, showing details, existing reviews, and a submission form for signed-in users.
- Admin REST API backing the dashboard: `GET`/`DELETE` for `/api/admin/users`, `/api/admin/locations`, `/api/admin/reviews`. All endpoints require an authenticated `ADMIN`.
- `requireAdmin` route guard (`src/lib/requireAdmin.ts`) returning `401`/`403` for non-admin callers.
- `UserRole` now propagated into the JWT and session (`session.user.roles`) for client and server-side admin gating.
- Server-side protection of `/admin` via middleware (redirects non-admins).
- Project documentation suite: bilingual `README` (FR/EN), `CONTRIBUTING` (FR/EN), `docs/ARCHITECTURE` (FR/EN), `docs/API` (FR/EN), this changelog.

### Fixed

- Admin dashboard was calling non-existent `/api/admin/*` endpoints; the dashboard is now functional (list + delete).
- Deleting a location now cascades its reviews in a transaction, avoiding a foreign-key violation.
- `LocationType` mismatch resolved: the form offered `BEACH` while the Prisma enum did not, so creating a beach failed at the DB. The enum is now `PARK | BEACH | RESTAURANT | SHOP | HOTEL | OTHER`, aligned across schema, TS type, and form (which now also offers `HOTEL`). **Requires a DB migration** (`npm run migrate`).
- `POST /api/locations` now rejects an unknown `location_type` with `400` instead of letting it reach Prisma.

### Changed

- Admin dashboard page hardened: typed rows (no `any`), correct per-resource id resolution, error state instead of `console.error`, and removal of the non-functional "Éditer" stub.
- `LocationsView` now types the locations response (no `any`) and parses coordinates to numbers.
- `AddLocationModal` typed against a `GeocodingFeature` shape (no `any`); postcode is parsed to a number.
- Migrated the UI from MUI / Emotion to **shadcn/ui** (base-ui primitives, lucide icons): all components and pages rebuilt on the new token-based design system; `@mui/*` and `@emotion/*` removed.
- Reverted the Prisma data-access layer from `@prisma/extension-accelerate` back to `@prisma/adapter-pg`.
- CI: added a `test` job (`prisma generate` → `npm run build` → `npm test`) running on every push and PR, and gating the GHCR image publish.

## [0.1.0] — Initial release

### Added

- Interactive Mapbox map of pet-friendly places around Bordeaux (`/carte`).
- Place submission via floating form (authenticated users).
- User profile pages: edit personal info, list submitted places, list authored reviews.
- Review system: rating and comment per place.
- Admin dashboard (role `ADMIN`).
- Authentication with NextAuth (Credentials provider, JWT sessions, bcrypt password hashing).
- REST API: `/api/locations`, `/api/locations/[id]`, `/api/register`, `/api/user/me`, `/api/user/update`, `/api/auth/[...nextauth]`.
- Prisma 7 schema with `User`, `Location`, `Review` models and `UserRole` / `LocationType` enums.
- Jest test suite (17 suites, ~133 tests, ~97% coverage) with dual-environment setup (node + jsdom).
- Docker image and `docker-compose.yml` for local stack.
- GitHub Actions CI: lint, gitleaks, build & publish to GHCR.

### Changed

- Migrated from Prisma `adapter-pg` to `@prisma/extension-accelerate` (v7).
- Migrated Tailwind to v4 CSS-based config.
- Upgraded to Node 24 LTS and React 19.

### Fixed

- Prisma client lazy-initialization via `Proxy` to prevent `next build` failures when `DATABASE_URL` is absent (Docker build stage).
- Authorization checks on `PUT` / `DELETE /api/locations/[id]` now verify ownership in addition to authentication.

[Unreleased]: https://github.com/Periicles/petfriendlylocator/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/Periicles/petfriendlylocator/releases/tag/v0.1.0

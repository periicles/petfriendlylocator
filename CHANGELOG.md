# Changelog

All notable changes to **Pet Friendly Locator** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Project documentation suite: bilingual `README` (FR/EN), `CONTRIBUTING` (FR/EN), `docs/ARCHITECTURE` (FR/EN), `docs/API` (FR/EN), this changelog.

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

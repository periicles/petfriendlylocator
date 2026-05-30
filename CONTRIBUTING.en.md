# Contributing

> [Version française](./CONTRIBUTING.md)

Thanks for contributing to **Pet Friendly Locator**. This guide summarizes the workflow and conventions.

---

## Git workflow

The project follows **GitHub Flow**: everything branches off `main`, changes go through a dedicated branch and then a Pull Request.

1. Branch off `main`:

   ```bash
   git switch -c feat/my-new-feature
   # or: fix/...   chore/...   ci/...   refactor/...   docs/...
   ```

2. Code, commit, push.
3. Open a PR against `main`. CI must pass (lint + gitleaks). Merging triggers the Docker build and publish to GHCR.

No release branches, no staging — the GHCR `latest` tag is whatever just landed on `main`.

---

## Commit conventions

**Conventional Commits** format:

```text
<type>(<optional scope>): <short description in present tense>
```

Types used in this repo: `feat`, `fix`, `chore`, `ci`, `refactor`, `deps`, `infra`, `docs`.

Examples from the log:

- `fix(prisma): lazy-init client via Proxy to fix Docker build failure`
- `ci: upgrade actions to Node 24 native, replace gitleaks action with CLI`
- `refactor: migrate Tailwind config to CSS-based v4 pattern`
- `docs: update .env.example with descriptive defaults`

---

## Local checks before pushing

```bash
npm run lint           # ESLint — zero warnings tolerated in CI
npm test               # Jest — all suites must pass
```

Optionally, scan for secrets the same way CI does:

```bash
gitleaks detect --source .
```

---

## Prisma migrations

Schema lives in `prisma/schema.prisma`. After editing:

```bash
npm run generate                       # regenerate the Prisma client
npx prisma migrate dev --name <name>   # create and apply the migration locally
```

Commit the generated file under `prisma/migrations/`. Do not run `migrate deploy` locally — it's for production environments only.

---

## Tests

Dual-environment configuration (node + jsdom) — see [`__tests__/README.md`](./__tests__/README.md).

- API route / utility tests: `.test.ts` (node env)
- React component tests: `.test.tsx` (jsdom env)

When touching a component or route, add or update the matching test.

---

## Code style

- Strict TypeScript, no implicit `any`.
- React components: Server Components by default, `"use client"` only when required.
- API responses: go through DTOs in `src/types/` rather than returning raw Prisma models.
- Comments: explain **why**, not **what** (the code reads itself).
- No `console.log` in production code (only `console.error` on error paths).

---

## Security

- **Never commit secrets** — `.env` is git-ignored, use `.env.example` to document.
- The `gitleaks` job blocks any secret pushed to `main`.
- For mutating API routes: require a JWT token **and** check ownership (`location.user_id === token.sub`).

---

## Questions

Open an issue on [the GitHub repo](https://github.com/Periicles/petfriendlylocator/issues).

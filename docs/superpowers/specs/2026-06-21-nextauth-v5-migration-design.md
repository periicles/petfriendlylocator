# Design — Migration NextAuth v4 → Auth.js v5

**Date:** 2026-06-21
**Status:** Approved (pending spec review)
**Scope:** Behaviour-preserving port + light cleanup. Credentials provider, JWT sessions.

## Goal

Migrate from `next-auth@4` to `next-auth@5` (Auth.js / `@auth/core`) to:

1. **Close the `uuid` advisory** (GHSA-w5hq-g745-h8pq) — v5 depends only on `@auth/core`, whose dependency tree (`jose`, `preact`, `@panva/hkdf`, `oauth4webapi`) contains no `uuid`.
2. **Modernise** the auth crypto (v5 uses `jose` for JWT) while keeping current behaviour.

Non-goals: switching to OAuth/Email, database sessions, session revocation, or any change to the login UX. Those remain a separate future product decision (DB sessions are not possible while the Credentials provider is used — Auth.js forces JWT with Credentials).

## Feasibility (verified)

- `next-auth@beta` = `5.0.0-beta.31`. **Accepted as a beta dependency** (documented tradeoff). Rollback = revert the PR.
- Peer deps: `next: ^14 || ^15 || ^16` → **Next 16 supported**.
- `@auth/core@0.41.2` deps: `jose`, `preact`, `@panva/hkdf`, `oauth4webapi`, `preact-render-to-string` → **no `uuid`**, so the advisory is cleared.

## Architecture — split config for edge-safe middleware

`middleware.ts` runs on the **edge** and only needs to **decode the JWT** (read `roles`). If middleware imports the auth config that contains `authorize` (which pulls in `bcryptjs` + `prisma`, Node-only), the edge bundle breaks. The canonical v5 fix is to split the config:

- **`src/lib/auth.config.ts`** — edge-safe, **no Node imports**. Holds `pages`, `session: { strategy: 'jwt' }`, and the `jwt` / `session` callbacks (pure, inject `id` + `roles`). `providers: []` placeholder. Typed `satisfies NextAuthConfig`.
- **`src/lib/auth.ts`** — Node runtime. Imports `authConfig`, adds the `Credentials` provider with the existing `authorize` logic (`prisma` lookup + `bcryptjs.compare`), and exports `{ handlers, auth, signIn, signOut } = NextAuth({ ...authConfig, providers: [Credentials(...)] })`.
- **`middleware.ts`** — builds `const { auth } = NextAuth(authConfig)` (edge-safe), then `export default auth((req) => …)` reproducing the current redirect logic via `req.auth` (`isAuth = !!req.auth`, role from `req.auth.user.roles`). Matcher unchanged: `['/login', '/register', '/admin', '/admin/:path*']`.

The `prisma` singleton keeps its lazy-Proxy (CLAUDE.md constraint) — unchanged.

## Call-site mapping (v4 → v5)

| File | Before | After |
|---|---|---|
| `src/app/api/auth/[...nextauth]/route.ts` | `const handler = NextAuth(authOptions); export { handler as GET, handler as POST }` | `export const { GET, POST } = handlers` |
| `src/app/api/user/me/route.ts` | `getServerSession(authOptions)` | `await auth()` |
| `src/app/api/user/update/route.ts` | `getServerSession(authOptions)` | `await auth()` |
| `src/app/profile/places/page.tsx` | `getServerSession(authOptions)` | `await auth()` |
| `src/app/profile/reviews/page.tsx` | `getServerSession(authOptions)` | `await auth()` |
| `src/app/api/locations/route.ts` | `getToken({req})` → `token.sub` | `await auth()` → `session?.user?.id` |
| `src/app/api/locations/[id]/route.ts` | `getToken({req})` → `token.sub` | `await auth()` → `session?.user?.id` |
| `src/app/api/locations/[id]/reviews/route.ts` | `getToken({req})` → `token.sub` | `await auth()` → `session?.user?.id` |
| `src/lib/requireAdmin.ts` | `getToken({req})` → `token.roles` | `await auth()` → `session?.user?.roles` |
| `middleware.ts` | `getToken({req})` | `auth((req)=>…)` + `req.auth` |
| `src/providers.tsx` | `SessionProvider` (`next-auth/react`) | unchanged |
| `src/components/Navbar.tsx` | `useSession`, `signOut` | unchanged |
| `src/components/LocationsSidebar.tsx` | `useSession` | unchanged |
| `src/components/LocationDetailPanel.tsx` | `useSession` | unchanged |
| `src/app/login/page.tsx` | `signIn('credentials', …)` | unchanged |

**Value mapping:** `getToken` returned the raw JWT (`token.sub`, `token.roles`); `auth()` returns the Session (`session.user.id`, `session.user.roles`). Auth checks change from `token?.sub` to `session?.user?.id`, and `token.roles` to `session.user.roles`. HTTP status codes (`401`/`403`/`404`) are preserved exactly.

## Types & callbacks

- `src/types/next-auth.d.ts`: keep module augmentation for `next-auth` (`Session.user.id/roles`, `User.roles`) and `next-auth/jwt` (`JWT.roles`). `UserRole` from `@prisma/client`. Behaviour identical.
- `jwt` callback: `if (user) { token.sub = user.id; token.roles = user.roles }` — unchanged.
- `session` callback: `session.user.id = token.sub; session.user.roles = token.roles` — unchanged.
- `authorize` returns `{ id, email, name, roles }` — unchanged.

## Environment variables

- `NEXTAUTH_SECRET` → **`AUTH_SECRET`** (auto-read by v5).
- `NEXTAUTH_URL` → removed (auto-detected by v5).
- Update `.env.example`. **Required user action:** add `AUTH_SECRET` to the local `.env` (and any deployment env) before running. The value can be the existing secret.

## Tests

- Node API tests that mock `next-auth/jwt` `getToken` — `__tests__/location.test.ts`, `__tests__/reviews.test.ts`, `__tests__/adminApi.test.ts` — re-mock `@/lib/auth`'s `auth` export to return `{ user: { id, roles } }` (instead of `getToken` returning `{ sub, roles }`). Unauthenticated case: `auth()` resolves `null`.
- Component tests mocking `useSession` (`next-auth/react`) — **unchanged** (v5 keeps `next-auth/react`).
- No test assertions on HTTP behaviour change (status codes identical).

## Verification

- `npm run lint` — 0 warnings.
- `npm test` — 160 tests / 21 suites green.
- `npm run build` — succeeds (incl. edge middleware bundle, proving the split config works).
- `npm audit` — `uuid` advisory gone.
- Manual smoke: login, logout, `/admin` gating (admin vs non-admin), submit a review.

## Rollback

Single dedicated branch / PR. If issues arise, revert the merge commit. No data migration involved (JWT sessions; existing accounts unaffected).

## Risks

- **Beta dependency** (`5.0.0-beta.31`): widely used in production but officially beta. Accepted.
- **Edge middleware bundling**: mitigated by the split config; `npm run build` is the gate that proves it.
- **Behavioural drift**: mitigated by keeping callbacks/authorize identical and asserting via the existing test suite + manual smoke.

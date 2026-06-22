# NextAuth v4 → Auth.js v5 Migration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate authentication from `next-auth@4` to `next-auth@5` (Auth.js) while preserving exact behaviour, to close the transitive `uuid` advisory and modernise the JWT crypto.

**Architecture:** Credentials provider + JWT sessions. A split config keeps the edge middleware Node-free: `auth.config.ts` (edge-safe: callbacks/pages/session) and `auth.ts` (Node: adds the Credentials provider with prisma/bcrypt and exports `handlers`, `auth`, `signIn`, `signOut`). All server-side `getServerSession`/`getToken` calls become `auth()`. Client `useSession`/`signIn`/`signOut`/`SessionProvider` are unchanged.

**Tech Stack:** Next.js 16 (App Router), `next-auth@5.0.0-beta.x` (`@auth/core` + `jose`), Prisma 7, Jest 30.

**Spec:** `docs/superpowers/specs/2026-06-21-nextauth-v5-migration-design.md`

---

## File Structure

- **Create** `src/lib/auth.config.ts` — edge-safe config (pages, jwt session strategy, jwt/session callbacks, empty providers).
- **Rewrite** `src/lib/auth.ts` — `NextAuth({...authConfig, providers:[Credentials(authorize)]})`, exports `{ handlers, auth, signIn, signOut }`.
- **Rewrite** `src/app/api/auth/[...nextauth]/route.ts` — `export const { GET, POST } = handlers`.
- **Edit** `src/lib/requireAdmin.ts` — use `auth()` (keep optional `_req` for call-site compatibility).
- **Edit** server session sites: `src/app/api/user/me/route.ts`, `src/app/api/user/update/route.ts`, `src/app/profile/places/page.tsx`, `src/app/profile/reviews/page.tsx`.
- **Edit** token sites: `src/app/api/locations/route.ts`, `src/app/api/locations/[id]/route.ts`, `src/app/api/locations/[id]/reviews/route.ts`.
- **Rewrite** `middleware.ts` — `NextAuth(authConfig).auth((req)=>…)`.
- **Edit** `.env.example` — `AUTH_SECRET`, drop `NEXTAUTH_*`.
- **Edit** tests: `__tests__/location.test.ts`, `__tests__/reviews.test.ts`, `__tests__/adminApi.test.ts` — mock `@/lib/auth` `auth` instead of `next-auth/jwt` `getToken`.
- **Unchanged** (verified at build): `src/types/next-auth.d.ts` (v5-compatible augmentation), `src/providers.tsx`, `src/components/{Navbar,LocationsSidebar,LocationDetailPanel}.tsx`, `src/app/login/page.tsx`, all `src/app/api/admin/**` routes (still pass `req` to `requireAdmin`).

> **Note on intermediate state:** This is a cross-cutting refactor. The tree may not type-check between Tasks 3–8 (call sites reference the old `authOptions` until updated). Full green is gated at Task 12. Each task still commits a coherent unit.

---

### Task 1: Install Auth.js v5

**Files:** Modify `package.json`, `package-lock.json`

- [ ] **Step 1: Install the beta**

Run: `npm install next-auth@beta`
Expected: `next-auth` moves to `^5.0.0-beta.31` (or later beta) in `dependencies`.

- [ ] **Step 2: Confirm uuid left the tree**

Run: `npm ls uuid 2>/dev/null || echo "no uuid"`
Expected: no `uuid` under `next-auth` (the advisory source is gone).

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore(deps): upgrade next-auth to v5 (Auth.js)"
```

---

### Task 2: Create edge-safe auth config

**Files:** Create `src/lib/auth.config.ts`

- [ ] **Step 1: Write the config**

```ts
import type { NextAuthConfig } from 'next-auth';

/**
 * Edge-safe Auth.js config: no Node-only imports (prisma/bcrypt), so it can be
 * loaded by the edge middleware to decode the JWT. The Credentials provider's
 * `authorize` (prisma + bcrypt) is added in the Node-only `auth.ts`.
 *
 * Why JWT sessions: lets route handlers and middleware authenticate statelessly
 * via `auth()` without a per-request DB round-trip, and Credentials requires JWT.
 */
export const authConfig = {
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.roles = user.roles;
      }
      return token;
    },
    session({ session, token }) {
      if (token?.sub) {
        session.user.id = token.sub;
        session.user.roles = token.roles;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
```

- [ ] **Step 2: Type-check the new file**

Run: `npx tsc --noEmit 2>&1 | grep "auth.config" || echo "auth.config OK"`
Expected: `auth.config OK` (augmentation in `src/types/next-auth.d.ts` provides `user.roles`, `token.roles`, `session.user.id/roles`).

- [ ] **Step 3: Commit**

```bash
git add src/lib/auth.config.ts
git commit -m "feat(auth): add edge-safe Auth.js config (split config)"
```

---

### Task 3: Rewrite auth.ts with v5 exports

**Files:** Rewrite `src/lib/auth.ts`

- [ ] **Step 1: Replace the file contents**

```ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { prisma } from './prisma';
import { authConfig } from './auth.config';

/**
 * Auth.js (v5) instance. Node-only: the Credentials `authorize` uses prisma +
 * bcrypt. Edge code (middleware) must import `authConfig`, not this module.
 *
 * The `jwt` callback injects `user.user_id` into `token.sub` and `roles`; the
 * `session` callback re-exposes them as `session.user.id` / `session.user.roles`
 * (typed in `src/types/next-auth.d.ts`).
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });
        if (!user) return null;

        const isValid = await compare(credentials.password as string, user.password);
        if (!isValid) return null;

        return {
          id: user.user_id,
          email: user.email,
          name: user.pseudo,
          roles: user.roles,
        };
      },
    }),
  ],
});
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/auth.ts
git commit -m "feat(auth): wire Auth.js v5 instance with Credentials provider"
```

---

### Task 4: Update the NextAuth route handler

**Files:** Rewrite `src/app/api/auth/[...nextauth]/route.ts`

- [ ] **Step 1: Replace contents**

```ts
import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers;
```

- [ ] **Step 2: Commit**

```bash
git add "src/app/api/auth/[...nextauth]/route.ts"
git commit -m "refactor(auth): expose v5 route handlers"
```

---

### Task 5: Migrate requireAdmin to auth()

**Files:** Rewrite `src/lib/requireAdmin.ts`

- [ ] **Step 1: Replace contents** (keep the optional `_req` so the 6 admin routes that call `requireAdmin(req)` need no change; `_`-prefix is allowed by the lint config)

```ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from './auth';

/**
 * Guard for admin-only route handlers. Returns a ready-to-send error response
 * when the caller is not an authenticated admin, or `null` when access is
 * granted: `const denied = await requireAdmin(); if (denied) return denied;`.
 *
 * `_req` is accepted but unused — v5 `auth()` reads the request context itself;
 * the parameter is kept for call-site compatibility.
 */
export async function requireAdmin(_req?: NextRequest): Promise<NextResponse | null> {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  if (session.user.roles !== 'ADMIN') {
    return NextResponse.json({ error: 'Accès interdit' }, { status: 403 });
  }

  return null;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/requireAdmin.ts
git commit -m "refactor(auth): requireAdmin via auth() session"
```

---

### Task 6: Migrate server-session call sites

**Files:** Modify `src/app/api/user/me/route.ts`, `src/app/api/user/update/route.ts`, `src/app/profile/places/page.tsx`, `src/app/profile/reviews/page.tsx`

- [ ] **Step 1: `user/me/route.ts`** — replace the import lines

Replace:
```ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
```
with:
```ts
import { auth } from '@/lib/auth';
```
and replace `const session = await getServerSession(authOptions);` with `const session = await auth();`.

- [ ] **Step 2: `user/update/route.ts`** — same swap

Replace:
```ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
```
with:
```ts
import { auth } from '@/lib/auth';
```
and replace `const session = await getServerSession(authOptions);` with `const session = await auth();`.

- [ ] **Step 3: `profile/places/page.tsx`** — same swap

Replace:
```ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
```
with:
```ts
import { auth } from '@/lib/auth';
```
and replace `const session = await getServerSession(authOptions);` with `const session = await auth();`.

- [ ] **Step 4: `profile/reviews/page.tsx`** — same swap

Replace:
```ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
```
with:
```ts
import { auth } from '@/lib/auth';
```
and replace `const session = await getServerSession(authOptions);` with `const session = await auth();`.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/user/me/route.ts src/app/api/user/update/route.ts src/app/profile/places/page.tsx src/app/profile/reviews/page.tsx
git commit -m "refactor(auth): replace getServerSession with auth()"
```

---

### Task 7: Migrate token (getToken) call sites

**Files:** Modify `src/app/api/locations/route.ts`, `src/app/api/locations/[id]/route.ts`, `src/app/api/locations/[id]/reviews/route.ts`

> `getToken` returned `{ sub, roles }`; `auth()` returns `{ user: { id, roles } }`. Map `token.sub` → `session.user.id`. Status codes unchanged.

- [ ] **Step 1: `locations/route.ts`** — swap import and POST guard

Replace `import { getToken } from 'next-auth/jwt';` with `import { auth } from '@/lib/auth';`.
In `POST`, replace:
```ts
  const token = await getToken({ req });

  if (!token || !token.sub) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const userId = token.sub;
```
with:
```ts
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const userId = session.user.id;
```

- [ ] **Step 2: `locations/[id]/route.ts`** — swap import and both guards

Replace `import { getToken } from 'next-auth/jwt';` with `import { auth } from '@/lib/auth';`.
In **both** `PUT` and `DELETE`, replace:
```ts
  const token = await getToken({ req });
  if (!token?.sub) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
```
with:
```ts
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
```
and replace both ownership checks `if (location.user_id !== token.sub) {` with `if (location.user_id !== session.user.id) {`.

- [ ] **Step 3: `locations/[id]/reviews/route.ts`** — swap import and POST guard

Replace `import { getToken } from 'next-auth/jwt';` with `import { auth } from '@/lib/auth';`.
In `POST`, replace:
```ts
  const token = await getToken({ req });
  if (!token?.sub) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
```
with:
```ts
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
```
and replace `user_id: token.sub` with `user_id: session.user.id` in the `prisma.review.create` data.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/locations/route.ts "src/app/api/locations/[id]/route.ts" "src/app/api/locations/[id]/reviews/route.ts"
git commit -m "refactor(auth): replace getToken with auth() in API routes"
```

---

### Task 8: Migrate the middleware

**Files:** Rewrite `middleware.ts`

- [ ] **Step 1: Replace contents** (same redirect logic, edge-safe via `authConfig`)

```ts
import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import { authConfig } from '@/lib/auth.config';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isAuth = !!req.auth;

  const isAuthPage = nextUrl.pathname === '/login' || nextUrl.pathname === '/register';
  const isAdminPage = nextUrl.pathname === '/admin' || nextUrl.pathname.startsWith('/admin/');

  if (isAuth && isAuthPage) {
    return NextResponse.redirect(new URL('/', nextUrl));
  }

  if (isAdminPage && req.auth?.user?.roles !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', nextUrl));
  }

  return NextResponse.next();
});

// Appliquer le middleware aux pages auth et à l'espace admin
export const config = {
  matcher: ['/login', '/register', '/admin', '/admin/:path*'],
};
```

- [ ] **Step 2: Commit**

```bash
git add middleware.ts
git commit -m "refactor(auth): migrate middleware to Auth.js v5"
```

---

### Task 9: Environment variables

**Files:** Modify `.env.example`

- [ ] **Step 1: Rename in `.env.example`**

Replace:
```
NEXTAUTH_SECRET=replace-with-a-random-secret
NEXTAUTH_URL=http://localhost:3000
```
with:
```
AUTH_SECRET=replace-with-a-random-secret
```
(v5 auto-detects the URL; `AUTH_URL` is optional.)

- [ ] **Step 2: Set the local secret** (manual, not committed — `.env` is gitignored)

Run: `grep -q '^AUTH_SECRET=' .env || echo "AUTH_SECRET=$(grep -E '^NEXTAUTH_SECRET=' .env | cut -d= -f2-)" >> .env; grep -c '^AUTH_SECRET=' .env`
Expected: `1` (AUTH_SECRET present in `.env`, copied from the existing NEXTAUTH_SECRET value).

- [ ] **Step 3: Commit**

```bash
git add .env.example
git commit -m "chore(auth): use AUTH_SECRET env var for Auth.js v5"
```

---

### Task 10: Update API test mocks

**Files:** Modify `__tests__/location.test.ts`, `__tests__/reviews.test.ts`, `__tests__/adminApi.test.ts`

> Mock `@/lib/auth`'s `auth` (returns a Session) instead of `next-auth/jwt`'s `getToken` (returned a raw JWT).

- [ ] **Step 1: `location.test.ts`** — swap the mock

Replace:
```ts
jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn(),
}));
```
with:
```ts
jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}));
```
Replace `import { getToken } from 'next-auth/jwt';` with `import { auth } from '@/lib/auth';`.
Replace `const mockGetToken = getToken as jest.MockedFunction<any>;` with `const mockAuth = auth as jest.MockedFunction<any>;`.
Replace `mockGetToken.mockResolvedValueOnce(null);` with `mockAuth.mockResolvedValueOnce(null);`.
Replace `mockGetToken.mockResolvedValueOnce({ sub: 'user_mocked_id' });` with `mockAuth.mockResolvedValueOnce({ user: { id: 'user_mocked_id' } });`.

- [ ] **Step 2: `reviews.test.ts`** — swap the mock

Replace:
```ts
jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn(),
}));
```
with:
```ts
jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}));
```
Replace `import { getToken } from 'next-auth/jwt';` with `import { auth } from '@/lib/auth';`.
Replace `const mockGetToken = getToken as jest.MockedFunction<any>;` with `const mockAuth = auth as jest.MockedFunction<any>;`.
Replace every `mockGetToken.mockResolvedValueOnce(null)` with `mockAuth.mockResolvedValueOnce(null)`.
Replace every `mockGetToken.mockResolvedValueOnce({ sub: 'u1' })` with `mockAuth.mockResolvedValueOnce({ user: { id: 'u1' } })`.

- [ ] **Step 3: `adminApi.test.ts`** — swap the mock

Replace:
```ts
jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn(),
}));
```
with:
```ts
jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}));
```
Replace `import { getToken } from 'next-auth/jwt';` with `import { auth } from '@/lib/auth';`.
Replace `const mockGetToken = getToken as jest.MockedFunction<any>;` with `const mockAuth = auth as jest.MockedFunction<any>;`.
Then update the resolved values:
- `mockGetToken.mockResolvedValueOnce(null)` → `mockAuth.mockResolvedValueOnce(null)`
- `mockGetToken.mockResolvedValueOnce({ sub: 'u1', roles: 'USER' })` → `mockAuth.mockResolvedValueOnce({ user: { id: 'u1', roles: 'USER' } })`
- `mockGetToken.mockResolvedValue({ sub: 'admin1', roles: 'ADMIN' })` → `mockAuth.mockResolvedValue({ user: { id: 'admin1', roles: 'ADMIN' } })`

- [ ] **Step 4: Run the node test suites**

Run: `npm test -- __tests__/location.test.ts __tests__/reviews.test.ts __tests__/adminApi.test.ts`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add __tests__/location.test.ts __tests__/reviews.test.ts __tests__/adminApi.test.ts
git commit -m "test(auth): mock auth() instead of getToken for v5"
```

---

### Task 11: Full type-check and fix types if needed

**Files:** Possibly `src/types/next-auth.d.ts`

- [ ] **Step 1: Type-check the whole project (production code)**

Run: `npx tsc --noEmit 2>&1 | grep -E "^src/|^middleware" || echo "prod clean"`
Expected: `prod clean`. If `src/types/next-auth.d.ts` errors on `next-auth/jwt` augmentation under v5, keep the `declare module 'next-auth'` block and ensure the JWT block imports `UserRole` from `@prisma/client`; the augmentation shape is unchanged from v4.

- [ ] **Step 2: Commit (only if the types file changed)**

```bash
git add src/types/next-auth.d.ts
git commit -m "fix(types): align NextAuth module augmentation with v5"
```

---

### Task 12: Verification

**Files:** none (verification only)

- [ ] **Step 1: Lint**

Run: `npm run lint`
Expected: 0 warnings, 0 errors.

- [ ] **Step 2: Full test suite**

Run: `npm test`
Expected: `Test Suites: 21 passed`, `Tests: 160 passed`.

- [ ] **Step 3: Build (proves the edge middleware bundle works with the split config)**

Run: `npm run build`
Expected: `✓ Compiled successfully`, middleware listed as `ƒ Proxy (Middleware)`.

- [ ] **Step 4: Audit (uuid gone)**

Run: `npm audit 2>&1 | tail -3`
Expected: the `uuid`/`next-auth` advisory no longer listed (0 vulnerabilities, or only unrelated ones).

- [ ] **Step 5: Manual smoke (requires `AUTH_SECRET` in `.env` and a running DB)**

Run `npm run dev`, then verify:
- Log in at `/login` with `admin@pfb.fr` / `admin123` → redirected to `/`.
- `/admin` is reachable as admin; logging in as a non-admin user (or anonymous) redirects away from `/admin`.
- Submit a review on a location (authenticated) → `201`, appears in the panel.
- Log out (Navbar) → session cleared, `/admin` no longer reachable.

- [ ] **Step 6: Final confirmation**

No commit needed (verification only). The branch `refactor/nextauth-v5` is ready for PR.

---

## Notes for the implementer

- `next-auth/react` (`useSession`, `signIn`, `signOut`, `SessionProvider`) is unchanged in v5 — do **not** touch `providers.tsx`, `Navbar.tsx`, `LocationsSidebar.tsx`, `LocationDetailPanel.tsx`, or `login/page.tsx`.
- Admin routes under `src/app/api/admin/**` are unchanged — they still call `requireAdmin(req)`, and `requireAdmin` accepts (and ignores) the argument.
- If the build complains that the middleware bundle pulls Node modules, verify `middleware.ts` imports **only** from `@/lib/auth.config` (never `@/lib/auth`).

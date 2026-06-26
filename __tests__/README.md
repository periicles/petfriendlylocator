# Test Suite

Jest 30 with **dual-environment** support: API/utility tests run in Node, component tests in jsdom.

## Environments

| File pattern  | Environment | Setup                                    | Examples                                              |
| ------------- | ----------- | ---------------------------------------- | ----------------------------------------------------- |
| `*.test.ts`   | `node`      | none                                     | `location.test.ts`, `mapLocationDto.test.ts`          |
| `*.test.tsx`  | `jsdom`     | `jest.setup.jsdom.ts` (RTL DOM matchers) | `register.test.tsx`, `login.test.tsx`, `Map.test.tsx` |

Two-project Jest config lives in `jest.config.ts`.

## Running tests

```bash
npm test                            # all suites
npm test -- --coverage              # with coverage report
npm test -- register.test.tsx       # one file
npm test -- --testNamePattern login # by test name
```

## Current state

- **21 test suites**, **160 tests** — all passing
- **~93% line coverage** (`npm test -- --coverage`)
- Suites cover: API route (`location.test.ts`), DTO mapping, pages (`HomePage`, `RootLayout`, `carte`, `profile`, `login`, `register`, `AdminDashboardPage`), and components (`Map`, `Navbar`, `LocationsView`, `LocationsSidebar`, `AddLocationModal`, `ClientNavbarWrapper`, `Providers`).

Refresh these numbers by running `npm test -- --coverage` after notable changes.

## Stack

- Jest 30 — test runner
- `@testing-library/react` + `@testing-library/user-event` + `@testing-library/jest-dom`
- `jest-environment-jsdom` — browser simulation for the jsdom project
- `ts-jest` — TS transformation

## Conventions

- One spec file per source file when practical; mirror the source name (`Map.tsx` → `Map.test.tsx`).
- Use `getByRole` / accessible queries over `getByTestId` whenever the component exposes accessible names.
- Mock auth via `next-auth/react` for client components and the `auth()` export of `@/lib/auth` (Auth.js v5) for server-side pages/handlers — see `profile.test.tsx` and `login.test.tsx` for reference patterns.

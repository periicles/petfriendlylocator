# API Reference

> [Version française](./API.md)

REST routes exposed by **Pet Friendly Locator**. All routes are under `/api/`.

---

## Shared types

- **`LocationDTO`** (`src/types/locationDto.ts`)

  ```ts
  {
    location_id: string;
    name: string;
    description?: string | null;
    address: string;
    zip_code: number;
    city: string;
    latitude: string;
    longitude: string;
    created_at: string;     // ISO 8601
    updated_at?: string | null;
    user_id?: string | null;
    location_type: string;
  }
  ```

- **`TCreateLocationInput`** (`src/types/createLocationInput.ts`)

  ```ts
  {
    name: string;
    description?: string;
    address: string;
    zip_code: number;
    city: string;
    latitude: string;
    longitude: string;
    location_type: 'PARK' | 'BEACH' | 'RESTAURANT' | 'SHOP' | 'OTHER';
  }
  ```

---

## Authentication

Two mechanisms coexist (both backed by NextAuth):

- **Direct JWT** via `getToken({ req })` — used by mutating `/api/locations/*` routes.
- **Server-side session** via `getServerSession(authOptions)` — used by `/api/user/*` routes.

A web client carrying NextAuth cookies satisfies both automatically.

---

## `/api/locations`

### `GET /api/locations`

List all locations.

- **Auth**: none
- **Response**: `200 OK` → `LocationDTO[]`

### `POST /api/locations`

Create a location, owned by the authenticated user.

- **Auth**: JWT required (`token.sub` ⇒ `user_id`)
- **Body**: `TCreateLocationInput`
- **Responses**:
  - `201 Created` → `LocationDTO`
  - `401 Unauthorized` → `{ error: "Non autorisé" }`

---

## `/api/locations/[id]`

### `GET /api/locations/[id]`

Fetch a single location.

- **Auth**: none
- **Responses**:
  - `200 OK` → raw Prisma `Location` model (⚠️ not passed through `mapLocationToDTO`)
  - `404 Not Found` → `{ error: "Lieu non trouvé" }`

### `PUT /api/locations/[id]`

Update a location. **Only the owner can edit.**

- **Auth**: JWT required + `location.user_id === token.sub`
- **Body**: editable fields → `name`, `description`, `address`, `zip_code`, `city`, `latitude`, `longitude`
- **Responses**:
  - `200 OK` → updated Prisma `Location` model
  - `401 Unauthorized` → `{ error: "Non autorisé" }`
  - `403 Forbidden` → `{ error: "Accès interdit" }`
  - `404 Not Found` → `{ error: "Lieu non trouvé" }`

### `DELETE /api/locations/[id]`

Delete a location. **Only the owner can delete.**

- **Auth**: JWT required + `location.user_id === token.sub`
- **Responses**:
  - `200 OK` → `{ message: "Lieu supprimé" }`
  - `401 Unauthorized` → `{ error: "Non autorisé" }`
  - `403 Forbidden` → `{ error: "Accès interdit" }`
  - `404 Not Found` → `{ error: "Lieu non trouvé" }`

---

## `/api/register`

### `POST /api/register`

Create a user account. Password is hashed with bcrypt (10 rounds).

- **Auth**: none
- **Body**: `{ email: string, password: string, pseudo: string }`
- **Responses**:
  - `201 Created` → `{ message: "Utilisateur créé avec succès" }`
  - `400 Bad Request` → `{ error: "Champs manquants" }`
  - `409 Conflict` → `{ error: "Email déjà utilisé" }` or `{ error: "Pseudo déjà utilisé" }`
  - `500 Internal Server Error` → `{ error: "Erreur serveur" }`

---

## `/api/user/me`

### `GET /api/user/me`

Fetch the current user's profile (looked up by session email).

- **Auth**: session required
- **Response**:
  - `200 OK` → `{ pseudo: string, email: string }`
  - `401 Unauthorized` → `{ error: "Unauthorized" }`

---

## `/api/user/update`

### `POST /api/user/update`

Update the current user's `pseudo` and/or `email`.

- **Auth**: session required
- **Body**: `{ pseudo?: string, email?: string }`
- **Responses**:
  - `200 OK` → `{ message: "Profil mis à jour", user: User }`
  - `401 Unauthorized` → `{ error: "Non autorisé" }`
  - `500 Internal Server Error` → `{ error: "Erreur serveur" }`

---

## `/api/auth/[...nextauth]`

Catch-all endpoint handled by NextAuth (signin, callback, signout, csrf, session…). See the [NextAuth docs](https://next-auth.js.org/configuration/options) for details. Configured provider: **Credentials** (`src/lib/auth.ts`).

---

## Notes

- `GET /api/locations` and `POST /api/locations` go through `mapLocationsToDTO`; the `[id]` routes return the **raw** Prisma model. Known inconsistency.
- Business error messages are in French (user-facing text). Standardizing on i18n or structured error codes is an open chore.

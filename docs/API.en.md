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
    location_type: 'PARK' | 'BEACH' | 'RESTAURANT' | 'SHOP' | 'HOTEL' | 'OTHER';
  }
  ```

---

## Authentication

Auth via **Auth.js v5 (NextAuth)**. Route handlers call `auth()` (`src/lib/auth.ts`), which returns the session; `session.user.id` and `session.user.roles` come from the `jwt`/`session` callbacks (`src/lib/auth.config.ts`). JWT strategy (httpOnly cookie, no session table in DB).

`/api/admin/*` routes add the `requireAdmin` guard (`src/lib/requireAdmin.ts`): `401` when unauthenticated, `403` when the user is not `ADMIN`.

---

## `/api/locations`

### `GET /api/locations`

List all locations.

- **Auth**: none
- **Response**: `200 OK` → `LocationDTO[]`

### `POST /api/locations`

Create a location, owned by the authenticated user.

- **Auth**: session required (`auth()` ⇒ `session.user.id`)
- **Body**: `TCreateLocationInput`
- **Responses**:
  - `201 Created` → `LocationDTO`
  - `400 Bad Request` → `{ error: "Type de lieu invalide" }` (value outside the `LocationType` enum)
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

- **Auth**: session required + `location.user_id === session.user.id`
- **Body**: editable fields → `name`, `description`, `address`, `zip_code`, `city`, `latitude`, `longitude`
- **Responses**:
  - `200 OK` → updated Prisma `Location` model
  - `401 Unauthorized` → `{ error: "Non autorisé" }`
  - `403 Forbidden` → `{ error: "Accès interdit" }`
  - `404 Not Found` → `{ error: "Lieu non trouvé" }`

### `DELETE /api/locations/[id]`

Delete a location. **Only the owner can delete.**

- **Auth**: session required + `location.user_id === session.user.id`
- **Responses**:
  - `200 OK` → `{ message: "Lieu supprimé" }`
  - `401 Unauthorized` → `{ error: "Non autorisé" }`
  - `403 Forbidden` → `{ error: "Accès interdit" }`
  - `404 Not Found` → `{ error: "Lieu non trouvé" }`

---

## `/api/locations/[id]/reviews`

### `GET /api/locations/[id]/reviews`

List a location's reviews.

- **Auth**: none
- **Response**: `200 OK` → `ReviewDTO[]`

### `POST /api/locations/[id]/reviews`

Create a review on the location, owned by the authenticated user.

- **Auth**: session required (`auth()` ⇒ `session.user.id`)
- **Body**: `{ rating: number, title: string, content: string }`
- **Responses**:
  - `201 Created` → `ReviewDTO`
  - `400 Bad Request` → `{ error: ... }` (invalid rating / title / content)
  - `401 Unauthorized` → `{ error: "Non autorisé" }`
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

## `/api/admin/*`

Moderation routes backing the admin dashboard. **All** require an authenticated `ADMIN` (`requireAdmin` guard → `401` when unauthenticated, `403` when not admin).

| Route                       | Method | Effect          |
| --------------------------- | ------ | --------------- |
| `/api/admin/users`          | GET    | List users      |
| `/api/admin/users/[id]`     | DELETE | Delete a user   |
| `/api/admin/locations`      | GET    | List locations  |
| `/api/admin/locations/[id]` | DELETE | Delete a location |
| `/api/admin/reviews`        | GET    | List reviews    |
| `/api/admin/reviews/[id]`   | DELETE | Delete a review |

---

## Notes

- `GET /api/locations` and `POST /api/locations` go through `mapLocationsToDTO`; the `[id]` routes return the **raw** Prisma model. Known inconsistency.
- Business error messages are in French (user-facing text). Standardizing on i18n or structured error codes is an open chore.

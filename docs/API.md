# Référence API

> [English version](./API.en.md)

Routes REST exposées par **Pet Friendly Locator**. Toutes les routes sont sous `/api/`.

---

## Types partagés

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

## Authentification

Deux mécanismes coexistent (tous deux NextAuth) :

- **JWT direct** via `getToken({ req })` — utilisé par les routes `/api/locations/*` qui mutent.
- **Session côté serveur** via `getServerSession(authOptions)` — utilisé par les routes `/api/user/*`.

Un client web qui passe par les cookies NextAuth obtient les deux automatiquement.

---

## `/api/locations`

### `GET /api/locations`

Liste tous les lieux.

- **Auth** : non
- **Réponse** : `200 OK` → `LocationDTO[]`

### `POST /api/locations`

Crée un lieu, associé à l'utilisateur authentifié.

- **Auth** : JWT requis (`token.sub` ⇒ `user_id`)
- **Body** : `TCreateLocationInput`
- **Réponses** :
  - `201 Created` → `LocationDTO`
  - `401 Unauthorized` → `{ error: "Non autorisé" }`

---

## `/api/locations/[id]`

### `GET /api/locations/[id]`

Récupère un lieu.

- **Auth** : non
- **Réponses** :
  - `200 OK` → modèle Prisma `Location` brut (⚠️ pas passé par `mapLocationToDTO`)
  - `404 Not Found` → `{ error: "Lieu non trouvé" }`

### `PUT /api/locations/[id]`

Met à jour un lieu. **Seul le propriétaire peut éditer.**

- **Auth** : JWT requis + `location.user_id === token.sub`
- **Body** : champs modifiables → `name`, `description`, `address`, `zip_code`, `city`, `latitude`, `longitude`
- **Réponses** :
  - `200 OK` → modèle Prisma `Location` mis à jour
  - `401 Unauthorized` → `{ error: "Non autorisé" }`
  - `403 Forbidden` → `{ error: "Accès interdit" }`
  - `404 Not Found` → `{ error: "Lieu non trouvé" }`

### `DELETE /api/locations/[id]`

Supprime un lieu. **Seul le propriétaire peut supprimer.**

- **Auth** : JWT requis + `location.user_id === token.sub`
- **Réponses** :
  - `200 OK` → `{ message: "Lieu supprimé" }`
  - `401 Unauthorized` → `{ error: "Non autorisé" }`
  - `403 Forbidden` → `{ error: "Accès interdit" }`
  - `404 Not Found` → `{ error: "Lieu non trouvé" }`

---

## `/api/register`

### `POST /api/register`

Crée un compte utilisateur. Mot de passe hashé avec bcrypt (10 rounds).

- **Auth** : non
- **Body** : `{ email: string, password: string, pseudo: string }`
- **Réponses** :
  - `201 Created` → `{ message: "Utilisateur créé avec succès" }`
  - `400 Bad Request` → `{ error: "Champs manquants" }`
  - `409 Conflict` → `{ error: "Email déjà utilisé" }` ou `{ error: "Pseudo déjà utilisé" }`
  - `500 Internal Server Error` → `{ error: "Erreur serveur" }`

---

## `/api/user/me`

### `GET /api/user/me`

Récupère le profil de l'utilisateur courant (lookup par email de session).

- **Auth** : session requise
- **Réponse** :
  - `200 OK` → `{ pseudo: string, email: string }`
  - `401 Unauthorized` → `{ error: "Unauthorized" }`

---

## `/api/user/update`

### `POST /api/user/update`

Met à jour le `pseudo` et/ou l'`email` de l'utilisateur courant.

- **Auth** : session requise
- **Body** : `{ pseudo?: string, email?: string }`
- **Réponses** :
  - `200 OK` → `{ message: "Profil mis à jour", user: User }`
  - `401 Unauthorized` → `{ error: "Non autorisé" }`
  - `500 Internal Server Error` → `{ error: "Erreur serveur" }`

---

## `/api/auth/[...nextauth]`

Endpoint catch-all géré par NextAuth (signin, callback, signout, csrf, session…). Voir la [documentation NextAuth](https://next-auth.js.org/configuration/options) pour le détail. Provider configuré : **Credentials** (`src/lib/auth.ts`).

---

## Remarques

- Les routes `GET /api/locations` et `POST /api/locations` passent par `mapLocationsToDTO` ; les routes `[id]` retournent **directement** le modèle Prisma. Incohérence connue.
- Les erreurs métier sont en français (texte affichable). Standardiser sur i18n ou codes d'erreur structurés est un chantier ouvert.

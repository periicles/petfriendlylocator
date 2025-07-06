# 🐾 Pet Friendly Locator - Bordeaux

Bienvenue sur **Pet Friendly Locator**, une application web dédiée à la découverte et au partage de lieux accueillants pour les animaux de compagnie dans la région bordelaise. Ce projet open source permet aux utilisateurs de consulter une carte interactive, d'ajouter des lieux pet-friendly, de gérer leur profil, et bientôt de laisser des avis.

---

## 🚀 Stack Technique

- **Framework Frontend** : [Next.js 15+](https://nextjs.org/docs) (App Router)
- **Langage** : [TypeScript](https://www.typescriptlang.org/docs/)
- **UI** : [Tailwind CSS 4.1](https://tailwindcss.com/docs), [MUI Icons](https://mui.com/material-ui/material-icons/)
- **Base de données** : [PostgreSQL](https://www.postgresql.org/) via [Prisma ORM](https://www.prisma.io/)
- **Carte interactive** : [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/)
- **Déploiement** : [Docker](https://docs.docker.com/), [GitLab CI/CD](https://docs.gitlab.com/topics/build_your_application/)
- **Tests** : [Jest](https://jestjs.io/)
- **Design** : Figma

---

## 🗺️ Fonctionnalités principales

- 🌐 **Page d'accueil** avec un grand scroller pour présenter l'idée du projet
- 📌 **Carte interactive** affichant les lieux pet-friendly autour de Bordeaux
- 🔍 **Barre de recherche** et liste des lieux associée
- ➕ **Ajout de lieux** via un formulaire flottant (uniquement pour utilisateurs connectés)
- 👤 **Page profil utilisateur** :
  - Visualisation et édition des données personnelles
  - Liste des lieux ajoutés
  - Liste des avis laissés _(à venir)_
- 🛡️ **Système d'administration** _(à venir)_ :
  - Modération des lieux proposés
  - Validation des avis
- ⭐ **Système d’avis** _(à venir)_ :
  - Les utilisateurs pourront commenter et noter les lieux

---

## 📦 Installation locale

### 1. Cloner le projet

```bash
git clone https://gitlab.com/ton-utilisateur/pet-friendly-locator.git
cd pet-friendly-locator
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

Créez un fichier `.env` à la racine du projet et ajoutez les variables présentes dans `.env.example` :

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/pet_friendly_locator"
NEXT_PUBLIC_MAPBOX_TOKEN="your_mapbox_token"
NEXTAUTH_SECRET="your_nextauth_secret"
POSTGRES_USER="your_postgres_user_here"
POSTGRES_PASSWORD="your_postgres_password_here"
POSTGRES_DB="your_postgres_db_here"
NEXTAUTH_URL="your_nextauth_url_here"
```

### 4. Lancer la base de données

```bash
npm run generate
npm run migrate
```

### 5. Démarrer le serveur de développement

```bash
npm run dev
```

---

## 🧪 Tests

Pour exécuter les tests, utilisez la commande suivante :

```bash
npm run test
```

Cela executera les test Jest présents dans le dossier `__tests__`.

---

## 🐳 Docker

Pour exécuter l'application avec Docker, assurez-vous d'avoir Docker installé sur votre machine. Ensuite, vous pouvez construire et démarrer les conteneurs avec :

```bash
docker-compose up --build
```

---

## 🔧 Architecture du projet

```bash
.
├── __tests__
├── coverage
│   └── lcov-report
│       ├── app
│       │   ├── api
│       │   │   └── locations
│       │   ├── carte
│       │   ├── login
│       │   ├── profile
│       │   └── register
│       ├── components
│       ├── lib
│       ├── src
│       │   ├── app
│       │   │   ├── admin
│       │   │   ├── api
│       │   │   │   └── locations
│       │   │   ├── carte
│       │   │   ├── login
│       │   │   ├── profile
│       │   │   └── register
│       │   ├── components
│       │   ├── lib
│       │   └── utils
│       └── utils
├── prisma
├── public
└── src
    ├── app
    │   ├── admin
    │   ├── api
    │   │   ├── auth
    │   │   │   └── [...nextauth]
    │   │   ├── locations
    │   │   │   └── [id]
    │   │   ├── register
    │   │   └── user
    │   │       ├── me
    │   │       └── update
    │   ├── carte
    │   ├── login
    │   ├── profile
    │   │   ├── places
    │   │   └── reviews
    │   └── register
    ├── components
    ├── lib
    ├── types
    └── utils
```

---

## 🐶 À propos

Ce projet a été créé pour aider les propriétaires d'animaux à profiter pleinement de la ville de Bordeaux.

# ---------- STAGE BASE : commun à dev & prod ----------
FROM node:22 AS base

WORKDIR /app

# Installation des dépendances (modifiées selon l'environnement ensuite)
COPY package*.json ./

# Installation de toutes les dépendances (avec devDependencies)
RUN npm install

# ---------- STAGE DE DEV ----------
FROM base AS dev

# Variables d’environnement de dev
ENV ENVIRONMENT=dev

# Lance le serveur dev
ENTRYPOINT ["npm", "run", "dev"]

# ---------- STAGE DE PROD ----------
FROM base AS prod

# Copie du reste de l’app
COPY . .

# Génération du Prisma client + déploiement
RUN npx prisma generate --schema=src/prisma/schema.prisma
RUN npx prisma migrate deploy --schema=src/prisma/schema.prisma

# Build de l’app Next.js
RUN npm run build

# Variables d’environnement de prod
ENV ENVIRONMENT=prod

# Lance le serveur
ENTRYPOINT ["npm", "start"]

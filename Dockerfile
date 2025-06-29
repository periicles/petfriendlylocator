# --------- BUILD STAGE ---------
FROM node:22-alpine AS builder

LABEL org.opencontainers.image.title="Pet Friendly Locator" \
      org.opencontainers.image.authors="Periicles" \
      org.opencontainers.image.url="https://gitlab.com/Periicles/petfriendlylocator" \
      org.opencontainers.image.vendor="Periicles"

WORKDIR /app

# Ajoute les dépendances système nécessaires
RUN apk add --no-cache git python3 make g++

# Copie des fichiers nécessaires
COPY package.json package-lock.json* ./
COPY prisma ./prisma
COPY public ./public

# Installation des dépendances
RUN npm ci

# Génération des fichiers Prisma
RUN npx prisma generate

# Copie du code source
COPY . .

# Build de l'application Next.js
RUN npm run build

# --------- PRODUCTION STAGE ---------
FROM node:22-alpine AS runner

WORKDIR /app

# Copie des fichiers nécessaires depuis builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Regénère les fichiers Prisma dans l'image finale (important pour runtime)
RUN npx prisma generate

# Définir la variable d'environnement de production
ENV NODE_ENV=production

# Expose le port
EXPOSE 3000

# Lancement de l'app
CMD ["npm", "start"]

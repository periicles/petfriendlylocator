# ---------- BASE ----------
FROM node:22-alpine AS base

LABEL org.opencontainers.image.title="Pet Friendly Locator" \
      org.opencontainers.image.authors="Periicles" \
      org.opencontainers.image.url="https://gitlab.com/Periicles/petfriendlybordeaux" \
      org.opencontainers.image.vendor="Periicles"

# Définir le répertoire de travail
WORKDIR /app

# Ajout dépendances nécessaires (git pour prisma, make pour éventuels packages natifs)
RUN apk add --no-cache git make python3 g++

# Ajout utilisateur sécurisé
RUN adduser -D -u 1001 petuser

# Copier fichiers de dépendances
COPY package*.json ./

# Copier le reste du projet
COPY . .

# ---------- DEV ----------
FROM base AS dev

RUN npm install
ENV ENVIRONMENT=dev

USER petuser
VOLUME ["/app/src"]
ENTRYPOINT ["npm", "run", "dev"]

# ---------- PROD ----------
FROM base AS prod

RUN npm ci --omit=dev

ENV ENVIRONMENT=prod

# Important : Prisma a besoin de DATABASE_URL
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

# Prisma + build
RUN npx prisma generate --schema=src/prisma/schema.prisma && \
    npm run build && \
    npm cache clean --force

RUN chown -R petuser:petuser /app

EXPOSE 3000
USER petuser
ENTRYPOINT ["npm", "start"]

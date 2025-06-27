# ---------- STAGE BASE : commun à dev & prod ----------
FROM debian:12.11 AS base

# Labels OCI standards
LABEL org.opencontainers.image.title="Pet Friendly Locator" \
      org.opencontainers.image.authors="Periicles" \
      org.opencontainers.image.url="https://gitlab.com/Periicles/petfriendlybordeaux" \
      org.opencontainers.image.vendor="Periicles"

# Création du répertoire de travail
WORKDIR /app

# Installer Node.js + outils de build
RUN apt-get update && \
    apt-get install -y curl gnupg ca-certificates git python3 make g++ && \
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Ajout d’un utilisateur applicatif sécurisé (UID fixe recommandé)
RUN useradd -m -u 1001 petuser

# Copier et installer les dépendances
COPY package*.json ./
RUN npm install

# Copier le code restant
COPY . .

# Changer les droits sur /app
RUN chown -R petuser:petuser /app

# ---------- STAGE DE DEV ----------
FROM base AS dev

ENV ENVIRONMENT=dev

# Passage en utilisateur non-root
USER petuser

VOLUME ["/app/src"]
ENTRYPOINT ["npm", "run", "dev"]

# ---------- STAGE DE PROD ----------
FROM base AS prod

ENV NODE_ENV=production
ENV ENVIRONMENT=prod

# Génération Prisma et build (en root)
RUN npx prisma generate --schema=src/prisma/schema.prisma && \
    npx prisma migrate deploy --schema=src/prisma/schema.prisma && \
    npm run build && npm cache clean --force

# Redonner les droits à petuser (si build a généré des fichiers root)
RUN chown -R petuser:petuser /app

# Port exposé
EXPOSE 3000

# Passage en utilisateur applicatif sécurisé
USER petuser

ENTRYPOINT ["npm", "start"]

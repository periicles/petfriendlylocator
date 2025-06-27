# Advanced Docker - Part 2

## Part 1 - Basic packaging

```bash
tree -a -L2
```

```bash
.
├── docker-compose.yml
├── Dockerfile
├── .dockerignore
├── .env
├── .env.example
├── eslint.config.js
├── .git
│   ├── COMMIT_EDITMSG
│   ├── config
│   ├── description
│   ├── FETCH_HEAD
│   ├── HEAD
│   ├── hooks
│   ├── index
│   ├── info
│   ├── logs
│   ├── objects
│   ├── packed-refs
│   └── refs
├── .gitignore
├── index.html
├── package.json
├── prisma
│   └── schema.prisma
├── public
│   ├── PFB.png
│   └── vite.svg
├── README.md
├── src
│   ├── client
│   ├── server
│   └── shared
├── tsconfig.client.json
├── tsconfig.client.tsbuildinfo
├── tsconfig.json
├── tsconfig.server.json
└── vite.config.ts

13 directories, 25 files
```

Dockerfile

```dockerfile
FROM node:22

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY eslint.config.js ./

RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

ENV ENVIRONMENT=dev

EXPOSE 3000
EXPOSE 5173

CMD ["npm", "run", "dev"]
```

docker-compose.yml

```yml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: pet_friendly_app
    volumes:
      - .:/app
    ports:
      - '3000:3000'
      - '5173:5173'
    environment:
      - NODE_ENV=development
      - DATABASE_URL
      - VITE_MAPBOX_TOKEN
    depends_on:
      - db
    command: sleep 9999
  db:
    image: postgres:16
    container_name: pet_friendly_db
    restart: always
    environment:
      POSTGRES_DB: petdb
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    ports:
      - '5433:5433'
    volumes:
      - pg_data:/var/lib/postgresql/data

volumes:
  pg_data:
    name: pet_friendly_pg_data
```

```bash
docker compose up --build
```

```bash
[+] Building 28.4s (18/18) FINISHED
 => [internal] load local bake definitions                                                                                                                                        0.0s
 => => reading from stdin 410B                                                                                                                                                    0.0s
 => [internal] load build definition from Dockerfile                                                                                                                              0.0s
 => => transferring dockerfile: 383B                                                                                                                                              0.0s
 => [internal] load metadata for docker.io/library/node:22                                                                                                                        0.7s
 => [internal] load .dockerignore                                                                                                                                                 0.0s
 => => transferring context: 345B                                                                                                                                                 0.0s
 => [internal] load build context                                                                                                                                                 0.1s
 => => transferring context: 28.45kB                                                                                                                                              0.1s
 => [ 1/11] FROM docker.io/library/node:22@sha256:71bcbb3b215b3fa84b5b167585675072f4c270855e37a599803f1a58141a0716                                                                0.0s
 => CACHED [ 2/11] WORKDIR /app                                                                                                                                                   0.0s
 => CACHED [ 3/11] COPY package*.json ./                                                                                                                                          0.0s
 => CACHED [ 4/11] COPY prisma ./prisma                                                                                                                                           0.0s
 => CACHED [ 5/11] COPY tsconfig*.json ./                                                                                                                                         0.0s
 => CACHED [ 6/11] COPY vite.config.ts ./                                                                                                                                         0.0s
 => CACHED [ 7/11] COPY eslint.config.js ./                                                                                                                                       0.0s
 => CACHED [ 8/11] RUN npm install                                                                                                                                                0.0s
 => [ 9/11] COPY . .                                                                                                                                                              0.6s
 => [10/11] RUN npx prisma generate                                                                                                                                               3.6s
 => [11/11] RUN npm run build                                                                                                                                                    22.3s
 => exporting to image                                                                                                                                                            0.5s
 => => exporting layers                                                                                                                                                           0.5s
 => => writing image sha256:d63d5d7ecf3c46b9f787bd8e96a25917322035f7cdf2576cd87a0e0a486fa065                                                                                      0.0s
 => => naming to docker.io/library/petfriendlybordeaux-app                                                                                                                        0.0s
 => resolving provenance for metadata file                                                                                                                                        0.0s
[+] Running 5/5
 ✔ petfriendlybordeaux-app              Built                                                                                                                                     0.0s
 ✔ Network petfriendlybordeaux_default  Created                                                                                                                                   0.5s
 ✔ Volume "pet_friendly_pg_data"        Created                                                                                                                                   0.0s
 ✔ Container pet_friendly_db            Created                                                                                                                                   0.3s
 ✔ Container pet_friendly_app           Created                                                                                                                                   0.1s
Attaching to pet_friendly_app, pet_friendly_db
pet_friendly_db   | The files belonging to this database system will be owned by user "postgres".
pet_friendly_db   | This user must also own the server process.
pet_friendly_db   |
pet_friendly_db   | The database cluster will be initialized with locale "en_US.utf8".
pet_friendly_db   | The default database encoding has accordingly been set to "UTF8".
pet_friendly_db   | The default text search configuration will be set to "english".
pet_friendly_db   |
pet_friendly_db   | Data page checksums are disabled.
pet_friendly_db   |
pet_friendly_db   | fixing permissions on existing directory /var/lib/postgresql/data ... ok
pet_friendly_db   | creating subdirectories ... ok
pet_friendly_db   | selecting dynamic shared memory implementation ... posix
pet_friendly_db   | selecting default max_connections ... 100
pet_friendly_db   | selecting default shared_buffers ... 128MB
pet_friendly_db   | selecting default time zone ... Etc/UTC
pet_friendly_db   | creating configuration files ... ok
pet_friendly_db   | running bootstrap script ... ok
pet_friendly_db   | performing post-bootstrap initialization ... ok
pet_friendly_db   | syncing data to disk ... ok
pet_friendly_db   |
pet_friendly_db   |
pet_friendly_db   | Success. You can now start the database server using:
pet_friendly_db   |
pet_friendly_db   |     pg_ctl -D /var/lib/postgresql/data -l logfile start
pet_friendly_db   |
pet_friendly_db   | initdb: warning: enabling "trust" authentication for local connections
pet_friendly_db   | initdb: hint: You can change this by editing pg_hba.conf or using the option -A, or --auth-local and --auth-host, the next time you run initdb.
pet_friendly_db   | waiting for server to start....2025-06-25 09:31:16.219 UTC [48] LOG:  starting PostgreSQL 16.9 (Debian 16.9-1.pgdg120+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 12.2.0-14) 12.2.0, 64-bit
pet_friendly_db   | 2025-06-25 09:31:16.222 UTC [48] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
pet_friendly_db   | 2025-06-25 09:31:16.230 UTC [51] LOG:  database system was shut down at 2025-06-25 09:31:14 UTC
pet_friendly_db   | 2025-06-25 09:31:16.241 UTC [48] LOG:  database system is ready to accept connections
pet_friendly_db   |  done
pet_friendly_db   | server started
pet_friendly_db   | CREATE DATABASE
pet_friendly_db   |
pet_friendly_db   |
pet_friendly_db   | /usr/local/bin/docker-entrypoint.sh: ignoring /docker-entrypoint-initdb.d/*
pet_friendly_db   |
pet_friendly_db   | waiting for server to shut down...2025-06-25 09:31:16.703 UTC [48] LOG:  received fast shutdown request
pet_friendly_db   | .2025-06-25 09:31:16.705 UTC [48] LOG:  aborting any active transactions
pet_friendly_db   | 2025-06-25 09:31:16.711 UTC [48] LOG:  background worker "logical replication launcher" (PID 54) exited with exit code 1
pet_friendly_db   | 2025-06-25 09:31:16.714 UTC [49] LOG:  shutting down
pet_friendly_db   | 2025-06-25 09:31:16.716 UTC [49] LOG:  checkpoint starting: shutdown immediate
pet_friendly_db   | 2025-06-25 09:31:17.455 UTC [49] LOG:  checkpoint complete: wrote 922 buffers (5.6%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.228 s, sync=0.500 s, total=0.742 s; sync files=301, longest=0.012 s, average=0.002 s; distance=4255 kB, estimate=4255 kB; lsn=0/19120F8, redo lsn=0/19120F8
pet_friendly_db   | 2025-06-25 09:31:17.477 UTC [48] LOG:  database system is shut down
pet_friendly_db   |  done
pet_friendly_db   | server stopped
pet_friendly_db   |
pet_friendly_db   | PostgreSQL init process complete; ready for start up.
pet_friendly_db   |
pet_friendly_db   | 2025-06-25 09:31:17.624 UTC [1] LOG:  starting PostgreSQL 16.9 (Debian 16.9-1.pgdg120+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 12.2.0-14) 12.2.0, 64-bit
pet_friendly_db   | 2025-06-25 09:31:17.626 UTC [1] LOG:  listening on IPv4 address "0.0.0.0", port 5432
pet_friendly_db   | 2025-06-25 09:31:17.626 UTC [1] LOG:  listening on IPv6 address "::", port 5432
pet_friendly_db   | 2025-06-25 09:31:17.631 UTC [1] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
pet_friendly_db   | 2025-06-25 09:31:17.650 UTC [64] LOG:  database system was shut down at 2025-06-25 09:31:17 UTC
pet_friendly_db   | 2025-06-25 09:31:17.674 UTC [1] LOG:  database system is ready to accept connections
```

```bash
curl -i http://localhost:5173
```

```bash
HTTP/1.1 200 OK
Vary: Origin
Content-Type: text/html
Cache-Control: no-cache
Etag: W/"27b-xmz1OW4dVKjZaggpPa3IjOljfQA"
Date: Tue, 24 Jun 2025 14:55:08 GMT
Connection: keep-alive
Keep-Alive: timeout=5
Content-Length: 635

<!doctype html>
<html lang="en">
  <head>
    <script type="module">import { injectIntoGlobalHook } from "/@react-refresh";
injectIntoGlobalHook(window);
window.$RefreshReg$ = () => {};
window.$RefreshSig$ = () => (type) => type;</script>

    <script type="module" src="/@vite/client"></script>

    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml+png" href="/PFB.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Pet Friendly Locator</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./src/client/main.tsx"></script>
  </body>
</html>
```

## Part 2 - Different environments

### 1 - Prod

!!! Changement de projet en Nextjs !!!

Dockerfile-prod

```dockerfile
# Dockerfile-prod
FROM node:22

WORKDIR /app

# Copie des dépendances
COPY package*.json ./
RUN npm install --production

# Copie du code
COPY . .

# Génération du Prisma client
RUN npx prisma generate --schema=src/prisma/schema.prisma
RUN npx prisma migrate deploy --schema=src/prisma/schema.prisma

# Build Next.js
RUN npm run build

# Variables d’environnement
ENV ENVIRONMENT=prod

# Port exposé
EXPOSE 3000

# Lancement
ENTRYPOINT ["npm", "start"]
```

docker-compose-prod.yml

```yml
services:
  db:
    image: postgres:16
    container_name: petfriendly_db_prod
    restart: always
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: petdb
    ports:
      - '5433:5432'
    volumes:
      - pgdata:/var/lib/postgresql/data

  app:
    container_name: petfriendly_app_prod
    build:
      context: .
      dockerfile: Dockerfile-prod
    image: petfriendly-prod
    ports:
      - '3000:3000'
    environment:
      - ENVIRONMENT=prod
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:password@db:5432/petdb?schema=public
    depends_on:
      - db

volumes:
  pgdata:
```

```bash
docker compose -f docker-compose-prod.yml up --build
```

```bash
[+] Building 85.2s (16/16) FINISHED
 => [internal] load local bake definitions                                                                                                                         0.0s
 => => reading from stdin 406B                                                                                                                                     0.0s
 => [internal] load build definition from Dockerfile-prod                                                                                                          0.0s
 => => transferring dockerfile: 562B                                                                                                                               0.0s
 => [internal] load metadata for docker.io/library/node:22                                                                                                         1.2s
 => [auth] library/node:pull token for registry-1.docker.io                                                                                                        0.0s
 => [internal] load .dockerignore                                                                                                                                  0.0s
 => => transferring context: 2B                                                                                                                                    0.0s
 => [1/8] FROM docker.io/library/node:22@sha256:0c0734eb7051babbb3e95cd74e684f940552b31472152edf0bb23e54ab44a0d7                                                   0.0s
 => [internal] load build context                                                                                                                                  2.7s
 => => transferring context: 9.81MB                                                                                                                                2.5s
 => CACHED [2/8] WORKDIR /app                                                                                                                                      0.0s
 => CACHED [3/8] COPY package*.json ./                                                                                                                             0.0s
 => CACHED [4/8] RUN npm install --production                                                                                                                      0.0s
 => [5/8] COPY . .                                                                                                                                                21.3s
 => [6/8] RUN npx prisma generate --schema=src/prisma/schema.prisma                                                                                                2.4s
 => [7/8] RUN npx prisma migrate deploy --schema=src/prisma/schema.prisma                                                                                          3.8s
 => [8/8] RUN npm run build                                                                                                                                       36.6s
 => exporting to image                                                                                                                                            16.9s
 => => exporting layers                                                                                                                                           16.9s
 => => writing image sha256:9eb4ee26f39ee25278b91c4284a20086eafccded213cc208b17903279cbdcb42                                                                       0.0s
 => => naming to docker.io/library/petfriendly-prod                                                                                                                0.0s
 => resolving provenance for metadata file                                                                                                                         0.0s
[+] Running 5/5
 ✔ app                                 Built                                                                                                                       0.0s
 ✔ Network petfriendlylocator_default  Created                                                                                                                     0.1s
 ✔ Volume "petfriendlylocator_pgdata"  Created                                                                                                                     0.0s
 ✔ Container petfriendly_db_prod       Created                                                                                                                     0.2s
 ✔ Container petfriendly_app_prod      Created                                                                                                                     0.0s
Attaching to petfriendly_app_prod, petfriendly_db_prod
petfriendly_db_prod   | The files belonging to this database system will be owned by user "postgres".
petfriendly_db_prod   | This user must also own the server process.
petfriendly_db_prod   |
petfriendly_db_prod   | The database cluster will be initialized with locale "en_US.utf8".
petfriendly_db_prod   | The default database encoding has accordingly been set to "UTF8".
petfriendly_db_prod   | The default text search configuration will be set to "english".
petfriendly_db_prod   |
petfriendly_db_prod   | Data page checksums are disabled.
petfriendly_db_prod   |
petfriendly_db_prod   | fixing permissions on existing directory /var/lib/postgresql/data ... ok
petfriendly_db_prod   | creating subdirectories ... ok
petfriendly_db_prod   | selecting dynamic shared memory implementation ... posix
petfriendly_db_prod   | selecting default max_connections ... 100
petfriendly_db_prod   | selecting default shared_buffers ... 128MB
petfriendly_db_prod   | selecting default time zone ... Etc/UTC
petfriendly_db_prod   | creating configuration files ... ok
petfriendly_app_prod  |
petfriendly_app_prod  | > petfriendlylocator@0.1.0 start
petfriendly_app_prod  | > next start
petfriendly_app_prod  |
petfriendly_db_prod   | running bootstrap script ... ok
petfriendly_app_prod  |    ▲ Next.js 15.3.4
petfriendly_app_prod  |    - Local:        http://localhost:3000
petfriendly_app_prod  |    - Network:      http://172.19.0.3:3000
petfriendly_app_prod  |
petfriendly_app_prod  |  ✓ Starting...
petfriendly_db_prod   | performing post-bootstrap initialization ... ok
petfriendly_app_prod  |    Downloading swc package @next/swc-wasm-nodejs... to /root/.cache/next-swc
petfriendly_db_prod   | syncing data to disk ... ok
petfriendly_db_prod   |
petfriendly_db_prod   |
petfriendly_db_prod   | Success. You can now start the database server using:
petfriendly_db_prod   |
petfriendly_db_prod   |     pg_ctl -D /var/lib/postgresql/data -l logfile start
petfriendly_db_prod   |
petfriendly_db_prod   | initdb: warning: enabling "trust" authentication for local connections
petfriendly_db_prod   | initdb: hint: You can change this by editing pg_hba.conf or using the option -A, or --auth-local and --auth-host, the next time you run initdb.
petfriendly_db_prod   | waiting for server to start....2025-06-27 09:51:05.539 UTC [48] LOG:  starting PostgreSQL 16.9 (Debian 16.9-1.pgdg120+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 12.2.0-14) 12.2.0, 64-bit
petfriendly_db_prod   | 2025-06-27 09:51:05.540 UTC [48] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
petfriendly_db_prod   | 2025-06-27 09:51:05.544 UTC [51] LOG:  database system was shut down at 2025-06-27 09:51:04 UTC
petfriendly_db_prod   | 2025-06-27 09:51:05.549 UTC [48] LOG:  database system is ready to accept connections
petfriendly_db_prod   |  done
petfriendly_db_prod   | server started
petfriendly_app_prod  |  ⚠ Attempted to load @next/swc-linux-x64-gnu, but an error occurred: /app/node_modules/@next/swc-linux-x64-gnu/next-swc.linux-x64-gnu.node: cannot change memory protections
petfriendly_app_prod  |  ⚠ Attempted to load @next/swc-linux-x64-musl, but an error occurred: libc.musl-x86_64.so.1: cannot open shared object file: No such file or directory
petfriendly_db_prod   | CREATE DATABASE
petfriendly_db_prod   |
petfriendly_db_prod   |
petfriendly_db_prod   | /usr/local/bin/docker-entrypoint.sh: ignoring /docker-entrypoint-initdb.d/*
petfriendly_db_prod   |
petfriendly_db_prod   | waiting for server to shut down....2025-06-27 09:51:05.800 UTC [48] LOG:  received fast shutdown request
petfriendly_db_prod   | 2025-06-27 09:51:05.801 UTC [48] LOG:  aborting any active transactions
petfriendly_db_prod   | 2025-06-27 09:51:05.803 UTC [48] LOG:  background worker "logical replication launcher" (PID 54) exited with exit code 1
petfriendly_db_prod   | 2025-06-27 09:51:05.804 UTC [49] LOG:  shutting down
petfriendly_db_prod   | 2025-06-27 09:51:05.805 UTC [49] LOG:  checkpoint starting: shutdown immediate
petfriendly_app_prod  |  ✓ Ready in 2.1s
petfriendly_db_prod   | 2025-06-27 09:51:06.183 UTC [49] LOG:  checkpoint complete: wrote 922 buffers (5.6%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.045 s, sync=0.328 s, total=0.379 s; sync files=301, longest=0.009 s, average=0.002 s; distance=4255 kB, estimate=4255 kB; lsn=0/19120F8, redo lsn=0/19120F8
petfriendly_db_prod   | 2025-06-27 09:51:06.189 UTC [48] LOG:  database system is shut down
petfriendly_db_prod   |  done
petfriendly_db_prod   | server stopped
petfriendly_db_prod   |
petfriendly_db_prod   | PostgreSQL init process complete; ready for start up.
petfriendly_db_prod   |
petfriendly_db_prod   | 2025-06-27 09:51:06.235 UTC [1] LOG:  starting PostgreSQL 16.9 (Debian 16.9-1.pgdg120+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 12.2.0-14) 12.2.0, 64-bit
petfriendly_db_prod   | 2025-06-27 09:51:06.236 UTC [1] LOG:  listening on IPv4 address "0.0.0.0", port 5432
petfriendly_db_prod   | 2025-06-27 09:51:06.236 UTC [1] LOG:  listening on IPv6 address "::", port 5432
petfriendly_db_prod   | 2025-06-27 09:51:06.238 UTC [1] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
petfriendly_db_prod   | 2025-06-27 09:51:06.242 UTC [64] LOG:  database system was shut down at 2025-06-27 09:51:06 UTC
petfriendly_db_prod   | 2025-06-27 09:51:06.247 UTC [1] LOG:  database system is ready to accept connections
```

```bash
curl -i http://localhost:3000
```

```bash
curl -i http://localhost:3000
HTTP/1.1 200 OK
Vary: RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Router-Segment-Prefetch, Accept-Encoding
x-nextjs-cache: HIT
x-nextjs-prerender: 1
x-nextjs-stale-time: 300
X-Powered-By: Next.js
Cache-Control: s-maxage=31536000
ETag: "7gvply44zb6h3"
Content-Type: text/html; charset=utf-8
Content-Length: 8419
Date: Fri, 27 Jun 2025 09:52:48 GMT
Connection: keep-alive
Keep-Alive: timeout=5

<!DOCTYPE html><html lang="fr"><head><meta charSet="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><link rel="stylesheet" href="/_next/static/css/dde25b75382bfa04.css" data-precedence="next"/><link rel="preload" as="script" fetchPriority="low" href="/_next/static/chunks/webpack-72674d02bf876f62.js"/><script src="/_next/static/chunks/4bd1b696-9cfabfef394959d2.js" async=""></script><script src="/_next/static/chunks/684-cdd6a7464ea2fe45.js" async=""></script><script src="/_next/static/chunks/main-app-f38f0d9153b95312.js" async=""></script><script src="/_next/static/chunks/108-e1a148a6f0ca9cff.js" async=""></script><script src="/_next/static/chunks/app/layout-99d1c46e6a0dd743.js" async=""></script><title>Pet Friendly Locator</title><meta name="description" content="Trouvez des lieux accueillants pour vos animaux à Bordeaux"/><link rel="icon" href="/favicon.ico" type="image/x-icon" sizes="16x16"/><script>document.querySelectorAll('body link[rel="icon"], body link[rel="apple-touch-icon"]').forEach(el => document.head.appendChild(el))</script><script src="/_next/static/chunks/polyfills-42372ed130431b0a.js" noModule=""></script></head><body><div hidden=""><!--$--><!--/$--></div><nav class="fixed top-0 z-50 w-full bg-white shadow"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between"><h1 class="text-lg md:text-xl font-bold text-gray-800">Pet Friendly Locator</h1><div class="flex space-x-4 text-sm md:text-base"><a class="text-blue-600 font-semibold" href="/">Accueil</a><a class="text-gray-700 hover:text-blue-500" href="/locations">Carte</a><a class="text-gray-700 hover:text-blue-500" href="/login">Connexion</a></div></div></nav><div class="flex flex-col items-center text-center space-y-32 px-4 py-16 md:py-32 max-w-4xl mx-auto"><section class="space-y-4"><h2 class="text-3xl md:text-5xl font-bold">🐾 Pet Friendly Locator</h2><p class="text-lg text-gray-700">Une application pour découvrir et partager les lieux accueillants pour vos animaux dans la région de Bordeaux.</p></section><section class="space-y-4"><h2 class="text-3xl md:text-4xl font-bold">🧭 Comment ça fonctionne</h2><p class="text-lg text-gray-700">Explorez une carte interactive, ajoutez des lieux, laissez des avis et aidez la communauté à trouver les meilleurs spots pet friendly.</p></section><section class="space-y-4"><h2 class="text-3xl md:text-4xl font-bold">📬 Me contacter</h2><p class="text-lg text-gray-700">Une question ou une suggestion ? Écrivez-moi à :<br/><a href="mailto:contact@petfriendlylocator.fr" class="text-blue-600 hover:underline">contact@petfriendlylocator.fr</a></p></section></div><!--$--><!--/$--><script src="/_next/static/chunks/webpack-72674d02bf876f62.js" async=""></script><script>(self.__next_f=self.__next_f||[]).push([0])</script><script>self.__next_f.push([1,"1:\"$Sreact.fragment\"\n2:I[2709,[\"108\",\"static/chunks/108-e1a148a6f0ca9cff.js\",\"177\",\"static/chunks/app/layout-99d1c46e6a0dd743.js\"],\"Providers\"]\n3:I[8009,[\"108\",\"static/chunks/108-e1a148a6f0ca9cff.js\",\"177\",\"static/chunks/app/layout-99d1c46e6a0dd743.js\"],\"default\"]\n4:I[7555,[],\"\"]\n5:I[1295,[],\"\"]\n6:I[9665,[],\"OutletBoundary\"]\n9:I[4911,[],\"AsyncMetadataOutlet\"]\nb:I[9665,[],\"ViewportBoundary\"]\nd:I[9665,[],\"MetadataBoundary\"]\nf:I[6614,[],\"\"]\n:HL[\"/_next/static/css/dde25b75382bfa04.css\",\"style\"]\n"])</script><script>self.__next_f.push([1,"0:{\"P\":null,\"b\":\"CMM-loTSc_6GY3m6VjDNr\",\"p\":\"\",\"c\":[\"\",\"\"],\"i\":false,\"f\":[[[\"\",{\"children\":[\"__PAGE__\",{}]},\"$undefined\",\"$undefined\",true],[\"\",[\"$\",\"$1\",\"c\",{\"children\":[[[\"$\",\"link\",\"0\",{\"rel\":\"stylesheet\",\"href\":\"/_next/static/css/dde25b75382bfa04.css\",\"precedence\":\"next\",\"crossOrigin\":\"$undefined\",\"nonce\":\"$undefined\"}]],[\"$\",\"html\",null,{\"lang\":\"fr\",\"children\":[\"$\",\"body\",null,{\"children\":[\"$\",\"$L2\",null,{\"children\":[[\"$\",\"$L3\",null,{}],[\"$\",\"$L4\",null,{\"parallelRouterKey\":\"children\",\"error\":\"$undefined\",\"errorStyles\":\"$undefined\",\"errorScripts\":\"$undefined\",\"template\":[\"$\",\"$L5\",null,{}],\"templateStyles\":\"$undefined\",\"templateScripts\":\"$undefined\",\"notFound\":[[[\"$\",\"title\",null,{\"children\":\"404: This page could not be found.\"}],[\"$\",\"div\",null,{\"style\":{\"fontFamily\":\"system-ui,\\\"Segoe UI\\\",Roboto,Helvetica,Arial,sans-serif,\\\"Apple Color Emoji\\\",\\\"Segoe UI Emoji\\\"\",\"height\":\"100vh\",\"textAlign\":\"center\",\"display\":\"flex\",\"flexDirection\":\"column\",\"alignItems\":\"center\",\"justifyContent\":\"center\"},\"children\":[\"$\",\"div\",null,{\"children\":[[\"$\",\"style\",null,{\"dangerouslySetInnerHTML\":{\"__html\":\"body{color:#000;background:#fff;margin:0}.next-error-h1{border-right:1px solid rgba(0,0,0,.3)}@media (prefers-color-scheme:dark){body{color:#fff;background:#000}.next-error-h1{border-right:1px solid rgba(255,255,255,.3)}}\"}}],[\"$\",\"h1\",null,{\"className\":\"next-error-h1\",\"style\":{\"display\":\"inline-block\",\"margin\":\"0 20px 0 0\",\"padding\":\"0 23px 0 0\",\"fontSize\":24,\"fontWeight\":500,\"verticalAlign\":\"top\",\"lineHeight\":\"49px\"},\"children\":404}],[\"$\",\"div\",null,{\"style\":{\"display\":\"inline-block\"},\"children\":[\"$\",\"h2\",null,{\"style\":{\"fontSize\":14,\"fontWeight\":400,\"lineHeight\":\"49px\",\"margin\":0},\"children\":\"This page could not be found.\"}]}]]}]}]],[]],\"forbidden\":\"$undefined\",\"unauthorized\":\"$undefined\"}]]}]}]}]]}],{\"children\":[\"__PAGE__\",[\"$\",\"$1\",\"c\",{\"children\":[[\"$\",\"div\",null,{\"className\":\"flex flex-col items-center text-center space-y-32 px-4 py-16 md:py-32 max-w-4xl mx-auto\",\"children\":[[\"$\",\"section\",null,{\"className\":\"space-y-4\",\"children\":[[\"$\",\"h2\",null,{\"className\":\"text-3xl md:text-5xl font-bold\",\"children\":\"🐾 Pet Friendly Locator\"}],[\"$\",\"p\",null,{\"className\":\"text-lg text-gray-700\",\"children\":\"Une application pour découvrir et partager les lieux accueillants pour vos animaux dans la région de Bordeaux.\"}]]}],[\"$\",\"section\",null,{\"className\":\"space-y-4\",\"children\":[[\"$\",\"h2\",null,{\"className\":\"text-3xl md:text-4xl font-bold\",\"children\":\"🧭 Comment ça fonctionne\"}],[\"$\",\"p\",null,{\"className\":\"text-lg text-gray-700\",\"children\":\"Explorez une carte interactive, ajoutez des lieux, laissez des avis et aidez la communauté à trouver les meilleurs spots pet friendly.\"}]]}],[\"$\",\"section\",null,{\"className\":\"space-y-4\",\"children\":[[\"$\",\"h2\",null,{\"className\":\"text-3xl md:text-4xl font-bold\",\"children\":\"📬 Me contacter\"}],[\"$\",\"p\",null,{\"className\":\"text-lg text-gray-700\",\"children\":[\"Une question ou une suggestion ? Écrivez-moi à :\",[\"$\",\"br\",null,{}],[\"$\",\"a\",null,{\"href\":\"mailto:contact@petfriendlylocator.fr\",\"className\":\"text-blue-600 hover:underline\",\"children\":\"contact@petfriendlylocator.fr\"}]]}]]}]]}],null,[\"$\",\"$L6\",null,{\"children\":[\"$L7\",\"$L8\",[\"$\",\"$L9\",null,{\"promise\":\"$@a\"}]]}]]}],{},null,false]},null,false],[\"$\",\"$1\",\"h\",{\"children\":[null,[\"$\",\"$1\",\"HNfGpWtw1uY3xu9xHzn45v\",{\"children\":[[\"$\",\"$Lb\",null,{\"children\":\"$Lc\"}],null]}],[\"$\",\"$Ld\",null,{\"children\":\"$Le\"}]]}],false]],\"m\":\"$undefined\",\"G\":[\"$f\",\"$undefined\"],\"s\":false,\"S\":true}\n"])</script><script>self.__next_f.push([1,"10:\"$Sreact.suspense\"\n11:I[4911,[],\"AsyncMetadata\"]\ne:[\"$\",\"div\",null,{\"hidden\":true,\"children\":[\"$\",\"$10\",null,{\"fallback\":null,\"children\":[\"$\",\"$L11\",null,{\"promise\":\"$@12\"}]}]}]\n8:null\n"])</script><script>self.__next_f.push([1,"c:[[\"$\",\"meta\",\"0\",{\"charSet\":\"utf-8\"}],[\"$\",\"meta\",\"1\",{\"name\":\"viewport\",\"content\":\"width=device-width, initial-scale=1\"}]]\n7:null\n"])</script><script>self.__next_f.push([1,"a:{\"metadata\":[[\"$\",\"title\",\"0\",{\"children\":\"Pet Friendly Locator\"}],[\"$\",\"meta\",\"1\",{\"name\":\"description\",\"content\":\"Trouvez des lieux accueillants pour vos animaux à Bordeaux\"}],[\"$\",\"link\",\"2\",{\"rel\":\"icon\",\"href\":\"/favicon.ico\",\"type\":\"image/x-icon\",\"sizes\":\"16x16\"}]],\"error\":null,\"digest\":\"$undefined\"}\n12:{\"metadata\":\"$a:metadata\",\"error\":null,\"digest\":\"$undefined\"}\n"])</script></body></html>%
```

### 2 - Dev

Dockerfile-dev

```dockerfile
# Dockerfile-dev
FROM node:22

WORKDIR /app

COPY package*.json ./
RUN npm install

ENV ENVIRONMENT=dev

# Recommande l’usage du dossier monté
VOLUME ["/app/src"]

ENTRYPOINT ["npm", "run", "dev"]
```

docker-compose-dev.yml

```yml
services:
  app:
    container_name: pet_friendly_dev
    build:
      context: .
      dockerfile: Dockerfile-dev
    ports:
      - '3000:3000'
    environment:
      - ENVIRONMENT=dev
      - DATABASE_URL=postgresql://user:password@db:5432/petdb?schema=public
    volumes:
      - ./src:/app/src
      - ./public:/app/public
    depends_on:
      - db

  db:
    image: postgres:16
    container_name: pet_friendly_db_dev
    restart: always
    environment:
      POSTGRES_DB: petdb
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    ports:
      - '5434:5432'
    volumes:
      - pg_data_dev:/var/lib/postgresql/data

volumes:
  pg_data_dev:
```

```bash
docker compose -f docker-compose-dev.yml up --build
```

```bash
[+] Building 0.2s (11/11) FINISHED
 => [internal] load local bake definitions                                                                                                                         0.0s
 => => reading from stdin 411B                                                                                                                                     0.0s
 => [internal] load build definition from Dockerfile-dev                                                                                                           0.0s
 => => transferring dockerfile: 302B                                                                                                                               0.0s
 => [internal] load metadata for docker.io/library/node:22                                                                                                         0.0s
 => [internal] load .dockerignore                                                                                                                                  0.0s
 => => transferring context: 160B                                                                                                                                  0.0s
 => [1/4] FROM docker.io/library/node:22                                                                                                                           0.0s
 => [internal] load build context                                                                                                                                  0.0s
 => => transferring context: 93B                                                                                                                                   0.0s
 => CACHED [2/4] WORKDIR /app                                                                                                                                      0.0s
 => CACHED [3/4] COPY package*.json ./                                                                                                                             0.0s
 => CACHED [4/4] RUN npm install                                                                                                                                   0.0s
 => exporting to image                                                                                                                                             0.0s
 => => exporting layers                                                                                                                                            0.0s
 => => writing image sha256:ce183bd7eaea3d864be2d5b2234ba897143af78c874ec6759aa760ed3abe0dab                                                                       0.0s
 => => naming to docker.io/library/petfriendlylocator-app                                                                                                          0.0s
 => resolving provenance for metadata file                                                                                                                         0.0s
[+] Running 1/1
 ✔ app  Built                                                                                                                                                      0.0s
Attaching to pet_friendly_db_dev, pet_friendly_dev
pet_friendly_db_dev  |
pet_friendly_db_dev  | PostgreSQL Database directory appears to contain a database; Skipping initialization
pet_friendly_db_dev  |
pet_friendly_db_dev  | 2025-06-27 10:35:19.004 UTC [1] LOG:  starting PostgreSQL 16.9 (Debian 16.9-1.pgdg120+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 12.2.0-14) 12.2.0, 64-bit
pet_friendly_db_dev  | 2025-06-27 10:35:19.005 UTC [1] LOG:  listening on IPv4 address "0.0.0.0", port 5432
pet_friendly_db_dev  | 2025-06-27 10:35:19.005 UTC [1] LOG:  listening on IPv6 address "::", port 5432
pet_friendly_db_dev  | 2025-06-27 10:35:19.007 UTC [1] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
pet_friendly_db_dev  | 2025-06-27 10:35:19.011 UTC [29] LOG:  database system was shut down at 2025-06-27 10:29:42 UTC
pet_friendly_db_dev  | 2025-06-27 10:35:19.018 UTC [1] LOG:  database system is ready to accept connections
pet_friendly_dev     |
pet_friendly_dev     | > petfriendlylocator@0.1.0 dev
pet_friendly_dev     | > next dev --turbopack
pet_friendly_dev     |
pet_friendly_dev     |    ▲ Next.js 15.3.4 (Turbopack)
pet_friendly_dev     |    - Local:        http://localhost:3000
pet_friendly_dev     |    - Network:      http://172.19.0.3:3000
pet_friendly_dev     |
pet_friendly_dev     |  ✓ Starting...
pet_friendly_dev     |
pet_friendly_dev     |    We detected TypeScript in your project and created a tsconfig.json file for you.
pet_friendly_dev     |  ✓ Ready in 1220ms
```

```bash
curl -i http://localhost:3000
```

```bash
HTTP/1.1 500 Internal Server Error
Cache-Control: no-store, must-revalidate
X-Powered-By: Next.js
ETag: "om0v7rqn3w44q"
Content-Type: text/html; charset=utf-8
Content-Length: 5354
Vary: Accept-Encoding
Date: Fri, 27 Jun 2025 10:36:31 GMT
Connection: keep-alive
Keep-Alive: timeout=5

<!DOCTYPE html><html><head><meta charSet="utf-8" data-next-head=""/><meta name="viewport" content="width=device-width" data-next-head=""/><style data-next-hide-fouc="true">body{display:none}</style><noscript data-next-hide-fouc="true"><style>body{display:block}</style></noscript><noscript data-n-css=""></noscript><script src="/_next/static/chunks/%5Broot-of-the-server%5D__e2c08166._.js" defer=""></script><script src="/_next/static/chunks/node_modules_react-dom_82bb97c6._.js" defer=""></script><script src="/_next/static/chunks/node_modules_a51498a5._.js" defer=""></script><script src="/_next/static/chunks/%5Broot-of-the-server%5D__49fd8634._.js" defer=""></script><script src="/_next/static/chunks/pages__app_5771e187._.js" defer=""></script><script src="/_next/static/chunks/pages__app_9114105e._.js" defer=""></script><script src="/_next/static/chunks/%5Broot-of-the-server%5D__8df7605f._.js" defer=""></script><script src="/_next/static/chunks/%5Broot-of-the-server%5D__923cb372._.js" defer=""></script><script src="/_next/static/chunks/pages__error_5771e187._.js" defer=""></script><script src="/_next/static/chunks/pages__error_ec6747c0._.js" defer=""></script><script src="/_next/static/development/_ssgManifest.js" defer=""></script><script src="/_next/static/development/_buildManifest.js" defer=""></script><noscript id="__next_css__DO_NOT_USE__"></noscript></head><body><div id="__next"></div><script id="__NEXT_DATA__" type="application/json">{"props":{"pageProps":{"statusCode":500,"hostname":"localhost"}},"page":"/_error","query":{},"buildId":"development","isFallback":false,"err":{"name":"Error","source":"server","message":"./src/app/layout.tsx:3:1\nModule not found: Can't resolve '@/components/Navbar'\n  1 | import './globals.css';\n  2 | import { Providers } from '@/providers';\n\u003e 3 | import Navbar from '@/components/Navbar';\n    | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^\n  4 |\n  5 | export const metadata = {\n  6 | \ttitle: 'Pet Friendly Locator',\n\n\n\nhttps://nextjs.org/docs/messages/module-not-found\n\n","stack":"Error: ./src/app/layout.tsx:3:1\nModule not found: Can't resolve '@/components/Navbar'\n\u001b[0m \u001b[90m 1 |\u001b[39m \u001b[36mimport\u001b[39m \u001b[32m'./globals.css'\u001b[39m\u001b[33m;\u001b[39m\u001b[0m\n\u001b[0m \u001b[90m 2 |\u001b[39m \u001b[36mimport\u001b[39m { \u001b[33mProviders\u001b[39m } \u001b[36mfrom\u001b[39m \u001b[32m'@/providers'\u001b[39m\u001b[33m;\u001b[39m\u001b[0m\n\u001b[0m\u001b[31m\u001b[1m\u003e\u001b[22m\u001b[39m\u001b[90m 3 |\u001b[39m \u001b[36mimport\u001b[39m \u001b[33mNavbar\u001b[39m \u001b[36mfrom\u001b[39m \u001b[32m'@/components/Navbar'\u001b[39m\u001b[33m;\u001b[39m\u001b[0m\n\u001b[0m \u001b[90m   |\u001b[39m \u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[0m\n\u001b[0m \u001b[90m 4 |\u001b[39m\u001b[0m\n\u001b[0m \u001b[90m 5 |\u001b[39m \u001b[36mexport\u001b[39m \u001b[36mconst\u001b[39m metadata \u001b[33m=\u001b[39m {\u001b[0m\n\u001b[0m \u001b[90m 6 |\u001b[39m \ttitle\u001b[33m:\u001b[39m \u001b[32m'Pet Friendly Locator'\u001b[39m\u001b[33m,\u001b[39m\u001b[0m\n\n\n\nhttps://nextjs.org/docs/messages/module-not-found\n\n\n    at Object.getCompilationErrors (/app/node_modules/next/dist/server/dev/hot-reloader-turbopack.js:725:59)\n    at DevBundlerService.getCompilationError (/app/node_modules/next/dist/server/lib/dev-bundler-service.js:39:55)\n    at DevServer.getCompilationError (/app/node_modules/next/dist/server/dev/next-dev-server.js:643:42)\n    at DevServer.findPageComponents (/app/node_modules/next/dist/server/dev/next-dev-server.js:613:43)\n    at async DevServer.renderErrorToResponseImpl (/app/node_modules/next/dist/server/base-server.js:2619:26)"},"gip":true,"scriptLoader":[]}</script></body></html>%
```

### 3 - Multi-stage build

Dockerfile

```dockerfile
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
```

```bash
docker build --target prod -t petfriendly-prod .
```

````bash
[+] Building 113.6s (13/13) FINISHED                                                                                                                                    docker:default
 => [internal] load build definition from Dockerfile                                                                                                                              0.0s
 => => transferring dockerfile: 960B                                                                                                                                              0.0s
 => [internal] load metadata for docker.io/library/node:22                                                                                                                        0.0s
 => [internal] load .dockerignore                                                                                                                                                 0.0s
 => => transferring context: 975B                                                                                                                                                 0.0s
 => [base 1/4] FROM docker.io/library/node:22                                                                                                                                     0.0s
 => [internal] load build context                                                                                                                                                 5.7s
 => => transferring context: 194.35MB                                                                                                                                             5.3s
 => CACHED [base 2/4] WORKDIR /app                                                                                                                                                0.0s
 => [base 3/4] COPY package*.json ./                                                                                                                                              0.9s
 => [base 4/4] RUN npm install                                                                                                                                                   23.8s
 => [prod 1/4] COPY . .                                                                                                                                                          29.1s
 => [prod 2/4] RUN npx prisma generate --schema=src/prisma/schema.prisma                                                                                                          1.8s
 => [prod 3/4] RUN npx prisma migrate deploy --schema=src/prisma/schema.prisma                                                                                                    3.3s
 => [prod 4/4] RUN npm run build                                                                                                                                                 27.3s
 => exporting to image                                                                                                                                                           21.6s
 => => exporting layers                                                                                                                                                          21.6s
 => => writing image sha256:0b3328396c37aa08760261c8831f4fca8c88dffbef5ef5dab8a603fb508bc68a                                                                                      0.0s
 => => naming to docker.io/library/petfriendly-prod    ```

```bash
docker build --target dev -t petfriendly-dev .
````

```bash
[+] Building 3.5s (9/9) FINISHED                                                                                                                                        docker:default
 => [internal] load build definition from Dockerfile                                                                                                                              0.0s
 => => transferring dockerfile: 960B                                                                                                                                              0.0s
 => [internal] load metadata for docker.io/library/node:22                                                                                                                        0.0s
 => [internal] load .dockerignore                                                                                                                                                 0.0s
 => => transferring context: 975B                                                                                                                                                 0.0s
 => [base 1/4] FROM docker.io/library/node:22                                                                                                                                     0.0s
 => [internal] load build context                                                                                                                                                 3.2s
 => => transferring context: 190B                                                                                                                                                 3.2s
 => CACHED [base 2/4] WORKDIR /app                                                                                                                                                0.0s
 => CACHED [base 3/4] COPY package*.json ./                                                                                                                                       0.0s
 => CACHED [base 4/4] RUN npm install                                                                                                                                             0.0s
 => exporting to image                                                                                                                                                            0.0s
 => => exporting layers                                                                                                                                                           0.0s
 => => writing image sha256:d3d57b11f0ab6c44fac69c74be4c6a65931d93bdcb8adf331bdf99c6b63e9014                                                                                      0.0s
 => => naming to docker.io/library/petfriendly-dev
```

## Part 3 - Base image

### 1 - Provenance

Lien vers le Dockerfile de `debian:latest`

https://github.com/debuerreotype/docker-debian-artifacts/blob/34def9a42f8f725225fcba6357df65c8a77f2d5d/bookworm/Dockerfile

Lien vers le Dockerfile de `alpine:latest`

https://github.com/alpinelinux/docker-alpine/blob/5213c5a71c73d39d5896657909e753effb1c05ff/x86_64/Dockerfile

Lien vers le Dockerfile de `node:22`

https://github.com/nodejs/docker-node/blob/781fc74e97c58255f2078b1ffcc85f16208b2604/22/bookworm/Dockerfile

### 2 - Known vulnerabilities

- `debian:latest`
  Total: 78 (UNKNOWN: 0, LOW: 58, MEDIUM: 12, HIGH: 7, CRITICAL: 1)

- `alpine:latest`
  '0': Clean (no security findings detected)

- `node:22`
  Total: 1344 (UNKNOWN: 2, LOW: 680, MEDIUM: 490, HIGH: 163, CRITICAL: 9)

### 3 - Dockerfile writing

Dockerfile-alpine

```dockerfile
FROM alpine:3.22.0 AS base

WORKDIR /app

# Ajout des outils nécessaires à l'installation Node + Prisma + deps
RUN apk add --no-cache \
  nodejs \
  npm \
  bash \
  curl \
  libc6-compat \
  openssl \
  python3 \
  make \
  g++ \
  git

COPY package*.json ./
RUN npm install

# Stage de dev
FROM base AS dev
ENV ENVIRONMENT=dev

VOLUME ["/app/src"]
ENTRYPOINT ["npm", "run", "dev"]

# Stage de prod
FROM base AS prod

ENV NODE_ENV=production
ENV ENVIRONMENT=prod

COPY . .

RUN npx prisma generate --schema=src/prisma/schema.prisma
RUN npx prisma migrate deploy --schema=src/prisma/schema.prisma
RUN npm run build

EXPOSE 3000
ENTRYPOINT ["npm", "start"]
```

Dockerfile-debian

```dockerfile
# Stage de base
FROM debian:12.11 AS base

WORKDIR /app

# Installation Node.js (manuel car non préinstallé)
RUN apt-get update && apt-get install -y \
  curl \
  gnupg \
  ca-certificates && \
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
  apt-get install -y nodejs git python3 make g++ && \
  apt-get clean && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

# Stage de dev
FROM base AS dev
ENV ENVIRONMENT=dev

VOLUME ["/app/src"]
ENTRYPOINT ["npm", "run", "dev"]

# Stage de prod
FROM base AS prod

ENV NODE_ENV=production
ENV ENVIRONMENT=prod

COPY . .

RUN npx prisma generate --schema=src/prisma/schema.prisma
RUN npx prisma migrate deploy --schema=src/prisma/schema.prisma
RUN npm run build

EXPOSE 3000
ENTRYPOINT ["npm", "start"]
```

### 4 - Measure !

Time for `alpine:latest`:

```bash
docker build -t petfriendly-alpine --target prod -f Dockerfile-alpine .  15.88s user 10.12s system 17% cpu 2:26.98 total
```

Time for `debian:latest`:

```bash
docker build -t petfriendly-debian --target prod -f Dockerfile-debian .  4.63s user 2.70s system 4% cpu 2:48.84 total
```

Sizing for images:

```bash
docker images | grep petfriendly
```

```bash
petfriendly-debian        latest    1adac74243e4   About a minute ago   2.78GB
petfriendly-alpine        latest    ea19ebff7619   5 minutes ago        2.33GB
```

Performances:

```bash
#!/bin/bash

URL="http://localhost:3002"
CONCURRENCY=100
TOTAL=5000

echo "Cible : $URL"
echo "Total : $TOTAL requêtes"
echo "Concurrence : $CONCURRENCY en parallèle"

start=$(date +%s.%N)

# Envoie les requêtes avec xargs et curl
xargs -P $CONCURRENCY -n 1 curl -s -o /dev/null <<< "$(yes $URL | head -n $TOTAL)"

end=$(date +%s.%N)
duration=$(echo "$end - $start" | bc)

echo "⏱ Temps total : $duration secondes"
```

`debian:latest`:

```bash
Cible : http://localhost:3002
Total : 5000 requêtes
Concurrence : 100 en parallèle
⏱ Temps total : 5.813220043 secondes
```

`alpine:latest`:

```bash
Cible : http://localhost:3001
Total : 5000 requêtes
Concurrence : 100 en parallèle
⏱ Temps total : 10.777363297 secondes
```

## Part 4 - En vrac

### 1 - Clean caches

Dockerfile-debian

```dockerfile
# Étape de base
FROM debian:12.11 AS base

# Définir le répertoire de travail
WORKDIR /app

# Installer Node.js (exemple de runtime)
RUN apt-get update && \
    apt-get install -y curl gnupg ca-certificates && \
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances sans le cache
RUN npm install --omit=dev && \
    npm cache clean --force

# Copier le reste du code
COPY . .

# Générer le Prisma client et migrer
RUN npx prisma generate --schema=src/prisma/schema.prisma && \
    npx prisma migrate deploy --schema=src/prisma/schema.prisma

# Build de l'application
RUN npm run build

# Port exposé
EXPOSE 3000

# Lancement
ENTRYPOINT ["npm", "start"]
```

### 2 - Labels

Dockerfile-debian

```dockerfile
# Étape de base
FROM debian:12.11 AS base

# LABELS OCI standard pour métadonnées de l'image
LABEL org.opencontainers.image.title="Pet Friendly Locator" \
      org.opencontainers.image.description="Web app to locate pet-friendly places around Bordeaux" \
      org.opencontainers.image.authors="Periicles" \
      org.opencontainers.image.url="https://gitlab.com/Periicles/petfriendlybordeaux" \
      org.opencontainers.image.source="https://gitlab.com/Periicles/petfriendlylocator/-/blob/main/Dockerfile-debian?ref_type=heads"

# Définir le répertoire de travail
WORKDIR /app

# Installer Node.js (exemple de runtime)
RUN apt-get update && \
    apt-get install -y curl gnupg ca-certificates && \
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances sans le cache
RUN npm install --omit=dev && \
    npm cache clean --force

# Copier le reste du code
COPY . .

# Générer le Prisma client et migrer
RUN npx prisma generate --schema=src/prisma/schema.prisma && \
    npx prisma migrate deploy --schema=src/prisma/schema.prisma

# Build de l'application
RUN npm run build

# Port exposé
EXPOSE 3000

# Lancement
ENTRYPOINT ["npm", "start"]
```

```bash
docker build -t petfriendly-debian --target base .
```

```bash
[+] Building 0.2s (9/9) FINISHED                                                                                                                                             docker:default
 => [internal] load build definition from Dockerfile                                                                                                                                   0.0s
 => => transferring dockerfile: 960B                                                                                                                                                   0.0s
 => [internal] load metadata for docker.io/library/node:22                                                                                                                             0.0s
 => [internal] load .dockerignore                                                                                                                                                      0.0s
 => => transferring context: 2B                                                                                                                                                        0.0s
 => [base 1/4] FROM docker.io/library/node:22                                                                                                                                          0.0s
 => [internal] load build context                                                                                                                                                      0.1s
 => => transferring context: 93B                                                                                                                                                       0.0s
 => CACHED [base 2/4] WORKDIR /app                                                                                                                                                     0.0s
 => CACHED [base 3/4] COPY package*.json ./                                                                                                                                            0.0s
 => CACHED [base 4/4] RUN npm install                                                                                                                                                  0.0s
 => exporting to image                                                                                                                                                                 0.0s
 => => exporting layers                                                                                                                                                                0.0s
 => => writing image sha256:64ee222e86dd49a04e06b2d57f11192d411d6da248280950fc03b41a61c0cb5b                                                                                           0.0s
 => => naming to docker.io/library/petfriendly-debian
```

### 3 - No root

Dockerfile

```dockerfile
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
```

```bash
docker build --target=dev -t petfriendly-dev .
```

```bash
[+] Building 213.0s (13/13) FINISHED                                                                                                                                         docker:default
 => [internal] load build definition from Dockerfile                                                                                                                                   0.0s
 => => transferring dockerfile: 1.83kB                                                                                                                                                 0.0s
 => [internal] load metadata for docker.io/library/debian:12.11                                                                                                                        0.7s
 => [internal] load .dockerignore                                                                                                                                                      0.0s
 => => transferring context: 2B                                                                                                                                                        0.0s
 => [internal] load build context                                                                                                                                                      0.1s
 => => transferring context: 1.97MB                                                                                                                                                    0.1s
 => [base 1/8] FROM docker.io/library/debian:12.11@sha256:0d8498a0e9e6a60011df39aab78534cfe940785e7c59d19dfae1eb53ea59babe                                                             0.0s
 => CACHED [base 2/8] WORKDIR /app                                                                                                                                                     0.0s
 => [base 3/8] RUN apt-get update &&     apt-get install -y curl gnupg ca-certificates git python3 make g++ &&     curl -fsSL https://deb.nodesource.com/setup_22.x | bash - &&       42.9s
 => [base 4/8] RUN useradd -m -u 1001 petuser                                                                                                                                          0.2s
 => [base 5/8] COPY package*.json ./                                                                                                                                                   0.1s
 => [base 6/8] RUN npm install                                                                                                                                                        36.5s
 => [base 7/8] COPY . .                                                                                                                                                                0.4s
 => [base 8/8] RUN chown -R petuser:petuser /app                                                                                                                                     109.6s
 => exporting to image                                                                                                                                                                22.1s
 => => exporting layers                                                                                                                                                               22.0s
 => => writing image sha256:cbf4ffd59f4b29bcd21d2fea010548c5c32a80d605d303a4516862ff5abb9412                                                                                           0.0s
 => => naming to docker.io/library/petfriendly-dev
```

```bash
docker build --target=prod -t petfriendly-prod .
```

```bash
[+] Building 163.9s (15/15) FINISHED                                                                                                                                         docker:default
 => [internal] load build definition from Dockerfile                                                                                                                                   0.2s
 => => transferring dockerfile: 1.83kB                                                                                                                                                 0.0s
 => [internal] load metadata for docker.io/library/debian:12.11                                                                                                                        0.6s
 => [internal] load .dockerignore                                                                                                                                                      0.1s
 => => transferring context: 2B                                                                                                                                                        0.0s
 => [internal] load build context                                                                                                                                                      0.0s
 => => transferring context: 22.35kB                                                                                                                                                   0.0s
 => [base 1/8] FROM docker.io/library/debian:12.11@sha256:0d8498a0e9e6a60011df39aab78534cfe940785e7c59d19dfae1eb53ea59babe                                                             0.0s
 => CACHED [base 2/8] WORKDIR /app                                                                                                                                                     0.0s
 => CACHED [base 3/8] RUN apt-get update &&     apt-get install -y curl gnupg ca-certificates git python3 make g++ &&     curl -fsSL https://deb.nodesource.com/setup_22.x | bash - &  0.0s
 => CACHED [base 4/8] RUN useradd -m -u 1001 petuser                                                                                                                                   0.0s
 => CACHED [base 5/8] COPY package*.json ./                                                                                                                                            0.0s
 => CACHED [base 6/8] RUN npm install                                                                                                                                                  0.0s
 => CACHED [base 7/8] COPY . .                                                                                                                                                         0.0s
 => CACHED [base 8/8] RUN chown -R petuser:petuser /app                                                                                                                                0.0s
 => [prod 1/2] RUN npx prisma generate --schema=src/prisma/schema.prisma &&     npx prisma migrate deploy --schema=src/prisma/schema.prisma &&     npm run build && npm cache clean   39.6s
 => [prod 2/2] RUN chown -R petuser:petuser /app                                                                                                                                     107.1s
 => exporting to image                                                                                                                                                                16.0s
 => => exporting layers                                                                                                                                                               16.0s
 => => writing image sha256:702d045f156600614e05ba2c82c5bd5e2ccd9f5f8b02b69dcf3670d72dd575d0                                                                                           0.0s
 => => naming to docker.io/library/petfriendly-prod
```

# Advanced Docker - Part 3

## Part 1 - First Pipeline

```bash
git add gitlab-ci.yml
```

```bash
git commit -m "feat: adding the ci file"
```

```bash
git push
```

```bash
$ /usr/games/cowsay "Meoooow"
 _________
< Meoooow >
 ---------
        \   ^__^
         \  (oo)\_______
            (__)\       )\/\
                ||----w |
                ||     ||
Cleaning up project directory and file based variables 00:01
Job succeeded
```

## Part 2 - Test then build

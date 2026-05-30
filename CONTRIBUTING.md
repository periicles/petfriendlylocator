# Contribuer

> [English version](./CONTRIBUTING.en.md)

Merci de contribuer à **Pet Friendly Locator**. Ce guide résume le workflow et les conventions du projet.

---

## Workflow git

Le projet suit un workflow **GitHub Flow** : tout part de `main`, les changements passent par une branche dédiée puis une Pull Request.

1. Crée une branche depuis `main` :

   ```bash
   git switch -c feat/ma-nouvelle-feature
   # ou: fix/...   chore/...   ci/...   refactor/...   docs/...
   ```

2. Code, commit, push.
3. Ouvre une PR vers `main`. La CI doit passer (lint + gitleaks). Le merge déclenche le build Docker et la publication sur GHCR.

Pas de release branches ni de staging — l'image `latest` sur GHCR est ce qui vient d'atterrir sur `main`.

---

## Conventions de commit

Format **Conventional Commits** :

```text
<type>(<scope facultatif>): <description courte au présent>
```

Types utilisés dans le repo : `feat`, `fix`, `chore`, `ci`, `refactor`, `deps`, `infra`, `docs`.

Exemples extraits du log :

- `fix(prisma): lazy-init client via Proxy to fix Docker build failure`
- `ci: upgrade actions to Node 24 native, replace gitleaks action with CLI`
- `refactor: migrate Tailwind config to CSS-based v4 pattern`
- `docs: update .env.example with descriptive defaults`

---

## Checks locaux avant push

```bash
npm run lint           # ESLint — zéro warning toléré en CI
npm test               # Jest — toutes les suites doivent passer
```

Optionnellement, scan secrets façon CI :

```bash
gitleaks detect --source .
```

---

## Migrations Prisma

Le schéma vit dans `prisma/schema.prisma`. Après modification :

```bash
npm run generate                       # régénère le client Prisma
npx prisma migrate dev --name <nom>    # crée et applique la migration en local
```

Commit le fichier de migration généré sous `prisma/migrations/`. Ne lance pas `migrate deploy` en local — c'est réservé aux environnements de prod.

---

## Tests

Configuration dual-environment (node + jsdom) — voir [`__tests__/README.md`](./__tests__/README.md).

- Tests d'utilitaires et de routes API : `.test.ts` (env node)
- Tests de composants React : `.test.tsx` (env jsdom)

Quand tu touches à un composant ou une route, ajoute ou mets à jour le test correspondant.

---

## Style de code

- TypeScript strict, pas de `any` implicite.
- Composants React : Server Components par défaut, `"use client"` uniquement si nécessaire.
- Pour les réponses API : passer par les DTO de `src/types/` plutôt que renvoyer directement les modèles Prisma.
- Commentaires : expliquer le **pourquoi**, pas le **quoi** (le code se lit tout seul).
- Pas de `console.log` en code de production (seulement `console.error` sur les chemins d'erreur).

---

## Sécurité

- **Ne jamais committer** de secrets — `.env` est dans `.gitignore`, utilise `.env.example` pour documenter.
- Le job `gitleaks` bloquera tout secret poussé sur `main`.
- Pour les routes API qui modifient des données : exiger un token JWT **et** vérifier la propriété (`location.user_id === token.sub`).

---

## Questions

Ouvre une issue sur [le repo GitHub](https://github.com/Periicles/petfriendlylocator/issues).

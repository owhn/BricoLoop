# BricoLoop — règles du projet

## Contexte
API de prêt d'outils entre voisins. Projet Scrum EPSI B3, sprints de 45 min de dev.
Priorité absolue : respecter la Definition of Done ci-dessous. On réduit le périmètre, jamais la qualité.

## Stack (ne pas en sortir sans demande explicite)
- Node 24 LTS, ESM ("type": "module"), Express 5
- Stockage : Supabase (Postgres, @supabase/supabase-js) pour `npm start` ; store en mémoire pour les tests (décision équipe, sprint 0)
- Vitest + Supertest
- ESLint 9 flat config, `--max-warnings=0`
- Front : HTML/JS natif dans public/, servi par express.static. Pas de React, pas de Vite, pas de TypeScript.
- Ne pas ajouter de dépendance sans me demander.

## Architecture
src/app.js            createApp({ store }) — ne fait JAMAIS listen()
src/server.js         seul fichier qui appelle listen()
src/store.js          createStore(seed?) → store en mémoire (tests)
src/supabaseStore.js  createSupabaseStore(client) → store Supabase (npm start), même interface
src/supabase.js       createSupabaseClient() depuis SUPABASE_URL / SUPABASE_SECRET_KEY (.env)
supabase/schema.sql   schéma des tables, à exécuter dans l'éditeur SQL Supabase
scripts/db-seed.js    npm run db:seed → upsert de src/seed.js dans Supabase
src/seed.js           données de démo
src/errors.js         class HttpError extends Error { constructor(status, message) }
src/middleware/currentUser.js   X-User-Id → req.user (null si absent)
src/middleware/errorHandler.js  HttpError → res.status(s).json({ error }) ; autre → 500
src/routes/tools.js   routes /api/tools
src/routes/loans.js   routes /api/loans
src/routes/me.js      routes /api/me
src/services/         logique métier pure, sans req/res (testable unitairement)
test/                 un fichier par story : usXX-slug.test.js

Règles :
- Le store est TOUJOURS injecté via createApp, jamais importé en global dans les routes.
- Interface du store, toute async : store.{users,tools,loans}.{list(), get(id) → objet|null, insert(data) → objet avec id, update(id, patch) → objet|null}.
  Toute évolution de l'interface se fait dans les DEUX stores.
- Ids : chaînes numériques ("1", "2"…) dans l'API et les deux stores. En base : bigint et colonnes snake_case ;
  src/supabaseStore.js fait la conversion (snake_case ↔ camelCase, id → chaîne).
- Chaque test crée son propre store (createStore(fixture) ou createStore() vide). Aucun test ne touche Supabase.
- Toute erreur métier = throw new HttpError(status, "champ: message"). Pas de res.status(...) dispersé.
- Format d'erreur unique : { "error": "<champ>: <message>" }.
- Dates : chaînes "AAAA-MM-JJ", comparées comme chaînes. Pas d'objets Date.
- Chevauchement : a.startDate <= b.endDate && b.startDate <= a.endDate.

## Modèle
User { id, firstName, district }
Tool { id, ownerId, name, category, description, status: available|lent|unavailable }
Loan { id, toolId, borrowerId, startDate, endDate, status: pending|accepted|refused|returned }
Catégories : Perçage, Jardinage, Peinture, Nettoyage, Mesure, Autre

## Definition of Done (obligatoire)
1. Branche feature/US-xx-slug (ou fix/...) créée depuis main à jour
2. Commits préfixés : feat:, fix:, test:, refactor:, docs:, chore:
3. Au moins un test par critère d'acceptation, cas d'erreur compris
4. `npm test` 100 % vert
5. `npm run lint` 0 erreur 0 warning
6. PR ouverte — relue et approuvée par un AUTRE membre humain
7. main reste démarrable (`npm start`)
Bug : branche fix/..., test de non-régression écrit ET vu rouge avant la correction.

## Ce que tu ne fais JAMAIS
- Pousser ou merger sur main. Tu peux ouvrir la PR (gh pr create), pas la merger.
- Implémenter une story qu'on ne t'a pas demandée, même « en passant ».
- Trancher une règle métier ambiguë : tu t'arrêtes et tu me poses la question.
- Désactiver une règle ESLint ou skipper un test pour faire passer `npm run check`.

## Workflow par story
1. git switch main && git pull && git switch -c feature/US-xx-slug
2. Écrire les tests à partir des critères d'acceptation (commit test:)
3. Les lancer, vérifier qu'ils sont rouges
4. Implémenter (commit feat:)
5. npm run check vert
6. Ajouter les requêtes de démo de la story dans api.http
7. Push + gh pr create, avec dans la description la liste des critères et le test qui couvre chacun
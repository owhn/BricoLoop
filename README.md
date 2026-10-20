# BricoLoop

API de prêt d'outils entre voisins — projet Scrum EPSI B3.

## Lancement

Prérequis : Node 24 (`nvm use` lit `.nvmrc`) et un projet Supabase.

Première fois :
1. Copier `.env.example` en `.env` et renseigner `SUPABASE_URL` et `SUPABASE_SECRET_KEY` (Supabase → Project Settings → API). Ne jamais commiter `.env`.
2. Base vide uniquement : dans Supabase → SQL Editor, exécuter [supabase/schema.sql](supabase/schema.sql).
3. Base vide uniquement : charger les données de démo avec `npm run db:seed`. Attention : il écrase les lignes d'ids 1 à 8.

```bash
npm install
npm start        # http://localhost:3000 (GET /health) — utilise Supabase
npm run check    # lint (0 warning) + tests (store en mémoire, sans Supabase)
```

Requêtes de démo : [api.http](api.http).

## Équipe / rotation PO-SM

<!-- À compléter -->

## Stories Done (n° de PR)

<!-- À compléter -->

## Vidéo de démo

Lien à venir.

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
npm start        # http://localhost:3000 — utilise Supabase
npm run check    # lint (0 warning) + tests (store en mémoire, sans Supabase)
```

Interface : ouvrir http://localhost:3000 et saisir son numéro d'utilisateur en haut à droite.

| Story | Où dans l'interface |
|---|---|
| US-01 catalogue | liste des outils, disponibles en premier |
| US-02 prêter un outil | panneau « Prêter un outil » |
| US-03 fiche outil | clic sur un outil |
| US-04 / US-06 demander un emprunt | fiche outil → « Demander à l'emprunter » |
| US-05 accepter / refuser | panneau « Répondre à une demande » (propriétaire, avec le n° de demande) |
| US-08 mes emprunts | panneau « Mes emprunts » |

Requêtes de démo de l'API : [api.http](api.http).

## Équipe / rotation PO-SM

<!-- À compléter -->

## Stories Done (n° de PR)

<!-- À compléter -->

## Vidéo de démo

Lien à venir.

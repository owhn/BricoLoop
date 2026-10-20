# BricoLoop

API de prêt d'outils entre voisins — projet Scrum EPSI B3.

## Équipe / rotation PO-SM

Membres : owhn, rigal34, Courumix, Leo Nuty, bruno

| Sprint | PO |
|---|---|
| Sprint 0 | Léo |
| Sprint 1 | Antoine |
| Sprint 2 | Matéo |

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
| US-05 accepter / refuser | panneau « Gérer une demande » (propriétaire, avec le n° de demande) |
| US-07 déclarer un retour | panneau « Gérer une demande » → « Outil rendu » |
| US-08 mes emprunts | panneau « Mes emprunts » |
| US-10 filtrer par catégorie | liste déroulante au-dessus du catalogue |
| US-15 signaler abîmé / réparé | fiche outil → « Signaler cet outil abîmé » / « Signaler comme réparé » |
| US-17 connexion simple | « Se connecter en tant que » en haut à droite |

Requêtes de démo de l'API : [api.http](api.http).

## US-15 — signaler un outil abîmé

Sur une base existante, exécuter uniquement `supabase/migrations/20261020_us15_abime.sql`
dans le SQL Editor Supabase avant de redémarrer le serveur. Cette migration ajoute
`tools.abime` (booléen non nul, `false` par défaut) sans effacer les données.
Ne pas relancer le seed pour cette migration.

Dans la fiche d'un outil, le bouton « Signaler cet outil abîmé » enregistre le signalement.
Il faut renseigner son numéro d'utilisateur : seuls le propriétaire et l'emprunteur
ayant un prêt accepté peuvent signaler. Les erreurs sont affichées dans la fiche.
Le signalement ne change pas la disponibilité et ne bloque pas les demandes d'emprunt.

API : `PATCH /api/tools/:id/abime`, avec l'en-tête `X-User-Id`, sans corps.
Pour indiquer que l'outil est réparé, le même endpoint accepte le JSON `{ "abime": false }`.
Le bouton de la fiche devient « Signaler comme réparé » lorsque l'outil est abîmé,
avec les mêmes droits. `{ "abime": true }` signale un dommage ; sans corps, le
comportement de signalement initial est conservé.

## Stories Done (n° de PR)

| Story | PR | Interface |
|---|---|---|
| US-01 Catalogue des outils | #3 | #10 |
| US-02 Prêter un outil | #5 | #10 |
| US-03 Fiche d'un outil | #11 | #12 |
| US-04 Demander un emprunt | #6 | #12 |
| US-05 Accepter / refuser une demande | #7 | #12 |
| US-06 Refuser un chevauchement | #9 | #12 |
| US-07 Déclarer un retour | aucune : commitée directement sur main, sans branche ni PR (`74bd072`) ; correctifs #13, #15 | #16 |
| US-08 Mes demandes et emprunts | #8 | #12 |
| US-10 Filtrer par catégorie | #22 | #22 |
| US-15 Signaler un outil abîmé (puis réparé) | #14, #18 | #14, #18 |
| US-17 Connexion simple | #21 | #21 |

Technique : stockage Supabase #2, alignement du schéma #4, revert de la PR #17 (main ne démarrait plus) #19.

## Vidéo de démo

Lien à venir.

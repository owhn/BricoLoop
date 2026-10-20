-- US-17 Connexion simple : rôle de chaque voisin. À exécuter dans le SQL Editor du projet Supabase existant.
-- Les voisins déjà présents reçoivent le rôle « user ».
alter table public.users
  add column if not exists role text not null default 'user' check (role in ('user', 'admin'));

-- Puis choisir l'administrateur (à adapter) :
-- update public.users set role = 'admin' where id = 1;

-- À exécuter dans le SQL Editor du projet Supabase existant.
-- Les outils déjà présents sont conservés et initialisés à false.
alter table public.tools
  add column if not exists abime boolean not null default false;

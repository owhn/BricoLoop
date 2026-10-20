-- Schéma BricoLoop, à exécuter dans l'éditeur SQL de Supabase.
-- Colonnes en camelCase (entre guillemets) pour coller au modèle de CLAUDE.md.

create table if not exists users (
  id text primary key default gen_random_uuid()::text,
  "firstName" text not null,
  district text not null
);

create table if not exists tools (
  id text primary key default gen_random_uuid()::text,
  "ownerId" text not null references users (id),
  name text not null,
  category text not null check (category in ('Perçage', 'Jardinage', 'Peinture', 'Nettoyage', 'Mesure', 'Autre')),
  description text,
  status text not null check (status in ('available', 'lent', 'unavailable'))
);

create table if not exists loans (
  id text primary key default gen_random_uuid()::text,
  "toolId" text not null references tools (id),
  "borrowerId" text not null references users (id),
  "startDate" date not null,
  "endDate" date not null,
  status text not null check (status in ('pending', 'accepted', 'refused', 'returned'))
);

-- RLS activé sans policy : seule la clé secrète du serveur accède aux tables.
alter table users enable row level security;
alter table tools enable row level security;
alter table loans enable row level security;

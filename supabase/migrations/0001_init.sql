-- 4.º Campeonato Perritos Locos - esquema inicial
create extension if not exists "pgcrypto";

create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  photo_url text,
  primary_position text not null check (primary_position in ('arquero','defensa','mediocampista','delantero')),
  secondary_positions text[] not null default '{}',
  skill_level int not null check (skill_level between 1 and 6),
  available boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists championship_config (
  id text primary key default 'singleton',
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists history_entries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  data jsonb not null
);

create table if not exists current_selection (
  id text primary key default 'singleton',
  data jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists player_votes (
  player_id uuid primary key references players(id) on delete cascade,
  votes jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table players enable row level security;
alter table championship_config enable row level security;
alter table history_entries enable row level security;
alter table current_selection enable row level security;
alter table player_votes enable row level security;

-- Políticas abiertas para uso administrativo interno (ajustar con autenticación real antes de producción pública)
create policy "players_all" on players for all using (true) with check (true);
create policy "config_all" on championship_config for all using (true) with check (true);
create policy "history_all" on history_entries for all using (true) with check (true);
create policy "selection_all" on current_selection for all using (true) with check (true);
create policy "player_votes_all" on player_votes for all using (true) with check (true);

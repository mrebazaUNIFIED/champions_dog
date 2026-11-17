-- 4.º Campeonato Perritos Locos - esquema inicial
create extension if not exists "pgcrypto";

create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  photo_url text,
  primary_position text not null check (primary_position in ('arquero','defensa','mediocampista','delantero')),
  secondary_positions text[] not null default '{}',
  position_levels jsonb not null default '{"arquero":3,"defensa":3,"mediocampista":3,"delantero":3}'::jsonb,
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

-- Cada voto (jugador, votante, posición) es su propia fila: dos votantes nunca escriben
-- la misma fila al mismo tiempo, así que nunca se pisan entre sí.
create table if not exists player_position_votes (
  player_id uuid not null references players(id) on delete cascade,
  voter_id text not null,
  position text not null check (position in ('arquero','defensa','mediocampista','delantero')),
  level int not null check (level between 1 and 6),
  updated_at timestamptz not null default now(),
  primary key (player_id, voter_id, position)
);

alter table players enable row level security;
alter table championship_config enable row level security;
alter table history_entries enable row level security;
alter table current_selection enable row level security;
alter table player_position_votes enable row level security;

-- Políticas abiertas para uso administrativo interno (ajustar con autenticación real antes de producción pública)
create policy "players_all" on players for all using (true) with check (true);
create policy "config_all" on championship_config for all using (true) with check (true);
create policy "history_all" on history_entries for all using (true) with check (true);
create policy "selection_all" on current_selection for all using (true) with check (true);
create policy "player_position_votes_all" on player_position_votes for all using (true) with check (true);

-- Aplica un nivel a una posición de un jugador de forma atómica (ver 0006_normalize_votes.sql
-- para el porqué: evita el read-modify-write del objeto completo desde el cliente).
create or replace function apply_position_level(p_player_id uuid, p_position text, p_level int)
returns void
language sql
as $$
  update players
  set position_levels = jsonb_set(position_levels, array[p_position], to_jsonb(p_level)),
      updated_at = now()
  where id = p_player_id;
$$;

grant execute on function apply_position_level(uuid, text, int) to anon, authenticated;

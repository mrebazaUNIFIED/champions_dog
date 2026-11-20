-- 4.º Campeonato Perritos Locos - gestión del torneo: equipos propios (armados a mano,
-- separados del generador de equipos balanceados), partidos, premios y datos generales.
create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text not null default '#16a34a',
  logo_url text,
  player_ids jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  phase text not null default 'Fase 1',
  home_team_id uuid not null references teams(id) on delete cascade,
  away_team_id uuid not null references teams(id) on delete cascade,
  status text not null default 'scheduled' check (status in ('scheduled', 'live', 'finished')),
  scheduled_at timestamptz,
  home_lineup jsonb not null default '[]'::jsonb,
  away_lineup jsonb not null default '[]'::jsonb,
  events jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists awards (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  winner_player_id uuid references players(id) on delete set null,
  winner_name text,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists tournament_info (
  id text primary key default 'singleton',
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table teams enable row level security;
alter table matches enable row level security;
alter table awards enable row level security;
alter table tournament_info enable row level security;

create policy "teams_all" on teams for all using (true) with check (true);
create policy "matches_all" on matches for all using (true) with check (true);
create policy "awards_all" on awards for all using (true) with check (true);
create policy "tournament_info_all" on tournament_info for all using (true) with check (true);

-- Storage para logos de equipo y banner del torneo (mismo criterio que 0002_storage.sql).
-- Restringido a imágenes reales (sin svg, para no permitir XSS almacenado) y 5 MB como tope.
insert into storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
values ('tournament-media', 'tournament-media', true, array['image/png', 'image/jpeg', 'image/webp'], 5242880)
on conflict (id) do update set allowed_mime_types = excluded.allowed_mime_types, file_size_limit = excluded.file_size_limit;

create policy "tournament_media_public_read"
  on storage.objects for select
  using (bucket_id = 'tournament-media');

create policy "tournament_media_insert"
  on storage.objects for insert
  with check (bucket_id = 'tournament-media');

create policy "tournament_media_update"
  on storage.objects for update
  using (bucket_id = 'tournament-media');

create policy "tournament_media_delete"
  on storage.objects for delete
  using (bucket_id = 'tournament-media');

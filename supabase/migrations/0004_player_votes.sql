-- 4.º Campeonato Perritos Locos - votación de nivel por jugador (8 votantes)
create table if not exists player_votes (
  player_id uuid primary key references players(id) on delete cascade,
  votes jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table player_votes enable row level security;
create policy "player_votes_all" on player_votes for all using (true) with check (true);

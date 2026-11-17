-- 4.º Campeonato Perritos Locos - normaliza los votos: antes se guardaba un jsonb con TODOS
-- los votos de un jugador en una sola fila, y cada voto nuevo leía ese jsonb completo, lo
-- modificaba en el cliente y lo volvía a escribir entero. Con 8 votantes votando al mismo
-- tiempo desde 8 celulares distintos, dos escrituras concurrentes sobre el MISMO jugador se
-- pisaban entre sí y se perdían votos. Ahora cada voto (jugador, votante, posición) es su
-- propia fila con clave primaria compuesta: dos votantes nunca escriben la misma fila, así
-- que nunca hay nada que pisar.
create table if not exists player_position_votes (
  player_id uuid not null references players(id) on delete cascade,
  voter_id text not null,
  position text not null check (position in ('arquero','defensa','mediocampista','delantero')),
  level int not null check (level between 1 and 6),
  updated_at timestamptz not null default now(),
  primary key (player_id, voter_id, position)
);

alter table player_position_votes enable row level security;
drop policy if exists "player_position_votes_all" on player_position_votes;
create policy "player_position_votes_all" on player_position_votes for all using (true) with check (true);

-- Migra los votos que ya existan en la tabla vieja (si existe) antes de borrarla. La tabla
-- vieja tiene una mezcla de formatos: votos cargados después de que la votación pasó a ser
-- por posición son objetos ({"arquero":3,...}); los cargados antes de ese cambio son un único
-- número por votante (el nivel "general" de antes). Cada caso se migra por separado.
do $$
begin
  if exists (select 1 from information_schema.tables where table_name = 'player_votes') then
    -- Caso nuevo: el voto de ese votante ya es un objeto posición → nivel.
    insert into player_position_votes (player_id, voter_id, position, level, updated_at)
    select
      pv.player_id,
      voter.key as voter_id,
      pos.key as position,
      (pos.value)::int as level,
      pv.updated_at
    from player_votes pv
    cross join lateral jsonb_each(pv.votes) as voter(key, value)
    cross join lateral jsonb_each_text(voter.value) as pos(key, value)
    where jsonb_typeof(voter.value) = 'object'
    on conflict (player_id, voter_id, position) do nothing;

    -- Caso viejo: el voto de ese votante es un único número (de antes de votar por posición).
    -- Se aplica ese mismo nivel a las 4 posiciones, que era el comportamiento de entonces.
    insert into player_position_votes (player_id, voter_id, position, level, updated_at)
    select
      pv.player_id,
      voter.key as voter_id,
      pos as position,
      (voter.value)::text::int as level,
      pv.updated_at
    from player_votes pv
    cross join lateral jsonb_each(pv.votes) as voter(key, value)
    cross join lateral unnest(array['arquero', 'defensa', 'mediocampista', 'delantero']) as pos
    where jsonb_typeof(voter.value) = 'number'
    on conflict (player_id, voter_id, position) do nothing;

    drop table player_votes;
  end if;
end $$;

-- Aplica un nivel a UNA posición de UN jugador de forma atómica en la propia base: nunca
-- se lee el `position_levels` completo en el cliente para modificarlo y reescribirlo, así que
-- dos votos concurrentes sobre posiciones distintas (o incluso la misma) de un mismo jugador
-- nunca se pisan entre sí.
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

-- 4.º Campeonato Perritos Locos - nivel por posición (arquero/defensa/mediocampista/delantero)
-- en vez de un único nivel por jugador.
alter table players add column if not exists position_levels jsonb;

update players
set position_levels = jsonb_build_object(
  'arquero', skill_level,
  'defensa', skill_level,
  'mediocampista', skill_level,
  'delantero', skill_level
)
where position_levels is null;

alter table players alter column position_levels set default '{"arquero":3,"defensa":3,"mediocampista":3,"delantero":3}'::jsonb;
alter table players alter column position_levels set not null;

alter table players drop constraint if exists players_skill_level_check;
alter table players drop column if exists skill_level;

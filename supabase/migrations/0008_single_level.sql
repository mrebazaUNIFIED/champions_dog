-- 4.º Campeonato Perritos Locos - nivel único por jugador (ya no por posición), asignado a
-- mano según la tabla oficial. El algoritmo de armado de equipos, la votación y el historial
-- de selecciones ya no existen en la app (los equipos del torneo se arman a mano en /equipos):
-- se da de baja todo lo que dependía de ellos.

alter table players add column if not exists level int;

update players
set level = coalesce((position_levels->>primary_position)::int, 3)
where level is null;

alter table players alter column level set default 3;
alter table players alter column level set not null;
alter table players add constraint players_level_check check (level between 1 and 6);

alter table players drop column if exists position_levels;

drop function if exists apply_position_level(uuid, text, int);
drop table if exists player_position_votes;
drop table if exists player_votes;
drop table if exists championship_config;
drop table if exists history_entries;
drop table if exists current_selection;

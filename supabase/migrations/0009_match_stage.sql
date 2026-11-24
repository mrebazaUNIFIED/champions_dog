-- 4.º Campeonato Perritos Locos - el torneo se juega por fechas de liga y después
-- eliminatorias: se agrega la etapa de cada partido para que la tabla de posiciones
-- solo sume las fechas de liga y no los cruces de eliminatoria.
alter table matches add column if not exists stage text not null default 'fecha'
  check (stage in ('fecha', 'eliminatoria'));

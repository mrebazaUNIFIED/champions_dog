-- Cronómetro del partido para el overlay de transmisión (OBS): arranca/pausa desde el
-- panel de control y el overlay calcula el tiempo transcurrido a partir de estos campos.
alter table matches add column if not exists clock_status text not null default 'idle'
  check (clock_status in ('idle', 'running', 'paused'));
alter table matches add column if not exists clock_started_at timestamptz;
alter table matches add column if not exists clock_elapsed_ms integer not null default 0;

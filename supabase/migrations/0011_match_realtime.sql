-- El overlay de OBS necesita que Supabase emita por websocket los cambios de la tabla
-- `matches` (Realtime). Por defecto las tablas no están en la publicación que usa
-- Realtime, así que el overlay queda "mudo" y solo se actualiza si recargás la página.
-- Este bloque agrega `matches` a esa publicación, sin fallar si ya estaba agregada.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'matches'
  ) then
    alter publication supabase_realtime add table public.matches;
  end if;
end $$;

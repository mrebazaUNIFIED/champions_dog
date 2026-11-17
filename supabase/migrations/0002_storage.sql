-- 4.º Campeonato Perritos Locos - storage para fotos de jugadores
insert into storage.buckets (id, name, public)
values ('player-photos', 'player-photos', true)
on conflict (id) do nothing;

-- Políticas abiertas para uso administrativo interno (mismo criterio que 0001_init.sql:
-- ajustar con autenticación real antes de exponer la app públicamente).
create policy "player_photos_public_read"
  on storage.objects for select
  using (bucket_id = 'player-photos');

create policy "player_photos_insert"
  on storage.objects for insert
  with check (bucket_id = 'player-photos');

create policy "player_photos_update"
  on storage.objects for update
  using (bucket_id = 'player-photos');

create policy "player_photos_delete"
  on storage.objects for delete
  using (bucket_id = 'player-photos');

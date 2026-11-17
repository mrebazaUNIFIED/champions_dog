import { supabase } from './client';

const PLAYER_PHOTOS_BUCKET = 'player-photos';

/** Sube una foto de jugador al bucket de Supabase Storage y devuelve su URL pública. */
export async function uploadPlayerPhoto(file: File): Promise<string> {
  if (!supabase) throw new Error('Supabase no está configurado.');

  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from(PLAYER_PHOTOS_BUCKET).upload(path, file, {
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(PLAYER_PHOTOS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

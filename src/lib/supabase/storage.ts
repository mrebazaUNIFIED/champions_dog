import { supabase } from './client';

const PLAYER_PHOTOS_BUCKET = 'player-photos';
const TOURNAMENT_MEDIA_BUCKET = 'tournament-media';

async function uploadToBucket(bucket: string, path: string, file: File): Promise<string> {
  if (!supabase) throw new Error('Supabase no está configurado.');

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

function randomPath(file: File, folder?: string): string {
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const name = `${crypto.randomUUID()}.${extension}`;
  return folder ? `${folder}/${name}` : name;
}

/** Sube una foto de jugador al bucket de Supabase Storage y devuelve su URL pública. */
export async function uploadPlayerPhoto(file: File): Promise<string> {
  return uploadToBucket(PLAYER_PHOTOS_BUCKET, randomPath(file), file);
}

/** Sube el logo de un equipo del torneo y devuelve su URL pública. */
export async function uploadTeamLogo(file: File): Promise<string> {
  return uploadToBucket(TOURNAMENT_MEDIA_BUCKET, randomPath(file, 'team-logos'), file);
}

/** Sube el banner del torneo y devuelve su URL pública. */
export async function uploadTournamentBanner(file: File): Promise<string> {
  return uploadToBucket(TOURNAMENT_MEDIA_BUCKET, randomPath(file, 'banners'), file);
}

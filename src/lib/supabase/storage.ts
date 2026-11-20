import { supabase } from './client';

const PLAYER_PHOTOS_BUCKET = 'player-photos';
const TOURNAMENT_MEDIA_BUCKET = 'tournament-media';

// Nada de svg: un svg puede traer <script> embebido (XSS almacenado) si se llega a
// renderizar como documento en vez de como imagen. Solo tipos de imagen real.
const ALLOWED_MIME_TYPES: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

async function uploadToBucket(bucket: string, path: string, file: File): Promise<string> {
  if (!supabase) throw new Error('Supabase no está configurado.');
  if (!(file.type in ALLOWED_MIME_TYPES)) {
    throw new Error('Formato de imagen no permitido. Usá PNG, JPG o WEBP.');
  }

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: false,
    contentType: file.type,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

function randomPath(file: File, folder?: string): string {
  const extension = ALLOWED_MIME_TYPES[file.type] ?? 'jpg';
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

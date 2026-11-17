import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function isConfigured(value: string | undefined): value is string {
  return Boolean(value && value.length > 0 && !value.includes('TU_') && !value.includes('your-'));
}

/** true una vez que se cargan NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY (clave anon/pública, nunca la service role). */
export const isSupabaseConfigured = isConfigured(url) && isConfigured(anonKey);

/**
 * Cliente de Supabase para uso exclusivo en el navegador, con la clave anon pública.
 * Mientras no haya credenciales configuradas, es `null` y la app usa el repositorio local
 * (ver src/lib/data) de forma transparente, sin romper ninguna funcionalidad.
 */
export const supabase = isSupabaseConfigured ? createClient(url as string, anonKey as string) : null;

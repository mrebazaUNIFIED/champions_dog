import { isSupabaseConfigured } from '../supabase/client';
import { LocalRepository } from './localRepository';
import { SupabaseRepository } from './supabaseRepository';
import type { DataRepository } from './repository.types';

/**
 * Repositorio único para toda la app. Mientras no haya credenciales de Supabase
 * configuradas (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY) usa
 * localStorage; apenas se configuran, el mismo código empieza a persistir en Supabase
 * sin ningún cambio en componentes ni stores.
 */
export const repository: DataRepository = isSupabaseConfigured ? new SupabaseRepository() : new LocalRepository();

export type { DataRepository } from './repository.types';

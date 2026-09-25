import { DataError } from '@/data/errors';
import { createSupabasePublicClient } from '@/data/supabase';
import { SiteSettings } from '@/types/settings';

/**
 * Lectura de la configuración del sitio.
 *
 * Es una sola fila (`id = 1`). Se valida con el esquema maestro, así que un dato
 * corrupto en la base de datos falla aquí, con el campo concreto, y no como un
 * error raro dentro de un componente.
 */

/** La fila única de configuración, ya validada. */
export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle();

  if (error) {
    throw new DataError('No se pudo leer la configuración del sitio.', { cause: error });
  }

  if (!data) {
    throw new DataError(
      'La fila de configuración del sitio no existe. ¿Se aplicó la migración 000_initial.sql?',
    );
  }

  const parsed = SiteSettings.safeParse(data);

  if (!parsed.success) {
    const detail = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || '(raíz)'}: ${issue.message}`)
      .join(' | ');
    throw new DataError(`La configuración del sitio no es válida -> ${detail}`);
  }

  return parsed.data;
}

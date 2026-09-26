import { unstable_cache } from 'next/cache';
import { cache } from 'react';

import { CACHE_TAGS } from '@/data/cache-tags';
import { DataError } from '@/data/errors';
import { createSupabasePublicClient } from '@/data/supabase';
import { SiteSettings } from '@/types/settings';

/**
 * Lectura de la configuración del sitio.
 *
 * Es una sola fila (`id = 1`). Se valida con el esquema maestro, así que un dato
 * corrupto en la base de datos falla aquí, con el campo concreto, y no como un
 * error raro dentro de un componente.
 *
 * Cacheada entre peticiones y etiquetada (`site-settings`): la usan el layout, las páginas
 * y `generateMetadata`, y sin etiqueta el panel no podría refrescar el sitio al guardar.
 */
const readSiteSettings = unstable_cache(
  async (): Promise<SiteSettings> => {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

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
  },
  ['site-settings'],
  { tags: [CACHE_TAGS.siteSettings] },
);

/**
 * La fila única de configuración, ya validada.
 *
 * La memoización por petición con `cache` de React es para las lecturas repetidas dentro
 * de la misma petición: la usan el layout del sitio, cada página y `generateMetadata`.
 */
export const getSiteSettings = cache((): Promise<SiteSettings> => readSiteSettings());

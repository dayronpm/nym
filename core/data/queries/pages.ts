import { unstable_cache } from 'next/cache';
import { cache } from 'react';

import { CACHE_TAGS } from '@/data/cache-tags';
import { DataError } from '@/data/errors';
import { createSupabasePublicClient } from '@/data/supabase';
import { PAGE_SLUGS, PageSettings, type PageSlug } from '@/types/settings';

/**
 * Lectura de los metadatos y el SEO de las cinco páginas.
 *
 * Devuelve `PageSettings` (ya validado con zod), no la fila cruda: la forma de la
 * tabla y la del dominio no tienen por qué coincidir, y centralizar la conversión
 * aquí evita que cada página la repita.
 */

/** Columnas que se leen; evita traer `created_at` y `updated_at`. */
const PAGE_COLUMNS = 'slug, title, meta_title, meta_description, og_image';

function toPageSettings(row: {
  slug: string;
  title: string;
  meta_title: string | null;
  meta_description: string | null;
  og_image: unknown;
}): PageSettings {
  // Se mapea a mano porque en la base de datos los opcionales son `null` y en el
  // esquema zod son `undefined`: `optional()` no acepta `null`.
  return PageSettings.parse({
    slug: row.slug,
    title: row.title,
    meta_title: row.meta_title ?? undefined,
    meta_description: row.meta_description ?? undefined,
    og_image: row.og_image ?? undefined,
  });
}

/** Todas las páginas, en el orden canónico de `PAGE_SLUGS`.
 *
 * Cacheada entre peticiones y etiquetada: la usa el `sitemap.xml`, que se genera una vez
 * y no debe consultar la base de datos en cada rastreo.
 */
export const getAllPages = unstable_cache(
  async (): Promise<PageSettings[]> => {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase.from('pages').select(PAGE_COLUMNS);

    if (error) throw new DataError('No se pudieron leer las páginas.', { cause: error });

    const pages = (data ?? []).map(toPageSettings);
    const order = new Map(PAGE_SLUGS.map((slug, index) => [slug as string, index]));

    return pages.sort((a, b) => (order.get(a.slug) ?? 0) - (order.get(b.slug) ?? 0));
  },
  ['all-pages'],
  { tags: [CACHE_TAGS.pages] },
);

/** La fila cruda de una página, cacheada entre peticiones. */
const readPage = unstable_cache(
  async (slug: string) => {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase
      .from('pages')
      .select(PAGE_COLUMNS)
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw new DataError(`No se pudo leer la página "${slug}".`, { cause: error });

    return data;
  },
  ['page-by-slug'],
  { tags: [CACHE_TAGS.pages] },
);

/**
 * Una página por su slug, o `null` si todavía no existe.
 *
 * Se memoiza dos veces, y cada una hace algo distinto: `unstable_cache` evita la consulta
 * entre peticiones, y `cache` de React evita repetirla dentro de la misma petición —la
 * usan la página y su `generateMetadata`—.
 */
export const getPage = cache(async (slug: PageSlug): Promise<PageSettings | null> => {
  const row = await readPage(slug);
  return row ? toPageSettings(row) : null;
});

/**
 * Título para el `<title>` con la marca añadida.
 *
 * Ya no la usa nadie en el sitio: los metadatos se componen en `core/lib/seo.ts`, donde la
 * portada se titula con la marca y el lema en lugar de con la palabra "Inicio". Se mantiene
 * porque la Fase 2 la necesita para la vista previa del panel.
 */
export function buildMetaTitle(page: PageSettings, brandName: string): string {
  return page.meta_title ?? `${page.title} · ${brandName}`;
}

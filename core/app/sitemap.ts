import type { MetadataRoute } from 'next';

import { getSiteUrl } from '@/config/env';
import { getAllPages } from '@/data/queries/pages';
import { pageHref } from '@/lib/navigation';

/**
 * sitemap.xml
 *
 * Se genera desde la tabla `pages`, nunca desde una lista escrita a mano: añadir una
 * página al esquema (`PAGE_SLUGS`) la añade al mapa, al encabezado y al pie a la vez.
 *
 * El panel no entra: está excluido en `robots.txt` y marcado `noindex`.
 *
 * La lectura de las páginas está etiquetada, así que el panel podrá refrescar el mapa al
 * guardar. El `revalidate` de aquí es el respaldo por si nadie lo hace.
 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = await getAllPages();
  const siteUrl = getSiteUrl();

  return pages.map((page, index) => ({
    url: `${siteUrl}${pageHref(page.slug)}`,
    // La portada es la que más cambia: es la que se toca al añadir contenido.
    changeFrequency: index === 0 ? 'weekly' : 'monthly',
    priority: index === 0 ? 1 : 0.7,
  }));
}

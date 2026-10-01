import { notFound } from 'next/navigation';

import BlockRenderer from '@/components/BlockRenderer';
import { getPublishedBlocksByPage } from '@/data/queries/blocks';
import { getPage } from '@/data/queries/pages';
import { getSiteSettings } from '@/data/queries/site-settings';
import type { PageSlug } from '@/types/settings';

/**
 * Cuerpo común de las páginas públicas que no son Inicio.
 *
 * Las cuatro páginas interiores son idénticas salvo por el slug: debajo del encabezado
 * común van sus bloques. En vez de repetir esa composición cuatro veces, cada `page.tsx`
 * es una línea que pasa su slug.
 *
 * Lo que sí vive en cada archivo de ruta es `generateMetadata`, porque Next exige
 * exportarlo desde la propia ruta (Fase 1.4).
 *
 * El `<h1>` lleva el `title` de la fila de `pages`, pero **sin banda de título visible**:
 * la franja con el título grande que había antes no aportaba —el primer bloque ya
 * encabeza la página— y se quitó en la revisión de la Fase 5. El `h1` se queda solo
 * para lectores de pantalla y buscadores.
 */
export default async function SitePage({ slug }: { slug: PageSlug }) {
  const [page, blocks, settings] = await Promise.all([
    getPage(slug),
    getPublishedBlocksByPage(slug),
    getSiteSettings(),
  ]);

  // Si falta la fila de la página en la base de datos, es un 404 de verdad: no
  // tiene sentido pintar una página vacía con su URL.
  if (!page) notFound();

  return (
    <>
      <h1 className="sr-only">{page.title}</h1>
      <BlockRenderer blocks={blocks} settings={settings} />
    </>
  );
}

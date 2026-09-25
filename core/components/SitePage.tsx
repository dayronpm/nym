import { notFound } from 'next/navigation';

import BlockRenderer from '@/components/BlockRenderer';
import PageHeading from '@/components/PageHeading';
import { getPublishedBlocksByPage } from '@/data/queries/blocks';
import { getPage } from '@/data/queries/pages';
import { getSiteSettings } from '@/data/queries/site-settings';
import type { PageSlug } from '@/types/settings';

/**
 * Cuerpo común de las páginas públicas que no son Inicio.
 *
 * Las cuatro páginas interiores son idénticas salvo por el slug: encabezado con el
 * título de la página y debajo sus bloques. En vez de repetir esa composición
 * cuatro veces, cada `page.tsx` es una línea que pasa su slug.
 *
 * Lo que sí vive en cada archivo de ruta es `generateMetadata`, porque Next exige
 * exportarlo desde la propia ruta (Fase 1.4).
 *
 * El `<h1>` lo pone `PageHeading` con el `title` de la fila de `pages`, tal como
 * manda el plan para las páginas sin Hero.
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
      <PageHeading title={page.title} />
      <BlockRenderer blocks={blocks} settings={settings} />
    </>
  );
}

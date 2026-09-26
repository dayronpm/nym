import BlockRenderer from '@/components/BlockRenderer';
import { getPublishedBlocksByPage } from '@/data/queries/blocks';
import { getSiteSettings } from '@/data/queries/site-settings';
import { buildPageMetadata } from '@/lib/seo';

/**
 * Página de Inicio.
 *
 * No lleva `PageHeading`: el único `<h1>` de esta página lo pone el bloque `hero`.
 * Por eso Inicio no usa el componente `SitePage`, que sí pinta encabezado.
 */

/**
 * `generateMetadata` tiene que salir del archivo de la ruta: Next solo mira los metadatos
 * que exporta la propia ruta, no los del componente que esta usa.
 */
export function generateMetadata() {
  return buildPageMetadata('inicio');
}

export default async function HomePage() {
  const [blocks, settings] = await Promise.all([
    getPublishedBlocksByPage('inicio'),
    getSiteSettings(),
  ]);

  return <BlockRenderer blocks={blocks} settings={settings} />;
}

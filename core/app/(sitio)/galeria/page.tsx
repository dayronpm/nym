import SitePage from '@/components/SitePage';
import { buildPageMetadata } from '@/lib/seo';

/** Página de Galería y Reels: portafolio visual. */
export default function GaleriaPage() {
  return <SitePage slug="galeria" />;
}

/**
 * `generateMetadata` tiene que salir del archivo de la ruta: Next solo mira los metadatos
 * que exporta la propia ruta, no los del componente que esta usa.
 */
export function generateMetadata() {
  return buildPageMetadata('galeria');
}

import SitePage from '@/components/SitePage';
import { buildPageMetadata } from '@/lib/seo';

/** Página de Nosotros: equipo y preguntas frecuentes. */
export default function NosotrosPage() {
  return <SitePage slug="nosotros" />;
}

/**
 * `generateMetadata` tiene que salir del archivo de la ruta: Next solo mira los metadatos
 * que exporta la propia ruta, no los del componente que esta usa.
 */
export function generateMetadata() {
  return buildPageMetadata('nosotros');
}

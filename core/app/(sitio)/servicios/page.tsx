import SitePage from '@/components/SitePage';
import { buildPageMetadata } from '@/lib/seo';

/** Página de Servicios: el catálogo completo, en modo `full`. */
export default function ServiciosPage() {
  return <SitePage slug="servicios" />;
}

/**
 * `generateMetadata` tiene que salir del archivo de la ruta: Next solo mira los metadatos
 * que exporta la propia ruta, no los del componente que esta usa.
 */
export function generateMetadata() {
  return buildPageMetadata('servicios');
}

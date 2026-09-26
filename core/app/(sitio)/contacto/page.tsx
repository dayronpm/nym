import SitePage from '@/components/SitePage';
import { buildPageMetadata } from '@/lib/seo';

/** Página de Contacto: datos y ubicación con horarios. */
export default function ContactoPage() {
  return <SitePage slug="contacto" />;
}

/**
 * `generateMetadata` tiene que salir del archivo de la ruta: Next solo mira los metadatos
 * que exporta la propia ruta, no los del componente que esta usa.
 */
export function generateMetadata() {
  return buildPageMetadata('contacto');
}

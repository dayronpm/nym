import { PAGE_LABELS, PAGE_SLUGS, type PageSlug } from '@/types/settings';

/**
 * Enlaces de navegación del sitio.
 *
 * Se derivan de `PAGE_SLUGS`, así que añadir una página al esquema la añade al
 * encabezado, al pie y al sitemap a la vez. No hay lista que mantener a mano.
 */
export interface NavItem {
  slug: string;
  label: string;
  /** Ruta pública: la página "inicio" corresponde a `/`. */
  href: string;
}

export const NAV_ITEMS: NavItem[] = PAGE_SLUGS.map((slug) => ({
  slug,
  label: PAGE_LABELS[slug],
  href: slug === 'inicio' ? '/' : `/${slug}`,
}));

/** Ruta pública de una página, a partir de su slug. */
export function pageHref(slug: string): string {
  return slug === 'inicio' ? '/' : `/${slug}`;
}

/**
 * Comprueba que un valor de la base de datos es una página de verdad.
 *
 * Necesario porque un `jsonb` (o un parámetro de la URL) puede traer cualquier cosa: el
 * esquema valida lo que escribe el panel, pero un dato antiguo o manipulado a mano no pasa
 * por ahí.
 */
export function isPageSlug(value: string): value is PageSlug {
  return (PAGE_SLUGS as readonly string[]).includes(value);
}

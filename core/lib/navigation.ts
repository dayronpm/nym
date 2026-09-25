import { PAGE_LABELS, PAGE_SLUGS } from '@/types/settings';

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

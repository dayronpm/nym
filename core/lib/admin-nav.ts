/**
 * Secciones del panel, en un solo sitio.
 *
 * Las usan el menú lateral, el menú de móvil y las tarjetas de Inicio: añadir una sección a
 * esta lista la añade a los tres. `icon` es una **clave**, no un componente, para que el
 * archivo siga siendo datos puros (lo leen servidor y cliente).
 *
 * El orden de aquí es el orden del menú y el de las tarjetas: las secciones más usadas van
 * primero, como en Odoo.
 */
export type AdminIconName =
  | 'home'
  | 'pages'
  | 'catalog'
  | 'images'
  | 'business'
  | 'seo'
  | 'appearance';

export interface AdminSection {
  href: string;
  label: string;
  /** Frase corta para la tarjeta de Inicio. */
  description: string;
  icon: AdminIconName;
}

/** La portada del panel, que también es el primer elemento del menú. */
export const ADMIN_HOME: AdminSection = {
  href: '/admin',
  label: 'Inicio',
  description: 'El índice de todas las secciones.',
  icon: 'home',
};

/** Las secciones de edición. */
export const ADMIN_SECTIONS: AdminSection[] = [
  {
    href: '/admin/paginas',
    label: 'Páginas y bloques',
    description: 'El contenido de las cinco páginas.',
    icon: 'pages',
  },
  {
    href: '/admin/servicios',
    label: 'Servicios',
    description: 'El catálogo único que usan Inicio y la página de Servicios.',
    icon: 'catalog',
  },
  {
    href: '/admin/imagenes',
    label: 'Imágenes',
    description: 'Todo lo subido al bucket, para reutilizar sus rutas.',
    icon: 'images',
  },
  {
    href: '/admin/negocio',
    label: 'Negocio',
    description: 'Marca, contacto y horarios.',
    icon: 'business',
  },
  {
    href: '/admin/seo',
    label: 'SEO',
    description: 'Títulos, descripciones e imagen al compartir.',
    icon: 'seo',
  },
  {
    href: '/admin/apariencia',
    label: 'Apariencia',
    description: 'Colores, tipografías y esquinas.',
    icon: 'appearance',
  },
];

/** El menú completo del panel: Inicio y las secciones. */
export const ADMIN_MENU: AdminSection[] = [ADMIN_HOME, ...ADMIN_SECTIONS];

/** ¿Esta ruta es de esta sección? Se usa para marcar el elemento activo del menú. */
export function isSectionActive(pathname: string, href: string): boolean {
  if (href === '/admin') return pathname === '/admin';
  return pathname === href || pathname.startsWith(`${href}/`);
}

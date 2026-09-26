/** Shim de raíz. Implementación en `core/app/sitemap.ts`. */
export { default } from '@/app/sitemap';

/**
 * El `revalidate` se declara **literal aquí**, no se reexporta: Next lo lee con análisis
 * estático del archivo de la ruta y un reexport se le escapa (es la misma trampa que dejó
 * al middleware corriendo en todas las rutas).
 */
export const revalidate = 3600;

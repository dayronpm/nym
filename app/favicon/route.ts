/** Shim de raíz. Implementación en `core/app/favicon/route.ts`. */
export { GET } from '@/app/favicon/route';

/**
 * El `revalidate` se declara literal, no se reexporta: Next lo lee con análisis estático
 * del archivo de la ruta y un reexport se le escapa (la misma trampa del middleware).
 */
export const revalidate = 3600;

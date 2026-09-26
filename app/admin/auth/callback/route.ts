/** Shim de raíz. Implementación en `core/app/admin/auth/callback/route.ts`. */
export { GET } from '@/app/admin/auth/callback/route';

/**
 * `force-dynamic` literal, no reexportado: la ruta escribe cookies de sesión, así que no
 * puede cachearse, y Next lee esta configuración con análisis estático del archivo de la
 * ruta (un reexport se le escapa, como le pasó al `matcher` del middleware).
 */
export const dynamic = 'force-dynamic';

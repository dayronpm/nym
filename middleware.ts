/**
 * Shim de raíz. Implementación en `core/middleware.ts`.
 *
 * Next.js exige que el middleware esté en la raíz del proyecto (o en `src/`).
 */
export { middleware, config } from '@/middleware';

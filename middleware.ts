/**
 * Shim de raíz. Implementación en `core/middleware.ts`.
 *
 * Next.js exige que el middleware esté en la raíz del proyecto (o en `src/`).
 *
 * ⚠️ El objeto `config` se declara aquí LITERAL, nunca reexportado.
 *
 * Motivo comprobado: Next.js extrae `config.matcher` del archivo de middleware
 * mediante análisis estático y no sigue los reexports. Cuando este archivo hacía
 * `export { middleware, config } from '@/middleware'`, el matcher se perdía y
 * Next aplicaba el middleware a TODAS las rutas (`^/.*$`), de modo que el sitio
 * público redirigía a /admin/login sin sesión.
 *
 * Regla: cualquier `config` de middleware va declarado en este archivo.
 */
export { middleware } from '@/middleware';

export const config = {
  matcher: ['/admin/:path*'],
};

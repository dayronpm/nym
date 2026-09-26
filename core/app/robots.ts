import type { MetadataRoute } from 'next';

import { getSiteUrl } from '@/config/env';

/**
 * robots.txt
 *
 * `/admin` se excluye del rastreo, pero conviene entender el matiz: una URL
 * bloqueada en robots.txt todavía puede aparecer en los resultados de búsqueda
 * (sin descripción), porque el buscador no puede leerla para saber que no debe
 * indexarla.
 *
 * La protección real contra indexación es el encabezado
 * `X-Robots-Tag: noindex, nofollow` que aplica `next.config.js` a `/admin/*`,
 * más el `robots: { index: false }` de los metadatos del panel. Este archivo es
 * la tercera capa, no la única.
 *
 * Aquí se declara además el `sitemap.xml`, para que los buscadores lo encuentren sin
 * tener que adivinarlo (y sin depender de que lo envíen a mano en Search Console).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/admin/'],
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}

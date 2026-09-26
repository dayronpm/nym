import { getSiteSettings } from '@/data/queries/site-settings';

/**
 * Favicon.
 *
 * En vez de un archivo estático se dibuja un **monograma**: la inicial del negocio sobre
 * el color de acento del tema. Así la plantilla no arrastra ningún binario, el icono se
 * adapta solo al nombre y a la paleta de cada cliente, y ninguna copia del repositorio se
 * queda con un favicon que ya no corresponde.
 *
 * Es una ruta (`/favicon`) y no un `app/icon.svg` estático por un motivo de estructura:
 * los archivos estáticos de `app/` no se pueden reexportar desde `core/` con un shim, así
 * que habría que duplicarlos y existirían dos originales. Al ser un módulo, el shim de
 * una línea sí funciona.
 *
 * Cuando el panel permita subir un favicon propio (Fase 2), esta ruta lo servirá y el
 * monograma quedará como respaldo.
 */
export const revalidate = 3600;

/** Escapa el texto que va dentro del SVG: el nombre del negocio lo escribe el dueño. */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function GET(): Promise<Response> {
  const settings = await getSiteSettings();

  const initial = settings.brand.name.trim().charAt(0).toUpperCase() || '·';
  // Los colores del tema están validados como hexadecimal por el esquema, así que se
  // pueden interpolar en el SVG sin riesgo.
  const { primary, on_primary: onPrimary } = settings.theme.colors;

  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img">',
    `<rect width="64" height="64" rx="14" fill="${primary}"/>`,
    `<text x="32" y="45" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif"`,
    ` font-size="38" fill="${onPrimary}">${escapeXml(initial)}</text>`,
    '</svg>',
  ].join('');

  return new Response(svg, {
    headers: {
      'content-type': 'image/svg+xml; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
}

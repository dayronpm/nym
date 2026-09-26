import { z } from 'zod';

/**
 * Validadores reutilizables.
 *
 * Los esquemas de los bloques y de `site_settings` importan de aquí para no
 * repetir expresiones regulares ni mensajes de error.
 *
 * **Marca `kind:`** — los validadores propios se describen con `.describe('kind:…')`. Es API
 * pública de zod y es lo que permite que el panel genere el input correcto (un selector de
 * color, un campo de hora, uno de teléfono) sin adivinar el tipo por el nombre del campo ni
 * inspeccionar la expresión regular. Al vivir aquí, cualquier esquema que use `hexColor()`
 * hereda el selector de color: la información está en un solo sitio. Ver `core/lib/zod-form.ts`.
 */

/** Color hexadecimal de 3 o 6 dígitos (tokens del tema). */
export const HEX_COLOR_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/** Hora en formato 24 h, por ejemplo "09:00". */
export const TIME_24H_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

/** WhatsApp: solo dígitos con código de país, sin "+" (ej.: "50760000000"). */
export const WHATSAPP_PATTERN = /^\d{8,15}$/;

/** Teléfono para el enlace `tel:` (ej.: "+50760000000"). */
export const PHONE_PATTERN = /^\+?\d{7,15}$/;

export function hexColor(message = 'Usa un color hexadecimal, por ejemplo #B0603F.') {
  return z.string().regex(HEX_COLOR_PATTERN, message).describe('kind:color');
}

export function time24h(message = 'Usa el formato 24 h, por ejemplo 09:00.') {
  return z.string().regex(TIME_24H_PATTERN, message).describe('kind:time');
}

export function whatsappNumber(message = 'Solo dígitos con código de país, sin "+".') {
  return z.string().regex(WHATSAPP_PATTERN, message).describe('kind:tel');
}

export function phoneNumber(message = 'Teléfono inválido. Ejemplo: +50760000000.') {
  return z.string().regex(PHONE_PATTERN, message).describe('kind:tel');
}

/** Dominio real de un enlace de Instagram (incluye subdominios). */
export function isInstagramUrl(value: string): boolean {
  return matchesHost(value, (host) => host === 'instagram.com' || host.endsWith('.instagram.com'));
}

/** Dominio real de un enlace de TikTok, incluidos los acortadores vm./vt. */
export function isTiktokUrl(value: string): boolean {
  return matchesHost(value, (host) => host === 'tiktok.com' || host.endsWith('.tiktok.com'));
}

/**
 * URL de "Insertar un mapa" de Google Maps.
 *
 * Se exige el dominio propio de Google, para no incrustar iframes de terceros desde el
 * panel. Se aceptan las dos formas que Google sirve:
 *  - la del botón "Insertar un mapa" (`/maps/embed?pb=...`);
 *  - la corta `.../maps?q=<lugar>&output=embed`, que Google sigue sirviendo y que es la
 *    que casi todo el mundo copia de la barra de direcciones.
 * Exigir solo la primera rechazaba la segunda sin ganar nada en seguridad.
 */
export function isGoogleMapsEmbedUrl(value: string): boolean {
  return matchesHost(
    value,
    (host) =>
      host === 'google.com' || host.endsWith('.google.com') || host.endsWith('.google.com.pa'),
    (url) =>
      url.pathname.startsWith('/maps/embed') ||
      (url.pathname.startsWith('/maps') && url.searchParams.get('output') === 'embed'),
  );
}

function matchesHost(
  value: string,
  hostMatches: (host: string) => boolean,
  urlMatches?: (url: URL) => boolean,
): boolean {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return false;
  }

  if (parsed.protocol !== 'https:') return false;
  if (!hostMatches(parsed.hostname.toLowerCase())) return false;
  if (urlMatches && !urlMatches(parsed)) return false;
  return true;
}

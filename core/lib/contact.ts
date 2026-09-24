import type { ContactSettings } from '@/types/settings';

/**
 * Enlaces de contacto.
 *
 * Los usan el encabezado, el pie y los bloques `hero`, `services`,
 * `booking_cta`, `contact` y `reels`. Se centralizan aquí para que la forma del
 * enlace de WhatsApp sea idéntica en todo el sitio.
 */

/**
 * Enlace de WhatsApp con mensaje prellenado.
 *
 * Devuelve `null` si el negocio no ha configurado su número: en ese caso los
 * bloques no deben mostrar el botón (regla de `booking_cta`).
 */
export function buildWhatsappUrl(contact: ContactSettings, message: string): string | null {
  if (!contact.whatsapp) return null;
  return `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(message)}`;
}

/** Mensaje genérico de reserva. */
export function genericBookingMessage(contact: ContactSettings): string {
  return contact.booking_message_generic;
}

/**
 * Mensaje de reserva para un servicio concreto.
 *
 * Reemplaza `{servicio}` en la plantilla del negocio. Si la plantilla no
 * contuviera el marcador, se añade el nombre al final para no perder el dato.
 */
export function serviceBookingMessage(contact: ContactSettings, serviceName: string): string {
  const template = contact.booking_message_service;
  if (template.includes('{servicio}')) {
    return template.replace('{servicio}', serviceName);
  }
  return `${template} ${serviceName}`.trim();
}

/** Enlace `tel:` a partir del teléfono configurado. */
export function buildPhoneUrl(contact: ContactSettings): string | null {
  if (!contact.phone) return null;
  return `tel:${contact.phone}`;
}

/** Enlace `mailto:`. */
export function buildEmailUrl(contact: ContactSettings): string | null {
  if (!contact.email) return null;
  return `mailto:${contact.email}`;
}

/**
 * Redes sociales configuradas, ya normalizadas para pintar botones o iconos.
 */
export function socialLinks(contact: ContactSettings): {
  platform: 'instagram' | 'tiktok' | 'facebook';
  label: string;
  url: string;
}[] {
  const links: { platform: 'instagram' | 'tiktok' | 'facebook'; label: string; url: string }[] = [];

  if (contact.instagram_url) {
    links.push({ platform: 'instagram', label: 'Instagram', url: contact.instagram_url });
  }
  if (contact.tiktok_url) {
    links.push({ platform: 'tiktok', label: 'TikTok', url: contact.tiktok_url });
  }
  if (contact.facebook_url) {
    links.push({ platform: 'facebook', label: 'Facebook', url: contact.facebook_url });
  }

  return links;
}

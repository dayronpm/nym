import { z } from 'zod';

import { MoreLinkSchema } from '@/blocks/links';

/**
 * Bloque `contact` — Contacto.
 *
 * Decisión: **datos y botones, sin formulario**. El formulario (con envío por correo
 * o con bandeja de mensajes en el panel) queda para el módulo futuro de reservas.
 *
 * Todos los datos salen de `site_settings.contact`; este bloque solo decide qué se
 * muestra. Cada dato aparece solo si existe en la configuración Y su `show_*` está
 * activo.
 */
export const ContactSchema = z.object({
  title: z.string().max(80).default('Contáctanos'),
  subtitle: z.string().max(200).optional(),
  show_whatsapp: z.boolean().default(true),
  show_phone: z.boolean().default(true),
  show_email: z.boolean().default(true),
  show_address: z.boolean().default(true),
  show_social: z.boolean().default(true),
  /** Enlace a la página de contacto completa (mapa y horarios), desde Inicio. */
  more: MoreLinkSchema.optional(),
});

export type ContactData = z.infer<typeof ContactSchema>;

export const CONTACT_DEFAULTS: ContactData = ContactSchema.parse({
  title: 'Contáctanos',
  show_whatsapp: true,
  show_phone: true,
  show_email: true,
  show_address: true,
  show_social: true,
});

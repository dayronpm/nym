import { z } from 'zod';

import { MediaRef } from '@/blocks/shared';

/**
 * Bloque `hero` — portada de Inicio.
 *
 * Decisión: texto e imagen lado a lado; en móvil la imagen va arriba y el texto
 * debajo.
 *
 * Este esquema es el CONTRATO del bloque: no se pueden cambiar nombres de
 * campos sin subir `version` y escribir una migración de contenido.
 */
export const HeroSchema = z.object({
  /** Texto pequeño sobre el título. */
  eyebrow: z.string().max(60).optional(),
  title: z.string().min(1, 'El título es obligatorio.').max(100).default('Tu momento de calma y bienestar'),
  subtitle: z.string().max(240).optional(),
  image: MediaRef.optional(),
  image_position: z.enum(['right', 'left']).default('right'),
  /** Abre WhatsApp con el mensaje genérico de reserva. */
  primary_cta_label: z.string().max(40).default('Reservar por WhatsApp'),
  /** Opcional. En el preset "Spa" apunta a /servicios. */
  secondary_cta: z
    .object({
      label: z.string().max(40),
      /** Ruta interna (ej.: "/servicios") o URL completa. */
      href: z.string().max(200),
    })
    .optional(),
});

export type HeroData = z.infer<typeof HeroSchema>;

export const HERO_DEFAULTS: HeroData = HeroSchema.parse({
  title: 'Tu momento de calma y bienestar',
  image_position: 'right',
  primary_cta_label: 'Reservar por WhatsApp',
  secondary_cta: { label: 'Ver servicios', href: '/servicios' },
});

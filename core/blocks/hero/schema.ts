import { z } from 'zod';

import { MediaRef } from '@/blocks/shared';

/**
 * Bloque `hero` — portada de Inicio.
 *
 * Decisión: texto e imagen lado a lado; en móvil la imagen va arriba y el texto
 * debajo.
 *
 * **v2 — se quitaron los botones.** El `primary_cta` (WhatsApp) y el `secondary_cta`
 * ("Ver servicios") se eliminaron por decisión de producto: la página ya tiene un
 * botón de reserva fijo en el encabezado y otro al final, así que repetirlo aquí
 * sobraba; y sin botones la portada empieza de forma más natural.
 *
 * Al quitar campos NO hace falta migrar el contenido existente: zod descarta las
 * claves desconocidas al validar, así que los datos antiguos siguen funcionando. Se
 * sube `version` igualmente porque el contrato del bloque ha cambiado.
 *
 * Este esquema es el CONTRATO del bloque: no se pueden cambiar nombres de campos
 * sin subir `version` y escribir una migración de contenido.
 */
export const HeroSchema = z.object({
  /** Texto pequeño sobre el título. */
  eyebrow: z.string().max(60).optional(),
  title: z
    .string()
    .min(1, 'El título es obligatorio.')
    .max(100)
    .default('Tu momento de calma y bienestar'),
  subtitle: z.string().max(240).optional(),
  image: MediaRef.optional(),
  /** Posición de la imagen en escritorio. En móvil siempre va arriba. */
  image_position: z.enum(['right', 'left']).default('right'),
});

export type HeroData = z.infer<typeof HeroSchema>;

export const HERO_DEFAULTS: HeroData = HeroSchema.parse({
  title: 'Tu momento de calma y bienestar',
  image_position: 'right',
});

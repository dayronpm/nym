import { z } from 'zod';

import { MoreLinkSchema, SourcePageRef } from '@/blocks/links';
import { MediaRef } from '@/blocks/shared';

/**
 * Bloque `reels` — Reels / Redes.
 *
 * Decisión: **tarjetas con miniatura subida a mano y enlace**, sin embeds. Los
 * scripts de Instagram y TikTok pesan mucho y frenan la página; miniatura más enlace
 * es mucho más ligero.
 *
 * Expectativa realista: los enlaces desde redes suelen ser `nofollow`, así que el
 * beneficio es tráfico cruzado y coherencia de marca, no posicionamiento directo.
 */
export const ReelItem = z.object({
  id: z.string(),
  platform: z.enum(['instagram', 'tiktok']),
  url: z.string().url('La URL del reel no es válida.'),
  title: z.string().max(100).optional(),
  /** Miniatura obligatoria: sin ella la tarjeta no tiene nada que enseñar. */
  thumbnail: MediaRef,
  enabled: z.boolean().default(true),
});

export type ReelItem = z.infer<typeof ReelItem>;

export const ReelsSchema = z.object({
  title: z.string().max(80).default('Síguenos en redes'),
  subtitle: z.string().max(200).optional(),
  /** Botones a los perfiles configurados en `site_settings.contact`. */
  show_profile_links: z.boolean().default(true),
  items: z.array(ReelItem).max(24).default([]),
  /** Cuántos reels se ven. Sin valor, todos: es el corte de la portada. */
  limit: z.number().int().min(1).max(24).optional(),
  /** De qué página salen los reels, para el resumen de Inicio. */
  source_page: SourcePageRef,
  /** Enlace a la sección completa, para la instancia de Inicio. */
  more: MoreLinkSchema.optional(),
});

export type ReelsData = z.infer<typeof ReelsSchema>;

export const REELS_DEFAULTS: ReelsData = ReelsSchema.parse({
  title: 'Síguenos en redes',
  show_profile_links: true,
  items: [],
});

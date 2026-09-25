import { z } from 'zod';

import { MoreLinkSchema, SourcePageRef } from '@/blocks/links';
import { MediaRef } from '@/blocks/shared';

/**
 * Bloque `gallery` — Galería.
 *
 * Decisión: cuadrícula uniforme con visor ampliado al tocar una foto. La proporción
 * del recorte es configurable.
 *
 * El visor vive en `GalleryGrid.tsx`, que sí es componente cliente: necesita estado y
 * manejo de teclado. El resto del bloque se renderiza en el servidor.
 */
export const GalleryImage = z.object({
  id: z.string(),
  /** El texto alternativo es obligatorio: lo exige `MediaRef`. */
  image: MediaRef,
  caption: z.string().max(120).optional(),
  enabled: z.boolean().default(true),
});

export type GalleryImage = z.infer<typeof GalleryImage>;

export const GallerySchema = z.object({
  title: z.string().max(80).default('Galería'),
  subtitle: z.string().max(200).optional(),
  /** Recorte uniforme de todas las fotos de la cuadrícula. */
  aspect_ratio: z.enum(['1:1', '4:5', '3:2']).default('4:5'),
  /** Columnas en escritorio. En móvil siempre son 2. */
  columns_desktop: z.union([z.literal(2), z.literal(3), z.literal(4)]).default(3),
  /** Límite de 60 imágenes: más allá, la página deja de ser ágil. */
  images: z.array(GalleryImage).max(60).default([]),
  /** Cuántas fotos se ven. Sin valor, todas: es el corte de la portada. */
  limit: z.number().int().min(1).max(60).optional(),
  /** De qué página salen las fotos, para el resumen de Inicio. */
  source_page: SourcePageRef,
  /** Enlace a la galería completa, para la instancia de Inicio. */
  more: MoreLinkSchema.optional(),
});

export type GalleryData = z.infer<typeof GallerySchema>;

export const GALLERY_DEFAULTS: GalleryData = GallerySchema.parse({
  title: 'Galería',
  aspect_ratio: '4:5',
  columns_desktop: 3,
  images: [],
});

import { z } from 'zod';

/**
 * Tipos compartidos entre todos los bloques.
 *
 * `MediaRef` se define una sola vez aquí y lo reutiliza cualquier bloque que
 * necesite una imagen. Nunca se guarda la URL completa de Storage, solo la ruta
 * relativa dentro del bucket `media`: la URL pública se construye con el
 * cliente de Supabase (ver `core/lib/storage.ts`, Fase 1).
 *
 * Aquí vive también `SHARED_CONTENT_FIELD`, que es lo que hace posible que Inicio
 * resuma las demás secciones sin duplicar contenido. Las referencias a otras páginas
 * (`more`, `source_page`) están en `links.ts`, y no aquí, para no crear un ciclo de
 * importaciones con `core/types/settings.ts`.
 */
export const MediaRef = z.object({
  /** Ruta dentro del bucket, por ejemplo "gallery/3fa2...c1.webp". */
  path: z.string().min(1, 'Falta la ruta de la imagen.'),
  /** Texto alternativo: obligatorio por accesibilidad y SEO. */
  alt: z.string().min(1, 'El texto alternativo es obligatorio.').max(140),
});

export type MediaRef = z.infer<typeof MediaRef>;

/**
 * Qué campo de cada bloque guarda su **contenido** (la lista de elementos).
 *
 * Convención del sistema de bloques: en un bloque, un array es contenido y los
 * escalares son presentación. Por eso un bloque-resumen puede tomar la lista de otra
 * página y quedarse solo con la presentación.
 *
 * Un bloque que no esté en esta tabla no tiene contenido compartible (`hero`,
 * `services` —que ya lee el catálogo único—, `contact`…) y `source_page` no le hace
 * nada.
 */
export const SHARED_CONTENT_FIELD: Record<string, string> = {
  gallery: 'images',
  team: 'members',
  faq: 'items',
  reels: 'items',
};

/** Bucket público único de la plantilla. */
export const MEDIA_BUCKET = 'media';

/** Carpetas del bucket, una por tipo de contenido. */
export const MEDIA_FOLDERS = [
  'hero',
  'services',
  'gallery',
  'team',
  'testimonials',
  'reels',
  'brand',
] as const;

export type MediaFolder = (typeof MEDIA_FOLDERS)[number];

/**
 * Identificador para los elementos de un arreglo dentro de un bloque
 * (servicios, testimonios, equipo, imágenes, reels, preguntas).
 *
 * `crypto.randomUUID()` existe de forma nativa en el navegador y en Node 22+,
 * así que no hace falta añadir ninguna librería para esto.
 */
export function createId(): string {
  return crypto.randomUUID();
}

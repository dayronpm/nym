import { MEDIA_BUCKET, type MediaRef } from '@/blocks/shared';

/**
 * Construcción de URLs públicas de Supabase Storage.
 *
 * Decisión de la v1: la URL se construye en el cliente (opción A). El bucket
 * `media` es de lectura pública, así que no hay ningún secreto que proteger y
 * se evita repetir esta lógica en cada componente.
 */

/**
 * URL pública de un archivo del bucket `media`.
 *
 * Se lee `process.env.NEXT_PUBLIC_SUPABASE_URL` directamente (y no a través de
 * `@/config/env`) por dos motivos: Next sustituye el valor en tiempo de
 * compilación, y así la función no lanza una excepción cuando el proyecto se
 * acaba de clonar y todavía no hay `.env.local`.
 */
export function getPublicMediaUrl(path: string): string | null {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl) return null;

  const cleanBase = baseUrl.replace(/\/+$/, '');
  const cleanPath = path.replace(/^\/+/, '');
  return `${cleanBase}/storage/v1/object/public/${MEDIA_BUCKET}/${cleanPath}`;
}

/** URL pública a partir de un `MediaRef`, o `null` si no hay imagen. */
export function getMediaUrl(media: MediaRef | null | undefined): string | null {
  if (!media) return null;
  return getPublicMediaUrl(media.path);
}

/**
 * Ruta de destino dentro del bucket para un archivo nuevo.
 *
 * Convención: `{carpeta}/{uuid}.webp`. Siempre WebP, porque la compresión se
 * hace en el navegador antes de subir (Fase 2).
 */
export function buildMediaPath(folder: string, id: string): string {
  return `${folder}/${id}.webp`;
}

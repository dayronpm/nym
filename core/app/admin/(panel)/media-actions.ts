'use server';

import { revalidateTag } from 'next/cache';

import { MEDIA_FOLDERS } from '@/blocks/shared';
import { CACHE_TAGS } from '@/data/cache-tags';
import { createSupabaseServerClient } from '@/data/supabase';
import { buildMediaPath } from '@/lib/storage';

/**
 * Subida de una imagen al bucket `media`.
 *
 * El archivo llega **ya comprimido** desde el navegador (`core/lib/compress-image.ts`): aquí no
 * se toca la imagen, solo se guarda. Así el servidor no necesita ninguna dependencia nativa y el
 * cuerpo de la acción se queda en decenas de KB.
 *
 * Se sube con el cliente de servidor, que lleva las **cookies de la sesión**: quien autoriza no
 * es esta función, son las políticas del bucket (`media_insert_admin`). Si alguien sin sesión
 * intentara subir, la base de datos lo rechaza.
 */

export interface UploadMediaResult {
  ok: boolean;
  /** Ruta dentro del bucket, lista para guardar en un `MediaRef`. */
  path?: string;
  /** Mensaje para la interfaz. */
  message: string;
}

/** Tipos que se aceptan. El navegador ya convierte a WebP; esto es la puerta de entrada. */
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

/** Tope de seguridad: la compresión del navegador deja esto muy por debajo. */
const MAX_BYTES = 4 * 1024 * 1024;

export async function uploadMediaAction(formData: FormData): Promise<UploadMediaResult> {
  const file = formData.get('file');
  const folderValue = String(formData.get('folder') ?? '');

  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: 'No llegó ningún archivo.' };
  }

  if (!ACCEPTED_TYPES.includes(file.type)) {
    return { ok: false, message: 'Solo se aceptan imágenes JPG, PNG, WebP o AVIF.' };
  }

  if (file.size > MAX_BYTES) {
    return { ok: false, message: 'La imagen es demasiado grande incluso después de comprimirla.' };
  }

  // La carpeta la elige el formulario, pero se comprueba contra la lista del proyecto: una ruta
  // que venga del navegador no puede escribir donde quiera dentro del bucket.
  const folder = (MEDIA_FOLDERS as readonly string[]).includes(folderValue) ? folderValue : 'gallery';
  const path = buildMediaPath(folder, crypto.randomUUID());

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.storage.from('media').upload(path, file, {
    contentType: file.type,
    cacheControl: '31536000',
    upsert: false,
  });

  if (error) {
    return { ok: false, message: `No se pudo subir la imagen: ${error.message}` };
  }

  // La galería y los bloques no cambian (el archivo todavía no está referenciado en ninguno),
  // pero la pantalla de imágenes lista el bucket y conviene que lo vea al instante.
  revalidateTag(CACHE_TAGS.blocks);

  return { ok: true, path, message: 'Imagen subida.' };
}

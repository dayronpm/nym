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

/**
 * Dónde se está usando una imagen, en palabras que se entienden.
 *
 * Se busca la ruta dentro del contenido guardado (`blocks.data`, la configuración y el `og_image`
 * de cada página). La búsqueda es de texto, no estructural, y a propósito: hay imágenes dentro de
 * listas, de listas anidadas y de grupos de la configuración, y recorrer cada forma posible sería
 * frágil justo donde un fallo significa borrar algo que está en uso. El volumen es diminuto
 * (unas decenas de bloques), así que serializar y buscar es lo más simple que funciona.
 */
async function findMediaUsages(path: string): Promise<string[]> {
  const supabase = createSupabaseServerClient();
  const usages: string[] = [];

  const [blocks, pages, settings] = await Promise.all([
    supabase.from('blocks').select('page,type,data'),
    supabase.from('pages').select('slug,og_image'),
    supabase.from('site_settings').select('brand,seo_defaults,services_catalog').eq('id', 1),
  ]);

  for (const block of blocks.data ?? []) {
    if (JSON.stringify(block.data).includes(path)) {
      usages.push(`el bloque ${block.type} de ${block.page}`);
    }
  }

  for (const page of pages.data ?? []) {
    if (page.og_image && JSON.stringify(page.og_image).includes(path)) {
      usages.push(`la imagen al compartir de ${page.slug}`);
    }
  }

  const configuration = settings.data?.[0];
  if (configuration && JSON.stringify(configuration).includes(path)) {
    usages.push('la configuración del sitio (marca, SEO o catálogo de servicios)');
  }

  return usages;
}

/**
 * Borrado de una imagen del bucket.
 *
 * **No borra si la imagen está en uso**: en ese caso devuelve dónde está y pide quitarla antes.
 * Un borrado que deja un hueco en el sitio público es mucho peor que un borrado que no se deja
 * hacer; y el aviso explica el siguiente paso, no solo que no.
 *
 * Quitar una imagen de un campo (`MediaField`) quita la **referencia**, no el archivo: ese es el
 * camino normal, y este borrado es para el archivo que ya no está en ninguna parte.
 */
export async function deleteMediaAction(path: string): Promise<UploadMediaResult> {
  if (!path || path.includes('..') || path.startsWith('/')) {
    return { ok: false, message: 'Esa ruta no es válida.' };
  }

  const usages = await findMediaUsages(path);

  if (usages.length > 0) {
    return {
      ok: false,
      message: `No se puede borrar: la imagen está en uso en ${usages.join(', ')}. Quítala de ahí primero.`,
    };
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.storage.from('media').remove([path]);

  if (error) {
    return { ok: false, message: `No se pudo borrar la imagen: ${error.message}` };
  }

  return { ok: true, message: 'Imagen borrada. Ya no está en el bucket.' };
}

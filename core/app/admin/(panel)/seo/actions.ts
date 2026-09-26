'use server';

import { revalidatePath, revalidateTag } from 'next/cache';

import { CACHE_TAGS } from '@/data/cache-tags';
import { ValidationError } from '@/data/errors';
import { updatePageSettings, type PageSettingsPatch } from '@/data/mutations/update-page';
import { isPageSlug, pageHref } from '@/lib/navigation';

/**
 * Guardado de los metadatos y el SEO de una página desde el panel.
 *
 * Se revalida **antes** que al guardar un bloque, y a propósito: el título y la descripción
 * cambian el `<head>` de **esa** página, no el de las demás. No hace falta rehacer Inicio (que
 * resume contenido, no metadatos) ni el layout entero.
 *
 *  1. `revalidateTag` tira la lectura cacheada de la tabla `pages`, que es la que usan
 *     `generateMetadata` y el `sitemap.xml`.
 *  2. `revalidatePath` rehace el HTML de esa página, porque las públicas se sirven con ISR y su
 *     HTML está cacheado hasta una hora.
 */

export interface SavePageResult {
  ok: boolean;
  /** Errores por ruta de campo (`meta_title`), listos para el formulario. */
  errors: Record<string, string>;
  /** Mensaje general: confirmación o el motivo del fallo. */
  message: string;
}

export async function savePageSettingsAction(
  slug: string,
  value: unknown,
): Promise<SavePageResult> {
  if (!isPageSlug(slug)) {
    return { ok: false, errors: {}, message: 'Esa página no existe.' };
  }

  // El `as` es de tipos, no de datos: lo que entra se valida con `PageSettings` antes de
  // escribir, así que el esquema sigue siendo quien decide si un dato vale.
  const patch = value as PageSettingsPatch;

  try {
    await updatePageSettings(slug, patch);
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        ok: false,
        errors: error.fieldErrors,
        message: 'Hay campos que revisar. Los marcados son los que fallan.',
      };
    }

    return {
      ok: false,
      errors: {},
      message: 'No se pudo guardar. Inténtalo de nuevo; si sigue fallando, revisa la consola del servidor.',
    };
  }

  revalidateTag(CACHE_TAGS.pages);
  revalidatePath(pageHref(slug));

  return { ok: true, errors: {}, message: 'Guardado. El sitio ya muestra el cambio.' };
}

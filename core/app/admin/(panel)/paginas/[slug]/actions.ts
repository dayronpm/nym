'use server';

import { revalidatePath, revalidateTag } from 'next/cache';

import { CACHE_TAGS } from '@/data/cache-tags';
import { ValidationError } from '@/data/errors';
import { saveBlock } from '@/data/mutations/save-block';
import { pageHref, isPageSlug } from '@/lib/navigation';

/**
 * Guardado de un bloque desde el panel.
 *
 * Es una Server Action y no una API propia porque no hace falta una: el formulario del panel
 * la llama directamente, la sesión se valida igual que en el resto del panel (cookies + RLS)
 * y el resultado vuelve como datos, con los errores por campo listos para pintar.
 *
 * Al guardar se invalida **dos veces**, y las dos son necesarias:
 *
 *   1. `revalidateTag` tira la lectura cacheada de los bloques, para que la próxima lectura
 *      traiga el contenido nuevo.
 *   2. `revalidatePath` rehace el HTML de la página. Sin esto, el cambio tardaría hasta una
 *      hora en verse, porque las páginas públicas se sirven con ISR y su HTML está cacheado.
 *
 * Y se rehace **Inicio además de la página del bloque** cuando no es Inicio: la portada resume
 * todas las secciones leyendo los bloques de las demás, así que un cambio en `/galeria` la
 * deja desfasada. Es justo el olvido que se documentó en la Fase 1.4.
 */

export interface SaveBlockResult {
  ok: boolean;
  /** Errores por ruta de campo (`images.0.caption`), listos para el formulario. */
  errors: Record<string, string>;
  /** Mensaje general: confirmación o el motivo del fallo. */
  message: string;
}

export interface SaveBlockActionInput {
  id: string;
  /** Clave del bloque en el registro. */
  type: string;
  /** Página a la que pertenece, tal como está en la base de datos. */
  page: string;
  /** Contenido sin validar. */
  data: unknown;
}

export async function saveBlockAction({
  id,
  type,
  page,
  data,
}: SaveBlockActionInput): Promise<SaveBlockResult> {
  try {
    await saveBlock({ id, type, data });
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        ok: false,
        errors: error.fieldErrors,
        message: 'Hay campos que revisar. Los marcados en rojo son los que fallan.',
      };
    }

    return {
      ok: false,
      errors: {},
      message: 'No se pudo guardar. Inténtalo de nuevo; si sigue fallando, revisa la consola del servidor.',
    };
  }

  revalidateTag(CACHE_TAGS.blocks);

  if (isPageSlug(page)) {
    revalidatePath(pageHref(page));
    if (page !== 'inicio') revalidatePath('/');
  }

  return { ok: true, errors: {}, message: 'Guardado. El sitio ya muestra el cambio.' };
}

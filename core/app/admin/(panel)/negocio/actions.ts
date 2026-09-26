'use server';

import { revalidatePath, revalidateTag } from 'next/cache';

import { CACHE_TAGS } from '@/data/cache-tags';
import { ValidationError } from '@/data/errors';
import {
  updateSiteSettings,
  type SiteSettingsPatch,
} from '@/data/mutations/update-site-settings';

/**
 * Guardado de un grupo de la configuración del sitio.
 *
 * Cada pantalla manda **solo su sección** (`brand`, `contact`, `hours`…), nunca la fila entera:
 * así dos pantallas no pueden pisarse los cambios entre ellas. Aun así, la mutación valida el
 * resultado **completo** con el esquema maestro antes de escribir, así que un parche que deje la
 * configuración en un estado que el sitio no sepa leer no llega a la base de datos.
 *
 * La revalidación es distinta a la de un bloque, y es importante: la configuración se ve en
 * **todas** las páginas (encabezado, pie, horarios), así que se rehace el layout completo y no
 * una ruta suelta. `revalidatePath('/', 'layout')` revalida el layout raíz y todo lo que cuelga
 * de él.
 */

export type SettingsSection = keyof SiteSettingsPatch;

export interface SaveSettingsResult {
  ok: boolean;
  errors: Record<string, string>;
  message: string;
}

export async function saveSettingsAction(
  section: SettingsSection,
  value: unknown,
): Promise<SaveSettingsResult> {
  // El `as` es de tipos, no de datos: el cliente manda una sección concreta y lo que entra se
  // valida con el esquema maestro, que es quien decide si un dato vale.
  const patch = { [section]: value } as SiteSettingsPatch;

  try {
    await updateSiteSettings(patch);
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

  revalidateTag(CACHE_TAGS.siteSettings);
  revalidatePath('/', 'layout');

  return { ok: true, errors: {}, message: 'Guardado. El sitio ya muestra el cambio.' };
}

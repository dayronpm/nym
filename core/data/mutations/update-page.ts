import { DataError, ValidationError } from '@/data/errors';
import { getPage } from '@/data/queries/pages';
import { createSupabaseServerClient } from '@/data/supabase';
import { PageSettings, type PageSlug } from '@/types/settings';

/**
 * Guarda los metadatos y el SEO de una página.
 *
 * Es el equivalente de `update-site-settings` para la tabla `pages`: lee la fila actual, aplica
 * el cambio, valida el resultado **completo** con `PageSettings` y solo entonces escribe.
 *
 * Detalle que importa: en la base de datos los opcionales son `null` y en el esquema zod son
 * `undefined` (`optional()` no acepta `null`). Al leer se traduce en `queries/pages.ts` y al
 * escribir se traduce aquí; si no, un campo que el dueño borra se quedaría como estaba.
 */

/** Campos de una página que el panel puede editar. El `slug` no: es la identidad de la fila. */
export type PageSettingsPatch = Partial<
  Pick<PageSettings, 'title' | 'meta_title' | 'meta_description' | 'og_image'>
>;

export async function updatePageSettings(
  slug: PageSlug,
  patch: PageSettingsPatch,
): Promise<PageSettings> {
  const current = await getPage(slug);

  if (!current) {
    throw new DataError(`No existe la página "${slug}".`);
  }

  const merged = PageSettings.safeParse({ ...current, ...patch });

  if (!merged.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of merged.error.issues) {
      const field = issue.path.join('.') || '_';
      // Se conserva el primer error de cada campo: es el que ve el usuario.
      if (!fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    throw new ValidationError('Los datos de la página no son válidos.', fieldErrors);
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from('pages')
    .update({
      title: merged.data.title,
      meta_title: merged.data.meta_title ?? null,
      meta_description: merged.data.meta_description ?? null,
      og_image: merged.data.og_image ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('slug', slug);

  if (error) {
    throw new DataError(`No se pudo guardar la página "${slug}".`, { cause: error });
  }

  return merged.data;
}

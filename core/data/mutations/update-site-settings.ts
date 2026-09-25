import { DataError, ValidationError } from '@/data/errors';
import { getSiteSettings } from '@/data/queries/site-settings';
import { createSupabaseServerClient } from '@/data/supabase';
import { SiteSettings } from '@/types/settings';

/**
 * Campos de `site_settings` que el panel puede editar.
 *
 * Cada pantalla envía solo su sección — `/admin/negocio` manda `contact` y
 * `hours`, `/admin/apariencia` manda `theme`, etc. — y el resto se conserva.
 */
export type SiteSettingsPatch = Partial<
  Pick<SiteSettings, 'brand' | 'theme' | 'contact' | 'hours' | 'services_catalog' | 'seo_defaults'>
>;

/**
 * Guarda una o varias secciones de la configuración del sitio.
 *
 * Lee la fila actual, aplica el cambio, valida el resultado **completo** con el
 * esquema maestro y solo entonces escribe. Validar el resultado completo (y no
 * solo el parche) evita dejar la fila en un estado que el sitio no pueda leer.
 */
export async function updateSiteSettings(patch: SiteSettingsPatch): Promise<SiteSettings> {
  const current = await getSiteSettings();
  const merged = SiteSettings.safeParse({ ...current, ...patch });

  if (!merged.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of merged.error.issues) {
      const field = issue.path.join('.') || '_';
      // Se conserva el primer error de cada campo: es el que ve el usuario.
      if (!fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    throw new ValidationError('La configuración del sitio no es válida.', fieldErrors);
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from('site_settings')
    .update({
      brand: merged.data.brand,
      currency: merged.data.currency,
      timezone: merged.data.timezone,
      theme: merged.data.theme,
      contact: merged.data.contact,
      hours: merged.data.hours,
      services_catalog: merged.data.services_catalog,
      seo_defaults: merged.data.seo_defaults,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 1);

  if (error) {
    throw new DataError('No se pudo guardar la configuración del sitio.', { cause: error });
  }

  return merged.data;
}

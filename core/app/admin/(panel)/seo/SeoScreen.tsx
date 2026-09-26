'use client';

import DraftCard from '@/components/admin/DraftCard';
import DynamicForm from '@/components/admin/DynamicForm';
import { pageHref } from '@/lib/navigation';
import { PAGE_LABELS, PageSettings, SeoDefaults } from '@/types/settings';
import type { PageSettings as PageMeta, SiteSettings } from '@/types/settings';

import { saveSettingsAction } from '../settings-actions';

import { savePageSettingsAction } from './actions';

/**
 * SEO: lo que leen los buscadores y lo que se ve al compartir un enlace.
 *
 * Tiene dos partes:
 *
 *  - **Valores por defecto del sitio**: el tipo de negocio para Google y la imagen de reserva.
 *  - **Una tarjeta por página**, porque el título, la descripción y la imagen son de cada
 *    página. Cada tarjeta se guarda sola, y solo rehace esa página.
 *
 * El campo `slug` se quita del formulario con `omit` en lugar de esconderlo: es la identidad de
 * la fila y el dueño no tiene nada que decidir ahí, así que no aparece ni ocupa sitio.
 */

/** Los campos de una página que se editan aquí. El `slug` no se toca. */
const PAGE_FIELDS = PageSettings.omit({ slug: true });

export default function SeoScreen({
  settings,
  pages,
}: {
  settings: SiteSettings;
  pages: PageMeta[];
}) {
  return (
    <div className="space-y-6">
      <DraftCard
        title="Valores por defecto"
        description="Lo que se aplica a todo el sitio. Cada página puede sustituir la imagen, pero no el tipo de negocio."
        initialValue={settings.seo_defaults}
        save={(value) => saveSettingsAction('seo_defaults', value)}
        errorPrefix="seo_defaults."
      >
        {(form) => (
          <DynamicForm
            schema={SeoDefaults}
            labelsKey="seo_defaults"
            initialData={form.value}
            onChange={form.onChange}
            errors={form.errors}
            disabled={form.disabled}
          />
        )}
      </DraftCard>

      {pages.map((page) => (
        <DraftCard
          key={page.slug}
          title={PAGE_LABELS[page.slug]}
          description={`Lo que se ve en Google y al compartir ${pageHref(page.slug)}.`}
          initialValue={page}
          save={(value) => savePageSettingsAction(page.slug, value)}
        >
          {(form) => (
            <DynamicForm
              schema={PAGE_FIELDS}
              labelsKey="page_meta"
              idPrefix={page.slug}
              initialData={form.value}
              onChange={form.onChange}
              errors={form.errors}
              disabled={form.disabled}
            />
          )}
        </DraftCard>
      ))}
    </div>
  );
}

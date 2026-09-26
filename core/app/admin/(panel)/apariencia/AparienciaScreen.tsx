'use client';

import DraftCard from '@/components/admin/DraftCard';
import DynamicForm from '@/components/admin/DynamicForm';
import { SiteTheme, type SiteSettings } from '@/types/settings';

import { saveSettingsAction } from '../settings-actions';

/**
 * Apariencia: la paleta, las tipografías y las esquinas de todo el sitio.
 *
 * Es una sola tarjeta y no tres, a diferencia de Negocio, porque el tema es una unidad: los
 * colores se eligen unos contra otros (el texto contra el fondo, el acento contra su hover) y
 * guardarlos por separado dejaría combinaciones a medias.
 *
 * El formulario sale del mismo `SiteTheme` que valida el servidor, así que los límites están en
 * un solo sitio: el contraste mínimo entre texto y fondo lo comprueba el esquema, no una
 * comprobación suelta en la pantalla. Los radios y las fuentes se eligen de listas cerradas
 * (`form-labels.ts`) porque el sitio solo sabe aplicar esos valores.
 */
export default function AparienciaScreen({ settings }: { settings: SiteSettings }) {
  return (
    <DraftCard
      title="Tema"
      description="Lo que cambia el aspecto de todas las páginas. Al guardar se aplica al sitio entero, sin tocar código."
      initialValue={settings.theme}
      save={(value) => saveSettingsAction('theme', value)}
      errorPrefix="theme."
    >
      {(form) => (
        <DynamicForm
          schema={SiteTheme}
          labelsKey="theme"
          initialData={form.value}
          onChange={form.onChange}
          errors={form.errors}
          disabled={form.disabled}
        />
      )}
    </DraftCard>
  );
}

'use client';

import FormMessage from '@/components/admin/FormMessage';
import { useDraft } from '@/components/admin/useDraft';

import { saveSettingsAction, type SettingsSection } from './actions';

/**
 * Tarjeta de un grupo de configuración: título, aviso de cambios sin guardar, guardar y los
 * campos dentro.
 *
 * Los campos llegan como función porque cada grupo se edita distinto: la mayoría con el
 * formulario generado desde su esquema, y los horarios con uno escrito a mano (son siete días
 * fijos, y añadir o quitar días no tiene sentido).
 *
 * Los errores que devuelve el servidor vienen con la ruta del esquema maestro
 * (`contact.email`), así que aquí se les quita el prefijo de la sección para que el formulario
 * los encuentre donde toca (`email`). Sin esto, los errores de configuración no se verían.
 */

export interface DraftCardProps<T> {
  title: string;
  description?: string;
  /** Sección de `site_settings` que guarda esta tarjeta. */
  section: SettingsSection;
  initialValue: T;
  children: (props: {
    value: T;
    onChange: (next: T) => void;
    disabled: boolean;
    errors: Record<string, string>;
  }) => React.ReactNode;
}

export default function DraftCard<T>({
  title,
  description,
  section,
  initialValue,
  children,
}: DraftCardProps<T>) {
  const draft = useDraft<T>(() => initialValue, (value) => saveSettingsAction(section, value));

  const localErrors: Record<string, string> = {};
  for (const [path, message] of Object.entries(draft.errors)) {
    localErrors[path.startsWith(`${section}.`) ? path.slice(section.length + 1) : path] = message;
  }

  return (
    <section className="rounded-md border border-border bg-surface shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border p-4">
        <div>
          <h2 className="text-xl">{title}</h2>
          {description ? <p className="mt-1 text-sm text-text-muted">{description}</p> : null}
        </div>

        <div className="flex items-center gap-3">
          {draft.dirty ? (
            <span className="rounded-sm bg-primary-soft px-2 py-0.5 text-xs">Sin guardar</span>
          ) : null}

          <button
            type="button"
            onClick={draft.commit}
            disabled={draft.saving || !draft.dirty}
            className="min-h-[44px] rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-hover disabled:opacity-40"
          >
            {draft.saving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>

      <div className="p-4">
        {draft.feedback ? (
          <div className="mb-4">
            <FormMessage tone={draft.feedback.tone}>{draft.feedback.text}</FormMessage>
          </div>
        ) : null}

        {children({
          value: draft.value,
          onChange: draft.setValue,
          disabled: draft.saving,
          errors: localErrors,
        })}
      </div>
    </section>
  );
}

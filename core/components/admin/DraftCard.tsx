'use client';

import FormMessage from '@/components/admin/FormMessage';
import { useDraft, type SaveOutcome } from '@/components/admin/useDraft';

/**
 * Tarjeta de un grupo de configuración: título, aviso de cambios sin guardar, guardar y los
 * campos dentro.
 *
 * Vive en `components/admin` y no dentro de una pantalla porque la usan varias: los grupos de
 * `site_settings` (negocio, servicios, apariencia, SEO) y, más adelante, los metadatos de cada
 * página. Todas se comportan igual —cada una guarda lo suyo por separado— y por eso comparten la
 * tarjeta y el gancho `useDraft`.
 *
 * Los campos llegan como función porque cada grupo se edita distinto: casi todos con el
 * formulario generado desde su esquema, y los horarios con uno escrito a mano (son siete días
 * fijos, y añadir o quitar días no tiene sentido).
 *
 * Los errores que devuelve el servidor llegan con la ruta del esquema maestro o del envoltorio
 * de la acción (`brand.email`, `services_catalog.categories.0.name`). Con `errorPrefix` se les
 * quita esa cabecera para que el formulario los encuentre donde toca. Sin esto, los errores de
 * configuración no se verían.
 */

export interface DraftCardProps<T> {
  title: string;
  description?: string;
  /** Se llama al pulsar Guardar. Cada pantalla trae la suya. */
  save: (value: T) => Promise<SaveOutcome>;
  /** Cabecera que el servidor antepone a las rutas de error (`'brand.'`). */
  errorPrefix?: string;
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
  save,
  errorPrefix,
  initialValue,
  children,
}: DraftCardProps<T>) {
  const draft = useDraft<T>(() => initialValue, save);

  const prefix = errorPrefix ?? '';
  const localErrors: Record<string, string> = {};

  for (const [path, message] of Object.entries(draft.errors)) {
    localErrors[prefix && path.startsWith(prefix) ? path.slice(prefix.length) : path] = message;
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

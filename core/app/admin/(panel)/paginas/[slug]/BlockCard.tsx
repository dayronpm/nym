'use client';

import { useState } from 'react';

import { getBlockSchema } from '@/blocks/schemas';
import DynamicForm from '@/components/admin/DynamicForm';
import FormMessage from '@/components/admin/FormMessage';
import { useDraft } from '@/components/admin/useDraft';
import { withSchemaDefaults } from '@/lib/zod-form';

import { saveBlockAction } from './actions';

/**
 * Tarjeta plegable de un bloque.
 *
 * El borrador (el contenido editado, el aviso de cambios sin guardar, los errores y el guardado)
 * lo lleva `useDraft`; aquí solo se decide cómo se ve la tarjeta y qué se llama al guardar. El
 * formulario de dentro es controlado y no sabe nada de esto.
 *
 * El esquema no llega por props —no se puede: es un objeto con funciones y no cruza la
 * frontera cliente/servidor—, así que se busca por el tipo del bloque en `BLOCK_SCHEMAS`.
 *
 * El borrador se pierde si se recarga la página, y se avisa: no hay guardado automático a
 * propósito. Escribir contenido a medias por accidente es peor que perder lo tecleado.
 */

export interface BlockCardProps {
  id: string;
  /** Clave del bloque en el registro y en `BLOCK_SCHEMAS`. */
  type: string;
  /** Página a la que pertenece. */
  page: string;
  label: string;
  description?: string;
  initialData: unknown;
  /** Si está desactivado, el bloque no se ve en el sitio. */
  enabled: boolean;
}

export default function BlockCard({
  id,
  type,
  page,
  label,
  description,
  initialData,
  enabled,
}: BlockCardProps) {
  const [open, setOpen] = useState(false);
  const schema = getBlockSchema(type);

  const draft = useDraft<unknown>(
    // El borrador arranca relleno con los valores por defecto del esquema: en la base de datos
    // pueden faltar campos que ahora tienen valor por defecto, y el formulario tiene que enseñar
    // lo mismo que guardaría el sitio.
    () => (schema ? withSchemaDefaults(schema, initialData) : initialData),
    (value) => saveBlockAction({ id, type, page, data: value }),
  );

  return (
    <li className="rounded-md border border-border bg-surface shadow-soft">
      <div className="flex flex-wrap items-center gap-3 p-3">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          className="flex min-h-[44px] flex-1 items-center gap-2 rounded-sm px-2 text-left transition-colors hover:bg-primary-soft"
        >
          <span aria-hidden="true" className="text-text-muted">
            {open ? '▾' : '▸'}
          </span>
          <span className="font-medium">{label}</span>
          {draft.dirty ? (
            <span className="rounded-sm bg-primary-soft px-2 py-0.5 text-xs">Sin guardar</span>
          ) : null}
          {!enabled ? (
            <span className="rounded-sm border border-border px-2 py-0.5 text-xs text-text-muted">
              Oculto en el sitio
            </span>
          ) : null}
        </button>

        <button
          type="button"
          onClick={draft.commit}
          disabled={draft.saving || !draft.dirty}
          className="min-h-[44px] shrink-0 rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-hover disabled:opacity-40"
        >
          {draft.saving ? 'Guardando…' : 'Guardar'}
        </button>
      </div>

      {open ? (
        <div className="border-t border-border p-4">
          {description ? <p className="mb-4 text-sm text-text-muted">{description}</p> : null}

          {draft.feedback ? (
            <div className="mb-4">
              <FormMessage tone={draft.feedback.tone}>{draft.feedback.text}</FormMessage>
            </div>
          ) : null}

          {schema ? (
            <DynamicForm
              schema={schema}
              labelsKey={type}
              idPrefix={id}
              initialData={draft.value}
              onChange={draft.setValue}
              errors={draft.errors}
              disabled={draft.saving}
            />
          ) : (
            <p className="text-sm text-text-muted">
              Este bloque ({type}) no tiene formulario en el panel.
            </p>
          )}
        </div>
      ) : null}
    </li>
  );
}

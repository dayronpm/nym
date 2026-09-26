'use client';

import { useState } from 'react';

import { getBlockSchema } from '@/blocks/schemas';
import DynamicForm from '@/components/admin/DynamicForm';
import FormMessage from '@/components/admin/FormMessage';
import { withSchemaDefaults } from '@/lib/zod-form';

import { saveBlockAction } from './actions';

/**
 * Tarjeta plegable de un bloque.
 *
 * Es quien **guarda el borrador**: mantiene el contenido editado, lo compara con lo que hay
 * guardado para saber si hay cambios y llama a la Server Action al pulsar Guardar. El
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

interface Feedback {
  tone: 'error' | 'success';
  text: string;
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

  // El borrador arranca relleno con los valores por defecto del esquema: en la base de datos
  // pueden faltar campos que ahora tienen valor por defecto, y el formulario tiene que enseñar
  // lo mismo que guardaría el sitio.
  const [data, setData] = useState<unknown>(() =>
    schema ? withSchemaDefaults(schema, initialData) : initialData,
  );
  const [savedData, setSavedData] = useState<unknown>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [saving, setSaving] = useState(false);

  // Comparación por serialización: los objetos se construyen siempre de la misma forma (se
  // copian con `...`), así que el orden de las claves es estable y basta para saber si hay
  // cambios. No hace falta comparar en profundidad.
  const dirty = JSON.stringify(data) !== JSON.stringify(savedData);

  async function save() {
    setSaving(true);
    setFeedback(null);

    try {
      const result = await saveBlockAction({ id, type, page, data });

      if (result.ok) {
        setSavedData(data);
        setErrors({});
        setFeedback({ tone: 'success', text: result.message });
      } else {
        setErrors(result.errors);
        setFeedback({ tone: 'error', text: result.message });
      }
    } finally {
      setSaving(false);
    }
  }

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
          {dirty ? (
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
          onClick={save}
          disabled={saving || !dirty}
          className="min-h-[44px] shrink-0 rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-hover disabled:opacity-40"
        >
          {saving ? 'Guardando…' : 'Guardar'}
        </button>
      </div>

      {open ? (
        <div className="border-t border-border p-4">
          {description ? <p className="mb-4 text-sm text-text-muted">{description}</p> : null}

          {feedback ? (
            <div className="mb-4">
              <FormMessage tone={feedback.tone}>{feedback.text}</FormMessage>
            </div>
          ) : null}

          {schema ? (
            <DynamicForm
              schema={schema}
              labelsKey={type}
              initialData={data}
              onChange={setData}
              errors={errors}
              disabled={saving}
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

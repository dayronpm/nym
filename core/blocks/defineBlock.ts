import type { ComponentType } from 'react';
import type { z } from 'zod';

import type { SiteSettings } from '@/types/settings';

/**
 * Sistema de registro de bloques.
 *
 * `defineBlock` une en un solo lugar:
 *   - el esquema zod      -> contrato de los datos del bloque
 *   - el componente       -> cómo se ve en el sitio público
 *   - el formulario       -> cómo se edita en el panel (Fase 2)
 *   - los valores por defecto
 *   - la versión          -> para migrar contenido si el esquema cambia
 *
 * Al añadir un bloque nuevo solo se escribe el esquema, el componente y el
 * formulario: el registro es automático (ver `registry.ts`).
 */

export interface BlockProps<TData> {
  data: TData;
  /** Configuración global del sitio: tema, contacto, horarios, catálogo. */
  settings: SiteSettings;
}

export interface BlockFormProps<TData> {
  initialData: TData;
  onChange: (data: TData) => void;
  errors?: Record<string, string>;
}

export interface BlockOptions {
  /** Nombre visible en el panel. Si falta, se usa el `type` técnico. */
  label?: string;
  /** Ayuda corta mostrada en el panel junto al nombre. */
  description?: string;
}

export interface Block<S extends z.ZodTypeAny = z.ZodTypeAny> {
  type: string;
  schema: S;
  Component: ComponentType<BlockProps<z.infer<S>>>;
  Form: ComponentType<BlockFormProps<z.infer<S>>>;
  defaults: z.infer<S>;
  version: number;
  label: string;
  description?: string;
}

export function defineBlock<S extends z.ZodTypeAny>(
  type: string,
  schema: S,
  Component: Block<S>['Component'],
  Form: Block<S>['Form'],
  defaults: z.infer<S>,
  version = 1,
  options: BlockOptions = {},
): Block<S> {
  return {
    type,
    schema,
    Component,
    Form,
    defaults,
    version,
    label: options.label ?? type,
    ...(options.description ? { description: options.description } : {}),
  };
}

export interface ParseBlockResult<S extends z.ZodTypeAny> {
  success: boolean;
  data: z.infer<S> | null;
  /** Errores por campo, en español, listos para mostrar en el panel. */
  errors: Record<string, string>;
}

/**
 * Valida el contenido de un bloque contra su esquema.
 *
 * Se usa en dos sitios:
 *   - al guardar desde el panel (para no escribir datos inválidos en la BD)
 *   - al leer desde la base de datos (un `jsonb` puede haber quedado de una
 *     versión anterior del esquema)
 *
 * Nunca lanza excepciones: devuelve el resultado para que el llamador decida.
 */
export function parseBlockData<S extends z.ZodTypeAny>(
  block: Block<S>,
  raw: unknown,
): ParseBlockResult<S> {
  const result = block.schema.safeParse(raw);

  if (result.success) {
    return { success: true, data: result.data, errors: {} };
  }

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const field = issue.path.join('.') || '_';
    // Se conserva el primer error de cada campo: es el que el usuario ve.
    if (!errors[field]) errors[field] = issue.message;
  }

  return { success: false, data: null, errors };
}

/**
 * Aplica los valores por defecto de un bloque sobre un contenido parcial.
 *
 * Útil al crear un bloque nuevo desde el panel y al leer contenido antiguo al
 * que le faltan campos añadidos después.
 */
export function withBlockDefaults<S extends z.ZodTypeAny>(
  block: Block<S>,
  partial: unknown,
): z.infer<S> {
  const merged = {
    ...(block.defaults as Record<string, unknown>),
    ...(typeof partial === 'object' && partial !== null ? (partial as Record<string, unknown>) : {}),
  };

  // `parse` rellena los campos anidados que falten con sus propios defaults.
  return block.schema.parse(merged);
}

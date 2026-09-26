'use client';

import { useState } from 'react';
import type { z } from 'zod';

import { cn } from '@/lib/cn';
import {
  describeField,
  emptyValueFor,
  itemLabel,
  type FieldEntry,
  type SelectOption,
} from '@/lib/zod-form';

import Field, { FieldRow, INPUT_CLASSES } from './Field';
import { CheckboxField, ColorField, MediaField, SelectField } from './form-fields';
import { fieldConfig, type FormLabels } from './form-labels';

/**
 * Formulario generado a partir de un esquema zod.
 *
 * Es el motor del panel: recorre el esquema del contenido —de una página, de un bloque o de
 * un grupo de `site_settings`— y pinta los campos que correspondan. Añadir un campo a un
 * esquema lo añade al panel sin tocar este archivo.
 *
 * **Es componente cliente, y aquí sí hace falta.** A diferencia de los formularios de acceso,
 * que son una Server Action con un `<form>` normal, un editor de contenido necesita estado:
 * añadir y quitar elementos de una lista, plegar tarjetas, reordenarlas. Eso no existe sin
 * JavaScript. La separación es deliberada: el acceso funciona sin JS, el editor no.
 *
 * El componente es **controlado**: no guarda copia de los datos, avisa a quien lo usa en cada
 * cambio y espera a recibir el valor nuevo por props. Así el que guarda (una tarjeta de
 * bloque, una pantalla de configuración) es el único dueño del borrador y puede comparar lo
 * que hay con lo que había para saber si hace falta guardar.
 */

export interface DynamicFormProps {
  /** Esquema del contenido. */
  schema: z.ZodTypeAny;
  /** Clave del mapa de etiquetas (`hero`, `negocio`…). */
  labelsKey: string;
  /** Contenido actual. */
  initialData: unknown;
  /** Se llama en cada cambio, con el contenido completo actualizado. */
  onChange: (data: unknown) => void;
  /** Errores por ruta de campo, tal como los devuelve el guardado. */
  errors?: Record<string, string>;
  /** Desactiva todos los campos (mientras se guarda). */
  disabled?: boolean;
}

interface RendererProps {
  field: FieldEntry;
  /** Ruta completa hasta el campo (`images.0.caption`): es la clave del error y el id. */
  path: string;
  labelsKey: string;
  value: unknown;
  errors?: Record<string, string>;
  disabled?: boolean;
  /** Campos propios de los elementos de una lista, para las etiquetas. */
  itemFields?: FormLabels;
  onChange: (value: unknown) => void;
}

const ICON_BUTTON =
  'flex h-11 w-11 items-center justify-center rounded-sm text-text-muted transition-colors hover:bg-primary-soft hover:text-text disabled:opacity-40';

/** Un `jsonb` visto como objeto, para leer y componer valores. */
function record(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
}

function mediaValue(value: unknown): { path: string; alt: string } {
  const data = record(value);
  return {
    path: typeof data.path === 'string' ? data.path : '',
    alt: typeof data.alt === 'string' ? data.alt : '',
  };
}

function itemKey(item: unknown, index: number): string | number {
  const id = record(item).id;
  return typeof id === 'string' ? id : index;
}

function withOptionLabels(options: SelectOption[], labels?: Record<string, string>): SelectOption[] {
  if (!labels) return options;
  return options.map((option) => ({ ...option, label: labels[option.value] ?? option.label }));
}

function TextareaField({
  label,
  id,
  hint,
  error,
  value,
  disabled,
  onChange,
}: {
  label: string;
  id: string;
  hint?: string;
  error?: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <FieldRow label={label} id={id} hint={hint} error={error}>
      {(aria) => (
        <textarea
          {...aria}
          rows={4}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className={cn(INPUT_CLASSES, 'min-h-[110px]')}
        />
      )}
    </FieldRow>
  );
}

/**
 * Lista editable: fotos, personas, preguntas, testimonios, vídeos.
 *
 * Cada elemento es una tarjeta plegable con su formulario dentro, y los botones de subir y
 * bajar están aquí aunque el arrastrar y soltar llegue en la Fase 3: sin ellos, quitar una
 * fila mal colocada obligaría a rehacerla.
 */
function ArrayField({ field, path, labelsKey, value, errors, disabled, onChange }: RendererProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const descriptor = field.descriptor;
  const config = fieldConfig(labelsKey, field.name);
  const items = Array.isArray(value) ? value : [];

  // Se guarda el elemento en constantes propias: dentro de las funciones de abajo
  // TypeScript no recuerda que `descriptor.item` ya no es `undefined`.
  const item = descriptor.item;
  if (!item) return null;

  const itemSchema = item.schema;
  const itemFieldsDescriptor = item.descriptor.fields;

  function replaceAt(index: number, next: unknown) {
    onChange(items.map((item, position) => (position === index ? next : item)));
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= items.length) return;

    const next = [...items];
    const [moved] = next.splice(from, 1);
    if (moved === undefined) return;
    next.splice(to, 0, moved);

    setOpenIndex(null);
    onChange(next);
  }

  function removeAt(index: number) {
    setOpenIndex(null);
    onChange(items.filter((_, position) => position !== index));
  }

  function add() {
    onChange([...items, emptyValueFor(itemSchema)]);
    setOpenIndex(items.length);
  }

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium">{config.label}</span>
        <span className="text-sm text-text-muted">{items.length}</span>
      </div>

      {config.hint ? <p className="text-sm text-text-muted">{config.hint}</p> : null}

      <ul className="mt-2 space-y-2">
        {items.map((item, index) => {
          const isOpen = openIndex === index;
          const name = itemLabel(item, index, config.itemTitle);

          return (
            <li key={itemKey(item, index)} className="rounded-sm border border-border bg-surface">
              <div className="flex items-center gap-1 p-2">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="flex min-h-[44px] flex-1 items-center gap-2 rounded-sm px-2 text-left text-sm transition-colors hover:bg-primary-soft"
                >
                  <span aria-hidden="true" className="text-text-muted">
                    {isOpen ? '▾' : '▸'}
                  </span>
                  <span className="font-medium">{name}</span>
                </button>

                <button
                  type="button"
                  onClick={() => move(index, index - 1)}
                  disabled={disabled || index === 0}
                  aria-label={`Subir «${name}»`}
                  className={ICON_BUTTON}
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(index, index + 1)}
                  disabled={disabled || index === items.length - 1}
                  aria-label={`Bajar «${name}»`}
                  className={ICON_BUTTON}
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  disabled={disabled}
                  aria-label={`Quitar «${name}»`}
                  className={ICON_BUTTON}
                >
                  ×
                </button>
              </div>

              {isOpen ? (
                <div className="space-y-4 border-t border-border p-3">
                  {itemFieldsDescriptor
                    ? itemFieldsDescriptor.map((child) => (
                        <FieldRenderer
                          key={child.name}
                          field={child}
                          path={`${path}.${index}.${child.name}`}
                          labelsKey={labelsKey}
                          itemFields={config.itemFields}
                          value={record(item)[child.name]}
                          errors={errors}
                          disabled={disabled}
                          onChange={(next) =>
                            replaceAt(index, { ...record(item), [child.name]: next })
                          }
                        />
                      ))
                    : null}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={add}
        disabled={disabled}
        className="mt-3 min-h-[44px] rounded-sm border border-border px-4 py-2 text-sm transition-colors hover:bg-primary-soft disabled:opacity-40"
      >
        {config.addLabel ?? 'Añadir'}
      </button>

      {errors?.[path] ? (
        <p role="alert" className="mt-1 text-sm text-primary">
          {errors[path]}
        </p>
      ) : null}
    </div>
  );
}

function FieldRenderer({
  field,
  path,
  labelsKey,
  value,
  errors,
  disabled,
  itemFields,
  onChange,
}: RendererProps) {
  const descriptor = field.descriptor;
  const config = fieldConfig(labelsKey, field.name, itemFields);
  const id = `f-${path.replace(/\./g, '-')}`;
  const error = errors?.[path];

  // Un campo oculto existe en el esquema pero no se pregunta: identificadores internos,
  // sobre todo. Su valor se conserva porque no se toca.
  if (config.hidden) return null;

  if (descriptor.kind === 'group') {
    return (
      <fieldset className="rounded-sm border border-border p-4">
        <legend className="px-1 text-sm font-medium">{config.label}</legend>
        {config.hint ? <p className="mb-3 text-sm text-text-muted">{config.hint}</p> : null}

        <div className="space-y-4">
          {(descriptor.fields ?? []).map((child) => (
            <FieldRenderer
              key={child.name}
              field={child}
              path={`${path}.${child.name}`}
              labelsKey={labelsKey}
              itemFields={itemFields}
              value={record(value)[child.name]}
              errors={errors}
              disabled={disabled}
              onChange={(next) => onChange({ ...record(value), [child.name]: next })}
            />
          ))}
        </div>
      </fieldset>
    );
  }

  if (descriptor.kind === 'media') {
    return (
      <MediaField
        label={config.label}
        id={id}
        hint={config.hint}
        value={mediaValue(value)}
        pathError={errors?.[`${path}.path`]}
        altError={errors?.[`${path}.alt`]}
        onChange={(next) => onChange(next)}
      />
    );
  }

  if (descriptor.kind === 'array') {
    return (
      <ArrayField
        field={field}
        path={path}
        labelsKey={labelsKey}
        value={value}
        errors={errors}
        disabled={disabled}
        onChange={onChange}
      />
    );
  }

  if (descriptor.kind === 'boolean') {
    return (
      <CheckboxField
        label={config.label}
        id={id}
        hint={config.hint}
        error={error}
        checked={value === true}
        onChange={onChange}
      />
    );
  }

  if (descriptor.kind === 'select') {
    const options = withOptionLabels(descriptor.options ?? [], config.optionLabels);

    // Un selector opcional necesita una opción vacía: sin ella no se puede volver a "sin
    // valor" (quitar el enlace a una sección, dejar de tomar el contenido de otra página) y
    // el campo aparece con la primera opción como si fuera lo elegido.
    const selectable: SelectOption[] = descriptor.optional
      ? [{ value: '', label: '— Sin valor —', raw: undefined }, ...options]
      : options;

    const current = String(value ?? '');
    const known = selectable.some((option) => option.value === current);
    const selected = known ? current : descriptor.optional ? '' : (options[0]?.value ?? '');

    return (
      <SelectField
        label={config.label}
        id={id}
        hint={config.hint}
        error={error}
        options={selectable}
        value={selected}
        onChange={(option) => onChange(option.raw)}
      />
    );
  }

  if (descriptor.kind === 'color') {
    return (
      <ColorField
        label={config.label}
        id={id}
        hint={config.hint}
        error={error}
        value={typeof value === 'string' ? value : ''}
        onChange={onChange}
      />
    );
  }

  if (descriptor.kind === 'number') {
    return (
      <Field
        label={config.label}
        name={path}
        id={id}
        hint={config.hint}
        error={error}
        type="number"
        disabled={disabled}
        value={typeof value === 'number' ? String(value) : ''}
        min={descriptor.min}
        max={descriptor.max}
        step={descriptor.integer ? 1 : 'any'}
        onChange={(event) => {
          // Vacío no es 0: es "sin valor". Casi todos los números opcionales del panel lo
          // son de verdad (el corte del resumen, un precio que se consulta por WhatsApp).
          const raw = event.target.value;
          onChange(raw === '' ? undefined : Number(raw));
        }}
      />
    );
  }

  if (descriptor.kind === 'unsupported') {
    return (
      <p className="rounded-sm border border-border bg-surface-alt p-3 text-sm text-text-muted">
        «{config.label}» no se puede editar desde el panel todavía. Se conserva el valor que ya
        tenía.
      </p>
    );
  }

  const type = config.type ?? descriptor.kind;

  if (type === 'textarea') {
    return (
      <TextareaField
        label={config.label}
        id={id}
        hint={config.hint}
        error={error}
        value={typeof value === 'string' ? value : ''}
        disabled={disabled}
        onChange={onChange}
      />
    );
  }

  return (
    <Field
      label={config.label}
      name={path}
      id={id}
      hint={config.hint}
      error={error}
      type={type}
      disabled={disabled}
      value={typeof value === 'string' ? value : ''}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

export default function DynamicForm({
  schema,
  labelsKey,
  initialData,
  onChange,
  errors,
  disabled,
}: DynamicFormProps) {
  const descriptor = describeField(schema);
  const data = record(initialData);

  if (!descriptor.fields) {
    return (
      <p className="rounded-sm border border-border bg-surface-alt p-4 text-sm text-text-muted">
        Este contenido no se puede editar con un formulario generado.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {descriptor.fields.map((field) => (
        <FieldRenderer
          key={field.name}
          field={field}
          path={field.name}
          labelsKey={labelsKey}
          value={data[field.name]}
          errors={errors}
          disabled={disabled}
          onChange={(next) => onChange({ ...data, [field.name]: next })}
        />
      ))}
    </div>
  );
}

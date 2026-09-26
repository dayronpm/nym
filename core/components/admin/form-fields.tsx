'use client';

import { cn } from '@/lib/cn';
import type { SelectOption } from '@/lib/zod-form';

import { FieldRow, INPUT_CLASSES } from './Field';

/**
 * Controles del formulario generado.
 *
 * Son los que no son un `<input type="text">`: selector, casilla, color y el par de campos
 * de una imagen (ruta + texto alternativo). Viven aparte de `DynamicForm` para que el motor
 * del formulario se lea como lo que es, un recorrido del esquema, y no como un catálogo de
 * controles.
 */

interface BaseProps {
  label: string;
  id: string;
  hint?: string;
  error?: string;
}

export interface SelectFieldProps extends BaseProps {
  value: string;
  options: SelectOption[];
  onChange: (option: SelectOption) => void;
}

/** Selector. Trabaja con el valor en texto, pero devuelve la opción entera para no perder
 *  el tipo original (hay selectores numéricos, como el de columnas de la galería). */
export function SelectField({ label, id, hint, error, value, options, onChange }: SelectFieldProps) {
  return (
    <FieldRow label={label} id={id} hint={hint} error={error}>
      {(aria) => (
        <select
          {...aria}
          className={cn(INPUT_CLASSES)}
          value={value}
          onChange={(event) => {
            const option = options.find((candidate) => candidate.value === event.target.value);
            if (option) onChange(option);
          }}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </FieldRow>
  );
}

export interface CheckboxFieldProps extends BaseProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/** Casilla. Se usa `min-h-[44px]` en toda la fila: el objetivo táctil incluye la etiqueta. */
export function CheckboxField({ label, id, hint, error, checked, onChange }: CheckboxFieldProps) {
  return (
    <div className="flex min-h-[44px] items-start gap-3">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className="mt-1 h-5 w-5 shrink-0 rounded-sm border-border text-primary focus:border-primary"
      />

      <div>
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        {hint ? (
          <p id={`${id}-hint`} className="text-sm text-text-muted">
            {hint}
          </p>
        ) : null}
        {error ? (
          <p role="alert" className="text-sm text-primary">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export interface ColorFieldProps extends BaseProps {
  value: string;
  onChange: (value: string) => void;
}

/** Selector de color con el valor hexadecimal al lado, para poder copiarlo y pegarlo. */
export function ColorField({ label, id, hint, error, value, onChange }: ColorFieldProps) {
  return (
    <FieldRow label={label} id={id} hint={hint} error={error}>
      {(aria) => (
        <div className="mt-1 flex items-center gap-3">
          <input
            {...aria}
            type="color"
            value={value || '#000000'}
            onChange={(event) => onChange(event.target.value)}
            className="h-11 w-14 shrink-0 rounded-sm border border-border bg-surface"
          />
          <input
            type="text"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            spellCheck={false}
            className="w-full rounded-sm border border-border bg-surface px-3 py-2.5 font-mono text-sm focus:border-primary"
          />
        </div>
      )}
    </FieldRow>
  );
}

export interface MediaFieldProps extends BaseProps {
  value: { path: string; alt: string };
  onChange: (value: { path: string; alt: string }) => void;
  /** Error de la ruta, si lo hay. */
  pathError?: string;
  /** Error del texto alternativo, si lo hay. */
  altError?: string;
  /** Texto de ayuda propio para la ruta (por ejemplo, la carpeta recomendada). */
  pathHint?: string;
}

/**
 * Imagen: ruta dentro del bucket y texto alternativo.
 *
 * La subida con compresión llega en el bloque 2.5 del panel; hasta entonces se edita la ruta,
 * que es lo que el bloque guarda de verdad (`MediaRef` nunca guarda una URL). Cada uno de los
 * dos campos lleva su propio error porque la validación los señala por separado.
 */
export function MediaField({ label, id, hint, pathError, altError, value, onChange, pathHint }: MediaFieldProps) {
  return (
    <fieldset className="rounded-sm border border-border p-4">
      <legend className="px-1 text-sm font-medium">{label}</legend>

      {hint ? <p className="mb-3 text-sm text-text-muted">{hint}</p> : null}

      <div className="space-y-3">
        <FieldRow
          label="Ruta"
          id={`${id}-path`}
          hint={pathHint ?? 'Ruta dentro del bucket, por ejemplo gallery/abc.webp'}
          error={pathError}
        >
          {(aria) => (
            <input
              {...aria}
              value={value.path}
              onChange={(event) => onChange({ ...value, path: event.target.value })}
              spellCheck={false}
              className={cn(INPUT_CLASSES, 'font-mono text-sm')}
            />
          )}
        </FieldRow>

        <FieldRow
          label="Texto alternativo"
          id={`${id}-alt`}
          hint="Obligatorio: lo leen los buscadores y los lectores de pantalla."
          error={altError}
        >
          {(aria) => (
            <input
              {...aria}
              value={value.alt}
              onChange={(event) => onChange({ ...value, alt: event.target.value })}
              className={INPUT_CLASSES}
            />
          )}
        </FieldRow>
      </div>
    </fieldset>
  );
}

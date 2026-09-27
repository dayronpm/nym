'use client';

import { useState } from 'react';

import { uploadMediaAction } from '@/app/admin/(panel)/media-actions';
import { baseNameOf, compressImage } from '@/lib/compress-image';
import { cn } from '@/lib/cn';
import { getMediaUrl } from '@/lib/storage';
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
  /** Se desactiva mientras se guarda, como el resto de los campos. */
  disabled?: boolean;
}

/** Selector. Trabaja con el valor en texto, pero devuelve la opción entera para no perder
 *  el tipo original (hay selectores numéricos, como el de columnas de la galería). */
export function SelectField({
  label,
  id,
  hint,
  error,
  value,
  options,
  disabled,
  onChange,
}: SelectFieldProps) {
  return (
    <FieldRow label={label} id={id} hint={hint} error={error}>
      {(aria) => (
        <select
          {...aria}
          disabled={disabled}
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
  /** Carpeta del bucket donde se guarda lo que se suba desde este campo. */
  folder?: string;
  /**
   * Si el campo puede quedarse sin imagen (`MediaRef.optional()`).
   *
   * Cuando no puede —la foto de un elemento de la galería, por ejemplo: un elemento sin imagen
   * no tiene sentido— el botón de quitarla no aparece, porque dejaría el contenido en un estado
   * que el esquema rechaza al guardar.
   */
  optional?: boolean;
  /** Quita la imagen del contenido: borra la clave en lugar de guardar una ruta vacía. */
  onClear?: () => void;
}

/**
 * Imagen: ruta dentro del bucket y texto alternativo.
 *
 * La ruta se puede escribir a mano (sigue siendo el dato que se guarda: `MediaRef` nunca guarda
 * una URL) o subir un archivo. Al subir se comprime **en el navegador** antes de enviarlo: la
 * foto de un móvil pasa de 3-5 MB a decenas de KB y el servidor no ve el archivo entero.
 *
 * Cada uno de los dos campos lleva su propio error porque la validación los señala por separado.
 */
export function MediaField({
  label,
  id,
  hint,
  pathError,
  altError,
  value,
  onChange,
  pathHint,
  folder = 'gallery',
  optional,
  onClear,
}: MediaFieldProps) {
  const [upload, setUpload] = useState<{ busy: boolean; tone: 'success' | 'error'; text: string }>({
    busy: false,
    tone: 'success',
    text: '',
  });

  const previewUrl = getMediaUrl(value);

  async function handleFile(file: File) {
    setUpload({ busy: true, tone: 'success', text: 'Comprimiendo…' });
    const before = Math.round(file.size / 1024);

    try {
      const compressed = await compressImage(file);

      const formData = new FormData();
      formData.append('file', new File([compressed.blob], 'imagen.webp', { type: 'image/webp' }));
      formData.append('folder', folder);

      const result = await uploadMediaAction(formData);

      if (!result.ok || !result.path) {
        setUpload({ busy: false, tone: 'error', text: result.message });
        return;
      }

      // El texto alternativo se propone a partir del nombre del archivo, y solo si está vacío:
      // es una ayuda para no guardar una imagen sin alt, no una imposición.
      onChange({ path: result.path, alt: value.alt || baseNameOf(file) });
      setUpload({
        busy: false,
        tone: 'success',
        text: `Subida: ${before} KB a ${compressed.kb} KB (${compressed.width}x${compressed.height}).`,
      });
    } catch (error) {
      setUpload({
        busy: false,
        tone: 'error',
        text: error instanceof Error ? error.message : 'No se pudo preparar la imagen.',
      });
    }
  }

  return (
    <fieldset className="rounded-sm border border-border p-4">
      <legend className="px-1 text-sm font-medium">{label}</legend>

      {hint ? <p className="mb-3 text-sm text-text-muted">{hint}</p> : null}

      {/* La vista previa es lo que permite **cambiar** una imagen a conciencia: sin ella se
          edita una ruta a ciegas, sin saber qué hay puesto. */}
      <div className="mb-3 flex flex-wrap items-center gap-3">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt=""
            loading="lazy"
            className="h-20 w-20 rounded-sm border border-border bg-surface-alt object-cover"
          />
        ) : (
          <span className="rounded-sm border border-dashed border-border px-3 py-7 text-sm text-text-muted">
            Sin imagen
          </span>
        )}

        {optional && value.path && onClear ? (
          <button
            type="button"
            onClick={onClear}
            className="min-h-[44px] rounded-sm border border-border px-3 text-sm text-danger transition-colors hover:bg-primary-soft"
          >
            Quitar la imagen
          </button>
        ) : null}
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-3 rounded-sm bg-surface-alt p-3">
        <label
          className={cn(
            'min-h-[44px] cursor-pointer rounded-sm border border-border bg-surface px-4 py-2 text-sm transition-colors hover:bg-primary-soft',
            upload.busy && 'pointer-events-none opacity-40',
          )}
        >
          {upload.busy ? 'Un momento…' : 'Subir una foto'}
          <input
            type="file"
            accept="image/*"
            disabled={upload.busy}
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleFile(file);
              // Se limpia para poder volver a elegir el mismo archivo (si no, el navegador
              // lo considera "sin cambios" y no dispara el evento).
              event.target.value = '';
            }}
          />
        </label>

        <p className="text-sm text-text-muted">Se comprime a WebP de 1600 px antes de subirla.</p>
      </div>

      {upload.text ? (
        <p
          role={upload.tone === 'error' ? 'alert' : 'status'}
          className={cn('mb-3 text-sm', upload.tone === 'error' ? 'text-danger' : 'text-success')}
        >
          {upload.text}
        </p>
      ) : null}

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

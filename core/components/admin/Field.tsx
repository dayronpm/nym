import { cn } from '@/lib/cn';

/**
 * Campo de texto del panel.
 *
 * Existe para que todos los formularios del panel compartan etiqueta, alto y foco, y para
 * que el `DynamicForm` tenga una sola pieza que reutilizar en vez de repetir estilos campo
 * a campo.
 */

export const INPUT_CLASSES =
  'mt-1 w-full rounded-sm border border-border bg-surface px-3 py-2.5 text-base focus:border-primary';

/**
 * Envoltorio de un campo: etiqueta, control, ayuda y error.
 *
 * El control llega como función porque necesita el `id` y los atributos de accesibilidad que
 * produce este envoltorio: un error que no está enlazado por `aria-describedby` no lo anuncia
 * ningún lector de pantalla, y sin `aria-invalid` el campo queda "normal" para quien no lo ve
 * en color.
 */
export interface FieldRowProps {
  /** Texto de la etiqueta. */
  label: string;
  /** Identificador único del control dentro de la página. */
  id: string;
  /** Aclaración bajo el campo. */
  hint?: string;
  /** Error de este campo, si la validación lo ha señalado. */
  error?: string;
  /** Marca opcional a la derecha de la etiqueta. */
  badge?: React.ReactNode;
  children: (aria: {
    id: string;
    'aria-describedby'?: string;
    'aria-invalid'?: true;
  }) => React.ReactNode;
}

export function FieldRow({ label, id, hint, error, badge, children }: FieldRowProps) {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="block text-sm font-medium">
          {label}
        </label>
        {badge}
      </div>

      {children({
        id,
        ...(describedBy.length > 0 ? { 'aria-describedby': describedBy.join(' ') } : {}),
        ...(error ? { 'aria-invalid': true as const } : {}),
      })}

      {hint ? (
        <p id={hintId} className="mt-1 text-sm text-text-muted">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} role="alert" className="mt-1 text-sm text-primary">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Texto de la etiqueta. */
  label: string;
  /** Nombre del campo. Se usa también para enlazar la etiqueta con el input. */
  name: string;
  /** Aclaración opcional bajo el campo. */
  hint?: string;
  /** Error del campo, si lo hay. */
  error?: string;
}

export default function Field({ label, name, hint, error, className, ...input }: FieldProps) {
  const fieldId = input.id ?? name;

  return (
    <FieldRow label={label} id={fieldId} hint={hint} error={error}>
      {(aria) => (
        <input name={name} className={cn(INPUT_CLASSES, className)} {...aria} {...input} />
      )}
    </FieldRow>
  );
}

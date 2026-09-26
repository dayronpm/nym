import { cn } from '@/lib/cn';

/**
 * Campo de texto del panel.
 *
 * Existe para que todos los formularios del panel compartan etiqueta, alto y foco, y para
 * que el `DynamicForm` de los bloques (que llega en el siguiente bloque de la Fase 2)
 * tenga una sola pieza que reutilizar en vez de repetir estilos campo a campo.
 */

export const INPUT_CLASSES =
  'mt-1 w-full rounded-sm border border-border bg-surface px-3 py-2.5 text-base focus:border-primary';

export interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Texto de la etiqueta. */
  label: string;
  /** Nombre del campo. Se usa también para enlazar la etiqueta con el input. */
  name: string;
  /** Aclaración opcional bajo el campo. */
  hint?: string;
}

export default function Field({ label, name, hint, className, ...input }: FieldProps) {
  const hintId = hint ? `${name}-hint` : undefined;

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium">
        {label}
      </label>

      <input
        id={name}
        name={name}
        aria-describedby={hintId}
        className={cn(INPUT_CLASSES, className)}
        {...input}
      />

      {hint ? (
        <p id={hintId} className="mt-1 text-sm text-text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

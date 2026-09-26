'use client';

import { useFormStatus } from 'react-dom';

import { cn } from '@/lib/cn';

/**
 * Botón de envío de los formularios del panel.
 *
 * Usa `useFormStatus`, así que sabe por sí solo si la acción del servidor está en curso:
 * se desactiva y cambia el texto. Sin eso, quien pulsa "Entrar" con mala conexión no
 * recibe ninguna señal y acaba pulsando tres veces. Es el único motivo por el que este
 * botón (y los formularios) son componentes cliente.
 */
export interface SubmitButtonProps {
  children: React.ReactNode;
  /** Texto mientras se envía. */
  pendingLabel?: string;
  className?: string;
}

export default function SubmitButton({ children, pendingLabel, className }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        'inline-flex min-h-[44px] w-full items-center justify-center rounded-md bg-primary px-5 py-3 font-medium text-on-primary transition-colors hover:bg-primary-hover disabled:opacity-60',
        className,
      )}
    >
      {pending ? (pendingLabel ?? 'Guardando…') : children}
    </button>
  );
}

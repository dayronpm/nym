'use client';

import { useSyncExternalStore } from 'react';

import { cn } from '@/lib/cn';

import { dismissToast, getToasts, subscribeToToasts, type Toast } from './toast';

/** Lista vacía estable: devolver un array nuevo en cada render hace que React avise. */
const EMPTY: Toast[] = [];

/**
 * Contenedor de los avisos flotantes. Se monta una sola vez, en el layout del panel.
 *
 * Va abajo a la derecha y con `pointer-events-none` en el contenedor: los avisos no deben tapar
 * un botón de guardar ni bloquear un clic por el sitio donde aparecen. Solo su propia tarjeta
 * recupera los clics, para poder cerrarla.
 *
 * Confirmaciones con `role="status"` (se anuncian sin interrumpir) y errores con `role="alert"`
 * (se anuncian de inmediato), que es la misma regla que siguen los avisos de dentro de las
 * tarjetas.
 */
export default function Toaster() {
  const toasts = useSyncExternalStore(subscribeToToasts, getToasts, () => EMPTY);

  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role={toast.tone === 'error' ? 'alert' : 'status'}
          className={cn(
            'pointer-events-auto flex items-start gap-3 rounded-md border bg-surface p-3 shadow-soft',
            toast.tone === 'error' ? 'border-danger text-danger' : 'border-success text-success',
          )}
        >
          <p className="flex-1 text-sm">{toast.text}</p>

          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            aria-label="Cerrar el aviso"
            className="-my-2 -mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-sm text-text-muted transition-colors hover:bg-primary-soft"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

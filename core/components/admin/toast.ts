'use client';

/**
 * Avisos flotantes del panel.
 *
 * Sin contexto ni proveedor: un módulo con una lista de suscriptores y dos funciones, emitir y
 * descartar. El panel es pequeño y con una sola pantalla a la vez, así que montar un
 * `ToastProvider` y pasar el gancho por medio árbol sería más ceremonia que solución. Aquí,
 * cualquier componente puede avisar con una llamada y el aviso se pinta donde vive `Toaster`.
 *
 * El estado vive **fuera** de React a propósito: sobrevive a los re-renders de quien avisa, y el
 * componente que lo pinta se suscribe con `useSyncExternalStore`, que es la forma que tiene React
 * de leer un almacén externo sin desincronizarse.
 */

export type ToastTone = 'success' | 'error';

export interface Toast {
  id: number;
  tone: ToastTone;
  text: string;
}

type Listener = (toasts: Toast[]) => void;

/** Cuánto dura un aviso en pantalla. Es corto: es un aviso, no un historial. */
const TOAST_MS = 4000;

let toasts: Toast[] = [];
let nextId = 1;
const listeners = new Set<Listener>();

function emit() {
  for (const listener of listeners) listener(toasts);
}

/** Muestra un aviso. Por defecto, de confirmación. */
export function showToast(text: string, tone: ToastTone = 'success') {
  const toast: Toast = { id: nextId++, tone, text };

  toasts = [...toasts, toast];
  emit();

  window.setTimeout(() => dismissToast(toast.id), TOAST_MS);
}

/** Quita un aviso antes de tiempo (el botón de cerrar). */
export function dismissToast(id: number) {
  toasts = toasts.filter((toast) => toast.id !== id);
  emit();
}

export function subscribeToToasts(listener: Listener): () => void {
  listeners.add(listener);
  // Se entrega el estado actual al suscribirse: si alguien avisa antes de que el componente
  // termine de montarse, el aviso no se pierde.
  listener(toasts);

  return () => {
    listeners.delete(listener);
  };
}

/** Lista actual, para el `getSnapshot` de `useSyncExternalStore`. */
export function getToasts(): Toast[] {
  return toasts;
}

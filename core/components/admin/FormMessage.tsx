import { cn } from '@/lib/cn';

/**
 * Aviso de los formularios del panel.
 *
 * `role="alert"` en los errores, para que un lector de pantalla los anuncie en cuanto
 * aparecen; `role="status"` en las confirmaciones, que no deben interrumpir.
 *
 * El color del error es el **acento del tema** y no un rojo literal: la paleta es un dato
 * de `site_settings` y un color escrito a mano dejaría de encajar el día que el cliente
 * elija otra. Queda pendiente un token propio de peligro (anotado en `PROGRESS.md`).
 */
export interface FormMessageProps {
  tone: 'error' | 'success';
  children: React.ReactNode;
}

export default function FormMessage({ tone, children }: FormMessageProps) {
  return (
    <p
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'rounded-sm border px-3 py-2 text-sm',
        tone === 'error' ? 'border-primary bg-primary-soft' : 'border-border bg-surface-alt',
      )}
    >
      {children}
    </p>
  );
}

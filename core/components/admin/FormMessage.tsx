import { cn } from '@/lib/cn';

/**
 * Aviso de los formularios del panel.
 *
 * `role="alert"` en los errores, para que un lector de pantalla los anuncie en cuanto
 * aparecen; `role="status"` en las confirmaciones, que no deben interrumpir.
 *
 * Usa los tokens propios de `danger` y `success`, que son de interfaz y no forman parte de la
 * paleta que elige el cliente: un error tiene que leerse como un error en cualquier tema.
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
        tone === 'error' ? 'border-danger text-danger' : 'border-success text-success',
      )}
    >
      {children}
    </p>
  );
}

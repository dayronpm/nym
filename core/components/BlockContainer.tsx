import { cn } from '@/lib/cn';

/**
 * Envoltorio estándar de una sección de bloque.
 *
 * Todos los bloques lo usan para que el ancho máximo y el espaciado vertical sean
 * idénticos en todo el sitio y editables desde un solo lugar (los tokens de
 * `globals.css`). Ningún bloque define su propio contenedor ni su propio padding.
 */
export interface BlockContainerProps {
  children: React.ReactNode;
  /** Fondo arena, para separar dos secciones consecutivas. */
  alternate?: boolean;
  /** Ancla para enlazar a la sección (`#contacto`). */
  id?: string;
  className?: string;
}

export default function BlockContainer({
  children,
  alternate,
  id,
  className,
}: BlockContainerProps) {
  return (
    <section id={id} className={cn('section-y', alternate && 'bg-surface-alt', className)}>
      <div className="container-page">{children}</div>
    </section>
  );
}

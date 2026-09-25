import { cn } from '@/lib/cn';

/**
 * Envoltorio estándar de una sección de bloque.
 *
 * Todos los bloques lo usan para que el ancho máximo y el espaciado vertical sean
 * idénticos en todo el sitio y editables desde un solo lugar (los tokens de
 * `globals.css`). Ningún bloque define su propio contenedor ni su propio padding.
 *
 * El fondo alterno (arena) NO se decide aquí ni en los bloques: lo aplica
 * `.site-main > section:nth-of-type(even)` en `globals.css`. Así la alternancia es
 * automática y no depende de que cada bloque acierte con el fondo de su vecino.
 */
export interface BlockContainerProps {
  children: React.ReactNode;
  /** Ancla para enlazar a la sección (`#contacto`). */
  id?: string;
  className?: string;
}

export default function BlockContainer({ children, id, className }: BlockContainerProps) {
  return (
    <section id={id} className={cn('section-y', className)}>
      <div className="container-page">{children}</div>
    </section>
  );
}

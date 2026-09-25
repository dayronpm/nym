import Link from 'next/link';

import type { MoreLink } from '@/blocks/links';
import { pageHref } from '@/lib/navigation';
import { PAGE_LABELS } from '@/types/settings';

/**
 * Encabezado estándar de un bloque.
 *
 * Los ocho bloques con título lo comparten para que la jerarquía sea siempre la
 * misma: `<h1>` una sola vez por página (el Hero o el `PageHeading`), `<h2>` en el
 * título de cada bloque y `<h3>` en los elementos de dentro.
 *
 * También se encarga de no pintar nada cuando no hay ni título ni subtítulo, que
 * es lo que permite desactivar el encabezado desde el panel sin dejar un hueco.
 *
 * Y de `more`, el enlace a la sección completa. Vive aquí, y no en cada bloque, para
 * que el enlace sea idéntico en todos los resúmenes y para resolver la ruta una sola
 * vez en lugar de repetirlo en cuatro bloques.
 */
export interface BlockHeadingProps {
  title?: string;
  subtitle?: string;
  /** Centrado, para bloques que se muestran solos en la página. */
  centered?: boolean;
  /** Enlace a la sección completa, en los bloques que resumen otra página. */
  more?: MoreLink;
}

function MoreLinkAnchor({ more }: { more: MoreLink }) {
  return (
    <Link
      href={pageHref(more.page)}
      // El nombre accesible empieza por el texto visible (WCAG 2.5.3) y además dice
      // el destino, para que se entienda fuera de contexto: un "Conócenos" suelto no
      // dice a dónde va.
      aria-label={`${more.label}: ${PAGE_LABELS[more.page]}`}
      className="group inline-flex items-center gap-1.5 font-medium underline decoration-border underline-offset-4 hover:text-primary hover:decoration-primary"
    >
      {more.label}
      <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
        →
      </span>
    </Link>
  );
}

export default function BlockHeading({ title, subtitle, centered, more }: BlockHeadingProps) {
  if (!title && !subtitle && !more) return null;

  if (centered) {
    return (
      <div className="mx-auto mb-10 max-w-2xl text-center">
        {title ? <h2>{title}</h2> : null}
        {subtitle ? <p className="mt-3 text-lg text-text-muted">{subtitle}</p> : null}
        {more ? (
          <p className="mt-5">
            <MoreLinkAnchor more={more} />
          </p>
        ) : null}
      </div>
    );
  }

  return (
    // En escritorio el enlace se alinea con el final del texto; en móvil cae debajo,
    // que es donde no hay sitio para los dos en la misma fila.
    <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
      <div className="max-w-2xl">
        {title ? <h2>{title}</h2> : null}
        {subtitle ? <p className="mt-3 text-lg text-text-muted">{subtitle}</p> : null}
      </div>
      {more ? (
        <div className="shrink-0 sm:pb-1.5">
          <MoreLinkAnchor more={more} />
        </div>
      ) : null}
    </div>
  );
}

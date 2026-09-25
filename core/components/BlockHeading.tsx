/**
 * Encabezado estándar de un bloque.
 *
 * Los ocho bloques con título lo comparten para que la jerarquía sea siempre la
 * misma: `<h1>` una sola vez por página (el Hero o el `PageHeading`), `<h2>` en el
 * título de cada bloque y `<h3>` en los elementos de dentro.
 *
 * También se encarga de no pintar nada cuando no hay ni título ni subtítulo, que
 * es lo que permite desactivar el encabezado desde el panel sin dejar un hueco.
 */
export interface BlockHeadingProps {
  title?: string;
  subtitle?: string;
  /** Centrado, para bloques que se muestran solos en la página. */
  centered?: boolean;
}

export default function BlockHeading({ title, subtitle, centered }: BlockHeadingProps) {
  if (!title && !subtitle) return null;

  return (
    <div className={centered ? 'mx-auto mb-10 max-w-2xl text-center' : 'mb-10 max-w-2xl'}>
      {title ? <h2>{title}</h2> : null}
      {subtitle ? <p className="mt-3 text-lg text-text-muted">{subtitle}</p> : null}
    </div>
  );
}

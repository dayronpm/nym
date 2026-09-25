/**
 * Encabezado de las páginas que no son Inicio.
 *
 * El plan reserva el único `<h1>` de Inicio al bloque `hero`. En el resto de
 * páginas el `<h1>` lo pone el `title` de la fila correspondiente de `pages`, y
 * este componente se encarga de pintarlo con el estilo de la plantilla.
 */
export interface PageHeadingProps {
  title: string;
  subtitle?: string;
}

export default function PageHeading({ title, subtitle }: PageHeadingProps) {
  return (
    <header className="border-b border-border bg-surface-alt">
      <div className="container-page py-12 md:py-16">
        <h1>{title}</h1>
        {subtitle ? <p className="mt-3 max-w-2xl text-lg text-text-muted">{subtitle}</p> : null}
      </div>
    </header>
  );
}

import Link from 'next/link';

/**
 * "Panel de control" de una pantalla del panel: lo que en Odoo va entre la barra superior y el
 * contenido —migas de pan, título y las acciones de la pantalla—.
 *
 * Se usa en todas las pantallas para que la cabecera sea idéntica en todas: dónde estás (migas),
 * qué es esta pantalla (título y una línea de ayuda) y qué se puede hacer aquí (los hijos, a la
 * derecha: buscadores, botones…).
 */
export interface Crumb {
  label: string;
  /** Sin enlace, es la página actual: se marca con `aria-current`. */
  href?: string;
}

export interface ControlPanelProps {
  title: string;
  subtitle?: string;
  breadcrumb?: Crumb[];
  /** Acciones de la pantalla (buscador, botones), alineadas a la derecha. */
  children?: React.ReactNode;
}

export default function ControlPanel({ title, subtitle, breadcrumb, children }: ControlPanelProps) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-border pb-4">
      <div className="min-w-0">
        {breadcrumb && breadcrumb.length > 0 ? (
          <nav
            aria-label="Ruta de navegación"
            className="mb-1 flex flex-wrap items-center gap-1.5 text-sm text-text-muted"
          >
            {breadcrumb.map((crumb, index) => (
              <span key={`${crumb.label}-${index}`} className="flex items-center gap-1.5">
                {index > 0 ? <span aria-hidden="true">/</span> : null}
                {crumb.href ? (
                  <Link href={crumb.href} className="transition-colors hover:text-primary">
                    {crumb.label}
                  </Link>
                ) : (
                  <span aria-current="page">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        ) : null}

        <h1 className="text-2xl md:text-3xl">{title}</h1>
        {subtitle ? <p className="mt-1 max-w-3xl text-sm text-text-muted">{subtitle}</p> : null}
      </div>

      {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
    </div>
  );
}

import Link from 'next/link';

/**
 * Dashboard del panel: el índice de las secciones de edición.
 *
 * Cada tarjeta es un enlace cuando la pantalla existe y una tarjeta quieta cuando todavía no:
 * un enlace a una pantalla que no está construida lleva a un 404 dentro del propio panel, que
 * es peor que no ofrecerlo.
 */
const SECTIONS: { href: string; label: string; description: string; ready: boolean }[] = [
  {
    href: '/admin/paginas',
    label: 'Páginas y bloques',
    description: 'El contenido de las cinco páginas.',
    ready: true,
  },
  {
    href: '/admin/negocio',
    label: 'Negocio',
    description: 'Contacto, horarios y catálogo de servicios.',
    ready: false,
  },
  {
    href: '/admin/apariencia',
    label: 'Apariencia',
    description: 'Colores, tipografías y esquinas.',
    ready: false,
  },
  {
    href: '/admin/imagenes',
    label: 'Imágenes',
    description: 'Subir y sustituir fotos.',
    ready: false,
  },
  {
    href: '/admin/seo',
    label: 'SEO',
    description: 'Títulos y descripciones para los buscadores.',
    ready: false,
  },
];

export default function AdminDashboardPage() {
  return (
    <main className="container-page section-y">
      <h1 className="text-4xl">Panel</h1>
      <p className="mt-2 text-text-muted">
        Desde aquí se edita todo el contenido del sitio. Las secciones se activan a medida
        que están listas.
      </p>

      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((section) => (
          <li
            key={section.href}
            className="rounded-md border border-border bg-surface p-5 shadow-soft"
          >
            {section.ready ? (
              <Link href={section.href} className="block">
                <span className="font-medium">{section.label}</span>
                <p className="mt-1 text-sm text-text-muted">{section.description}</p>
              </Link>
            ) : (
              <>
                <span className="font-medium text-text-muted">{section.label}</span>
                <p className="mt-1 text-sm text-text-muted">En construcción</p>
              </>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}

/**
 * Dashboard del panel: el índice de las secciones de edición.
 *
 * Las tarjetas **no** son enlaces todavía, y es a propósito: un enlace a una pantalla que
 * no existe lleva a un 404 dentro del propio panel, que es peor que no ofrecerlo. Se
 * activan a medida que cada sección se construye. Mientras tanto, el contenido del sitio
 * se carga con `npm run seed`.
 */
const SECTIONS = [
  { href: '/admin/paginas', label: 'Páginas y bloques' },
  { href: '/admin/negocio', label: 'Negocio' },
  { href: '/admin/apariencia', label: 'Apariencia' },
  { href: '/admin/imagenes', label: 'Imágenes' },
  { href: '/admin/seo', label: 'SEO' },
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
            <span className="font-medium">{section.label}</span>
            <p className="mt-1 text-sm text-text-muted">En construcción</p>
          </li>
        ))}
      </ul>
    </main>
  );
}

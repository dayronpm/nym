/**
 * Dashboard del panel (Fase 0: estructura mínima).
 *
 * Las secciones reales (Páginas y bloques, Negocio, Apariencia, Imágenes, SEO)
 * se implementan en las fases 2 y 3.
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
        Sesión iniciada. Las secciones de edición se habilitan en la Fase 2.
      </p>

      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((section) => (
          <li
            key={section.href}
            className="rounded-md border border-border bg-surface p-5 shadow-soft"
          >
            <span className="font-medium">{section.label}</span>
            <p className="mt-1 text-sm text-text-muted">Pendiente</p>
          </li>
        ))}
      </ul>
    </main>
  );
}

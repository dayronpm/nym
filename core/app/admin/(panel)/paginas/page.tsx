import Link from 'next/link';

import ControlPanel from '@/components/admin/ControlPanel';
import { getAllPages } from '@/data/queries/pages';

/**
 * Lista de páginas del sitio.
 *
 * Sale de la tabla `pages`, en el orden de `PAGE_SLUGS`. No hay ninguna lista escrita a mano,
 * así que una página nueva aparece aquí sola (igual que en el encabezado, el pie y el
 * sitemap).
 */
export default async function AdminPagesPage() {
  const pages = await getAllPages();

  return (
    <>
      <ControlPanel
        title="Páginas y bloques"
        subtitle="Elige una página para editar su contenido. Los apartados técnicos (SEO, apariencia) se editan en sus propias secciones."
        breadcrumb={[{ label: 'Panel', href: '/admin' }, { label: 'Páginas y bloques' }]}
      />

      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {pages.map((page) => (
          <li key={page.slug}>
            <Link
              href={`/admin/paginas/${page.slug}`}
              className="block min-h-[44px] rounded-md border border-border bg-surface p-5 shadow-soft transition-colors hover:bg-primary-soft"
            >
              <span className="font-medium">{page.title}</span>
              <p className="mt-1 text-sm text-text-muted">Editar sus bloques →</p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

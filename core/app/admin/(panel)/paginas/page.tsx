import Link from 'next/link';

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
    <main className="container-page section-y">
      <h1 className="text-3xl">Páginas y bloques</h1>
      <p className="mt-2 text-text-muted">
        Elige una página para editar su contenido. Los apartados técnicos (SEO, apariencia) se
        editan en sus propias secciones.
      </p>

      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
    </main>
  );
}

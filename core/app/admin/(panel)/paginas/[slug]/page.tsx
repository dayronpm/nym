import { notFound } from 'next/navigation';

import { getBlockDefinition } from '@/blocks/registry';
import { getAllBlocksByPage } from '@/data/queries/blocks';
import { getPage } from '@/data/queries/pages';
import { isPageSlug } from '@/lib/navigation';

import BlockCard from './BlockCard';

/**
 * Editor de los bloques de una página.
 *
 * Es la pantalla principal del panel: los bloques en su orden, cada uno plegado, con su
 * formulario dentro y su botón de guardar.
 *
 * Deliberadamente **no** hay interruptor de activar/desactivar ni arrastrar para reordenar:
 * eso es la Fase 3. El orden se muestra para que se entienda la página, y el estado
 * (activado u oculto) se avisa, pero se cambia más adelante.
 *
 * Se leen **todos** los bloques, desactivados incluidos: la política RLS del público solo
 * deja ver los activos, y aquí hacen falta todos para poder editarlos.
 */
export default async function AdminPageBlocksPage({ params }: { params: { slug: string } }) {
  if (!isPageSlug(params.slug)) notFound();

  const [page, blocks] = await Promise.all([
    getPage(params.slug),
    getAllBlocksByPage(params.slug),
  ]);

  return (
    <main className="container-page section-y">
      <h1 className="text-3xl">{page?.title ?? params.slug}</h1>
      <p className="mt-2 text-text-muted">
        {blocks.length === 1 ? '1 bloque' : `${blocks.length} bloques`}, en el orden en que se
        ven en el sitio. Ábrelos para editarlos.
      </p>

      <ul className="mt-8 space-y-3">
        {blocks.map((block) => {
          const definition = getBlockDefinition(block.type);

          if (!definition) {
            return (
              <li
                key={block.id}
                className="rounded-md border border-border bg-surface-alt p-4 text-sm text-text-muted"
              >
                Este bloque es de tipo «{block.type}», que ya no existe en la plantilla. Sus datos
                siguen guardados, pero el sitio no lo dibuja.
              </li>
            );
          }

          return (
            <BlockCard
              key={block.id}
              id={block.id}
              type={block.type}
              page={block.page}
              label={definition.label}
              {...(definition.description ? { description: definition.description } : {})}
              initialData={block.data}
              enabled={block.enabled}
            />
          );
        })}
      </ul>
    </main>
  );
}

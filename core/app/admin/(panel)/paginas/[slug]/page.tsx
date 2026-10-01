import { notFound } from 'next/navigation';

import { getBlockDefinition } from '@/blocks/registry';
import BlockOrderButtons from '@/components/admin/BlockOrderButtons';
import ControlPanel from '@/components/admin/ControlPanel';
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
 * Cada bloque trae su interruptor de activar o desactivar y sus flechas para moverlo de sitio.
 * Las flechas escriben el orden nuevo en la base de datos: el orden es de la **página**, así que
 * la lista completa de identificadores se pasa desde aquí y no desde la tarjeta.
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
    <>
      <ControlPanel
        title={page?.title ?? params.slug}
        subtitle={`${blocks.length === 1 ? '1 bloque' : `${blocks.length} bloques`}, en el orden en que se ven en el sitio. Ábrelos para editarlos.`}
        breadcrumb={[
          { label: 'Panel', href: '/admin' },
          { label: 'Páginas y bloques', href: '/admin/paginas' },
          { label: page?.title ?? params.slug },
        ]}
      />

      <ul className="space-y-3">
        {blocks.map((block, index) => {
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
              orderControls={
                <BlockOrderButtons
                  page={params.slug}
                  ids={blocks.map((item) => item.id)}
                  index={index}
                  label={definition.label}
                />
              }
            />
          );
        })}
      </ul>
    </>
  );
}

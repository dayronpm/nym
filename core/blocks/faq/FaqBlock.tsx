import type { BlockProps } from '@/blocks/defineBlock';
import BlockContainer from '@/components/BlockContainer';
import BlockHeading from '@/components/BlockHeading';

import type { FaqData } from './schema';

/**
 * Bloque `faq` — vista pública.
 *
 * Implementado con `<details>`/`<summary>` en lugar del `<button>` con
 * `aria-expanded`/`aria-controls` que describe el plan. Motivos:
 *  - hace lo mismo sin una sola línea de JavaScript, así que la página no paga
 *    hidratación (el plan exige Lighthouse ≥ 85 en móvil);
 *  - `<summary>` ya es un control accesible de forma nativa: operable con teclado,
 *    anunciado como expandible/contraído por los lectores de pantalla;
 *  - se pueden abrir varias preguntas a la vez, que es el comportamiento pedido.
 *
 * Lo que sí se respeta literalmente: todas las respuestas están en el HTML aunque
 * estén cerradas, para que los buscadores las lean.
 */
export default function FaqBlock({ data }: BlockProps<FaqData>) {
  // `limit` es el corte del resumen de Inicio.
  const items = data.items.filter((item) => item.enabled).slice(0, data.limit);
  if (items.length === 0) return null;

  return (
    <BlockContainer>
      <BlockHeading title={data.title} subtitle={data.subtitle} more={data.more} />

      <div className="max-w-3xl border-y border-border">
        {items.map((item) => (
          <details key={item.id} className="group border-b border-border last:border-b-0">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 py-5 [&::-webkit-details-marker]:hidden">
              <h3 className="text-lg">{item.question}</h3>
              <span
                aria-hidden="true"
                className="mt-1 shrink-0 text-xl leading-none text-text-muted transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>

            {/* whitespace-pre-line respeta los saltos de línea del texto original. */}
            <p className="whitespace-pre-line pb-5 text-text-muted">{item.answer}</p>
          </details>
        ))}
      </div>
    </BlockContainer>
  );
}

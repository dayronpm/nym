import type { BlockProps } from '@/blocks/defineBlock';
import BlockContainer from '@/components/BlockContainer';
import BlockHeading from '@/components/BlockHeading';
import Button from '@/components/Button';
import { buildWhatsappUrl, serviceBookingMessage } from '@/lib/contact';
import { formatDuration, formatPrice } from '@/lib/formatting';
import type { ServiceItem } from '@/types/settings';

import type { ServicesData } from './schema';

/**
 * Bloque `services` — vista pública.
 *
 * Reglas aplicadas (todas del plan):
 *  - El catálogo viene SIEMPRE de `settings.services_catalog`, nunca del bloque.
 *  - Los servicios con `enabled: false` no se muestran, ni en resumen ni completo.
 *  - Si `show_prices` es falso, o el servicio no tiene precio, se muestra
 *    `price_hidden_label` en su lugar.
 *  - La duración solo aparece si `show_durations` y el servicio la tiene.
 *  - En modo `summary` se cortan los servicios por categoría y se ofrece un
 *    enlace a `/servicios`.
 *  - Sin categorías con servicios visibles, el bloque no se pinta (nada de
 *    secciones vacías).
 */
export default function ServicesBlock({ data, settings }: BlockProps<ServicesData>) {
  const isSummary = data.mode === 'summary';

  // Se filtran los servicios desactivados y las categorías que se quedan vacías.
  const categories = settings.services_catalog.categories
    .map((category) => ({
      ...category,
      items: category.items.filter((item) => item.enabled),
    }))
    .map((category) => ({
      ...category,
      items: isSummary ? category.items.slice(0, data.summary_limit) : category.items,
    }))
    .filter((category) => category.items.length > 0);

  if (categories.length === 0) return null;

  function renderPrice(item: ServiceItem) {
    // El plan es explícito: precio oculto o ausente -> etiqueta de consulta.
    const showAmount = data.show_prices && typeof item.price === 'number';
    const text = showAmount ? formatPrice(item.price as number, settings.currency) : data.price_hidden_label;

    return (
      <span className={showAmount ? 'font-medium' : 'text-sm text-text-muted'}>{text}</span>
    );
  }

  function renderBooking(item: ServiceItem) {
    if (!data.show_booking_button) return null;

    const url = buildWhatsappUrl(settings.contact, serviceBookingMessage(settings.contact, item.name));
    if (!url) return null;

    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Reservar ${item.name} por WhatsApp`}
        className="text-sm font-medium text-primary underline decoration-border hover:decoration-primary"
      >
        Reservar
      </a>
    );
  }

  return (
    <BlockContainer alternate>
      <BlockHeading title={data.title} subtitle={data.subtitle} />

      <div className="space-y-12">
        {categories.map((category) => (
          <section key={category.id}>
            <h3 className="text-2xl">{category.name}</h3>
            {category.description ? (
              <p className="mt-2 max-w-2xl text-sm text-text-muted">{category.description}</p>
            ) : null}

            <ul className="mt-6 grid gap-4 md:grid-cols-2">
              {category.items.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-col rounded-md border border-border bg-surface p-5"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <h4 className="text-lg">{item.name}</h4>
                    {renderPrice(item)}
                  </div>

                  {item.description ? (
                    <p className="mt-2 text-sm text-text-muted">{item.description}</p>
                  ) : null}

                  <div className="mt-auto flex items-center justify-between gap-4 pt-4">
                    <span className="text-sm text-text-muted">
                      {data.show_durations && item.duration_minutes
                        ? formatDuration(item.duration_minutes)
                        : ''}
                    </span>
                    {renderBooking(item)}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {isSummary ? (
        <div className="mt-10">
          <Button href="/servicios" variant="secondary">
            Ver todos los servicios
          </Button>
        </div>
      ) : null}
    </BlockContainer>
  );
}

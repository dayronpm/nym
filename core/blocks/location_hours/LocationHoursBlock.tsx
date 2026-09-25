import type { BlockProps } from '@/blocks/defineBlock';
import BlockContainer from '@/components/BlockContainer';
import BlockHeading from '@/components/BlockHeading';
import Button from '@/components/Button';
import { groupHours } from '@/lib/formatting';

import type { LocationHoursData } from './schema';

/**
 * Bloque `location_hours` — vista pública.
 *
 * Reglas del plan:
 *  - El iframe solo se renderiza si `show_map` está activo Y hay `maps_embed_url`.
 *  - El iframe lleva `loading="lazy"` y un `title` descriptivo (accesibilidad), y
 *    `referrerPolicy="no-referrer-when-downgrade"` como recomienda Google.
 *  - El botón "Cómo llegar" solo aparece si hay `maps_url`.
 *  - Sin dirección, ni enlaces, ni horarios, el bloque no se muestra.
 */
export default function LocationHoursBlock({ data, settings }: BlockProps<LocationHoursData>) {
  const { contact } = settings;
  const hours = groupHours(settings.hours);

  const mapUrl = data.show_map ? contact.maps_embed_url : undefined;
  const directionsUrl = contact.maps_url;
  const hasSomething = Boolean(mapUrl || directionsUrl || contact.address || hours.length);
  if (!hasSomething) return null;

  return (
    <BlockContainer>
      <BlockHeading title={data.title} subtitle={data.subtitle} />

      <div className="grid gap-10 md:grid-cols-2">
        <div className="space-y-8">
          {contact.address ? (
            <div>
              <p className="block-label">Dirección</p>
              <p className="mt-1">{contact.address}</p>
              {directionsUrl ? (
                <div className="mt-4">
                  <Button href={directionsUrl} external variant="secondary">
                    {data.directions_label}
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}

          {hours.length > 0 ? (
            <div>
              <p className="block-label">Horarios</p>
              <ul className="mt-2 space-y-1">
                {hours.map((line) => (
                  <li key={line.days}>
                    <span className="font-medium">{line.days}:</span>{' '}
                    <span className="text-text-muted">{line.hours}</span>
                  </li>
                ))}
              </ul>
              {data.hours_note ? (
                <p className="mt-3 text-sm text-text-muted">{data.hours_note}</p>
              ) : null}
            </div>
          ) : null}
        </div>

        {mapUrl ? (
          <div className="overflow-hidden rounded-lg border border-border">
            <iframe
              src={mapUrl}
              title={`Mapa de ${settings.brand.name}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-80 w-full md:h-full md:min-h-[320px]"
            />
          </div>
        ) : null}
      </div>
    </BlockContainer>
  );
}

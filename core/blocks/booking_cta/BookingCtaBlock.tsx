import type { BlockProps } from '@/blocks/defineBlock';
import BlockContainer from '@/components/BlockContainer';
import Button from '@/components/Button';
import { buildWhatsappUrl, genericBookingMessage } from '@/lib/contact';

import type { BookingCtaData } from './schema';

/**
 * Bloque `booking_cta` — vista pública.
 *
 * Regla del plan: si el negocio no ha configurado su número de WhatsApp, el bloque
 * no se muestra. Un botón de reserva que no lleva a ningún sitio es peor que no
 * tener botón.
 */
export default function BookingCtaBlock({ data, settings }: BlockProps<BookingCtaData>) {
  const message = data.message_override?.trim()
    ? data.message_override
    : genericBookingMessage(settings.contact);

  const url = buildWhatsappUrl(settings.contact, message);
  if (!url) return null;

  return (
    <BlockContainer alternate>
      <div className="mx-auto max-w-2xl text-center">
        {data.title ? <h2>{data.title}</h2> : null}
        {data.text ? <p className="mt-4 text-lg text-text-muted">{data.text}</p> : null}

        <div className="mt-8 flex justify-center">
          <Button href={url} external>
            {data.button_label}
          </Button>
        </div>
      </div>
    </BlockContainer>
  );
}

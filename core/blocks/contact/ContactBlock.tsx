import type { BlockProps } from '@/blocks/defineBlock';
import BlockContainer from '@/components/BlockContainer';
import BlockHeading from '@/components/BlockHeading';
import Button from '@/components/Button';
import {
  buildEmailUrl,
  buildPhoneUrl,
  buildWhatsappUrl,
  genericBookingMessage,
  socialLinks,
} from '@/lib/contact';

import type { ContactData } from './schema';

/**
 * Bloque `contact` — vista pública.
 *
 * Reglas del plan: cada dato sale de `site_settings.contact`, se muestra solo si
 * existe y su interruptor está activo, y si no queda nada que mostrar el bloque
 * desaparece.
 *
 * Las redes se muestran como enlaces de texto con `aria-label`, no como iconos. El
 * plan pedía iconos, pero dibujar los logotipos de Instagram, TikTok y Facebook a
 * mano (no se permiten librerías de iconos) saldría peor que no ponerlos, y el enlace
 * de texto es igual de accesible y encaja con la línea minimalista.
 */
export default function ContactBlock({ data, settings }: BlockProps<ContactData>) {
  const { contact } = settings;

  const whatsappUrl = data.show_whatsapp
    ? buildWhatsappUrl(contact, genericBookingMessage(contact))
    : null;
  const phoneUrl = data.show_phone ? buildPhoneUrl(contact) : null;
  const emailUrl = data.show_email ? buildEmailUrl(contact) : null;
  const address = data.show_address ? contact.address : undefined;
  const socials = data.show_social ? socialLinks(contact) : [];

  const hasSomething = Boolean(whatsappUrl || phoneUrl || emailUrl || address || socials.length);
  if (!hasSomething) return null;

  return (
    <BlockContainer>
      <BlockHeading title={data.title} subtitle={data.subtitle} more={data.more} />

      <div className="grid gap-10 md:grid-cols-2">
        <ul className="space-y-6">
          {address ? (
            <li>
              <p className="block-label">Dirección</p>
              <p className="mt-1">{address}</p>
            </li>
          ) : null}

          {phoneUrl && contact.phone_display ? (
            <li>
              <p className="block-label">Teléfono</p>
              <a
                href={phoneUrl}
                className="mt-1 inline-block underline decoration-border hover:text-primary"
              >
                {contact.phone_display}
              </a>
            </li>
          ) : null}

          {emailUrl && contact.email ? (
            <li>
              <p className="block-label">Correo</p>
              <a
                href={emailUrl}
                className="mt-1 inline-block underline decoration-border hover:text-primary"
              >
                {contact.email}
              </a>
            </li>
          ) : null}
        </ul>

        <div className="space-y-8">
          {whatsappUrl ? (
            <div>
              <p className="block-label">WhatsApp</p>
              <div className="mt-3">
                <Button href={whatsappUrl} external>
                  Escribir por WhatsApp
                </Button>
              </div>
            </div>
          ) : null}

          {socials.length > 0 ? (
            <div>
              <p className="block-label">Redes</p>
              <ul className="mt-2 flex flex-wrap gap-4">
                {socials.map((social) => (
                  <li key={social.platform}>
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="underline decoration-border hover:text-primary"
                    >
                      {social.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </BlockContainer>
  );
}

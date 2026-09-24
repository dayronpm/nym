import Image from 'next/image';
import Link from 'next/link';

import { genericBookingMessage, buildWhatsappUrl } from '@/lib/contact';
import { getMediaUrl } from '@/lib/storage';
import type { BlockProps } from '@/blocks/defineBlock';

import type { HeroData } from './schema';

/**
 * Bloque `hero` — vista pública.
 *
 * Reglas aplicadas:
 *  - El `title` es el único <h1> de la página de Inicio.
 *  - La imagen usa `next/image` con `priority` (es el elemento principal de
 *    carga) y `alt` obligatorio (lo garantiza el esquema).
 *  - Sin imagen, el texto se centra sobre el fondo alterno.
 *  - El botón principal abre WhatsApp con el mensaje genérico; si el negocio no
 *    ha configurado su número, el botón no se muestra.
 */
export default function HeroBlock({ data, settings }: BlockProps<HeroData>) {
  const imageUrl = getMediaUrl(data.image);
  const whatsappUrl = buildWhatsappUrl(settings.contact, genericBookingMessage(settings.contact));

  const hasImage = Boolean(imageUrl);
  const imageFirst = data.image_position === 'left';

  return (
    <section
      className={hasImage ? 'section-y' : 'section-y bg-surface-alt'}
      aria-labelledby="hero-title"
    >
      <div className="container-page">
        <div
          className={
            hasImage
              ? 'grid items-center gap-10 md:grid-cols-2 md:gap-16'
              : 'mx-auto max-w-2xl text-center'
          }
        >
          {/* En móvil la imagen siempre va arriba, por eso el orden se ajusta
              solo a partir de `md`. */}
          {hasImage && imageUrl ? (
            <div className={imageFirst ? 'md:order-1' : 'md:order-2'}>
              <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-surface-alt md:aspect-[4/5]">
                <Image
                  src={imageUrl}
                  alt={data.image?.alt ?? ''}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>
          ) : null}

          <div className={hasImage ? (imageFirst ? 'md:order-2' : 'md:order-1') : undefined}>
            {data.eyebrow ? (
              <p className="text-sm uppercase tracking-[0.2em] text-text-muted">{data.eyebrow}</p>
            ) : null}

            <h1 id="hero-title" className="mt-3">
              {data.title}
            </h1>

            {data.subtitle ? (
              <p className="mt-5 text-lg text-text-muted">{data.subtitle}</p>
            ) : null}

            <div
              className={`mt-8 flex flex-wrap gap-3 ${hasImage ? '' : 'justify-center'}`}
            >
              {whatsappUrl ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md bg-primary px-6 py-3 font-medium text-on-primary transition-colors hover:bg-primary-hover"
                >
                  {data.primary_cta_label}
                </a>
              ) : null}

              {data.secondary_cta ? (
                <Link
                  href={data.secondary_cta.href}
                  className="rounded-md border border-border px-6 py-3 font-medium transition-colors hover:bg-primary-soft"
                >
                  {data.secondary_cta.label}
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

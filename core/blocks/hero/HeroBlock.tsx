import type { BlockProps } from '@/blocks/defineBlock';
import Image from '@/components/ui/Image';

import type { HeroData } from './schema';

/**
 * Bloque `hero` — vista pública.
 *
 * Reglas aplicadas:
 *  - El `title` es el único <h1> de la página de Inicio.
 *  - La imagen usa `priority` (es el elemento principal de carga) y `sizes`
 *    responsivos; el `alt` lo garantiza el esquema de `MediaRef`.
 *  - Sin imagen, el texto se centra sobre el fondo arena.
 *
 * No hay botones: se quitaron en la v2 del bloque. La reserva está en el botón fijo
 * del encabezado y en el bloque `booking_cta` al final de la página.
 */
export default function HeroBlock({ data }: BlockProps<HeroData>) {
  const hasImage = Boolean(data.image);
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
          {/* En móvil la imagen siempre va arriba, por eso el orden solo se ajusta
              a partir de `md`. */}
          {hasImage && data.image ? (
            <div className={imageFirst ? 'md:order-1' : 'md:order-2'}>
              <Image
                media={data.image}
                aspect="4:5"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          ) : null}

          <div className={hasImage ? (imageFirst ? 'md:order-2' : 'md:order-1') : undefined}>
            {data.eyebrow ? (
              <p className="text-sm uppercase tracking-[0.2em] text-text-muted">{data.eyebrow}</p>
            ) : null}

            <h1 id="hero-title" className="mt-3">
              {data.title}
            </h1>

            {data.subtitle ? <p className="mt-5 text-lg text-text-muted">{data.subtitle}</p> : null}
          </div>
        </div>
      </div>
    </section>
  );
}

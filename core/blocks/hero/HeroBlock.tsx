import NextImage from 'next/image';

import type { BlockProps } from '@/blocks/defineBlock';
import { cn } from '@/lib/cn';
import { getMediaUrl } from '@/lib/storage';

import type { HeroData } from './schema';

/**
 * Bloque `hero` — vista pública.
 *
 * Reglas aplicadas:
 *  - El `title` es el único <h1> de la página de Inicio.
 *  - La imagen usa `priority` (es el elemento principal de carga) y `sizes`
 *    responsivos; el `alt` lo garantiza el esquema de `MediaRef`.
 *  - La imagen se ajusta al **alto del texto** en escritorio (`object-contain`): la
 *    marca se ve entera, sin recortes, y las dos columnas quedan a la par.
 *  - Sin imagen, el texto se centra sobre el fondo arena.
 *
 * No hay botones: se quitaron en la v2 del bloque. La reserva está en el botón fijo
 * del encabezado y en el bloque `booking_cta` al final de la página.
 */
export default function HeroBlock({ data }: BlockProps<HeroData>) {
  // La URL puede faltar aunque haya imagen (entorno sin configurar): se trata como
  // «sin imagen» para no pintar un hueco roto.
  const imageUrl = getMediaUrl(data.image);
  const hasImage = Boolean(imageUrl);
  const imageFirst = data.image_position === 'left';

  return (
    <section className="section-y" aria-labelledby="hero-title">
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
          {hasImage && data.image && imageUrl ? (
            <div
              className={cn(
                // Móvil: la imagen va arriba, en un cuadrado centrado.
                'relative mx-auto aspect-square w-full max-w-sm sm:max-w-md',
                // Escritorio: la imagen se sale del flujo, así el alto de la fila lo marca
                // el TEXTO y el logotipo se ajusta a ese mismo alto — las dos columnas
                // quedan a la par.
                'md:aspect-auto md:max-w-none md:self-stretch',
                imageFirst ? 'md:order-1' : 'md:order-2',
              )}
            >
              <NextImage
                src={imageUrl}
                alt={data.image.alt}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain"
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

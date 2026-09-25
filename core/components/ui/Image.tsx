import NextImage from 'next/image';

import type { MediaRef } from '@/blocks/shared';
import { cn } from '@/lib/cn';
import { getMediaUrl } from '@/lib/storage';

/**
 * Imagen del sitio a partir de un `MediaRef`.
 *
 * Centraliza tres cosas que el plan exige en todos los bloques:
 *  - la URL se construye desde la ruta del bucket (`getMediaUrl`), nunca se guarda;
 *  - el recorte lo fija el contenedor con `object-cover` y una proporción;
 *  - `alt` viene del propio `MediaRef`, que lo obliga por esquema.
 *
 * No es un componente cliente: `next/image` funciona igual en el servidor.
 */
export type ImageAspect = '1:1' | '4:5' | '3:2' | '9:16';

export interface ImageProps {
  media: MediaRef;
  aspect?: ImageAspect;
  /** `sizes` de `next/image`: cuánto ocupa la imagen en cada ancho de pantalla. */
  sizes: string;
  /** Solo para la imagen principal de la página (el resto se cargan en diferido). */
  priority?: boolean;
  className?: string;
}

const ASPECT_CLASSES: Record<ImageAspect, string> = {
  '1:1': 'aspect-square',
  '4:5': 'aspect-[4/5]',
  '3:2': 'aspect-[3/2]',
  '9:16': 'aspect-[9/16]',
};

export default function Image({
  media,
  aspect = '4:5',
  sizes,
  priority,
  className,
}: ImageProps) {
  const url = getMediaUrl(media);

  // Sin URL no hay nada que pintar. Ocurre si falta la configuración del entorno;
  // cada bloque decide entonces si muestra un hueco o se oculta.
  if (!url) return null;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg bg-surface-alt',
        ASPECT_CLASSES[aspect],
        className,
      )}
    >
      <NextImage
        src={url}
        alt={media.alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    </div>
  );
}

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

/**
 * Redondeo de las esquinas.
 *
 * Existe como prop, y no se resuelve pasando `rounded-none` por `className`, porque
 * dos utilidades de Tailwind del mismo grupo dependen del orden en la hoja de
 * estilos, no del orden en el atributo `class`. Con la prop, el resultado es
 * determinista. Se usa `none` cuando la imagen va pegada al borde de una tarjeta que
 * ya recorta por su cuenta.
 */
export type ImageRounding = 'none' | 'md' | 'lg';

export interface ImageProps {
  media: MediaRef;
  aspect?: ImageAspect;
  rounded?: ImageRounding;
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

const ROUNDING_CLASSES: Record<ImageRounding, string> = {
  none: '',
  md: 'rounded-md',
  lg: 'rounded-lg',
};

export default function Image({
  media,
  aspect = '4:5',
  rounded = 'lg',
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
        'relative overflow-hidden bg-surface-alt',
        ASPECT_CLASSES[aspect],
        ROUNDING_CLASSES[rounded],
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

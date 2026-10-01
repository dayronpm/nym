import NextImage from 'next/image';

import { cn } from '@/lib/cn';
import { getMediaUrl } from '@/lib/storage';
import type { BrandSettings } from '@/types/settings';

/**
 * Logotipo del negocio: la marca del encabezado y del pie.
 *
 * Dos decisiones:
 *
 *  - **Variante oscura.** Si el negocio subió un logotipo para fondo oscuro (casi todas las
 *    marcas definen uno: el mismo logo en sus colores no siempre se lee sobre oscuro), se
 *    pintan las dos imágenes y el CSS enseña la que toca — mismo mecanismo que los iconos
 *    del interruptor de tema, sin JavaScript y sin parpadeo.
 *  - **Sin optimizar (`unoptimized`).** El archivo se sirve tal cual: un logotipo es plano,
 *    pequeño y ya viene comprimido; no merece variantes por cada ancho.
 *
 * Si no hay logotipo subido, cae al nombre como texto: el encabezado nunca se queda sin marca.
 */
export default function BrandLogo({
  brand,
  className,
  textClassName,
  priority,
}: {
  brand: BrandSettings;
  /** Alto del logotipo (`h-10`…). El ancho lo pone la proporción del archivo. */
  className?: string;
  /** Clases del nombre cuando no hay logotipo subido. */
  textClassName?: string;
  /** Precarga el archivo. Solo el logotipo del encabezado, que está sobre el pliegue. */
  priority?: boolean;
}) {
  const light = getMediaUrl(brand.logo);

  if (!light) {
    return <span className={textClassName}>{brand.name}</span>;
  }

  const dark = getMediaUrl(brand.logo_dark);

  return (
    <>
      <NextImage
        src={light}
        alt={brand.logo?.alt || brand.name}
        width={0}
        height={0}
        unoptimized
        priority={priority}
        className={cn('w-auto', className, dark ? 'logo-claro' : null)}
      />
      {dark ? (
        <NextImage
          src={dark}
          alt=""
          aria-hidden="true"
          width={0}
          height={0}
          unoptimized
          className={cn('logo-oscuro w-auto', className)}
        />
      ) : null}
    </>
  );
}

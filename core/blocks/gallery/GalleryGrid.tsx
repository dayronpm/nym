'use client';

import NextImage from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { MediaRef } from '@/blocks/shared';
import Image, { type ImageAspect } from '@/components/ui/Image';
import { cn } from '@/lib/cn';
import { getMediaUrl } from '@/lib/storage';

/**
 * Cuadrícula de la galería con visor ampliado.
 *
 * Es el único bloque con JavaScript en el sitio público, porque el visor necesita
 * estado y control de teclado.
 *
 * El visor se apoya en `<dialog>` nativo con `showModal()`, que ya aporta gratis lo
 * que el plan pide y es fácil de implementar mal a mano:
 *  - cierre con la tecla Esc,
 *  - foco atrapado dentro mientras está abierto,
 *  - el resto de la página queda inerte para los lectores de pantalla.
 *
 * Lo que sí hay que añadir es la navegación con las flechas del teclado y los botones
 * de anterior y siguiente. La imagen grande se carga solo al abrir (hasta entonces no
 * existe en el DOM), como pide el plan.
 */

export interface GalleryGridItem {
  id: string;
  image: MediaRef;
  caption?: string;
}

export interface GalleryGridProps {
  images: GalleryGridItem[];
  aspect: ImageAspect;
  columns: 2 | 3 | 4;
}

/** En móvil siempre 2 columnas, como marca el plan. */
const COLUMN_CLASSES: Record<2 | 3 | 4, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-2 lg:grid-cols-4',
};

const CONTROL_CLASSES =
  'flex h-11 w-11 items-center justify-center rounded-full border border-bg text-bg transition-colors hover:bg-surface hover:text-text';

export default function GalleryGrid({ images, aspect, columns }: GalleryGridProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const close = useCallback(() => setOpenIndex(null), []);

  const showPrevious = useCallback(() => {
    setOpenIndex((current) =>
      current === null ? current : (current - 1 + images.length) % images.length,
    );
  }, [images.length]);

  const showNext = useCallback(() => {
    setOpenIndex((current) => (current === null ? current : (current + 1) % images.length));
  }, [images.length]);

  // Abrir y cerrar el diálogo nativo cuando cambia la imagen seleccionada.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (openIndex === null) {
      if (dialog.open) dialog.close();
    } else if (!dialog.open) {
      dialog.showModal();
    }
  }, [openIndex]);

  // Navegación con las flechas y cierre con Esc. El <dialog> modal ya dispara
  // `cancel` al pulsar Esc, pero no todos los motores lo hacen (Electron integrado,
  // por ejemplo), así que lo tratamos aquí para que el cierre sea siempre el mismo.
  useEffect(() => {
    if (openIndex === null) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowRight') showNext();
      else if (event.key === 'ArrowLeft') showPrevious();
      else if (event.key === 'Escape') close();
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openIndex, close, showNext, showPrevious]);

  const current = openIndex === null ? undefined : images[openIndex];
  const currentUrl = current ? getMediaUrl(current.image) : null;
  const position = openIndex === null ? 0 : openIndex + 1;

  return (
    <>
      <ul className={cn('grid gap-3', COLUMN_CLASSES[columns])}>
        {images.map((item, index) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => setOpenIndex(index)}
              aria-label={`Ampliar imagen ${index + 1}${item.caption ? `: ${item.caption}` : ''}`}
              className="block w-full cursor-zoom-in"
            >
              <Image
                media={item.image}
                aspect={aspect}
                rounded="md"
                sizes={`(max-width: 1024px) 50vw, ${Math.round(100 / columns)}vw`}
              />
            </button>
          </li>
        ))}
      </ul>

      {/* El scrim del visor usa negro con opacidad y no un token del tema: una capa de
          oscurecimiento no es color de marca, es una convención de interfaz. */}
      <dialog
        ref={dialogRef}
        onClose={close}
        aria-label="Visor de imágenes"
        className="m-0 h-full max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-black/70"
      >
        {current && currentUrl ? (
          <div className="relative flex h-full w-full flex-col items-center justify-center p-4">
            <div className="relative h-[70vh] w-full max-w-4xl">
              <NextImage
                src={currentUrl}
                alt={current.image.alt}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>

            {current.caption ? (
              <p className="mt-4 max-w-2xl text-center text-sm text-bg">{current.caption}</p>
            ) : null}

            {/* aria-live para que el cambio de imagen se anuncie al navegar con flechas. */}
            <p className="mt-2 text-sm text-bg" aria-live="polite">
              {position} / {images.length}
            </p>

            <button
              type="button"
              onClick={close}
              aria-label="Cerrar el visor"
              className={cn(CONTROL_CLASSES, 'absolute right-4 top-4 text-2xl leading-none')}
            >
              ×
            </button>

            {images.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={showPrevious}
                  aria-label="Imagen anterior"
                  className={cn(CONTROL_CLASSES, 'absolute left-2 top-1/2 -translate-y-1/2 text-2xl leading-none')}
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={showNext}
                  aria-label="Imagen siguiente"
                  className={cn(CONTROL_CLASSES, 'absolute right-2 top-1/2 -translate-y-1/2 text-2xl leading-none')}
                >
                  ›
                </button>
              </>
            ) : null}
          </div>
        ) : null}
      </dialog>
    </>
  );
}

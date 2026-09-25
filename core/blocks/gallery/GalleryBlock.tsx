import type { BlockProps } from '@/blocks/defineBlock';
import BlockContainer from '@/components/BlockContainer';
import BlockHeading from '@/components/BlockHeading';

import GalleryGrid from './GalleryGrid';
import type { GalleryData } from './schema';

/**
 * Bloque `gallery` — vista pública.
 *
 * La cuadrícula y el visor están en `GalleryGrid`, que es componente cliente. Aquí
 * solo se filtran las imágenes desactivadas y se decide si el bloque se muestra.
 */
export default function GalleryBlock({ data }: BlockProps<GalleryData>) {
  const images = data.images.filter((item) => item.enabled);

  // Sin imágenes el bloque desaparece: el plan prohíbe las secciones vacías.
  if (images.length === 0) return null;

  return (
    <BlockContainer>
      <BlockHeading title={data.title} subtitle={data.subtitle} />
      <GalleryGrid
        images={images}
        aspect={data.aspect_ratio}
        columns={data.columns_desktop}
      />
    </BlockContainer>
  );
}

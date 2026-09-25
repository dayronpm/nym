import { defineBlock } from '@/blocks/defineBlock';
import BlockFormPending from '@/components/admin/BlockFormPending';

import GalleryBlock from './GalleryBlock';
import { GALLERY_DEFAULTS, GallerySchema } from './schema';

export const galleryBlock = defineBlock(
  'gallery',
  GallerySchema,
  GalleryBlock,
  BlockFormPending,
  GALLERY_DEFAULTS,
  1,
  {
    label: 'Galería',
    description: 'Cuadrícula uniforme con visor ampliado (Esc para cerrar, flechas para navegar).',
  },
);

export { GALLERY_DEFAULTS, GallerySchema } from './schema';
export type { GalleryData } from './schema';

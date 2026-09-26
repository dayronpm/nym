import { defineBlock } from '@/blocks/defineBlock';
import { createBlockForm } from '@/components/admin/createBlockForm';

import GalleryBlock from './GalleryBlock';
import { GALLERY_DEFAULTS, GallerySchema } from './schema';

export const galleryBlock = defineBlock(
  'gallery',
  GallerySchema,
  GalleryBlock,
  createBlockForm(GallerySchema, 'gallery'),
  GALLERY_DEFAULTS,
  1,
  {
    label: 'Galería',
    description: 'Cuadrícula uniforme con visor ampliado (Esc para cerrar, flechas para navegar).',
  },
);

export { GALLERY_DEFAULTS, GallerySchema } from './schema';
export type { GalleryData } from './schema';

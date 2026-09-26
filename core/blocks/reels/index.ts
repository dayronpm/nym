import { defineBlock } from '@/blocks/defineBlock';
import { createBlockForm } from '@/components/admin/createBlockForm';

import ReelsBlock from './ReelsBlock';
import { REELS_DEFAULTS, ReelsSchema } from './schema';

export const reelsBlock = defineBlock(
  'reels',
  ReelsSchema,
  ReelsBlock,
  createBlockForm(ReelsSchema, 'reels'),
  REELS_DEFAULTS,
  1,
  { label: 'Reels / Redes', description: 'Tarjetas con miniatura y enlace, sin embeds.' },
);

export { REELS_DEFAULTS, ReelsSchema } from './schema';
export type { ReelsData } from './schema';

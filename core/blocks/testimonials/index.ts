import { defineBlock } from '@/blocks/defineBlock';
import BlockFormPending from '@/components/admin/BlockFormPending';

import TestimonialsBlock from './TestimonialsBlock';
import { TESTIMONIALS_DEFAULTS, TestimonialsSchema } from './schema';

export const testimonialsBlock = defineBlock(
  'testimonials',
  TestimonialsSchema,
  TestimonialsBlock,
  BlockFormPending,
  TESTIMONIALS_DEFAULTS,
  1,
  { label: 'Testimonios', description: 'Reseñas escritas a mano, con imagen opcional.' },
);

export { TESTIMONIALS_DEFAULTS, TestimonialsSchema } from './schema';
export type { TestimonialsData } from './schema';

import { defineBlock } from '@/blocks/defineBlock';

import FaqBlock from './FaqBlock';
import { FAQ_DEFAULTS, FaqSchema } from './schema';

export const faqBlock = defineBlock(
  'faq',
  FaqSchema,
  FaqBlock,
  FAQ_DEFAULTS,
  1,
  {
    label: 'Preguntas frecuentes',
    description: 'Acordeón de preguntas y respuestas.',
  },
);

export { FAQ_DEFAULTS, FaqSchema } from './schema';
export type { FaqData } from './schema';

import { defineBlock } from '@/blocks/defineBlock';
import { createBlockForm } from '@/components/admin/createBlockForm';

import HeroBlock from './HeroBlock';
import { HERO_DEFAULTS, HeroSchema } from './schema';

/**
 * Registro del bloque `hero`.
 *
 * `version: 2` — en la v1 el bloque tenía los botones de reserva y "Ver servicios";
 * se quitaron porque la página ya los ofrece en el encabezado y al final.
 */
export const heroBlock = defineBlock(
  'hero',
  HeroSchema,
  HeroBlock,
  createBlockForm(HeroSchema, 'hero'),
  HERO_DEFAULTS,
  2,
  { label: 'Hero', description: 'Portada de Inicio: texto e imagen lado a lado.' },
);

export { HERO_DEFAULTS, HeroSchema } from './schema';
export type { HeroData } from './schema';

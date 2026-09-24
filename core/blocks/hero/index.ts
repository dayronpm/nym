import { defineBlock } from '@/blocks/defineBlock';

import HeroBlock from './HeroBlock';
import HeroForm from './HeroForm';
import { HERO_DEFAULTS, HeroSchema } from './schema';

/**
 * Registro del bloque `hero`.
 *
 * Este es el patrón que siguen los diez bloques: el esquema es la fuente única
 * de verdad y de él salen el componente público, el formulario del panel y los
 * valores por defecto.
 */
export const heroBlock = defineBlock(
  'hero',
  HeroSchema,
  HeroBlock,
  HeroForm,
  HERO_DEFAULTS,
  1,
  { label: 'Hero', description: 'Portada de Inicio: texto e imagen lado a lado.' },
);

export { HeroSchema, HERO_DEFAULTS } from './schema';
export type { HeroData } from './schema';

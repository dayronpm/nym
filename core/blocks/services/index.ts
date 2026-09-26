import { defineBlock } from '@/blocks/defineBlock';
import { createBlockForm } from '@/components/admin/createBlockForm';

import ServicesBlock from './ServicesBlock';
import { SERVICES_DEFAULTS, ServicesSchema } from './schema';

/**
 * Registro del bloque `services`.
 *
 * Nombre del esquema: `ServicesSchema`, no `ServicesBlock`. En el plan chocaban
 * el esquema y su entrada en el registro, que se llamaban igual.
 */
export const servicesBlock = defineBlock(
  'services',
  ServicesSchema,
  ServicesBlock,
  createBlockForm(ServicesSchema, 'services'),
  SERVICES_DEFAULTS,
  1,
  {
    label: 'Servicios',
    description: 'Catálogo de servicios. En Inicio en modo resumen, en /servicios completo.',
  },
);

export { SERVICES_DEFAULTS, ServicesSchema } from './schema';
export type { ServicesData } from './schema';

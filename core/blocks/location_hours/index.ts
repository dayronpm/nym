import { defineBlock } from '@/blocks/defineBlock';
import BlockFormPending from '@/components/admin/BlockFormPending';

import LocationHoursBlock from './LocationHoursBlock';
import { LOCATION_HOURS_DEFAULTS, LocationHoursSchema } from './schema';

export const locationHoursBlock = defineBlock(
  'location_hours',
  LocationHoursSchema,
  LocationHoursBlock,
  BlockFormPending,
  LOCATION_HOURS_DEFAULTS,
  1,
  {
    label: 'Ubicación y horarios',
    description: 'Mapa incrustado, botón "Cómo llegar" y horarios agrupados.',
  },
);

export { LOCATION_HOURS_DEFAULTS, LocationHoursSchema } from './schema';
export type { LocationHoursData } from './schema';

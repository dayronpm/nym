import { defineBlock } from '@/blocks/defineBlock';
import BlockFormPending from '@/components/admin/BlockFormPending';

import TeamBlock from './TeamBlock';
import { TEAM_DEFAULTS, TeamSchema } from './schema';

export const teamBlock = defineBlock(
  'team',
  TeamSchema,
  TeamBlock,
  BlockFormPending,
  TEAM_DEFAULTS,
  1,
  { label: 'Equipo', description: 'Personas del negocio, con avatar de iniciales si no hay foto.' },
);

export { TEAM_DEFAULTS, TeamSchema } from './schema';
export type { TeamData } from './schema';

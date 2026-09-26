import { defineBlock } from '@/blocks/defineBlock';
import { createBlockForm } from '@/components/admin/createBlockForm';

import TeamBlock from './TeamBlock';
import { TEAM_DEFAULTS, TeamSchema } from './schema';

export const teamBlock = defineBlock(
  'team',
  TeamSchema,
  TeamBlock,
  createBlockForm(TeamSchema, 'team'),
  TEAM_DEFAULTS,
  1,
  { label: 'Equipo', description: 'Personas del negocio, con avatar de iniciales si no hay foto.' },
);

export { TEAM_DEFAULTS, TeamSchema } from './schema';
export type { TeamData } from './schema';

import { defineBlock } from '@/blocks/defineBlock';
import BlockFormPending from '@/components/admin/BlockFormPending';

import ContactBlock from './ContactBlock';
import { CONTACT_DEFAULTS, ContactSchema } from './schema';

export const contactBlock = defineBlock(
  'contact',
  ContactSchema,
  ContactBlock,
  BlockFormPending,
  CONTACT_DEFAULTS,
  1,
  { label: 'Contacto', description: 'Datos y botones de contacto, sin formulario.' },
);

export { CONTACT_DEFAULTS, ContactSchema } from './schema';
export type { ContactData } from './schema';

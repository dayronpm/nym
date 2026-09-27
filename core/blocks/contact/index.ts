import { defineBlock } from '@/blocks/defineBlock';

import ContactBlock from './ContactBlock';
import { CONTACT_DEFAULTS, ContactSchema } from './schema';

export const contactBlock = defineBlock(
  'contact',
  ContactSchema,
  ContactBlock,
  CONTACT_DEFAULTS,
  1,
  { label: 'Contacto', description: 'Datos y botones de contacto, sin formulario.' },
);

export { CONTACT_DEFAULTS, ContactSchema } from './schema';
export type { ContactData } from './schema';

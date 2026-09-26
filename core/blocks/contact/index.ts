import { defineBlock } from '@/blocks/defineBlock';
import { createBlockForm } from '@/components/admin/createBlockForm';

import ContactBlock from './ContactBlock';
import { CONTACT_DEFAULTS, ContactSchema } from './schema';

export const contactBlock = defineBlock(
  'contact',
  ContactSchema,
  ContactBlock,
  createBlockForm(ContactSchema, 'contact'),
  CONTACT_DEFAULTS,
  1,
  { label: 'Contacto', description: 'Datos y botones de contacto, sin formulario.' },
);

export { CONTACT_DEFAULTS, ContactSchema } from './schema';
export type { ContactData } from './schema';

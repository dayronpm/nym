import { defineBlock } from '@/blocks/defineBlock';
import BlockFormPending from '@/components/admin/BlockFormPending';

import BookingCtaBlock from './BookingCtaBlock';
import { BOOKING_CTA_DEFAULTS, BookingCtaSchema } from './schema';

export const bookingCtaBlock = defineBlock(
  'booking_cta',
  BookingCtaSchema,
  BookingCtaBlock,
  BlockFormPending,
  BOOKING_CTA_DEFAULTS,
  1,
  { label: 'Reservar por WhatsApp', description: 'Llamada a la acción con mensaje prellenado.' },
);

export { BOOKING_CTA_DEFAULTS, BookingCtaSchema } from './schema';
export type { BookingCtaData } from './schema';

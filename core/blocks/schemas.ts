import type { z } from 'zod';

import { BookingCtaSchema } from './booking_cta/schema';
import { ContactSchema } from './contact/schema';
import { FaqSchema } from './faq/schema';
import { GallerySchema } from './gallery/schema';
import { HeroSchema } from './hero/schema';
import { LocationHoursSchema } from './location_hours/schema';
import { ReelsSchema } from './reels/schema';
import { ServicesSchema } from './services/schema';
import { TeamSchema } from './team/schema';
import { TestimonialsSchema } from './testimonials/schema';

/**
 * Esquemas de los bloques, sin sus componentes.
 *
 * Existe por la frontera cliente/servidor: `registry.ts` une cada bloque con su componente
 * público, así que no se puede importar desde un componente cliente (arrastraría los
 * componentes de servidor al bundle del navegador). El panel, en cambio, necesita el
 * **esquema** en el cliente para generar el formulario.
 *
 * Este archivo es ese subconjunto: solo esquemas, que son zod puro y viajan sin problema. Es
 * la única lista que hay que mantener en paralelo al registro, y el tipo `Record<string,
 * z.ZodTypeAny>` obliga a que las claves coincidan con lo que guarda `blocks.type`.
 */
export const BLOCK_SCHEMAS: Record<string, z.ZodTypeAny> = {
  hero: HeroSchema,
  services: ServicesSchema,
  gallery: GallerySchema,
  team: TeamSchema,
  faq: FaqSchema,
  contact: ContactSchema,
  location_hours: LocationHoursSchema,
  testimonials: TestimonialsSchema,
  booking_cta: BookingCtaSchema,
  reels: ReelsSchema,
};

export function getBlockSchema(type: string): z.ZodTypeAny | null {
  return BLOCK_SCHEMAS[type] ?? null;
}

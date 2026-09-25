import type { ComponentType } from 'react';
import { z } from 'zod';

import { bookingCtaBlock } from '@/blocks/booking_cta';
import { contactBlock } from '@/blocks/contact';
import { faqBlock } from '@/blocks/faq';
import { galleryBlock } from '@/blocks/gallery';
import { heroBlock } from '@/blocks/hero';
import { locationHoursBlock } from '@/blocks/location_hours';
import { reelsBlock } from '@/blocks/reels';
import { servicesBlock } from '@/blocks/services';
import { teamBlock } from '@/blocks/team';
import { testimonialsBlock } from '@/blocks/testimonials';
import type { SiteSettings } from '@/types/settings';

/**
 * Un bloque cualquiera del registro.
 *
 * No se puede escribir como `Block<z.ZodTypeAny>`. `Block<S>` usa `z.infer<S>`, y
 * TypeScript no resuelve ese condicional cuando `S` es el comodín: comparar un
 * bloque concreto con el comodín falla y obligaría a un `as unknown` en cada
 * entrada del registro.
 *
 * Esta interfaz describe la misma forma sin genéricos, con `any` justo donde el
 * tipo depende del bloque (los props del componente y del formulario). El tipo
 * específico — `HeroData`, etc. — se recupera validando con `parseBlockData`, que
 * es donde el esquema del bloque vuelve a entrar en juego.
 */
export interface AnyBlock {
  type: string;
  schema: z.ZodTypeAny;
  Component: ComponentType<{ data: any; settings: SiteSettings }>;
  Form: ComponentType<{
    initialData: any;
    onChange: (data: any) => void;
    errors?: Record<string, string>;
  }>;
  defaults: any;
  version: number;
  label: string;
  description?: string;
}

/**
 * Registro global de bloques.
 *
 * Es la única lista que hay que tocar al añadir un bloque nuevo. Cada entrada
 * aporta su esquema, su componente público, su formulario y sus valores por
 * defecto.
 *
 * La clave es el valor que se guarda en `blocks.type`.
 */
export const BLOCK_REGISTRY: Record<string, AnyBlock> = {
  hero: heroBlock,
  services: servicesBlock,
  gallery: galleryBlock,
  team: teamBlock,
  faq: faqBlock,
  contact: contactBlock,
  location_hours: locationHoursBlock,
  testimonials: testimonialsBlock,
  booking_cta: bookingCtaBlock,
  reels: reelsBlock,
};

export function getBlockDefinition(type: string): AnyBlock | null {
  return BLOCK_REGISTRY[type] ?? null;
}

/** Tipos de bloque disponibles, para listas y validaciones del panel. */
export const BLOCK_TYPES = Object.keys(BLOCK_REGISTRY);

/**
 * Bloques pendientes de implementar.
 *
 * Está vacío: los diez bloques del plan ya están registrados arriba. La constante se
 * mantiene porque es el sitio natural donde mirar al añadir un bloque nuevo, y el
 * panel la usa para avisar de los que aún no existen.
 */
export const PENDING_BLOCKS: readonly string[] = [];

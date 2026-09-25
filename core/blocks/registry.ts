import type { ComponentType } from 'react';
import { z } from 'zod';

import { bookingCtaBlock } from '@/blocks/booking_cta';
import { faqBlock } from '@/blocks/faq';
import { heroBlock } from '@/blocks/hero';
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
  team: teamBlock,
  faq: faqBlock,
  testimonials: testimonialsBlock,
  booking_cta: bookingCtaBlock,
};

export function getBlockDefinition(type: string): AnyBlock | null {
  return BLOCK_REGISTRY[type] ?? null;
}

/** Tipos de bloque disponibles, para listas y validaciones del panel. */
export const BLOCK_TYPES = Object.keys(BLOCK_REGISTRY);

/**
 * Bloques pendientes de la Fase 1.
 *
 * Se listan de forma explícita para que el trabajo pendiente no se pierda de vista.
 * Al implementar cada uno:
 *   1. crear `core/blocks/<tipo>/` con schema.ts, <Tipo>Block.tsx e index.ts
 *   2. registrarlo en BLOCK_REGISTRY y borrarlo de esta lista
 */
export const PENDING_BLOCKS = ['gallery', 'contact', 'location_hours', 'reels'] as const;

import type { Block } from '@/blocks/defineBlock';
import { heroBlock } from '@/blocks/hero';

/**
 * Registro global de bloques.
 *
 * Es la única lista que hay que tocar al añadir un bloque nuevo. Cada entrada
 * aporta su esquema, su componente público, su formulario y sus valores por
 * defecto.
 *
 * La clave es el valor que se guarda en `blocks.type`.
 */
export const BLOCK_REGISTRY: Record<string, Block<never>> = {
  hero: heroBlock as unknown as Block<never>,
};

export function getBlockDefinition(type: string): Block<never> | null {
  return BLOCK_REGISTRY[type] ?? null;
}

/** Tipos de bloque disponibles, para listas y validaciones del panel. */
export const BLOCK_TYPES = Object.keys(BLOCK_REGISTRY);

/**
 * Bloques pendientes de la Fase 1.
 *
 * Se listan aquí de forma explícita para que el orden de trabajo quede claro y
 * no se pierda ninguno. Al implementar cada uno:
 *   1. crear `core/blocks/<tipo>/` con schema.ts, <Tipo>Block.tsx, <Tipo>Form.tsx e index.ts
 *   2. registrarlo en BLOCK_REGISTRY y borrarlo de esta lista
 */
export const PENDING_BLOCKS = [
  'services',
  'gallery',
  'team',
  'faq',
  'contact',
  'location_hours',
  'testimonials',
  'booking_cta',
  'reels',
] as const;

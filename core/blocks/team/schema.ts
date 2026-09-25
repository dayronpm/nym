import { z } from 'zod';

import { MoreLinkSchema, SourcePageRef } from '@/blocks/links';
import { MediaRef } from '@/blocks/shared';

/**
 * Bloque `team` — Equipo.
 *
 * Decisión: cada persona lleva foto, nombre, cargo y una biografía corta opcional.
 * Sin foto se muestra un avatar con las iniciales, así que el bloque funciona
 * desde el primer día aunque el negocio todavía no tenga las fotos.
 */
export const TeamMember = z.object({
  id: z.string(),
  name: z.string().min(1, 'El nombre es obligatorio.').max(60),
  role: z.string().min(1, 'El cargo es obligatorio.').max(80),
  bio: z.string().max(400).optional(),
  photo: MediaRef.optional(),
  enabled: z.boolean().default(true),
});

export type TeamMember = z.infer<typeof TeamMember>;

export const TeamSchema = z.object({
  title: z.string().max(80).default('Nuestro equipo'),
  subtitle: z.string().max(200).optional(),
  members: z.array(TeamMember).max(24).default([]),
  /** Cuántas personas se ven. Sin valor, todas: es el corte de la portada. */
  limit: z.number().int().min(1).max(24).optional(),
  /** De qué página sale el equipo, para el resumen de Inicio. */
  source_page: SourcePageRef,
  /** Enlace a la página completa, para la instancia de Inicio. */
  more: MoreLinkSchema.optional(),
});

export type TeamData = z.infer<typeof TeamSchema>;

export const TEAM_DEFAULTS: TeamData = TeamSchema.parse({
  title: 'Nuestro equipo',
  members: [],
});

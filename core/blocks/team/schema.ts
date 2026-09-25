import { z } from 'zod';

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
});

export type TeamData = z.infer<typeof TeamSchema>;

export const TEAM_DEFAULTS: TeamData = TeamSchema.parse({
  title: 'Nuestro equipo',
  members: [],
});

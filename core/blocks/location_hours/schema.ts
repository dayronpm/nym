import { z } from 'zod';

/**
 * Bloque `location_hours` — Ubicación y horarios.
 *
 * Decisión: mapa de Google Maps incrustado (iframe con carga diferida) más el botón
 * "Cómo llegar".
 *
 * Los datos NO se guardan aquí: vienen de `site_settings.contact` (dirección y
 * enlaces) y de `site_settings.hours`. Este bloque solo decide qué se enseña, para
 * que la dirección y los horarios sean los mismos en el pie, en la página de contacto
 * y en los datos estructurados de SEO.
 */
export const LocationHoursSchema = z.object({
  title: z.string().max(80).default('Visítanos'),
  subtitle: z.string().max(200).optional(),
  show_map: z.boolean().default(true),
  directions_label: z.string().max(40).default('Cómo llegar'),
  /** Aviso bajo los horarios, por ejemplo "Atención con cita previa". */
  hours_note: z.string().max(200).optional(),
});

export type LocationHoursData = z.infer<typeof LocationHoursSchema>;

export const LOCATION_HOURS_DEFAULTS: LocationHoursData = LocationHoursSchema.parse({
  title: 'Visítanos',
  show_map: true,
  directions_label: 'Cómo llegar',
});

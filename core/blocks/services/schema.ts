import { z } from 'zod';

/**
 * Bloque `services` — Servicios.
 *
 * Ojo con la decisión más importante de este bloque: **no guarda el catálogo**.
 * El catálogo de servicios es un dato único compartido
 * (`site_settings.services_catalog`), porque este bloque aparece dos veces: en
 * Inicio en modo resumen y en `/servicios` en modo completo. Si cada instancia
 * guardara su propia copia, el dueño tendría que editar el mismo servicio dos
 * veces y las dos versiones podrían desincronizarse.
 *
 * Así que aquí solo se guarda **cómo mostrarlo** en esa página.
 *
 * Este esquema es el CONTRATO del bloque: no se pueden cambiar nombres de campos
 * sin subir `version` y escribir una migración de contenido.
 */
export const ServicesSchema = z.object({
  title: z.string().max(80).default('Nuestros servicios'),
  subtitle: z.string().max(200).optional(),
  /** `summary` muestra un extracto por categoría; `full`, el catálogo entero. */
  mode: z.enum(['summary', 'full']).default('full'),
  /** Servicios por categoría cuando `mode` es `summary`. */
  summary_limit: z.number().int().min(1).max(8).default(4),
  show_prices: z.boolean().default(true),
  show_durations: z.boolean().default(true),
  /** Qué mostrar cuando el precio está oculto o el servicio no lo tiene. */
  price_hidden_label: z.string().max(60).default('Consultar por WhatsApp'),
  /** Botón "Reservar" en cada servicio, con el nombre prellenado. */
  show_booking_button: z.boolean().default(true),
});

export type ServicesData = z.infer<typeof ServicesSchema>;

export const SERVICES_DEFAULTS: ServicesData = ServicesSchema.parse({
  title: 'Nuestros servicios',
  mode: 'full',
  summary_limit: 4,
  show_prices: true,
  show_durations: true,
  price_hidden_label: 'Consultar por WhatsApp',
  show_booking_button: true,
});

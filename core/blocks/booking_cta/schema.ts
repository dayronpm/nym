import { z } from 'zod';

/**
 * Bloque `booking_cta` — Reservar por WhatsApp.
 *
 * Decisión de la v1: botón con mensaje prellenado, sin formulario y sin backend.
 * El formulario con fecha y hora, y la bandeja de solicitudes, son el módulo
 * futuro de reservas con calendario.
 */
export const BookingCtaSchema = z.object({
  title: z.string().max(80).default('Reserva tu cita'),
  text: z.string().max(240).optional(),
  button_label: z.string().max(40).default('Reservar por WhatsApp'),
  /** Si está vacío se usa `contact.booking_message_generic`. */
  message_override: z.string().max(300).optional(),
});

export type BookingCtaData = z.infer<typeof BookingCtaSchema>;

export const BOOKING_CTA_DEFAULTS: BookingCtaData = BookingCtaSchema.parse({
  title: 'Reserva tu cita',
  button_label: 'Reservar por WhatsApp',
});

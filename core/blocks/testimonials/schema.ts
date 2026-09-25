import { z } from 'zod';

import { MediaRef } from '@/blocks/shared';

/**
 * Bloque `testimonials` — Testimonios.
 *
 * Decisión: testimonios escritos a mano en el panel, con imagen opcional (foto del
 * cliente o captura de una reseña).
 *
 * El bloque existe en la plantilla, pero N&M Salón Spa no lo usa: en su copia
 * queda desactivado. Si no hay testimonios activos, no se muestra — nada de
 * secciones vacías.
 *
 * SEO: a propósito NO se generan datos estructurados `Review` ni
 * `AggregateRating` a partir de esto. Google no suele mostrar estrellas para
 * reseñas que el propio negocio publica sobre sí mismo.
 */
export const TestimonialItem = z.object({
  id: z.string(),
  quote: z.string().min(1, 'El texto del testimonio es obligatorio.').max(500),
  /** Nombre o inicial, por ejemplo "María G.". */
  author_name: z.string().min(1, 'El nombre es obligatorio.').max(60),
  /** Servicio al que se refiere el testimonio. */
  service: z.string().max(80).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  image: MediaRef.optional(),
  enabled: z.boolean().default(true),
});

export type TestimonialItem = z.infer<typeof TestimonialItem>;

export const TestimonialsSchema = z.object({
  title: z.string().max(80).default('Lo que dicen nuestros clientes'),
  subtitle: z.string().max(200).optional(),
  show_ratings: z.boolean().default(true),
  items: z.array(TestimonialItem).default([]),
});

export type TestimonialsData = z.infer<typeof TestimonialsSchema>;

export const TESTIMONIALS_DEFAULTS: TestimonialsData = TestimonialsSchema.parse({
  title: 'Lo que dicen nuestros clientes',
  show_ratings: true,
  items: [],
});

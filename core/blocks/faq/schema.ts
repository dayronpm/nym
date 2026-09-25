import { z } from 'zod';

/**
 * Bloque `faq` — Preguntas frecuentes.
 *
 * Decisión: acordeón simple; cada pregunta se despliega al tocarla y se pueden
 * tener varias abiertas a la vez. Las respuestas están en el HTML aunque estén
 * cerradas, para que los buscadores las lean.
 *
 * SEO: a propósito NO se generan datos estructurados `FAQPage`. Google restringió
 * esos resultados enriquecidos a sitios oficiales de gobierno y salud.
 */
export const FaqItem = z.object({
  id: z.string(),
  question: z.string().min(1, 'La pregunta es obligatoria.').max(160),
  /** Texto plano; los saltos de línea se respetan al mostrar. */
  answer: z.string().min(1, 'La respuesta es obligatoria.').max(1000),
  enabled: z.boolean().default(true),
});

export type FaqItem = z.infer<typeof FaqItem>;

export const FaqSchema = z.object({
  title: z.string().max(80).default('Preguntas frecuentes'),
  subtitle: z.string().max(200).optional(),
  items: z.array(FaqItem).max(30).default([]),
});

export type FaqData = z.infer<typeof FaqSchema>;

export const FAQ_DEFAULTS: FaqData = FaqSchema.parse({
  title: 'Preguntas frecuentes',
  items: [],
});

import { z } from 'zod';

import { MediaRef } from '@/blocks/shared';
import { hexColor, phoneNumber, time24h, whatsappNumber } from '@/lib/validation';

/**
 * Esquemas de configuración del sitio (`site_settings`).
 *
 * Es el "esquema maestro": todo lo que no pertenece a un bloque concreto.
 * Se guarda en una sola fila (id = 1) y se edita desde:
 *   - /admin/negocio     -> contact, hours
 *   - /admin/apariencia  -> theme
 *   - /admin/seo         -> seo_defaults
 *   - /admin/servicios   -> services_catalog
 *
 * Los valores por defecto de aquí deben coincidir con los tokens de
 * `core/styles/globals.css` y con el INSERT de la migración 000.
 */

/* -------------------------------------------------------------------------- */
/* Tema (tokens de diseño)                                                     */
/* -------------------------------------------------------------------------- */

export const SiteThemeColors = z.object({
  bg: hexColor(),
  surface: hexColor(),
  surface_alt: hexColor(),
  text: hexColor(),
  text_muted: hexColor(),
  border: hexColor(),
  primary: hexColor(),
  primary_hover: hexColor(),
  primary_soft: hexColor(),
  on_primary: hexColor(),
});

export const SiteTheme = z.object({
  colors: SiteThemeColors,
  fonts: z.object({
    /** Nombre de la fuente de títulos. Limitada a la lista curada del código. */
    heading: z.string().min(1),
    body: z.string().min(1),
  }),
  radius: z.object({
    sm: z.string().min(1),
    md: z.string().min(1),
    lg: z.string().min(1),
  }),
});

export type SiteTheme = z.infer<typeof SiteTheme>;

/** Tema por defecto: paleta neutra cálida con acento terracota. */
export const DEFAULT_THEME: SiteTheme = {
  colors: {
    bg: '#FAF7F2',
    surface: '#FFFFFF',
    surface_alt: '#F3EDE4',
    text: '#2B2622',
    text_muted: '#6B625A',
    border: '#E5DCD0',
    primary: '#B0603F',
    primary_hover: '#93502F',
    primary_soft: '#F1DDD2',
    on_primary: '#FFFFFF',
  },
  fonts: {
    heading: 'Cormorant Garamond',
    body: 'Inter',
  },
  radius: {
    sm: '6px',
    md: '12px',
    lg: '20px',
  },
};

/* -------------------------------------------------------------------------- */
/* Marca                                                                       */
/* -------------------------------------------------------------------------- */

export const BrandSettings = z.object({
  name: z.string().min(1, 'El nombre del negocio es obligatorio.').max(80),
  tagline: z.string().max(160).optional(),
  logo: MediaRef.optional(),
  favicon: MediaRef.optional(),
});

export type BrandSettings = z.infer<typeof BrandSettings>;

export const DEFAULT_BRAND: BrandSettings = {
  // Contenido neutro de ejemplo: la plantilla no lleva datos de ningún negocio real.
  name: 'Nombre del Negocio',
};

/* -------------------------------------------------------------------------- */
/* Contacto                                                                    */
/* -------------------------------------------------------------------------- */

export const ContactSettings = z.object({
  /** Solo dígitos con código de país, sin "+". Ej.: "50760000000". */
  whatsapp: whatsappNumber('Solo dígitos con código de país, sin "+". Ej.: 50760000000.').optional(),
  /** Cómo se muestra al público. Ej.: "6000-0000". */
  phone_display: z.string().max(30).optional(),
  /** Para el enlace tel:. Ej.: "+50760000000". */
  phone: phoneNumber().optional(),
  email: z.string().email('Correo inválido.').optional(),
  address: z.string().max(200).optional(),
  /** Enlace a Google Maps para el botón "Cómo llegar". */
  maps_url: z.string().url('URL inválida.').optional(),
  /** URL de "Insertar un mapa" de Google Maps (iframe). */
  maps_embed_url: z.string().url('URL inválida.').optional(),
  instagram_url: z.string().url('URL inválida.').optional(),
  tiktok_url: z.string().url('URL inválida.').optional(),
  facebook_url: z.string().url('URL inválida.').optional(),
  booking_message_generic: z
    .string()
    .max(300)
    .default('Hola, quisiera reservar una cita. ¿Me pueden ayudar?'),
  booking_message_service: z
    .string()
    .max(300)
    .default('Hola, quisiera reservar: {servicio}. ¿Tienen disponibilidad?'),
});

export type ContactSettings = z.infer<typeof ContactSettings>;

export const DEFAULT_CONTACT: ContactSettings = {
  booking_message_generic: 'Hola, quisiera reservar una cita. ¿Me pueden ayudar?',
  booking_message_service: 'Hola, quisiera reservar: {servicio}. ¿Tienen disponibilidad?',
};

/* -------------------------------------------------------------------------- */
/* Horarios                                                                    */
/* -------------------------------------------------------------------------- */

export const WEEK_DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

export type WeekDay = (typeof WEEK_DAYS)[number];

export const HoursRange = z.object({
  open: time24h(),
  close: time24h(),
});

export const DayHours = z.object({
  day: z.enum(WEEK_DAYS),
  closed: z.boolean().default(false),
  /** Hasta 2 tramos, para permitir el cierre al mediodía. */
  ranges: z.array(HoursRange).max(2).default([]),
});

export type DayHours = z.infer<typeof DayHours>;

export const HoursSettings = z.array(DayHours).length(7);

/** Semana laboral por defecto (ejemplo neutro, editable desde el panel). */
export const DEFAULT_HOURS: DayHours[] = WEEK_DAYS.map((day) => ({
  day,
  closed: day === 'sun',
  ranges: day === 'sun' ? [] : [{ open: '09:00', close: '18:00' }],
}));

/* -------------------------------------------------------------------------- */
/* Catálogo de servicios                                                       */
/* -------------------------------------------------------------------------- */

export const ServiceItem = z.object({
  id: z.string(),
  name: z.string().min(1, 'El nombre del servicio es obligatorio.').max(80),
  description: z.string().max(400).optional(),
  /** En la moneda de site_settings.currency. */
  price: z.number().nonnegative().optional(),
  duration_minutes: z.number().int().positive().optional(),
  image: MediaRef.optional(),
  enabled: z.boolean().default(true),
});

export const ServiceCategory = z.object({
  id: z.string(),
  name: z.string().min(1, 'El nombre de la categoría es obligatorio.').max(60),
  description: z.string().max(240).optional(),
  items: z.array(ServiceItem).default([]),
});

export type ServiceCategory = z.infer<typeof ServiceCategory>;

/**
 * Catálogo ÚNICO de servicios, compartido por todas las instancias del bloque
 * `services` (una en Inicio en modo resumen y otra en /servicios en modo
 * completo). El bloque nunca guarda su propia copia del catálogo: si lo
 * hiciera, el dueño tendría que editar el mismo servicio dos veces y las dos
 * versiones podrían desincronizarse.
 */
export const ServicesCatalog = z.object({
  categories: z.array(ServiceCategory).default([]),
});

export type ServicesCatalog = z.infer<typeof ServicesCatalog>;

export const DEFAULT_SERVICES_CATALOG: ServicesCatalog = { categories: [] };

/* -------------------------------------------------------------------------- */
/* SEO por defecto                                                             */
/* -------------------------------------------------------------------------- */

export const SeoDefaults = z.object({
  /** Tipo schema.org del negocio. Específico del preset: "DaySpa" para spa. */
  business_type: z.string().default('DaySpa'),
  /** Imagen Open Graph de reserva si una página no define la suya. */
  default_og_image: MediaRef.optional(),
});

export type SeoDefaults = z.infer<typeof SeoDefaults>;

export const DEFAULT_SEO_DEFAULTS: SeoDefaults = { business_type: 'DaySpa' };

/* -------------------------------------------------------------------------- */
/* Esquema maestro                                                             */
/* -------------------------------------------------------------------------- */

export const SiteSettings = z.object({
  brand: BrandSettings,
  /** Única moneda soportada en la v1 (USD es la moneda oficial de Panamá). */
  currency: z.enum(['USD']).default('USD'),
  timezone: z.string().default('America/Panama'),
  theme: SiteTheme,
  contact: ContactSettings,
  hours: HoursSettings,
  services_catalog: ServicesCatalog,
  seo_defaults: SeoDefaults,
});

export type SiteSettings = z.infer<typeof SiteSettings>;

/* -------------------------------------------------------------------------- */
/* Páginas                                                                     */
/* -------------------------------------------------------------------------- */

export const PAGE_SLUGS = ['inicio', 'servicios', 'galeria', 'nosotros', 'contacto'] as const;

export type PageSlug = (typeof PAGE_SLUGS)[number];

/** Etiquetas de página usadas en la navegación del sitio y del panel. */
export const PAGE_LABELS: Record<PageSlug, string> = {
  inicio: 'Inicio',
  servicios: 'Servicios',
  galeria: 'Galería y Reels',
  nosotros: 'Nosotros',
  contacto: 'Contacto',
};

export const PageSettings = z.object({
  slug: z.enum(PAGE_SLUGS),
  /** Se usa como <h1> en las páginas sin Hero (todas menos Inicio). */
  title: z.string().min(1).max(80),
  /** Si falta, se arma como "{title} · {brand.name}". */
  meta_title: z.string().max(60).optional(),
  meta_description: z.string().max(160).optional(),
  og_image: MediaRef.optional(),
});

export type PageSettings = z.infer<typeof PageSettings>;

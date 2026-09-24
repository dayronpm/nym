import type {
  BrandSettings,
  ContactSettings,
  DayHours,
  SeoDefaults,
  ServicesCatalog,
  SiteTheme,
} from '@/types/settings';

/**
 * Forma de las filas de la base de datos.
 *
 * IMPORTANTE (Fase 0): estos tipos se escribieron a mano para que el proyecto
 * compile antes de vincular el proyecto de Supabase. Reflejan exactamente la
 * migración `000_initial.sql`.
 *
 * En cuanto el proyecto esté vinculado se ejecuta:
 *
 *     npm run db:types        (supabase gen types typescript --linked)
 *
 * Eso genera `core/types/supabase.ts` con los tipos reales, y este archivo
 * pasará a reexportarlos en la Fase 1. Así la capa `core/data/` no cambia.
 */

export interface ProfileRow {
  id: string;
  email: string;
  /** 'admin' escribe; 'viewer' queda preparado para más adelante. */
  role: 'admin' | 'viewer';
  created_at: string;
  updated_at: string;
}

export interface PageRow {
  slug: string;
  title: string;
  meta_title: string | null;
  meta_description: string | null;
  og_image: { path: string; alt: string } | null;
  created_at: string;
  updated_at: string;
}

export interface BlockRow {
  id: string;
  page: string;
  /** Tipo de bloque: "hero", "services", "gallery", ... */
  type: string;
  /** Contenido del bloque (jsonb); su forma la define el esquema zod del bloque. */
  data: unknown;
  /** Permite migrar el contenido cuando cambia el esquema de un bloque. */
  version: number;
  /** Posición dentro de la página. */
  order: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface SiteSettingsRow {
  id: number;
  brand: BrandSettings;
  currency: 'USD';
  timezone: string;
  theme: SiteTheme;
  contact: ContactSettings;
  hours: DayHours[];
  services_catalog: ServicesCatalog;
  seo_defaults: SeoDefaults;
  created_at: string;
  updated_at: string;
}

export interface MediaRow {
  id: string;
  /** Ruta dentro del bucket `media`, por ejemplo "gallery/abc123.webp". */
  path: string;
  filename: string | null;
  content_type: string | null;
  size_bytes: number | null;
  uploaded_by: string | null;
  created_at: string;
}

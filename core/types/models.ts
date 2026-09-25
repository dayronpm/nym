import type {
  BrandSettings,
  ContactSettings,
  DayHours,
  SeoDefaults,
  ServicesCatalog,
  SiteTheme,
} from './settings';
import type { Database } from './supabase';

/**
 * Forma de las filas de la base de datos.
 *
 * Se DERIVAN del `Database` que genera Supabase (`npm run db:types`). Así, si
 * una migración añade, renombra o quita una columna, estos tipos cambian solos y
 * `npm run type-check` lo detecta: ya no hay que mantenerlos a mano.
 *
 * Matiz: el generador devuelve las columnas `jsonb` como `Json` (cualquier
 * cosa). Aquí se sustituyen por el tipo que de verdad contienen, que sale del
 * esquema zod correspondiente. Esa sustitución es la única parte escrita a mano,
 * y se hace con `Omit` + intersección para que las columnas no listadas sigan
 * viniendo del generador.
 */

type Tables = Database['public']['Tables'];

/** Sustituye el tipo de las columnas indicadas por el que realmente contienen. */
type WithOverrides<TRow, TOverrides> = Omit<TRow, keyof TOverrides> & TOverrides;

export type ProfileRow = WithOverrides<
  Tables['profiles']['Row'],
  {
    /** El generador lo devuelve como `string`; el CHECK de la migración lo limita a estos dos. */
    role: 'admin' | 'viewer';
  }
>;

/**
 * Fila de `blocks`.
 *
 * `type` es la clave del registro de bloques ("hero", "services", "gallery"...)
 * y `version` sirve para migrar el contenido cuando cambia el esquema del bloque.
 *
 * `data` se deja como `Json` a propósito, tal cual lo devuelve el generador: su
 * forma real la define el esquema zod del bloque, y para obtenerla tipada hay que
 * pasar por `parseBlockData()` (`core/blocks/defineBlock.ts`). Así el compilador
 * impide leer campos de ese `jsonb` sin validarlos antes.
 */
export type BlockRow = Tables['blocks']['Row'];

/**
 * Fila de `pages`, tal cual la genera Supabase.
 *
 * `og_image` llega como `Json | null`. `getPage()` lo valida con zod y devuelve
 * ya un `PageSettings` tipado, que es lo que consumen las páginas.
 */
export type PageRow = Tables['pages']['Row'];
export type SiteSettingsRow = WithOverrides<
  Tables['site_settings']['Row'],
  {
    /** Única moneda soportada en la v1. */
    currency: 'USD';
    brand: BrandSettings;
    theme: SiteTheme;
    contact: ContactSettings;
    hours: DayHours[];
    services_catalog: ServicesCatalog;
    seo_defaults: SeoDefaults;
  }
>;

/**
 * Fila de `media`.
 *
 * `path` es la ruta relativa dentro del bucket `media`
 * (ej.: "gallery/abc123.webp"), nunca la URL completa.
 */
export type MediaRow = Tables['media']['Row'];

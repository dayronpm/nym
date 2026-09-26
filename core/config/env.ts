/**
 * Acceso centralizado a las variables de entorno.
 *
 * Reglas:
 *  - Las variables `NEXT_PUBLIC_*` se leen siempre con su nombre literal: Next
 *    sustituye esos valores en tiempo de compilación, y una lectura dinámica
 *    (`process.env[name]`) no funcionaría en el navegador.
 *  - La clave secreta solo se lee desde código de servidor. Si se llama a
 *    `getSupabaseSecretKey()` en un componente cliente, el valor será
 *    `undefined` (Next no la expone) y el error será explícito.
 */

const MISSING_PUBLIC_URL =
  'Falta NEXT_PUBLIC_SUPABASE_URL en .env.local. Copia .env.example y completa los datos del proyecto de Supabase.';

const MISSING_PUBLIC_KEY =
  'Falta NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY en .env.local. Usa la clave publicable (sb_publishable_...) del proyecto.';

const MISSING_SECRET_KEY =
  'Falta SUPABASE_SECRET_KEY en .env.local. Es la clave secreta (sb_secret_...) y solo puede usarse en el servidor.';

/** URL pública del proyecto de Supabase. */
export function getSupabaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!value) throw new Error(MISSING_PUBLIC_URL);
  return value;
}

/** Clave publicable (puede llegar al navegador; RLS la protege). */
export function getSupabasePublishableKey(): string {
  const value = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!value) throw new Error(MISSING_PUBLIC_KEY);
  return value;
}

/** Clave secreta. Omite RLS: solo servidor. */
export function getSupabaseSecretKey(): string {
  const value = process.env.SUPABASE_SECRET_KEY;
  if (!value) throw new Error(MISSING_SECRET_KEY);
  return value;
}

/**
 * Indica si hay credenciales públicas configuradas.
 *
 * Sirve para no romper el renderizado cuando el proyecto se acaba de clonar y
 * `.env.local` todavía está vacío: en ese caso las páginas muestran un aviso en
 * lugar de lanzar una excepción.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}

/** Permiso explícito para que el seed borre contenido. Nunca en producción. */
export function isSeedResetAllowed(): boolean {
  return process.env.ALLOW_SEED_RESET === 'true';
}

/**
 * URL base del sitio público, sin barra final.
 *
 * La necesitan el `sitemap.xml`, el `canonical` y las URLs de Open Graph, que están
 * obligadas a ser absolutas. Orden de preferencia:
 *
 *   1. `NEXT_PUBLIC_SITE_URL` — el dominio propio del negocio. Es la única que hay que
 *      declarar, y solo el día que se compra el dominio.
 *   2. `VERCEL_URL` — la pone Vercel sola en cada despliegue, así que las
 *      previsualizaciones y el dominio `.vercel.app` funcionan sin configurar nada.
 *   3. `http://localhost:3000` — para trabajar en local.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, '');

  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel.replace(/\/+$/, '')}`;

  return 'http://localhost:3000';
}

import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { cache } from 'react';

import { getSupabasePublishableKey, getSupabaseSecretKey, getSupabaseUrl } from '@/config/env';
import type { Database } from '@/types/supabase';

/**
 * Clientes de Supabase.
 *
 * La capa `core/data/` es la única que habla con la base de datos; los
 * componentes nunca importan de aquí directamente.
 *
 * Cuatro clientes, cuatro contextos distintos:
 *
 *  1. `createSupabasePublicClient`     -> sitio público, sin sesión (permite caché).
 *  2. `createSupabaseBrowserClient`    -> componentes cliente del panel.
 *  3. `createSupabaseServerClient`     -> Server Components y route handlers.
 *  4. `createSupabaseAdminClient`      -> solo servidor y scripts (seed).
 *
 * El cliente del middleware vive aparte, en `./supabase-middleware`, para que
 * el bundle edge no arrastre `next/headers` ni `react.cache`.
 */

/** Cliente para el navegador. Usa la clave publicable (protegida por RLS). */
export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(getSupabaseUrl(), getSupabasePublishableKey());
}

/**
 * Cliente para Server Components y route handlers.
 *
 * Se memoiza con `cache` de React para crear una sola instancia por petición.
 */
export const createSupabaseServerClient = cache(() => {
  const cookieStore = cookies();

  return createServerClient<Database>(getSupabaseUrl(), getSupabasePublishableKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Un Server Component no puede escribir cookies. Se ignora a
          // propósito: el middleware ya refrescó la sesión antes de renderizar.
        }
      },
    },
  });
});

/**
 * Cliente público SIN sesión, para leer el contenido del sitio público.
 *
 * Es deliberadamente distinto del cliente de servidor: si las páginas públicas
 * usaran el cliente con cookies, `cookies()` las obligaría a renderizarse en cada
 * petición y perderíamos el renderizado estático y la revalidación por etiquetas.
 * Como `blocks`, `pages` y `site_settings` tienen política de lectura pública, un
 * cliente anónimo basta y las páginas pueden cachearse.
 */
export function createSupabasePublicClient() {
  return createClient<Database>(getSupabaseUrl(), getSupabasePublishableKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

/**
 * Cliente administrativo con la clave secreta.
 *
 * PROHIBIDO usarlo en componentes, route handlers públicos o cualquier código
 * que llegue al navegador: la clave secreta omite RLS. Su uso previsto es el
 * seed y las tareas de mantenimiento por línea de comandos.
 */
export function createSupabaseAdminClient() {
  return createClient<Database>(getSupabaseUrl(), getSupabaseSecretKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { cache } from 'react';

import { getSupabasePublishableKey, getSupabaseSecretKey, getSupabaseUrl } from '@/config/env';

/**
 * Clientes de Supabase.
 *
 * La capa `core/data/` es la única que habla con la base de datos; los
 * componentes nunca importan de aquí directamente.
 *
 * Tres clientes, tres contextos distintos:
 *
 *  1. `createSupabaseBrowserClient`   -> componentes cliente del panel.
 *  2. `createSupabaseServerClient`    -> Server Components y route handlers.
 *  3. `createSupabaseAdminClient`     -> solo servidor y scripts (seed).
 *
 * El cliente del middleware vive aparte, en `./supabase-middleware`, para que
 * el bundle edge no arrastre `next/headers` ni `react.cache`.
 */

/** Cliente para el navegador. Usa la clave publicable (protegida por RLS). */
export function createSupabaseBrowserClient() {
  return createBrowserClient(getSupabaseUrl(), getSupabasePublishableKey());
}

/**
 * Cliente para Server Components y route handlers.
 *
 * Se memoiza con `cache` de React para crear una sola instancia por petición.
 */
export const createSupabaseServerClient = cache(() => {
  const cookieStore = cookies();

  return createServerClient(getSupabaseUrl(), getSupabasePublishableKey(), {
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
 * Cliente para el middleware: lee las cookies de la petición y escribe las
 * cookies 
 * PROHIBIDO usarlo en componentes, route handlers públicos o cualquier código
 * que llegue al navegador: la clave secreta omite RLS. Su uso previsto es el
 * seed y las tareas de mantenimiento por línea de comandos.
 */
export function createSupabaseAdminClient() {
  return createClient(getSupabaseUrl(), getSupabaseSecretKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

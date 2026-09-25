import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

import { getSupabasePublishableKey, getSupabaseUrl } from '@/config/env';
import type { Database } from '@/types/supabase';

/**
 * Cliente de Supabase para el middleware.
 *
 * Vive en un archivo aparte de `./supabase` a propósito: el middleware se
 * empaqueta para el runtime edge, donde `next/headers` y `react.cache` no
 * existen. Si este cliente compartiera módulo con el de Server Components, el
 * bundle del middleware intentaría resolver esos imports y el build avisaría
 * (o fallaría).
 *
 * Función: leer las cookies de la petición y escribir en la respuesta las
 * cookies de sesión renovadas.
 */
export function createSupabaseMiddlewareClient(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(getSupabaseUrl(), getSupabasePublishableKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // Las cookies renovadas se escriben en la petición y en la respuesta:
        // en la petición para que el renderizado en curso las vea, y en la
        // respuesta para que el navegador las guarde.
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }

        response = NextResponse.next({ request });

        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Se devuelve una función en lugar de la respuesta porque `response` se
  // reemplaza cada vez que Supabase renueva un token. Devolverla por valor
  // congelaría una versión obsoleta y el navegador perdería la sesión.
  return { supabase, getResponse: () => response };
}

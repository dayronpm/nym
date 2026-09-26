import { NextResponse, type NextRequest } from 'next/server';

import { createSupabaseServerClient } from '@/data/supabase';

/**
 * Retorno del enlace que Supabase envía por correo.
 *
 * Supabase devuelve aquí el `code` del flujo PKCE (el que usa `@supabase/ssr`). Se canjea
 * por una sesión —que queda guardada en las cookies de la respuesta— y se sigue al
 * destino. Cualquier fallo vuelve al login con un aviso, en lugar de dejar al usuario en
 * una página en blanco sin saber qué ha pasado.
 *
 * El destino se valida igual que en el login: solo rutas internas del panel, para que el
 * parámetro no sirva de redirección abierta.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;

  const code = searchParams.get('code');
  const requested = searchParams.get('next') ?? '';
  const next = requested.startsWith('/admin') && !requested.startsWith('//') ? requested : '/admin';

  if (!code) {
    return NextResponse.redirect(`${origin}/admin/login?error=enlace`);
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/admin/login?error=enlace`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}

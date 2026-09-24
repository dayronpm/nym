import { NextResponse, type NextRequest } from 'next/server';

import { isSupabaseConfigured } from '@/config/env';
import { createSupabaseMiddlewareClient } from '@/data/supabase-middleware';

/**
 * Redirección temprana del panel.
 *
 * Motivo: se valida la sesión en el servidor antes de renderizar nada. El
 * layout protegido del panel repite la comprobación como garantía final.
 *
 * El matcher solo cubre `/admin/*`, así que el sitio público nunca paga el
 * coste de este middleware. Se excluyen:
 *   - `/admin/login`            (debe ser accesible sin sesión)
 *   - `/api/*`                  (no aplica)
 *   - archivos estáticos
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Guarda de ruta: este middleware SOLO se ocupa del panel.
  //
  // No se delega esta comprobación al `config.matcher` porque ese config vive en
  // el shim de la raíz: si algún día se rompe, el middleware se aplicaría a todo
  // el sitio y el público acabaría redirigido a /admin/login (ya ocurrió una
  // vez). Aquí la seguridad no depende de un archivo externo.
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next({ request });
  }

  // Sin credenciales configuradas no hay nada que validar: se deja pasar y el
  // layout del panel se encarga de redirigir al login.
  if (!isSupabaseConfigured()) {
    return NextResponse.next({ request });
  }

  // `getResponse` (y no la respuesta en sí) porque Supabase reemplaza la
  // respuesta cada vez que renueva un token.
  const { supabase, getResponse } = createSupabaseMiddlewareClient(request);

  // IMPORTANTE: `getUser()` valida el token contra el servidor de Auth. Es la
  // comprobación fiable; `getSession()` puede devolver null de forma
  // intermitente en navegadores móviles.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoginRoute = pathname.startsWith('/admin/login');

  if (!user && !isLoginRoute) {
    return redirectKeepingSession(request, '/admin/login', getResponse);
  }

  // Con sesión activa no tiene sentido volver a mostrar el login.
  if (user && isLoginRoute) {
    return redirectKeepingSession(request, '/admin', getResponse);
  }

  return getResponse();
}

/**
 * Redirige conservando las cookies que Supabase haya renovado durante la
 * petición. Si se descartaran, el usuario perdería la sesión recién refrescada
 * y tendría que volver a iniciar sesión sin motivo aparente.
 */
function redirectKeepingSession(
  request: NextRequest,
  pathname: string,
  getResponse: () => NextResponse,
): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = '';

  const redirect = NextResponse.redirect(url);
  for (const cookie of getResponse().cookies.getAll()) {
    redirect.cookies.set(cookie);
  }
  return redirect;
}

export const config = {
  matcher: ['/admin/:path*'],
};

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
 * coste de este middleware. Dentro del panel, `PUBLIC_ADMIN_PATHS` son las
 * únicas rutas que se pueden abrir sin sesión (el login y el flujo de
 * restablecimiento de contraseña); todo lo demás redirige al login.
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

  const isPublicRoute = PUBLIC_ADMIN_PATHS.some((path) => pathname.startsWith(path));

  if (!user && !isPublicRoute) {
    return redirectKeepingSession(request, '/admin/login', getResponse);
  }

  // Con sesión activa no tiene sentido volver a mostrar el login. Las otras rutas públicas
  // (el callback del correo) sí se dejan pasar: se usan justo para cerrar el flujo.
  if (user && pathname.startsWith('/admin/login')) {
    return redirectKeepingSession(request, '/admin', getResponse);
  }

  return getResponse();
}

/**
 * Rutas del panel accesibles sin sesión.
 *
 * `/admin/auth/callback` es la que abre el enlace del correo de restablecimiento, y
 * `/admin/recuperar` el formulario que lo pide: si exigieran sesión, el usuario que ha
 * olvidado la contraseña no podría entrar nunca.
 */
const PUBLIC_ADMIN_PATHS = ['/admin/login', '/admin/recuperar', '/admin/auth/callback'];

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

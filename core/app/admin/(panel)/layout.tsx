import { redirect } from 'next/navigation';

import { createSupabaseServerClient } from '@/data/supabase';
import { isSupabaseConfigured } from '@/config/env';

/**
 * El panel nunca puede servirse desde caché: cada petición depende de la sesión
 * del usuario.
 */
export const dynamic = 'force-dynamic';

/**
 * Layout protegido del panel.
 *
 * Vive en el grupo de rutas `(panel)` para que `/admin/login` quede fuera y
 * pueda ser pública. El grupo no afecta a la URL: las rutas siguen siendo
 * `/admin`, `/admin/paginas`, etc.
 *
 * Aquí se valida la sesión EN EL SERVIDOR (defensa en profundidad: el
 * middleware hace la redirección temprana, este layout es la garantía final).
 */
export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  // Sin credenciales configuradas no se puede validar nada: se envía al login
  // en lugar de romper el renderizado.
  if (!isSupabaseConfigured()) {
    redirect('/admin/login');
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  return <div className="min-h-screen bg-surface-alt">{children}</div>;
}

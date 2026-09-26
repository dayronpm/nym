import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import PanelHeader from '@/components/admin/PanelHeader';
import { isSupabaseConfigured } from '@/config/env';
import { createSupabaseServerClient } from '@/data/supabase';

/**
 * El panel nunca puede servirse desde caché: cada petición depende de la sesión
 * del usuario.
 */
export const dynamic = 'force-dynamic';

/** El panel no debe indexarse nunca (además del X-Robots-Tag de next.config.js). */
export const metadata: Metadata = {
  title: 'Panel',
  robots: { index: false, follow: false },
};

/**
 * Layout protegido del panel.
 *
 * Vive en el grupo de rutas `(panel)` para que `/admin/login` quede fuera y
 * pueda ser pública. El grupo no afecta a la URL: las rutas siguen siendo
 * `/admin`, `/admin/paginas`, etc.
 *
 * Aquí se valida la sesión EN EL SERVIDOR (defensa en profundidad: el
 * middleware hace la redirección temprana, este layout es la garantía final).
 *
 * El encabezado del panel —con el correo de la sesión y el botón de cerrar sesión— sale
 * de aquí, así que todas las pantallas protegidas lo comparten sin repetirlo.
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

  return (
    <div className="min-h-screen bg-surface-alt">
      <PanelHeader email={user.email} />
      {children}
    </div>
  );
}

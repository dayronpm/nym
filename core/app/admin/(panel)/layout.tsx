import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import AdminNav from '@/components/admin/AdminNav';
import AdminTopBar from '@/components/admin/AdminTopBar';
import Toaster from '@/components/admin/Toaster';
import { isSupabaseConfigured } from '@/config/env';
import { getSiteSettings } from '@/data/queries/site-settings';
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
 * La estructura es la de Odoo: **barra superior** fija (marca, menú de móvil y bandeja de
 * usuario), **menú lateral** con las secciones y, dentro, el contenido —cada pantalla pinta su
 * “panel de control” con `ControlPanel`—. El menú sale de `admin-nav.ts`, así que una sección
 * nueva aparece sola en el lateral, en el menú de móvil y en las tarjetas de Inicio.
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

  // La configuración está cacheada: el nombre del negocio no añade consultas al panel.
  const settings = await getSiteSettings();

  return (
    <div className="min-h-screen bg-surface-alt">
      <AdminTopBar email={user.email} brandName={settings.brand.name} />

      <div className="mx-auto flex w-full max-w-[1400px] items-start gap-6 px-4 py-6 md:px-6">
        {/* Menú lateral: pegado bajo la barra y con su propio scroll si la lista creciera. */}
        <aside className="hidden w-56 shrink-0 md:sticky md:top-14 md:block md:max-h-[calc(100vh-4rem)] md:overflow-y-auto">
          <AdminNav />
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>

      {/* Los avisos flotantes se montan una sola vez, aquí: cualquier pantalla del panel puede
          avisar con `showToast` sin envolver nada. */}
      <Toaster />
    </div>
  );
}

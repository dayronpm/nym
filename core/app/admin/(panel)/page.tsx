import Link from 'next/link';

import AdminIcon from '@/components/admin/AdminIcon';
import ControlPanel from '@/components/admin/ControlPanel';
import { ADMIN_SECTIONS } from '@/lib/admin-nav';

/**
 * Inicio del panel: el índice de las secciones.
 *
 * La lista sale de `admin-nav.ts` — la misma que pinta el menú lateral—, así que una sección
 * nueva aparece aquí sola.
 */
export default function AdminDashboardPage() {
  return (
    <>
      <ControlPanel
        title="Panel"
        subtitle="Desde aquí se edita todo el contenido del sitio."
        breadcrumb={[{ label: 'Panel' }]}
      />

      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {ADMIN_SECTIONS.map((section) => (
          <li key={section.href}>
            <Link
              href={section.href}
              className="flex h-full min-h-[44px] gap-3 rounded-md border border-border bg-surface p-5 shadow-soft transition-colors hover:bg-primary-soft"
            >
              <AdminIcon name={section.icon} className="mt-0.5 h-5 w-5 shrink-0 text-text-muted" />
              <span>
                <span className="font-medium">{section.label}</span>
                <p className="mt-1 text-sm text-text-muted">{section.description}</p>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

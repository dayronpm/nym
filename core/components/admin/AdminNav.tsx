'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { ADMIN_MENU, isSectionActive } from '@/lib/admin-nav';
import { cn } from '@/lib/cn';

import AdminIcon from './AdminIcon';

/**
 * Menú de secciones del panel.
 *
 * Es el único componente cliente del armazón, y lo es por una razón concreta: saber qué
 * sección está abierta. `usePathname` es del cliente y el layout es del servidor, así que la
 * marca del elemento activo se resuelve aquí en lugar de repetirla en cada pantalla.
 *
 * Dos variantes de densidad: `sidebar` para el menú fijo de escritorio (más compacto, como el
 * de Odoo) y `menu` para el desplegable de móvil, donde cada fila necesita los 44 px táctiles.
 */
export default function AdminNav({ variant = 'sidebar' }: { variant?: 'sidebar' | 'menu' }) {
  const pathname = usePathname();
  const compact = variant === 'sidebar';

  return (
    <nav aria-label="Secciones del panel">
      <ul className={compact ? 'space-y-0.5' : 'space-y-1'}>
        {ADMIN_MENU.map((item) => {
          const active = isSectionActive(pathname, item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 text-sm transition-colors',
                  compact ? 'py-2' : 'min-h-[44px] py-2.5',
                  active
                    ? 'bg-primary-soft font-medium text-text'
                    : 'text-text-muted hover:bg-primary-soft hover:text-text',
                )}
              >
                <AdminIcon name={item.icon} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

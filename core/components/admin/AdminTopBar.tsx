import Link from 'next/link';

import { signOut } from '@/app/admin/auth-actions';

import AdminNav from './AdminNav';

/**
 * Barra superior del panel, al estilo de Odoo.
 *
 * Tres cosas y ninguna más: el nombre del negocio (la "app"), el menú para pantallas pequeñas
 * —donde el menú lateral no cabe— y la bandeja de usuario (correo, ver el sitio y cerrar
 * sesión).
 *
 * Decisiones concretas:
 *
 *  - **Fondo oscuro con los tokens invertidos** (`bg-text` sobre `text-bg`) en lugar de un color
 *    fijo: así la barra se ve como la de Odoo —oscura, para separarse del contenido— y sigue al
 *    tema del negocio si algún día el panel se tematiza.
 *  - **Sin logotipo**, solo el nombre. Es lo que hace Odoo con el nombre de la app, y además
 *    evita el problema del logo claro sobre fondo oscuro: aquí el texto siempre contrasta.
 *  - **Los desplegables son `<details>`**, que se abren sin JavaScript. El cierre de sesión es un
 *    formulario con Server Action: funciona aunque el JavaScript no haya cargado.
 */
export default function AdminTopBar({ email, brandName }: { email?: string; brandName: string }) {
  const initial = (email?.trim().charAt(0) ?? 'A').toUpperCase();
  const linkClass = 'flex min-h-[44px] items-center rounded-sm px-3 text-sm transition-colors hover:bg-white/10';

  return (
    <div className="sticky top-0 z-40 bg-text text-bg">
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-2 px-4 md:px-6">
        {/* Menú de móvil: el lateral no cabe, así que las secciones viven aquí. */}
        <details className="relative md:hidden">
          <summary className="flex h-14 cursor-pointer list-none items-center rounded-sm px-2 text-sm [&::-webkit-details-marker]:hidden">
            Menú
          </summary>
          <div className="absolute left-0 z-50 mt-1 w-64 rounded-md border border-border bg-surface p-2 text-text shadow-soft">
            <AdminNav variant="menu" />
          </div>
        </details>

        <Link href="/admin" className="flex h-14 min-w-0 items-center gap-2">
          <span className="truncate font-heading text-lg leading-none">{brandName}</span>
          <span className="hidden text-sm opacity-70 sm:inline">· Panel</span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className={`${linkClass} hidden sm:inline-flex`}
          >
            Ver el sitio ↗
          </Link>

          <details className="relative">
            <summary className="flex h-14 cursor-pointer list-none items-center gap-2 rounded-sm px-2 text-sm [&::-webkit-details-marker]:hidden">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/15 text-xs font-medium">
                {initial}
              </span>
              <span className="hidden max-w-[12rem] truncate sm:inline">{email}</span>
            </summary>

            <div className="absolute right-0 z-50 mt-1 w-64 rounded-md border border-border bg-surface p-2 text-text shadow-soft">
              <p className="truncate px-2 py-1 text-xs text-text-muted">{email}</p>
              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-sm px-2 py-2 text-sm transition-colors hover:bg-primary-soft sm:hidden"
              >
                Ver el sitio ↗
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="block w-full rounded-sm px-2 py-2 text-left text-sm transition-colors hover:bg-primary-soft"
                >
                  Cerrar sesión
                </button>
              </form>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}

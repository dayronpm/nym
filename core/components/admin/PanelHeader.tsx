import Link from 'next/link';

import { signOut } from '@/app/admin/auth-actions';

/**
 * Encabezado del panel: dónde estás, cómo ver el sitio y cómo salir.
 *
 * El cierre de sesión es un `<form>` que llama a una Server Action, así que funciona sin
 * JavaScript (y sin él, cerrar sesión es justo lo que alguien querría poder hacer).
 *
 * Los enlaces a las secciones se irán añadiendo aquí a medida que existan: un enlace a una
 * pantalla que todavía no está construida lleva a un 404 dentro del propio panel, que es
 * peor que no tener el enlace.
 */
export interface PanelHeaderProps {
  /** Correo del usuario con sesión abierta. */
  email?: string;
}

export default function PanelHeader({ email }: PanelHeaderProps) {
  return (
    <header className="border-b border-border bg-surface">
      <div className="container-page flex flex-wrap items-center justify-between gap-4 py-4">
        <div className="flex items-baseline gap-4">
          <Link href="/admin" className="font-heading text-xl">
            Panel
          </Link>
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-text-muted hover:text-primary"
          >
            Ver el sitio ↗
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {email ? <span className="text-sm text-text-muted">{email}</span> : null}

          <form action={signOut}>
            <button
              type="submit"
              className="min-h-[44px] rounded-sm border border-border px-3 py-2 text-sm transition-colors hover:bg-primary-soft"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';

/**
 * Formulario de acceso (Fase 0: solo estructura).
 *
 * Esta página es pública (no requiere sesión) pero NO debe indexarse. Queda
 * fuera del layout protegido del panel, así que se marca aquí explícitamente.
 * El encabezado X-Robots-Tag de next.config.js ya cubre /admin/*; esto lo
 * refuerza a nivel de página.
 *
 * La lógica de autenticación (signInWithPassword, mensajes de error en español
 * y el flujo de "olvidé mi contraseña") se implementa en la Fase 2.
 */
export const metadata: Metadata = {
  title: 'Acceso al panel',
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl">Panel</h1>
        <p className="mt-2 text-sm text-text-muted">
          Inicia sesión para administrar el contenido del sitio.
        </p>

        <form className="mt-8 space-y-4 rounded-md border border-border bg-surface p-6 shadow-soft">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Correo
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              className="mt-1 w-full rounded-sm border border-border bg-surface px-3 py-2.5 text-base"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              className="mt-1 w-full rounded-sm border border-border bg-surface px-3 py-2.5 text-base"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-primary px-5 py-3 font-medium text-on-primary transition-colors hover:bg-primary-hover"
          >
            Entrar
          </button>

          {/* El enlace de restablecimiento se activa en la Fase 2. */}
          <p className="text-center text-sm text-text-muted">¿Olvidaste tu contraseña?</p>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          <Link href="/" className="underline">
            Volver al sitio
          </Link>
        </p>
      </div>
    </main>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';

import AuthLayout from '@/components/admin/AuthLayout';
import FormMessage from '@/components/admin/FormMessage';

import LoginForm from './LoginForm';

/**
 * Acceso al panel.
 *
 * Esta página es pública (no requiere sesión) pero NO debe indexarse. Queda
 * fuera del layout protegido del panel, así que se marca aquí explícitamente.
 * El encabezado X-Robots-Tag de next.config.js ya cubre /admin/*; esto lo
 * refuerza a nivel de página.
 *
 * Los dos avisos que puede mostrar la página sin que intervenga el formulario llegan por
 * la URL: `error=enlace` (el enlace del correo caducó o ya se usó) y `next` (a dónde ir
 * después de entrar, para devolver a quien pidió una página concreta).
 */
export const metadata: Metadata = {
  title: 'Acceso al panel',
  robots: { index: false, follow: false },
};

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: { error?: string; next?: string };
}) {
  return (
    <AuthLayout
      title="Panel"
      description="Inicia sesión para administrar el contenido del sitio."
    >
      {searchParams.error === 'enlace' ? (
        <div className="mb-4">
          <FormMessage tone="error">
            El enlace del correo ha caducado o ya se usó. Pide uno nuevo.
          </FormMessage>
        </div>
      ) : null}

      <LoginForm next={searchParams.next} />

      <p className="mt-4 text-center text-sm">
        <Link href="/admin/recuperar" className="underline decoration-border hover:text-primary">
          ¿Olvidaste tu contraseña?
        </Link>
      </p>
    </AuthLayout>
  );
}

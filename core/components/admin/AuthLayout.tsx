import Link from 'next/link';

/**
 * Marco común de las pantallas de acceso (entrar, recuperar, contraseña nueva).
 *
 * Las tres son la misma cosa —una tarjeta centrada con un formulario dentro— así que
 * comparten marco en lugar de repetir el marcado tres veces.
 *
 * Estas pantallas quedan fuera del layout del panel a propósito: son las que se ven
 * *antes* de tener sesión, así que no pueden llevar el encabezado del panel ni sus enlaces.
 */
export interface AuthLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export default function AuthLayout({ title, description, children }: AuthLayoutProps) {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl">{title}</h1>
        {description ? <p className="mt-2 text-sm text-text-muted">{description}</p> : null}

        <div className="mt-8 rounded-md border border-border bg-surface p-6 shadow-soft">
          {children}
        </div>

        <p className="mt-6 text-center text-sm text-text-muted">
          <Link href="/" className="underline decoration-border hover:text-primary">
            Volver al sitio
          </Link>
        </p>
      </div>
    </main>
  );
}

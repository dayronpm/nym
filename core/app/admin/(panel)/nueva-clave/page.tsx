import type { Metadata } from 'next';

import NewPasswordForm from './NewPasswordForm';

/**
 * Contraseña nueva.
 *
 * Vive **dentro** del grupo `(panel)` a propósito: solo se llega aquí con la sesión que
 * abre el callback del correo, así que el layout protegido es quien la custodia. La URL
 * sigue siendo `/admin/nueva-clave` (el grupo no cuenta).
 */
export const metadata: Metadata = {
  title: 'Contraseña nueva',
  robots: { index: false, follow: false },
};

export default function AdminNewPasswordPage() {
  return (
    <main className="container-page section-y">
      <div className="mx-auto max-w-sm">
        <h1 className="text-3xl">Contraseña nueva</h1>
        <p className="mt-2 text-sm text-text-muted">
          Elige la contraseña con la que entrarás al panel a partir de ahora.
        </p>

        <div className="mt-8 rounded-md border border-border bg-surface p-6 shadow-soft">
          <NewPasswordForm />
        </div>
      </div>
    </main>
  );
}

import type { Metadata } from 'next';

import AuthLayout from '@/components/admin/AuthLayout';

import ResetRequestForm from './ResetRequestForm';

/**
 * Petición del enlace de restablecimiento.
 *
 * Es pública por necesidad: quien ha olvidado la contraseña no puede iniciar sesión, así
 * que esta pantalla (y el callback del correo) tienen que quedar fuera del control de
 * sesión. Está declarada en `PUBLIC_ADMIN_PATHS`, en el middleware.
 */
export const metadata: Metadata = {
  title: 'Recuperar contraseña',
  robots: { index: false, follow: false },
};

export default function AdminRecoverPasswordPage() {
  return (
    <AuthLayout
      title="Recuperar contraseña"
      description="Escribe tu correo y te enviamos un enlace para elegir una contraseña nueva."
    >
      <ResetRequestForm />
    </AuthLayout>
  );
}

'use client';

import Link from 'next/link';
import { useFormState } from 'react-dom';

import { requestPasswordReset, type AuthFormState } from '@/app/admin/auth-actions';
import Field from '@/components/admin/Field';
import FormMessage from '@/components/admin/FormMessage';
import SubmitButton from '@/components/admin/SubmitButton';

/**
 * Petición del enlace de restablecimiento.
 *
 * Al enviarse, el formulario se sustituye por la confirmación: no hay nada más que hacer
 * en esta pantalla, y dejar los campos ahí invita a enviarlo otra vez. El mensaje no dice
 * si el correo existe, así que sirve igual si la cuenta no está.
 */

const INITIAL_STATE: AuthFormState = { error: null };

export default function ResetRequestForm() {
  const [state, formAction] = useFormState(requestPasswordReset, INITIAL_STATE);

  if (state.success) {
    return (
      <div className="space-y-4">
        <FormMessage tone="success">{state.success}</FormMessage>
        <p className="text-sm">
          <Link href="/admin/login" className="underline decoration-border hover:text-primary">
            Volver al inicio de sesión
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <Field
        label="Correo"
        name="email"
        type="email"
        autoComplete="email"
        required
        hint="El correo con el que entras al panel."
      />

      {state.error ? <FormMessage tone="error">{state.error}</FormMessage> : null}

      <SubmitButton pendingLabel="Enviando…">Enviar enlace</SubmitButton>
    </form>
  );
}

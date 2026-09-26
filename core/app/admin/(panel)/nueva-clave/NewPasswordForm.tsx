'use client';

import { useFormState } from 'react-dom';

import { updatePassword, type AuthFormState } from '@/app/admin/auth-actions';
import Field from '@/components/admin/Field';
import FormMessage from '@/components/admin/FormMessage';
import SubmitButton from '@/components/admin/SubmitButton';

/**
 * Elección de la contraseña nueva.
 *
 * Solo se llega aquí con sesión abierta: la abre el callback del correo
 * (`/admin/auth/callback`). Si alguien entra directo sin ese paso, la Server Action detecta
 * que no hay usuario y lo dice, en lugar de dejar un formulario que no haría nada.
 */

const INITIAL_STATE: AuthFormState = { error: null };

export default function NewPasswordForm() {
  const [state, formAction] = useFormState(updatePassword, INITIAL_STATE);

  return (
    <form action={formAction} className="space-y-4">
      <Field
        label="Contraseña nueva"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        hint="Al menos 8 caracteres."
      />
      <Field
        label="Repite la contraseña"
        name="repeat"
        type="password"
        autoComplete="new-password"
        required
      />

      {state.error ? <FormMessage tone="error">{state.error}</FormMessage> : null}

      <SubmitButton pendingLabel="Guardando…">Guardar contraseña</SubmitButton>
    </form>
  );
}

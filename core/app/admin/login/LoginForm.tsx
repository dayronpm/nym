'use client';

import { useFormState } from 'react-dom';

import { signIn, type AuthFormState } from '@/app/admin/auth-actions';
import Field from '@/components/admin/Field';
import FormMessage from '@/components/admin/FormMessage';
import SubmitButton from '@/components/admin/SubmitButton';

/**
 * Formulario de acceso.
 *
 * Es componente cliente solo por el estado de la acción (`useFormState`) y el aviso de
 * "enviando": la contraseña se manda al servidor y quien la valida es la Server Action. El
 * cliente no tiene ninguna instancia de Supabase ni, por tanto, ninguna sesión que un
 * script ajeno pueda leer.
 */

const INITIAL_STATE: AuthFormState = { error: null };

export interface LoginFormProps {
  /** Ruta interna a la que ir después de entrar (viene de `?next=`). */
  next?: string;
}

export default function LoginForm({ next }: LoginFormProps) {
  const [state, formAction] = useFormState(signIn, INITIAL_STATE);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next ?? '/admin'} />

      <Field label="Correo" name="email" type="email" autoComplete="email" required />
      <Field
        label="Contraseña"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />

      {state.error ? <FormMessage tone="error">{state.error}</FormMessage> : null}

      <SubmitButton pendingLabel="Entrando…">Entrar</SubmitButton>
    </form>
  );
}

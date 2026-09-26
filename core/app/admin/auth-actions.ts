'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { getSiteUrl } from '@/config/env';
import { createSupabaseServerClient } from '@/data/supabase';

/**
 * Acciones de autenticación del panel.
 *
 * Son **Server Actions**: los formularios funcionan sin una línea de JavaScript en el
 * cliente (si el navegador no carga el bundle, siguen enviándose) y la contraseña viaja
 * del formulario al servidor, sin pasar por código de navegador ni por una API intermedia.
 *
 * Los mensajes de error son deliberadamente neutros: "Correo o contraseña incorrectos" no
 * distingue si el correo existe, y el restablecimiento responde lo mismo exista o no la
 * cuenta. Con un único administrador esa información no le sirve al dueño, y en cambio le
 * sirve a quien esté probando cuentas.
 */

export interface AuthFormState {
  /** Mensaje de error que mostrar bajo el formulario. */
  error: string | null;
  /** Confirmación (solo en el flujo de restablecimiento). */
  success?: string | null;
}

const CredentialsSchema = z.object({
  email: z.string().trim().min(1, 'Escribe tu correo.').email('Ese correo no parece válido.'),
  password: z.string().min(1, 'Escribe tu contraseña.'),
});

const EmailSchema = z.string().trim().min(1, 'Escribe tu correo.').email('Ese correo no parece válido.');

/**
 * Ruta interna a la que volver tras iniciar sesión.
 *
 * Solo se aceptan rutas del panel. Sin esta comprobación, `?next=` sería una redirección
 * abierta: basta con enviar a alguien a un enlace que, justo después de escribir su
 * contraseña, lo lleve a un sitio que imita al panel.
 */
function safeNextPath(value: FormDataEntryValue | null): string {
  if (typeof value !== 'string') return '/admin';
  if (!value.startsWith('/admin') || value.startsWith('//')) return '/admin';
  return value;
}

/** Inicia sesión con correo y contraseña. */
export async function signIn(_previous: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = CredentialsSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Revisa los datos.' };
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    // Este caso (cuenta sin confirmar) solo puede darse con la contraseña correcta, así
    // que decirlo no filtra nada y evita la confusión de creer que la contraseña está mal.
    if (error.code === 'email_not_confirmed') {
      return {
        error:
          'La cuenta existe, pero el correo todavía no está confirmado. Confirma el usuario desde el panel de Supabase.',
      };
    }

    return { error: 'Correo o contraseña incorrectos.' };
  }

  const destination = safeNextPath(formData.get('next'));

  // El panel se renderiza por petición, así que no hay datos cacheados que invalidar; lo
  // que sí hay que tirar es el recuerdo que el router del navegador guarda de `/admin`
  // (podría tener el HTML de antes del login, cuando no había sesión).
  revalidatePath('/admin', 'layout');
  redirect(destination);
}

/** Cierra la sesión y vuelve al login. */
export async function signOut(): Promise<void> {
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();

  revalidatePath('/admin', 'layout');
  redirect('/admin/login');
}

/** Pide por correo el enlace para elegir una contraseña nueva. */
export async function requestPasswordReset(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = EmailSchema.safeParse(formData.get('email'));

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Revisa el correo.' };
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
    // El enlace del correo vuelve por aquí: el callback canjea el código por una sesión y
    // deja al usuario en el formulario de contraseña nueva.
    redirectTo: `${getSiteUrl()}/admin/auth/callback?next=/admin/nueva-clave`,
  });

  if (error) {
    // Supabase limita cuántos correos se pueden pedir por hora. Sin decirlo, el aviso
    // genérico haría pensar que la dirección está mal cuando solo hay que esperar.
    if (error.code === 'over_email_send_rate_limit') {
      return { error: 'Se han pedido demasiados enlaces seguidos. Espera unos minutos.' };
    }

    return { error: 'No se pudo enviar el correo. Inténtalo de nuevo en un minuto.' };
  }

  return {
    error: null,
    success:
      'Si ese correo pertenece al panel, recibirás un enlace para elegir una contraseña nueva. Revisa también la carpeta de correo no deseado.',
  };
}

/** Guarda la contraseña nueva del usuario que tiene sesión abierta. */
export async function updatePassword(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = z
    .object({
      password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.'),
      repeat: z.string(),
    })
    .refine((values) => values.password === values.repeat, {
      message: 'Las dos contraseñas no coinciden.',
    })
    .safeParse({ password: formData.get('password'), repeat: formData.get('repeat') });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Revisa la contraseña.' };
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'El enlace ha caducado. Pide otro correo de restablecimiento.' };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: 'No se pudo guardar la contraseña. Inténtalo de nuevo.' };

  redirect('/admin');
}

'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { deleteMediaAction } from '@/app/admin/(panel)/media-actions';

import { showToast } from './toast';

/**
 * Borra una imagen del bucket, desde `/admin/imagenes`.
 *
 * Pregunta antes con el diálogo del navegador: una confirmación propia sería más bonita, pero
 * para una acción destructiva y poco frecuente la del navegador cumple y no añade una pieza que
 * mantener. Si la acción contesta que la imagen está en uso, ese mensaje **es** el aviso —y dice
 * dónde está—: no se borra nada.
 *
 * Tras borrar se refresca la pantalla para que la lista deje de mostrarla. El listado se lee del
 * bucket en el servidor, así que no hay caché que invalidar aquí.
 */
export default function DeleteMediaButton({ path }: { path: string }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function handleClick() {
    const confirmed = window.confirm(
      `¿Borrar esta imagen del bucket?\n\n${path}\n\nSi está en uso en el sitio, no se borrará y te dirá dónde está.`,
    );
    if (!confirmed) return;

    setBusy(true);

    try {
      const result = await deleteMediaAction(path);
      showToast(result.message, result.ok ? 'success' : 'error');
      if (result.ok) router.refresh();
    } catch {
      showToast('No se pudo borrar: el servidor no respondió.', 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      aria-label={`Borrar del bucket la imagen ${path}`}
      className="min-h-[44px] rounded-sm border border-border px-3 text-xs text-danger transition-colors hover:bg-primary-soft disabled:opacity-40"
    >
      {busy ? 'Borrando…' : 'Borrar'}
    </button>
  );
}

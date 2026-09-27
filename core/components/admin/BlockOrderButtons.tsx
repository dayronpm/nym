'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { reorderBlocksAction } from '@/app/admin/(panel)/paginas/[slug]/actions';

import { showToast } from './toast';

/**
 * Flechas para subir y bajar un bloque dentro de su página.
 *
 * Son botones y no arrastre por una razón de fondo: arrastrar con el dedo exige eventos de
 * puntero, gestión de umbrales y una zona de soltado, y en un móvil se falla mucho. Un botón de
 * subir funciona igual con ratón, con el dedo y con el teclado, y anuncia lo que hace a quien usa
 * un lector de pantalla. El arrastre, si llega, será un atajo **además** de esto, nunca en lugar
 * de esto.
 *
 * La lista completa de identificadores llega por props porque el movimiento se calcula sobre el
 * orden real de la página: mandar solo el bloque movido dejaría al servidor adivinando dónde va.
 */

const ICON =
  'flex h-11 w-11 items-center justify-center rounded-sm text-text-muted transition-colors hover:bg-primary-soft disabled:opacity-30';

export interface BlockOrderButtonsProps {
  /** Página a la que pertenecen los bloques. */
  page: string;
  /** Identificadores de todos los bloques de la página, en su orden actual. */
  ids: string[];
  /** Posición de este bloque dentro de `ids`. */
  index: number;
  /** Nombre del bloque, para el texto que anuncia el botón. */
  label: string;
}

export default function BlockOrderButtons({ page, ids, index, label }: BlockOrderButtonsProps) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function move(to: number) {
    if (to < 0 || to >= ids.length) return;

    const next = [...ids];
    const [moved] = next.splice(index, 1);
    if (moved === undefined) return;
    next.splice(to, 0, moved);

    setBusy(true);

    try {
      const result = await reorderBlocksAction({ page, ids: next });
      showToast(result.message, result.ok ? 'success' : 'error');
      if (result.ok) router.refresh();
    } catch {
      showToast('No se pudo cambiar el orden: el servidor no respondió.', 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="flex shrink-0 items-center gap-1">
      <button
        type="button"
        onClick={() => void move(index - 1)}
        disabled={busy || index === 0}
        aria-label={`Subir ${label}`}
        className={ICON}
      >
        ↑
      </button>
      <button
        type="button"
        onClick={() => void move(index + 1)}
        disabled={busy || index === ids.length - 1}
        aria-label={`Bajar ${label}`}
        className={ICON}
      >
        ↓
      </button>
    </span>
  );
}

'use client';

import { useState } from 'react';

/**
 * Botón de copiar al portapapeles.
 *
 * Existe porque el valor que se copia es una **ruta de bucket** (`gallery/abc.webp`), que es lo
 * que se pega en el campo de imagen de cualquier bloque. Sin esto habría que seleccionarla a
 * mano desde el texto, que es exactamente el tipo de tarea que hace que la gente busque el
 * archivo en su carpeta y lo suba otra vez.
 *
 * Si el navegador no da permiso al portapapeles (o la página no va por HTTPS) no se avisa de un
 * error: la ruta está a la vista y se puede seleccionar.
 */
export default function CopyButton({ value, label = 'Copiar ruta' }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Sin portapapeles disponible: la ruta ya se ve en pantalla.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="min-h-[44px] rounded-sm border border-border px-3 text-xs transition-colors hover:bg-primary-soft"
    >
      {copied ? 'Copiada' : label}
    </button>
  );
}

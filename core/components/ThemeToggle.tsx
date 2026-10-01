'use client';

/**
 * Interruptor de tema del encabezado.
 *
 * Ciclo de tres estados: seguir al sistema → oscuro → claro. Desde «sistema», el primer clic
 * lleva al contrario de lo que se está viendo, para que siempre cambie algo; y se puede
 * volver a «sistema» cuando se quiera. La elección se guarda en `localStorage`
 * (`site-theme`) y se aplica como atributo `data-theme` en `<html>`.
 *
 * Este componente no guarda estado en React a propósito: los tres iconos van siempre en el
 * botón y es el CSS quien enseña uno u otro según el atributo. Así el servidor pinta el
 * mismo HTML para todos, el script del layout raíz aplica la preferencia antes del primer
 * pintado, y no hay parpadeo ni desajuste de hidratación.
 */

const STORAGE_KEY = 'site-theme';

/** Estado del atributo: `null` significa «seguir al sistema». */
type ThemeMode = 'dark' | 'light' | null;

/** Siguiente estado del ciclo. Desde «sistema» se pasa al contrario de lo que se ve. */
function nextMode(current: string | null): ThemeMode {
  if (current === 'dark') return 'light';
  if (current === 'light') return null;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'light' : 'dark';
}

const MODE_LABELS: Record<'system' | 'dark' | 'light', string> = {
  system: 'sigue al sistema',
  dark: 'oscuro',
  light: 'claro',
};

/** Aplica el modo (o lo quita) y devuelve cómo ha quedado, para anunciarlo. */
function applyMode(mode: ThemeMode): string {
  const root = document.documentElement;

  if (mode) {
    root.setAttribute('data-theme', mode);
  } else {
    root.removeAttribute('data-theme');
  }

  try {
    if (mode) {
      localStorage.setItem(STORAGE_KEY, mode);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Sin almacenamiento (modo privado estricto) el cambio vale para esta visita.
  }

  return MODE_LABELS[mode ?? 'system'];
}

export default function ThemeToggle() {
  return (
    <button
      type="button"
      aria-label="Cambiar el tema de color"
      title="Tema del sitio: sigue al sistema o fíjalo en oscuro o claro"
      onClick={(event) => {
        const label = applyMode(nextMode(document.documentElement.getAttribute('data-theme')));
        event.currentTarget.setAttribute('aria-label', `Cambiar el tema de color (${label})`);
      }}
      className="flex h-11 w-11 items-center justify-center rounded-md border border-border text-text-muted transition-colors hover:bg-primary-soft hover:text-text"
    >
      {/* Un icono por estado: el CSS enseña el que corresponde a `data-theme` (globals.css). */}

      {/* Círculo mitad relleno: «sigue al sistema». */}
      <svg
        className="theme-toggle-icon h-5 w-5"
        data-mode="system"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3a9 9 0 0 0 0 18Z" fill="currentColor" stroke="none" />
      </svg>

      {/* Luna: modo oscuro activo. */}
      <svg
        className="theme-toggle-icon h-5 w-5"
        data-mode="dark"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
      </svg>

      {/* Sol: modo claro activo. */}
      <svg
        className="theme-toggle-icon h-5 w-5"
        data-mode="light"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    </button>
  );
}

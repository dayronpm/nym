import type { AdminIconName } from '@/lib/admin-nav';

/**
 * Iconos del panel.
 *
 * Son trazos mínimos (24×24, sin relleno) dibujados a mano: la plantilla no arrastra ninguna
 * librería de iconos por siete dibujos. Van con `aria-hidden` porque siempre acompañan a un
 * texto que ya dice lo mismo.
 */
const PATHS: Record<AdminIconName, string[]> = {
  home: ['M3 10.5 12 3l9 7.5', 'M5 9.5V21h14V9.5'],
  pages: ['M6 2.5h7l5 5v14H6z', 'M13 2.5v5h5'],
  catalog: ['M4 6h16', 'M4 12h16', 'M4 18h10'],
  images: ['M3 5h18v14H3z', 'm3.5 16.5 5-5 4 4 3-3 5 5'],
  business: ['M3.5 9 5 4h14l1.5 5', 'M5 9v11h14V9', 'M10 20v-5h4v5'],
  seo: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M3.5 9.5h17', 'M3.5 14.5h17'],
  appearance: [
    'M12 3a9 9 0 0 0 0 18c1.6 0 2.3-1.3 1.5-2.3-.7-1 0-1.9 1.1-1.9H18a3 3 0 0 0 3-3A9 9 0 0 0 12 3Z',
    'M8.5 10h.01',
    'M12 7.5h.01',
    'M15.5 10h.01',
  ],
};

export default function AdminIcon({
  name,
  className = 'h-5 w-5 shrink-0',
}: {
  name: AdminIconName;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {PATHS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

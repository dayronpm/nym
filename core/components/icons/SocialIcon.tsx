import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

/**
 * Iconos de redes sociales, dibujados a mano en SVG.
 *
 * El plan no permite librerías de iconos, así que los trazos viven aquí. Son
 * **decorativos**: van con `aria-hidden` porque siempre acompañan a una etiqueta de
 * texto ("Instagram") que ya nombra el enlace; repetir el nombre en el icono sería
 * ruido para un lector de pantalla.
 *
 * Heredan el color con `currentColor`, así que valen igual en modo claro y oscuro.
 */
export type SocialPlatform = 'instagram' | 'tiktok' | 'facebook';

const GLYPHS: Record<SocialPlatform, ReactNode> = {
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="1.15" fill="currentColor" stroke="none" />
    </>
  ),
  tiktok: (
    <>
      <path d="M15 3.8v10.7a4.2 4.2 0 1 1-4.2-4.2" />
      <path d="M15 3.8c.5 2.6 2.2 4.2 4.8 4.5" />
    </>
  ),
  facebook: (
    <path
      d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.8c0-.9.3-1.5 1.6-1.5h1.5V4.7c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1v1.8H7.7v3h2.5V21Z"
      fill="currentColor"
      stroke="none"
    />
  ),
};

export default function SocialIcon({
  platform,
  className,
}: {
  platform: SocialPlatform;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={cn('h-[18px] w-[18px] shrink-0', className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {GLYPHS[platform]}
    </svg>
  );
}

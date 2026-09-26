import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';

import { getSiteUrl } from '@/config/env';
import '@/styles/globals.css';

/**
 * Fuentes de la plantilla.
 *
 * Se descargan y sirven desde el propio sitio (sin llamadas a Google en tiempo
 * de ejecución). Al ser de compilación, las tipografías elegibles desde el
 * panel se limitarán a una lista curada declarada aquí (Fase 2).
 */
const headingFont = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600'],
  display: 'swap',
  variable: '--font-heading',
  fallback: ['ui-serif', 'Georgia', 'serif'],
});

const bodyFont = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-body',
  fallback: ['ui-sans-serif', 'system-ui', 'sans-serif'],
});

/**
 * Metadatos por defecto.
 *
 * Son valores neutros de la plantilla. La plantilla del `<title>` con el nombre real del
 * negocio la pone el layout del sitio (`(sitio)/layout.tsx`), que sí lee `site_settings`.
 *
 * `metadataBase` es lo que permite escribir rutas relativas en Open Graph: Next las
 * convierte en absolutas (con el dominio propio si está declarado, si no con el de
 * Vercel) y avisa en el build si falta.
 */
export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: 'Nombre del Negocio',
    template: '%s · Nombre del Negocio',
  },
  description: 'Sitio web de un negocio de bienestar, con panel de administración propio.',
  // Favicon generado en `/favicon` a partir del nombre y la paleta del negocio, en lugar
  // de un archivo estático: ver `core/app/favicon/route.ts`.
  icons: { icon: [{ url: '/favicon', type: 'image/svg+xml' }] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // El sitio es solo español: no hace falta atributo de cambio de idioma.
    <html lang="es" className={`${headingFont.variable} ${bodyFont.variable}`}>
      <body className="min-h-screen bg-bg text-text antialiased">{children}</body>
    </html>
  );
}

import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';

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
 * Son valores neutros de la plantilla. Cada página los sobrescribe con los
 * suyos desde `pages` (title, meta_title, meta_description, og_image).
 */
export const metadata: Metadata = {
  title: {
    default: 'Nombre del Negocio',
    template: '%s · Nombre del Negocio',
  },
  description: 'Sitio web de un negocio de bienestar, con panel de administración propio.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // El sitio es solo español: no hace falta atributo de cambio de idioma.
    <html lang="es" className={`${headingFont.variable} ${bodyFont.variable}`}>
      <body className="min-h-screen bg-bg text-text antialiased">{children}</body>
    </html>
  );
}

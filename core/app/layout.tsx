import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Inter, Jost } from 'next/font/google';

import { getSiteUrl } from '@/config/env';
import '@/styles/globals.css';

/**
 * Fuentes de la plantilla.
 *
 * Se descargan y sirven desde el propio sitio (sin llamadas a Google en tiempo de ejecución).
 * Al ser de compilación, las tipografías elegibles desde el panel se limitan a esta lista
 * curada: añadir una fuente es un cambio de código, no un dato que se pueda escribir.
 *
 * Las variables llevan el **nombre de la familia** (`--font-inter`) y no el papel que cumplen
 * (`--font-heading`): el papel lo decide `site_settings.theme` y lo inyecta el layout del sitio
 * (`lib/theme.ts`). Con un nombre por papel no se podrían intercambiar desde el panel.
 */
const headingFont = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600'],
  display: 'swap',
  variable: '--font-cormorant',
  fallback: ['ui-serif', 'Georgia', 'serif'],
});

const bodyFont = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-inter',
  fallback: ['ui-sans-serif', 'system-ui', 'sans-serif'],
});

const jostFont = Jost({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-jost',
  fallback: ['ui-sans-serif', 'system-ui', 'sans-serif'],
});

/**
 * Script mínimo que aplica la elección de tema guardada antes del primer pintado.
 *
 * Con qué paleta abre el sitio lo decide el tema guardado en la base de datos —el negocio puede
 * poner la oscura como base desde el panel, y así lo hace N&M—; este script solo respeta la
 * elección del visitante (`localStorage`, clave `site-theme`), que el servidor no puede leer.
 * Sin elección no hace nada: manda la paleta base del tema.
 *
 * Va envuelto en `try` porque `localStorage` puede no existir (modo privado estricto) y eso no
 * debe romper la página.
 */
const THEME_INIT_SCRIPT =
  "try{var m=localStorage.getItem('site-theme');if(m==='dark'||m==='light'){document.documentElement.setAttribute('data-theme',m)}}catch(e){}";

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
  // La ruta `/favicon` sirve el icono subido desde el panel o genera un monograma de
  // respaldo: ver `core/app/favicon/route.ts`. Sin `type`: el archivo puede ser SVG o PNG.
  icons: { icon: [{ url: '/favicon' }] },
};

/**
 * `colorScheme` va en `viewport` y no en `metadata` (lo exige Next 14): declara que el sitio
 * sabe pintarse claro y oscuro, para que el navegador —sobre todo en móvil— no asuma que es
 * solo claro al pintar controles nativos y el fondo del área de página.
 */
export const viewport: Viewport = {
  colorScheme: 'light dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // El sitio es solo español: no hace falta atributo de cambio de idioma.
    <html lang="es" className={`${headingFont.variable} ${bodyFont.variable} ${jostFont.variable}`}>
      <body className="min-h-screen bg-bg text-text antialiased">
        {/* La elección de tema guardada se aplica antes de pintar nada. Va lo primero del
            cuerpo a propósito: el navegador lo ejecuta antes del contenido, así nadie ve un
            parpadeo del tema equivocado. Sin elección no hace nada: manda la paleta base. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        {children}
      </body>
    </html>
  );
}

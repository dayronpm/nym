import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { getSiteSettings } from '@/data/queries/site-settings';

/**
 * Layout del sitio público.
 *
 * Agrupa las cinco páginas públicas para darles el encabezado y el pie comunes.
 * Vive en el grupo `(sitio)` y no en el `layout.tsx` raíz porque aquel también
 * envuelve `/admin`, y el panel no debe llevar el chrome público.
 *
 * El grupo no afecta a la URL: las rutas siguen siendo `/`, `/servicios`, etc.
 *
 * La lectura de `site_settings` aquí arriba evita repetirla en cada página, y al
 * usar el cliente público (sin cookies) permite que las páginas se generen de
 * forma estática y se refresquen solas cada hora.
 */
export const revalidate = 3600;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <>
      <Header settings={settings} />
      {/* El <main> lo pone este layout: las páginas no deben añadir otro.
          `site-main` activa la alternancia de fondos definida en globals.css. */}
      <main className="site-main">{children}</main>
      <Footer settings={settings} />
    </>
  );
}

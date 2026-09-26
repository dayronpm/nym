import type { Metadata } from 'next';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { getSiteSettings } from '@/data/queries/site-settings';
import { buildBusinessJsonLd, serializeJsonLd } from '@/lib/seo';

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

/**
 * Metadatos comunes del sitio público.
 *
 * Aquí se declara la plantilla del `<title>` con el **nombre real del negocio**: el layout
 * raíz trae el valor neutro de la plantilla y este lo sustituye por el de `site_settings`.
 * Las páginas devuelven solo su nombre y la marca la añade la plantilla (ver `lib/seo.ts`).
 */
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return {
    title: {
      default: settings.brand.name,
      template: `%s · ${settings.brand.name}`,
    },
    description: settings.brand.tagline,
    openGraph: { siteName: settings.brand.name },
  };
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <>
      {/* Datos estructurados del negocio local (schema.org, tipo `DaySpa`). Van en el
          <body> a propósito: Google los acepta igual y así no hay que montarlos con
          `next/script`, que añadiría JavaScript por unos datos que son texto. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildBusinessJsonLd(settings)) }}
      />

      <Header settings={settings} />
      {/* El <main> lo pone este layout: las páginas no deben añadir otro.
          `site-main` activa la alternancia de fondos definida en globals.css. */}
      <main className="site-main">{children}</main>
      <Footer settings={settings} />
    </>
  );
}

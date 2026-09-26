import { getAllPages } from '@/data/queries/pages';
import { getSiteSettings } from '@/data/queries/site-settings';

import SeoScreen from './SeoScreen';

/**
 * Pantalla de SEO.
 *
 * Lee la configuración (valores por defecto) y las cinco páginas con sus metadatos. Las dos
 * lecturas están cacheadas y etiquetadas, y el guardado las revalida.
 */
export default async function AdminSeoPage() {
  const [settings, pages] = await Promise.all([getSiteSettings(), getAllPages()]);

  return (
    <main className="container-page section-y">
      <h1 className="text-3xl">SEO</h1>
      <p className="mt-2 text-text-muted">
        El título y la descripción que aparecen en Google y al compartir un enlace en WhatsApp o
        redes.
      </p>

      <div className="mt-8">
        <SeoScreen settings={settings} pages={pages} />
      </div>
    </main>
  );
}

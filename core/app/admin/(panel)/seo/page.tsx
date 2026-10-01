import ControlPanel from '@/components/admin/ControlPanel';
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
    <>
      <ControlPanel
        title="SEO"
        subtitle="El título y la descripción que aparecen en Google y al compartir un enlace en WhatsApp o redes."
        breadcrumb={[{ label: 'Panel', href: '/admin' }, { label: 'SEO' }]}
      />

      <SeoScreen settings={settings} pages={pages} />
    </>
  );
}

import ControlPanel from '@/components/admin/ControlPanel';
import { getSiteSettings } from '@/data/queries/site-settings';

import NegocioScreen from './NegocioScreen';

/**
 * Datos del negocio.
 *
 * La lectura de la configuración está cacheada, así que esta pantalla no añade consultas al
 * panel. El guardado revalida el layout completo del sitio, porque estos datos se ven en todas
 * las páginas.
 */
export default async function AdminNegocioPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <ControlPanel
        title="Negocio"
        subtitle="Los datos que se repiten en todo el sitio. Cada tarjeta se guarda por separado."
        breadcrumb={[{ label: 'Panel', href: '/admin' }, { label: 'Negocio' }]}
      />

      <NegocioScreen settings={settings} />
    </>
  );
}

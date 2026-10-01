import ControlPanel from '@/components/admin/ControlPanel';
import { getSiteSettings } from '@/data/queries/site-settings';

import ServiciosScreen from './ServiciosScreen';

/**
 * Catálogo de servicios.
 *
 * La lectura de la configuración está cacheada. Al guardar se rehace el layout completo del
 * sitio, porque el catálogo se ve en Inicio y en /servicios.
 */
export default async function AdminServiciosPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <ControlPanel
        title="Servicios"
        subtitle="El catálogo se edita una sola vez y lo usan la portada y la página de Servicios."
        breadcrumb={[{ label: 'Panel', href: '/admin' }, { label: 'Servicios' }]}
      />

      <ServiciosScreen settings={settings} />
    </>
  );
}

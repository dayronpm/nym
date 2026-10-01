import ControlPanel from '@/components/admin/ControlPanel';
import { getSiteSettings } from '@/data/queries/site-settings';

import AparienciaScreen from './AparienciaScreen';

/**
 * Pantalla de apariencia.
 *
 * Lee el tema desde la configuración (cacheada) y lo entrega a la pantalla cliente. Al guardar
 * se revalida el layout completo del sitio, que es donde se inyecta el tema.
 */
export default async function AdminAparienciaPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <ControlPanel
        title="Apariencia"
        subtitle="Los colores, las letras y las esquinas del sitio. Los cambios se ven al guardar."
        breadcrumb={[{ label: 'Panel', href: '/admin' }, { label: 'Apariencia' }]}
      />

      <AparienciaScreen settings={settings} />
    </>
  );
}

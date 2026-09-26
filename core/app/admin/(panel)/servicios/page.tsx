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
    <main className="container-page section-y">
      <h1 className="text-3xl">Servicios</h1>
      <p className="mt-2 text-text-muted">
        El catálogo se edita una sola vez y lo usan la portada y la página de Servicios.
      </p>

      <div className="mt-8">
        <ServiciosScreen settings={settings} />
      </div>
    </main>
  );
}

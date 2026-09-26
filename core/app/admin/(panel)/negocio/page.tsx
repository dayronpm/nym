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
    <main className="container-page section-y">
      <h1 className="text-3xl">Negocio</h1>
      <p className="mt-2 text-text-muted">
        Los datos que se repiten en todo el sitio. Cada tarjeta se guarda por separado.
      </p>

      <div className="mt-8">
        <NegocioScreen settings={settings} />
      </div>
    </main>
  );
}

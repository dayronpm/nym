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
    <main className="container-page section-y">
      <h1 className="text-3xl">Apariencia</h1>
      <p className="mt-2 text-text-muted">
        Los colores, las letras y las esquinas del sitio. Los cambios se ven al guardar.
      </p>

      <div className="mt-8">
        <AparienciaScreen settings={settings} />
      </div>
    </main>
  );
}

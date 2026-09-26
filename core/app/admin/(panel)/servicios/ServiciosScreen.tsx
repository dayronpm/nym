'use client';

import DraftCard from '@/components/admin/DraftCard';
import DynamicForm from '@/components/admin/DynamicForm';
import { ServicesCatalog, type SiteSettings } from '@/types/settings';

import { saveSettingsAction } from '../settings-actions';

/**
 * Catálogo de servicios.
 *
 * Es el **único** sitio donde se editan los servicios, y es a propósito: el bloque `services`
 * aparece dos veces en el sitio —resumen en Inicio y listado completo en /servicios— y si cada
 * bloque guardara su propia copia, el dueño tendría que editar el mismo servicio dos veces y las
 * dos versiones podrían desincronizarse. El bloque solo decide **cómo** se muestra (título,
 * corte, enlace); los servicios salen de aquí.
 *
 * El formulario es el generado desde `ServicesCatalog`, que es el mismo esquema que valida el
 * servidor: un catálogo con listas dentro de listas (categorías → servicios). Un servicio nuevo
 * se crea con un identificador ya puesto y con `enabled` en verdadero, porque esas dos cosas no
 * se le preguntan a nadie.
 */
export default function ServiciosScreen({ settings }: { settings: SiteSettings }) {
  return (
    <DraftCard
      title="Catálogo de servicios"
      description="Las categorías con sus servicios. Es el mismo catálogo que usa Inicio en modo resumen y la página de Servicios completa."
      initialValue={settings.services_catalog}
      save={(value) => saveSettingsAction('services_catalog', value)}
      errorPrefix="services_catalog."
    >
      {(form) => (
        <DynamicForm
          schema={ServicesCatalog}
          labelsKey="services_catalog"
          initialData={form.value}
          onChange={form.onChange}
          errors={form.errors}
          disabled={form.disabled}
        />
      )}
    </DraftCard>
  );
}

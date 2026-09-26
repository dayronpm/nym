'use client';

import DraftCard from '@/components/admin/DraftCard';
import DynamicForm from '@/components/admin/DynamicForm';
import { BrandSettings, ContactSettings, type SiteSettings } from '@/types/settings';

import { saveSettingsAction } from '../settings-actions';

import HoursForm from './HoursForm';

/**
 * Pantalla de datos del negocio: marca, contacto y horarios.
 *
 * Es una sola pantalla cliente en lugar de tres componentes sueltos porque las tarjetas reciben
 * sus campos como función, y una función no puede cruzar la frontera servidor/cliente. La página
 * del servidor lee la configuración y se la pasa ya resuelta.
 *
 * Los esquemas **sí** vienen de `types/settings`: son los mismos que validan en el servidor, así
 * que el formulario y la base de datos no pueden discrepar.
 */
export default function NegocioScreen({ settings }: { settings: SiteSettings }) {
  return (
    <div className="space-y-6">
      <DraftCard
        title="Marca"
        description="El nombre que aparece en el encabezado, el pie, el título de las páginas y los buscadores."
        initialValue={settings.brand}
        save={(value) => saveSettingsAction('brand', value)}
        errorPrefix="brand."
      >
        {(form) => (
          <DynamicForm
            schema={BrandSettings}
            labelsKey="brand_settings"
            initialData={form.value}
            onChange={form.onChange}
            errors={form.errors}
            disabled={form.disabled}
          />
        )}
      </DraftCard>

      <DraftCard
        title="Contacto"
        description="Con esto se construyen el botón de WhatsApp, los enlaces de teléfono y correo, y los datos para los buscadores."
        initialValue={settings.contact}
        save={(value) => saveSettingsAction('contact', value)}
        errorPrefix="contact."
      >
        {(form) => (
          <DynamicForm
            schema={ContactSettings}
            labelsKey="contact_settings"
            initialData={form.value}
            onChange={form.onChange}
            errors={form.errors}
            disabled={form.disabled}
          />
        )}
      </DraftCard>

      <DraftCard
        title="Horarios"
        description="Se ven en el pie de todas las páginas y en el bloque de ubicación, y se publican como datos estructurados para Google."
        initialValue={settings.hours}
        save={(value) => saveSettingsAction('hours', value)}
        errorPrefix="hours."
      >
        {(form) => (
          <HoursForm
            value={form.value}
            onChange={form.onChange}
            disabled={form.disabled}
            errors={form.errors}
          />
        )}
      </DraftCard>
    </div>
  );
}

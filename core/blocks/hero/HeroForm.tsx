'use client';

import type { BlockFormProps } from '@/blocks/defineBlock';

import type { HeroData } from './schema';

/**
 * Bloque `hero` — formulario del panel.
 *
 * Fase 0: cubre los campos de texto y la posición de la imagen. La subida de
 * imágenes (`ImageUpload` con compresión en el navegador) se conecta en la
 * Fase 2, sustituyendo el aviso de "imagen pendiente".
 *
 * El formulario no guarda nada por su cuenta: emite los cambios con `onChange`
 * y el panel decide cuándo persistir.
 */
export default function HeroForm({ initialData, onChange, errors = {} }: BlockFormProps<HeroData>) {
  function patch(changes: Partial<HeroData>) {
    onChange({ ...initialData, ...changes });
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="hero-eyebrow" className="block text-sm font-medium">
          Texto superior (opcional)
        </label>
        <input
          id="hero-eyebrow"
          type="text"
          value={initialData.eyebrow ?? ''}
          maxLength={60}
          onChange={(event) => patch({ eyebrow: event.target.value })}
          className="mt-1 w-full rounded-sm border border-border px-3 py-2.5"
        />
        {errors['eyebrow'] ? <p className="mt-1 text-sm text-danger">{errors['eyebrow']}</p> : null}
      </div>

      <div>
        <label htmlFor="hero-title" className="block text-sm font-medium">
          Título
        </label>
        <input
          id="hero-title"
          type="text"
          value={initialData.title}
          maxLength={100}
          onChange={(event) => patch({ title: event.target.value })}
          className="mt-1 w-full rounded-sm border border-border px-3 py-2.5"
        />
        {errors['title'] ? <p className="mt-1 text-sm text-danger">{errors['title']}</p> : null}
      </div>

      <div>
        <label htmlFor="hero-subtitle" className="block text-sm font-medium">
          Subtítulo (opcional)
        </label>
        <textarea
          id="hero-subtitle"
          value={initialData.subtitle ?? ''}
          maxLength={240}
          rows={3}
          onChange={(event) => patch({ subtitle: event.target.value })}
          className="mt-1 w-full rounded-sm border border-border px-3 py-2.5"
        />
        {errors['subtitle'] ? (
          <p className="mt-1 text-sm text-danger">{errors['subtitle']}</p>
        ) : null}
      </div>

      <fieldset>
        <legend className="text-sm font-medium">Posición de la imagen (escritorio)</legend>
        <div className="mt-2 flex gap-4">
          {(['right', 'left'] as const).map((position) => (
            <label key={position} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="hero-image-position"
                value={position}
                checked={initialData.image_position === position}
                onChange={() => patch({ image_position: position })}
              />
              {position === 'right' ? 'Derecha' : 'Izquierda'}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="hero-cta" className="block text-sm font-medium">
          Texto del botón principal
        </label>
        <input
          id="hero-cta"
          type="text"
          value={initialData.primary_cta_label}
          maxLength={40}
          onChange={(event) => patch({ primary_cta_label: event.target.value })}
          className="mt-1 w-full rounded-sm border border-border px-3 py-2.5"
        />
      </div>

      <p className="rounded-sm border border-border bg-surface-alt p-3 text-sm text-text-muted">
        Imagen del hero y botón secundario: pendientes de la Fase 2.
      </p>
    </div>
  );
}

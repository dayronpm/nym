'use client';

/**
 * Formulario provisional de bloque.
 *
 * Ocupa el sitio que el `defineBlock` exige hasta que exista el panel de edición.
 * En la Fase 1 no hay ninguna pantalla que lo alcance, así que escribir nueve
 * formularios a mano sería trabajo sin verificar y condenado a reescribirse: el
 * plan pide que los formularios se **generen desde el esquema zod**.
 *
 * En la Fase 2 se sustituye por `DynamicForm`, que derivará los campos del
 * esquema de cada bloque. Los formularios propios quedan solo para los casos con
 * comportamiento especial (subida de imágenes, listas repetibles).
 */
export default function BlockFormPending() {
  return (
    <p className="rounded-sm border border-border bg-surface-alt p-4 text-sm text-text-muted">
      La edición de este bloque se habilita en la Fase 2 (panel de administración).
    </p>
  );
}

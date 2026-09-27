'use client';

import { useState } from 'react';

/**
 * Borrador con guardado: la lógica que comparten todas las tarjetas del panel.
 *
 * Editar contenido en el panel siempre es lo mismo: se copia el valor actual a un borrador, el
 * formulario lo va cambiando, se avisa de si hay cambios sin guardar, se llama a la acción del
 * servidor y se pintan los errores que devuelva (por campo y en general).
 *
 * Vive en un gancho y no repetido en cada tarjeta porque hay dos clases de tarjeta —la de un
 * bloque y la de un grupo de configuración— y no tiene ningún sentido que se comporten
 * distinto.
 *
 * Decisión: **el borrador se pierde si se recarga la página**, y se avisa. No hay guardado
 * automático a propósito: escribir contenido a medias por accidente es peor que perder lo
 * tecleado.
 */

export interface DraftFeedback {
  tone: 'error' | 'success';
  text: string;
}

/** Lo que devuelven las acciones de guardado del panel. */
export interface SaveOutcome {
  ok: boolean;
  errors: Record<string, string>;
  message: string;
}

export interface DraftState<T> {
  /** Valor en edición. */
  value: T;
  setValue: (next: T) => void;
  /** Hay cambios sin guardar. */
  dirty: boolean;
  saving: boolean;
  /** Errores por ruta de campo, tal como los devolvió el servidor. */
  errors: Record<string, string>;
  /** Confirmación o error general. */
  feedback: DraftFeedback | null;
  /** Guarda y deja el borrador como punto de partida. */
  commit: () => Promise<void>;
}

/**
 * La comparación de "hay cambios" es por serialización: los borradores se construyen siempre
 * copiando con `...`, así que el orden de las claves es estable y no hace falta comparar en
 * profundidad.
 */
export function useDraft<T>(
  createInitial: () => T,
  save: (value: T) => Promise<SaveOutcome>,
): DraftState<T> {
  // El valor inicial llega como función para que solo se calcule al montar: rellenar un
  // borrador con los valores por defecto del esquema es un `parse`, y no tiene sentido repetirlo
  // en cada pulsación de tecla.
  const [value, setValue] = useState<T>(createInitial);
  const [savedValue, setSavedValue] = useState<T>(createInitial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<DraftFeedback | null>(null);
  const [saving, setSaving] = useState(false);

  const dirty = JSON.stringify(value) !== JSON.stringify(savedValue);

  async function commit() {
    setSaving(true);
    setFeedback(null);

    try {
      const result = await save(value);

      if (result.ok) {
        setSavedValue(value);
        setErrors({});
        setFeedback({ tone: 'success', text: result.message });
      } else {
        setErrors(result.errors);
        setFeedback({ tone: 'error', text: result.message });
      }
    } catch (error) {
      // Una acción del servidor puede fallar **sin devolver nada**: si el servidor se cayó, si
      // se reinició a mitad del envío o si se fue la conexión, `fetch` no llega a responder y el
      // error sube como excepción. Sin este `catch`, Next pinta su pantalla de error —"Failed to
      // fetch" y una pila de llamadas— que no le dice nada a quien está editando, y el borrador
      // parece perdido. Se avisa y se sigue: lo tecleado sigue ahí, listo para reintentar.
      setErrors({});
      setFeedback({
        tone: 'error',
        text: 'No se pudo enviar el cambio: el servidor no respondió. Comprueba que el sitio sigue encendido e inténtalo otra vez.',
      });
      console.error('[panel] no se pudo enviar el borrador:', error);
    } finally {
      setSaving(false);
    }
  }

  return { value, setValue, dirty, saving, errors, feedback, commit };
}

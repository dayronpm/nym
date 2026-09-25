/**
 * Errores de la capa de datos.
 *
 * La capa `core/data/` nunca deja pasar un error crudo de Supabase: lo envuelve
 * en uno de estos, con un mensaje en español que se puede mostrar tal cual y el
 * error original en `cause` para depurar.
 */

/** Fallo al leer o escribir en la base de datos. */
export class DataError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'DataError';
  }
}

/**
 * Fallo de validación antes de escribir.
 *
 * Lleva los errores por campo para que el panel pueda marcarlos en el formulario
 * sin tener que volver a validar.
 */
export class ValidationError extends DataError {
  readonly fieldErrors: Record<string, string>;

  constructor(message: string, fieldErrors: Record<string, string>) {
    super(message);
    this.name = 'ValidationError';
    this.fieldErrors = fieldErrors;
  }
}

/**
 * Punto único de importación de tipos.
 *
 * Convención: los tipos se importan siempre desde `@/types`, nunca desde los
 * archivos internos, para que la reorganización futura no obligue a tocar los
 * componentes.
 *
 * En la Fase 1 se añadirá aquí el reexport de `./supabase`, el archivo generado
 * por `supabase gen types`.
 */
export * from './models';
export * from './settings';

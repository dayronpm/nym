/**
 * Punto único de importación de tipos.
 *
 * Convención: los tipos se importan siempre desde `@/types`, nunca desde los
 * archivos internos, para que la reorganización futura no obligue a tocar los
 * componentes.
 */
// Tipos generados por Supabase. Se regeneran con `npm run db:types`: no editar a mano.
export * from './supabase';
// Filas de la base de datos, derivadas de los anteriores.
export * from './models';
// Esquemas zod de la configuración del sitio y de las páginas.
export * from './settings';

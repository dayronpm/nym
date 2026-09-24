/**
 * Shim de raíz.
 *
 * Tailwind resuelve `tailwind.config.ts` desde la raíz del proyecto, así que
 * este archivo solo reexporta la configuración real de la plantilla, que vive
 * en `core/styles/tailwind.config.ts` junto con los tokens de diseño.
 */
export { default } from './core/styles/tailwind.config';

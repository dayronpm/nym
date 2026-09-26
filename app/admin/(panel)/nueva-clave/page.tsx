/**
 * Shim de raíz. Implementación en `core/app/admin/(panel)/nueva-clave/page.tsx`.
 *
 * El shim va **dentro** del grupo `(panel)` porque la página tiene que heredar el layout
 * protegido: una página fuera del grupo perdería la comprobación de sesión sin avisar.
 */
export { default, metadata } from '@/app/admin/(panel)/nueva-clave/page';

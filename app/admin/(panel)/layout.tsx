/**
 * Shim de raíz. Implementación en `core/app/admin/(panel)/layout.tsx`.
 *
 * El grupo de rutas `(panel)` no forma parte de la URL: solo sirve para que
 * `/admin/login` quede fuera del layout protegido.
 */
export { default, dynamic } from '@/app/admin/(panel)/layout';

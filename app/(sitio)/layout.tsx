/**
 * Shim de raíz. Implementación en `core/app/(sitio)/layout.tsx`.
 *
 * El grupo de rutas `(sitio)` no forma parte de la URL: `app/(sitio)/page.tsx`
 * resuelve a `/`. La agrupación existe para que estas páginas compartan el
 * encabezado y el pie, y para que `/admin` quede fuera de ese chrome.
 *
 * Ojo al mover rutas: una página que viva fuera del grupo NO hereda este layout.
 */
export { default, revalidate } from '@/app/(sitio)/layout';

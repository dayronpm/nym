/**
 * Shim de raíz — NO poner lógica aquí.
 *
 * Next.js solo descubre rutas dentro de `app/` en la raíz del proyecto, así que
 * cada ruta de la plantilla tiene aquí un reexport de una línea. La
 * implementación real vive en `core/app/`, que es la carpeta que se clona como
 * plantilla.
 *
 * Al añadir una ruta nueva hay que crear el archivo en `core/app/...` y su shim
 * equivalente en `app/...`.
 */
export { default, metadata } from '@/app/layout';

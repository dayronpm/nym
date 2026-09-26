/**
 * Etiquetas de caché del contenido.
 *
 * `unstable_cache` guarda el resultado de una lectura entre peticiones y lo marca con
 * etiquetas; desde el panel se invalida con `revalidateTag`. Todo el contenido pasa por
 * aquí para que las etiquetas se escriban en un único sitio y no como cadenas sueltas
 * repartidas por el código.
 *
 * Decisión sobre la granularidad: **las escrituras invalidan la etiqueta gruesa**, no una
 * por página. El motivo es que los bloques resumen leen el contenido de otra página: quien
 * guarda una foto en `/galeria` tendría que acordarse de invalidar también Inicio, y eso
 * es exactamente el olvido que se acaba convirtiendo en un bug reportado como "la portada
 * no se actualiza". Con la etiqueta gruesa no se puede olvidar, y con cinco páginas rehacer
 * una lectura no cuesta nada. Si el sitio crece, se afina añadiendo una etiqueta por página
 * a la lectura correspondiente, sin tocar las mutaciones.
 */

export const CACHE_TAGS = {
  /** Cualquier bloque, de cualquier página. */
  blocks: 'blocks',
  /** Los metadatos de las páginas. */
  pages: 'pages',
  /** La fila única de configuración. */
  siteSettings: 'site-settings',
} as const;

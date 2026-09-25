import { z } from 'zod';

import { PAGE_SLUGS } from '@/types/settings';

/**
 * Referencias de un bloque a **otra página**.
 *
 * Son las dos piezas que hacen posible que Inicio resuma las demás secciones sin
 * duplicar contenido: por dónde se entra a la sección completa (`MoreLinkSchema`) y de
 * dónde sale el contenido del resumen (`SourcePageRef`).
 *
 * Viven en su propio archivo y no en `shared.ts` por una razón que costó un build:
 * `core/types/settings.ts` importa `MediaRef` de `shared.ts`, así que si `shared.ts`
 * importa `PAGE_SLUGS` de `settings.ts` se forma un ciclo, y con él un
 * `Cannot access 'w' before initialization` al recopilar los datos de las páginas. Este
 * archivo solo depende de `settings.ts`, nunca al revés.
 */

/**
 * Enlace de un bloque-resumen hacia su sección completa.
 *
 * Se guarda la **página** (una clave de `PAGE_SLUGS`), nunca la URL: la ruta se deriva
 * con `pageHref()` y la etiqueta por defecto es el nombre de la página, así que desde el
 * panel no se puede guardar un enlace roto ni queda una ruta escrita a mano dentro del
 * contenido guardado.
 *
 * El caso de uso es la portada: Inicio resume cada sección y desde cada resumen hay que
 * poder entrar donde está el contenido completo.
 */
export const MoreLinkSchema = z.object({
  page: z.enum(PAGE_SLUGS),
  /** Texto visible del enlace. Se pinta seguido de una flecha. */
  label: z.string().min(1).max(60).default('Ver más'),
});

export type MoreLink = z.infer<typeof MoreLinkSchema>;

/**
 * Página de la que un bloque **toma prestado su contenido**.
 *
 * Es lo que permite que Inicio resuma una sección sin duplicarla: el bloque resumido no
 * guarda la lista, la lee del bloque del mismo tipo que vive en la página completa
 * (`SHARED_CONTENT_FIELD`, en `shared.ts`, dice cuál es el campo de la lista). La lista
 * local se descarta, y todo lo demás —título, corte, columnas, enlace— sigue siendo de
 * este bloque.
 *
 * Quien lo resuelve es la lectura pública (`getPublishedBlocksByPage`), así que el
 * bloque llega al renderizador con el contenido ya dentro. Si la página de origen no
 * tiene un bloque de ese tipo, no hay nada que traer y el bloque desaparece en lugar de
 * pintar una sección vacía.
 */
export const SourcePageRef = z.enum(PAGE_SLUGS).optional();

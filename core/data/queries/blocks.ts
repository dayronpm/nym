import { SHARED_CONTENT_FIELD } from '@/blocks/shared';
import { DataError } from '@/data/errors';
import { createSupabasePublicClient, createSupabaseServerClient } from '@/data/supabase';
import type { BlockRow } from '@/types/models';
import type { PageSlug } from '@/types/settings';

/**
 * Lectura de bloques.
 *
 * Hay dos entradas distintas a propósito, porque el sitio público y el panel
 * necesitan cosas distintas y con clientes distintos:
 *
 *   - `getPublishedBlocksByPage` -> cliente público sin sesión. Permite que las
 *     páginas se generen de forma estática y se revaliden por etiquetas.
 *   - `getAllBlocksByPage` / `getBlockById` -> cliente con sesión. La política
 *     RLS del público solo deja ver `enabled = true`, así que el panel necesita
 *     la sesión para poder listar también los bloques desactivados.
 */

/** Un `jsonb` visto como objeto, o `null` si no lo es. */
function asObject(data: BlockRow['data']): Record<string, unknown> | null {
  return data && typeof data === 'object' && !Array.isArray(data)
    ? (data as Record<string, unknown>)
    : null;
}

/**
 * Resuelve los bloques que toman su contenido de otra página (`source_page`).
 *
 * Es lo que hace posible que Inicio resuma una sección sin duplicarla: el bloque
 * resumido guarda solo la presentación y su lista se sustituye por la del bloque del
 * mismo tipo que vive en la página completa (`SHARED_CONTENT_FIELD` dice cuál es ese
 * campo). Así el contenido se edita en un único sitio y el resumen no puede quedarse
 * desfasado en silencio.
 *
 * Se resuelve aquí, en la lectura pública, y no en el renderizador: el renderizador no
 * tiene —ni debería tener— forma de leer otras páginas, y así el bloque llega completo
 * a quien lo pinta. El panel no pasa por aquí: edita el contenido del bloque en su
 * propia página, así que `getAllBlocksByPage` devuelve las filas tal cual están.
 *
 * Coste: una consulta extra como máximo (se piden todas las páginas de origen juntas) y
 * solo si la página tiene bloques espejo.
 *
 * Ojo al revalidar: si cambia el contenido de `/galeria`, además de `/galeria` hay que
 * revalidar las páginas que la resumen (Fase 1.4).
 */
async function resolveSourceContent(rows: BlockRow[]): Promise<BlockRow[]> {
  const mirrors = rows.flatMap((row) => {
    const source = asObject(row.data)?.source_page;
    return typeof source === 'string' ? [{ source }] : [];
  });

  if (mirrors.length === 0) return rows;

  const pages = [...new Set(mirrors.map((mirror) => mirror.source))];
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from('blocks')
    .select('*')
    .in('page', pages)
    .eq('enabled', true);

  if (error) {
    throw new DataError(`No se pudieron leer los bloques de origen (${pages.join(', ')}).`, {
      cause: error,
    });
  }

  const origins = data ?? [];

  return rows.map((row) => {
    const local = asObject(row.data);
    const source = local?.source_page;
    const field = SHARED_CONTENT_FIELD[row.type];

    if (!local || typeof source !== 'string' || !field) return row;

    const origin = origins.find(
      (candidate) => candidate.page === source && candidate.type === row.type,
    );
    const list = origin ? asObject(origin.data)?.[field] : undefined;

    // Sin origen, o con un origen sin lista, la fila se deja como está: si el bloque
    // tampoco tiene lista propia, simplemente desaparece en lugar de pintarse vacío.
    if (!Array.isArray(list)) return row;

    // El cast es el precio de componer un `jsonb` dinámicamente; el resultado pasa
    // igualmente por la validación del esquema del bloque antes de pintarse.
    return { ...row, data: { ...local, [field]: list } as BlockRow['data'] };
  });
}

/** Bloques publicados de una página, en su orden. Para el sitio público. */
export async function getPublishedBlocksByPage(page: PageSlug): Promise<BlockRow[]> {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from('blocks')
    .select('*')
    .eq('page', page)
    .eq('enabled', true)
    .order('order', { ascending: true });

  if (error) {
    throw new DataError(`No se pudieron leer los bloques de "${page}".`, { cause: error });
  }

  // Los bloques que resumen otra sección se completan antes de devolverlos.
  return resolveSourceContent(data ?? []);
}

/** Todos los bloques de una página, desactivados incluidos. Solo para el panel. */
export async function getAllBlocksByPage(page: PageSlug): Promise<BlockRow[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('blocks')
    .select('*')
    .eq('page', page)
    .order('order', { ascending: true });

  if (error) {
    throw new DataError(`No se pudieron leer los bloques de "${page}".`, { cause: error });
  }

  return data ?? [];
}

/** Un bloque por su id. Solo para el panel. */
export async function getBlockById(id: string): Promise<BlockRow | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from('blocks').select('*').eq('id', id).maybeSingle();

  if (error) {
    throw new DataError(`No se pudo leer el bloque ${id}.`, { cause: error });
  }

  return data ?? null;
}

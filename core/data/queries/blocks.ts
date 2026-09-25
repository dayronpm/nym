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

  return data ?? [];
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

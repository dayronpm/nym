import { DataError } from '@/data/errors';
import { createSupabaseServerClient } from '@/data/supabase';
import type { BlockRow } from '@/types/models';

/**
 * Muestra u oculta un bloque en el sitio.
 *
 * Es una operación distinta de guardar el contenido, y por eso vive aparte: `enabled` es una
 * columna de la tabla, no un campo dentro de `data`. Ocultar un bloque **no toca su contenido**,
 * que es justo lo que hace útil la operación: se puede apagar una sección sin miedo a perder lo
 * escrito, y volver a mostrarla después.
 *
 * Requiere sesión con rol admin; lo exigen las políticas RLS y los GRANT.
 */
export async function setBlockEnabled(id: string, enabled: boolean): Promise<BlockRow> {
  const supabase = createSupabaseServerClient();
  const { data: row, error } = await supabase
    .from('blocks')
    .update({ enabled, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new DataError(`No se pudo cambiar la visibilidad del bloque ${id}.`, { cause: error });
  }

  return row;
}

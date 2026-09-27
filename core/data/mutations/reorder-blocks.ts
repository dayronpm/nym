import { DataError } from '@/data/errors';
import { createSupabaseServerClient } from '@/data/supabase';

/**
 * Guarda el orden de los bloques de una página.
 *
 * Recibe la lista **completa** de identificadores en el orden nuevo y escribe la posición de cada
 * uno. Recibir la lista entera y no un movimiento suelto evita que dos reordenamientos seguidos
 * se pisen: lo que llega es el orden final, no una instrucción sobre el anterior.
 *
 * Se escribe fila a fila dentro del mismo proceso. Con una decena de bloques por página son unas
 * pocas consultas; una función en la base de datos sería más atómica, pero también más difícil de
 * leer y de cambiar, y aquí el peor caso de un orden a medias es que el dueño vuelva a mover una
 * tarjeta.
 *
 * Requiere sesión con rol admin; lo exigen las políticas RLS y los GRANT.
 */
export async function reorderBlocks(ids: string[]): Promise<void> {
  const supabase = createSupabaseServerClient();

  for (const [position, id] of ids.entries()) {
    const { error } = await supabase
      .from('blocks')
      .update({ "order": position, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw new DataError(`No se pudo guardar el orden del bloque ${id}.`, { cause: error });
    }
  }
}

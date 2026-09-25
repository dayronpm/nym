import { parseBlockData } from '@/blocks/defineBlock';
import { getBlockDefinition } from '@/blocks/registry';
import { DataError, ValidationError } from '@/data/errors';
import { createSupabaseServerClient } from '@/data/supabase';
import type { BlockRow } from '@/types/models';

/** Datos necesarios para guardar un bloque. */
export interface SaveBlockInput {
  id: string;
  /** Clave del bloque en `BLOCK_REGISTRY`. */
  type: string;
  /** Contenido sin validar, tal como lo emite el formulario del panel. */
  data: unknown;
}

/**
 * Guarda el contenido de un bloque.
 *
 * Valida contra el esquema zod del bloque **antes** de escribir. Es la única red
 * que impide guardar contenido que después no se pueda renderizar: el `jsonb` de
 * la base de datos no tiene forma propia.
 *
 * Requiere sesión con rol admin; lo exigen las políticas RLS y los GRANT.
 */
export async function saveBlock({ id, type, data }: SaveBlockInput): Promise<BlockRow> {
  const block = getBlockDefinition(type);

  if (!block) {
    throw new DataError(`Tipo de bloque desconocido: "${type}".`);
  }

  const parsed = parseBlockData(block, data);

  if (!parsed.success) {
    throw new ValidationError(`El contenido del bloque "${type}" no es válido.`, parsed.errors);
  }

  const supabase = createSupabaseServerClient();
  const { data: row, error } = await supabase
    .from('blocks')
    .update({
      data: parsed.data,
      // Se guarda la versión del esquema con la que se escribió, para poder
      // migrar el contenido si el esquema del bloque cambia más adelante.
      version: block.version,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new DataError(`No se pudo guardar el bloque ${id}.`, { cause: error });
  }

  return row;
}

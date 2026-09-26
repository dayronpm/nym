import type { z } from 'zod';

import type { BlockFormProps } from '@/blocks/defineBlock';

import DynamicForm from './DynamicForm';

/**
 * Crea el formulario de un bloque a partir de su esquema.
 *
 * Es lo que une el contrato con el panel: el bloque declara su esquema una vez y el formulario
 * sale de ahí. Un bloque solo necesita escribir su formulario a mano si tiene un comportamiento
 * que ningún esquema puede expresar (subir un archivo, por ejemplo), y en ese caso lo pasa a
 * `defineBlock` en lugar de usar esta fábrica.
 *
 * **Este módulo NO puede llevar `'use client'`**, y costó un build descubrirlo: los archivos de
 * bloque lo llaman al cargarse, desde el servidor. En un módulo de cliente, la importación se
 * sustituye por una referencia opaca que solo se puede *renderizar*, no *llamar*, y el registro
 * fallaba con un `s is not a function` al recopilar las páginas.
 *
 * El tipo de los props es el del bloque (`BlockFormProps<z.infer<S>>`), así que el registro lo
 * acepta sin castigar nada. Dentro hace falta **un** `as`, y está aquí por un motivo concreto:
 * `DynamicForm` recibe los datos como `unknown` porque los recorre a partir del esquema y no
 * sabe de qué bloque se trata. La dirección de `onChange` es lo único que TypeScript no puede
 * comprobar en una fábrica genérica, y lo que la garantiza de verdad es la validación del
 * servidor antes de escribir: el formulario nunca guarda nada por su cuenta.
 */
export function createBlockForm<S extends z.ZodTypeAny>(schema: S, blockType: string) {
  function GeneratedBlockForm({ initialData, onChange, errors }: BlockFormProps<z.infer<S>>) {
    return (
      <DynamicForm
        schema={schema}
        labelsKey={blockType}
        initialData={initialData}
        onChange={onChange as (data: unknown) => void}
        errors={errors}
      />
    );
  }

  // El nombre se conserva para que cada bloque se identifique en las herramientas de desarrollo
  // del navegador en lugar de aparecer diez veces como "DynamicForm".
  GeneratedBlockForm.displayName = `BlockForm(${blockType})`;

  return GeneratedBlockForm;
}

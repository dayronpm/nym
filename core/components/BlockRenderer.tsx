import { Fragment } from 'react';

import { parseBlockData } from '@/blocks/defineBlock';
import { getBlockDefinition } from '@/blocks/registry';
// EXPERIMENTO: quitar esta línea para deshacer el ornamento entre secciones.
import SectionOrnament from '@/components/experimental/SectionOrnament';
import type { BlockRow } from '@/types/models';
import type { SiteSettings } from '@/types/settings';

/**
 * Renderiza una lista de bloques de una página.
 *
 * Es el ÚNICO sitio donde `blocks.data` (un `jsonb` sin forma propia en la base de
 * datos) se convierte en props tipadas: busca el bloque en el registro y valida su
 * contenido con el esquema zod, que además rellena con sus valores por defecto los
 * campos que falten.
 *
 * Un bloque de tipo desconocido o con datos que no validan se omite en lugar de
 * tumbar la página: ese contenido lo edita una persona desde el panel, y una errata
 * no debe dejar el sitio en blanco. En desarrollo se avisa por consola para que el
 * fallo no pase inadvertido.
 */
export interface BlockRendererProps {
  blocks: BlockRow[];
  settings: SiteSettings;
}

export default function BlockRenderer({ blocks, settings }: BlockRendererProps) {
  return (
    <>
      {blocks.map((block, index) => {
        const definition = getBlockDefinition(block.type);

        if (!definition) {
          // Tipo todavía sin implementar (los que quedan de la Fase 1) o errata.
          if (process.env.NODE_ENV !== 'production') {
            console.warn(`Bloque "${block.type}" (${block.id}) omitido: no está en el registro.`);
          }
          return null;
        }

        const parsed = parseBlockData(definition, block.data);

        if (!parsed.success) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn(
              `Bloque "${block.type}" (${block.id}) omitido: sus datos no validan -> ${JSON.stringify(parsed.errors)}`,
            );
          }
          return null;
        }

        const { Component } = definition;
        return (
          <Fragment key={block.id}>
            {/* EXPERIMENTO: adornos del río entre secciones. Borra esta línea
                (y el componente `experimental/SectionOrnament.tsx`) para volver atrás. */}
            {index > 0 ? <SectionOrnament index={index} /> : null}
            <Component data={parsed.data} settings={settings} />
          </Fragment>
        );
      })}
    </>
  );
}

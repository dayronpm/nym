import type { BlockProps } from '@/blocks/defineBlock';
import BlockContainer from '@/components/BlockContainer';
import BlockHeading from '@/components/BlockHeading';
import Image from '@/components/ui/Image';
import { cn } from '@/lib/cn';

import type { TeamData } from './schema';

/**
 * Bloque `team` — vista pública.
 *
 * Sin foto se pinta un avatar con las iniciales sobre `--color-primary-soft`, tal
 * como pide el plan. Si no hay miembros activos, el bloque no se muestra.
 */

/** "María García López" -> "MG" */
function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}

/**
 * Columnas según cuántas personas haya.
 *
 * Con cuatro columnas fijas y tres personas queda un hueco al final de la fila; con una
 * o dos, las tarjetas se estiran hasta quedar desproporcionadas. Se ajustan a lo que hay
 * y, cuando hay pocas, se limita el ancho y el grupo se centra.
 */
function gridClasses(count: number): string {
  if (count >= 4) return 'lg:grid-cols-4';
  if (count === 3) return 'lg:grid-cols-3';
  return 'lg:grid-cols-2 lg:mx-auto lg:max-w-3xl';
}

export default function TeamBlock({ data }: BlockProps<TeamData>) {
  // `limit` es el corte del resumen de Inicio.
  const members = data.members.filter((member) => member.enabled).slice(0, data.limit);
  if (members.length === 0) return null;

  return (
    <BlockContainer>
      <BlockHeading title={data.title} subtitle={data.subtitle} more={data.more} />

      <ul className={cn('grid gap-8 sm:grid-cols-2', gridClasses(members.length))}>
        {members.map((member) => (
          <li key={member.id}>
            {member.photo ? (
              <Image
                media={member.photo}
                aspect="4:5"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            ) : (
              <div className="flex aspect-[4/5] items-center justify-center rounded-lg bg-primary-soft">
                <span
                  aria-hidden="true"
                  className="font-heading text-4xl font-semibold text-primary"
                >
                  {initialsOf(member.name)}
                </span>
              </div>
            )}

            <h3 className="mt-4 text-lg">{member.name}</h3>
            <p className="text-sm text-text-muted">{member.role}</p>
            {member.bio ? <p className="mt-2 text-sm text-text-muted">{member.bio}</p> : null}
          </li>
        ))}
      </ul>
    </BlockContainer>
  );
}

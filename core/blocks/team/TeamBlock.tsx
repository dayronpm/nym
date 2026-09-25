import type { BlockProps } from '@/blocks/defineBlock';
import BlockContainer from '@/components/BlockContainer';
import BlockHeading from '@/components/BlockHeading';
import Image from '@/components/ui/Image';

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

export default function TeamBlock({ data }: BlockProps<TeamData>) {
  const members = data.members.filter((member) => member.enabled);
  if (members.length === 0) return null;

  return (
    <BlockContainer>
      <BlockHeading title={data.title} subtitle={data.subtitle} />

      <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
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

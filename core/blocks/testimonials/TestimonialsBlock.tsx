import Image from 'next/image';

import type { BlockProps } from '@/blocks/defineBlock';
import BlockContainer from '@/components/BlockContainer';
import BlockHeading from '@/components/BlockHeading';
import { getMediaUrl } from '@/lib/storage';

import type { TestimonialsData } from './schema';

/**
 * Bloque `testimonials` — vista pública.
 *
 * Si no hay testimonios con `enabled: true`, devuelve `null`: el plan prohíbe las
 * secciones vacías.
 */
export default function TestimonialsBlock({ data }: BlockProps<TestimonialsData>) {
  const items = data.items.filter((item) => item.enabled);
  if (items.length === 0) return null;

  return (
    <BlockContainer>
      <BlockHeading title={data.title} subtitle={data.subtitle} />

      <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const imageUrl = getMediaUrl(item.image);

          return (
            <li key={item.id} className="flex flex-col rounded-md border border-border bg-surface p-6">
              {data.show_ratings && item.rating ? (
                // El `aria-label` va en un `role="img"` y no en el <p>: sobre un párrafo
                // ARIA lo prohíbe (el rol `paragraph` no admite nombre accesible) y
                // Lighthouse lo marca como incumplimiento.
                <p className="text-primary">
                  <span role="img" aria-label={`${item.rating} de 5 estrellas`}>
                    <span aria-hidden="true">
                      {'★'.repeat(item.rating)}
                      {'☆'.repeat(5 - item.rating)}
                    </span>
                  </span>
                </p>
              ) : null}

              <blockquote className="mt-4 text-text-muted">“{item.quote}”</blockquote>

              <footer className="mt-auto flex items-center gap-3 pt-6">
                {imageUrl ? (
                  <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-surface-alt">
                    <Image
                      src={imageUrl}
                      alt={item.image?.alt ?? ''}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </span>
                ) : null}

                <span className="text-sm">
                  <span className="font-medium">{item.author_name}</span>
                  {item.service ? (
                    <span className="block text-text-muted">{item.service}</span>
                  ) : null}
                </span>
              </footer>
            </li>
          );
        })}
      </ul>
    </BlockContainer>
  );
}

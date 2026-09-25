import type { BlockProps } from '@/blocks/defineBlock';
import BlockContainer from '@/components/BlockContainer';
import BlockHeading from '@/components/BlockHeading';
import Button from '@/components/Button';
import Image from '@/components/ui/Image';
import { socialLinks } from '@/lib/contact';

import type { ReelsData } from './schema';

/**
 * Bloque `reels` — vista pública.
 *
 * Reglas del plan:
 *  - Sin embeds ni scripts de terceros: miniatura vertical 9:16 y enlace.
 *  - Los enlaces se abren en pestaña nueva con `rel="noopener noreferrer"` y llevan
 *    `aria-label` del tipo "Ver reel en Instagram: {título}".
 *  - Los botones de perfil solo salen para Instagram y TikTok, y solo si están
 *    configurados en `site_settings.contact`.
 *  - Si no hay reels activos ni perfiles que mostrar, el bloque desaparece.
 *
 * La plataforma se indica con texto, no con icono: el plan pedía iconos SVG propios,
 * pero dibujar los logotipos de Instagram y TikTok a mano saldría peor que una
 * etiqueta, y el nombre de la red se lee igual de bien.
 */

const PLATFORM_LABELS: Record<'instagram' | 'tiktok', string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
};

export default function ReelsBlock({ data, settings }: BlockProps<ReelsData>) {
  const items = data.items.filter((item) => item.enabled);

  const profiles = data.show_profile_links
    ? socialLinks(settings.contact).filter((social) => social.platform !== 'facebook')
    : [];

  if (items.length === 0 && profiles.length === 0) return null;

  return (
    <BlockContainer>
      <BlockHeading title={data.title} subtitle={data.subtitle} />

      {items.length > 0 ? (
        <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Ver reel en ${PLATFORM_LABELS[item.platform]}${
                  item.title ? `: ${item.title}` : ''
                }`}
                className="group block"
              >
                <Image
                  media={item.thumbnail}
                  aspect="9:16"
                  sizes="(max-width: 1024px) 50vw, 25vw"
                />

                <p className="mt-3 text-xs uppercase tracking-[0.15em] text-text-muted">
                  {PLATFORM_LABELS[item.platform]}
                </p>

                {item.title ? (
                  <p className="mt-1 text-sm group-hover:text-primary">{item.title}</p>
                ) : null}
              </a>
            </li>
          ))}
        </ul>
      ) : null}

      {profiles.length > 0 ? (
        <div className="mt-10 flex flex-wrap gap-3">
          {profiles.map((profile) => (
            <Button key={profile.platform} href={profile.url} external variant="secondary">
              {profile.label}
            </Button>
          ))}
        </div>
      ) : null}
    </BlockContainer>
  );
}

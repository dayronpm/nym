import type { Metadata } from 'next';

import { getSiteUrl } from '@/config/env';
import { getPage } from '@/data/queries/pages';
import { getSiteSettings } from '@/data/queries/site-settings';
import { pageHref } from '@/lib/navigation';
import { getMediaUrl } from '@/lib/storage';
import {
  PAGE_LABELS,
  WEEK_DAYS,
  type DayHours,
  type PageSettings,
  type PageSlug,
  type SiteSettings,
  type WeekDay,
} from '@/types/settings';

/**
 * Metadatos y datos estructurados del sitio público.
 *
 * Todo lo que necesitan los buscadores —y WhatsApp o Instagram, para previsualizar un
 * enlace— sale de aquí: `<title>`, `description`, `canonical`, Open Graph y el JSON-LD
 * del negocio. Se genera desde los datos (`pages` y `site_settings`), nunca desde
 * literales repartidos por los componentes: el dueño los edita desde el panel y el sitio
 * los obedece.
 *
 * Sobre el `<title>`: en las páginas que no son la portada se devuelve **sin la marca**,
 * porque el layout del sitio declara la plantilla `%s · {marca}` y la añade él. Si se
 * compusiera también aquí, el nombre del negocio saldría dos veces.
 */

/** Nombre del día tal y como lo espera schema.org: siempre en inglés. */
const SCHEMA_DAYS: Record<WeekDay, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
};

/**
 * Título completo de una página, marca incluida.
 *
 * La portada se titula con la marca y su lema, no con "Inicio": es lo que aparece en
 * Google y "Inicio · Nombre del Negocio" no dice a nadie lo que hace el negocio.
 */
function fullTitleOf(page: PageSettings | null, settings: SiteSettings, slug: PageSlug): string {
  if (page?.meta_title) return page.meta_title;

  if (slug === 'inicio') {
    return settings.brand.tagline
      ? `${settings.brand.name} · ${settings.brand.tagline}`
      : settings.brand.name;
  }

  return `${page?.title ?? PAGE_LABELS[slug]} · ${settings.brand.name}`;
}

/** URL absoluta de una página. Open Graph y `canonical` no admiten rutas relativas. */
export function pageUrl(slug: PageSlug): string {
  return `${getSiteUrl()}${pageHref(slug)}`;
}

/**
 * Metadatos de una página, listos para que los devuelva su `generateMetadata`.
 *
 * Las lecturas (`getPage` y `getSiteSettings`) están memoizadas, así que esta función no
 * añade consultas a las que la página ya hace para pintarse.
 */
export async function buildPageMetadata(slug: PageSlug): Promise<Metadata> {
  const [page, settings] = await Promise.all([getPage(slug), getSiteSettings()]);

  const fullTitle = fullTitleOf(page, settings, slug);
  const description = page?.meta_description ?? settings.brand.tagline;
  const url = pageUrl(slug);
  // La imagen de la página manda; si no hay, la de reserva del sitio y, en último caso,
  // el logotipo. Un enlace compartido sin imagen se ve mucho peor en WhatsApp.
  const image = getMediaUrl(
    page?.og_image ?? settings.seo_defaults.default_og_image ?? settings.brand.logo,
  );

  // El título completo (con la marca) se usa como `absolute` en la portada y cuando el
  // dueño ha escrito un `meta_title`: en los dos casos ya viene de fuera de la plantilla.
  const ownTitle = page?.meta_title !== undefined || slug === 'inicio';

  return {
    title: ownTitle ? { absolute: fullTitle } : (page?.title ?? PAGE_LABELS[slug]),
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      siteName: settings.brand.name,
      locale: 'es_PA',
      title: fullTitle,
      description,
      images: image ? [{ url: image, alt: settings.brand.name }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: image ? [image] : undefined,
    },
  };
}

/**
 * Horarios en el formato de schema.org.
 *
 * Se agrupan los días consecutivos que comparten horario, igual que se agrupan para
 * mostrarlos: una entrada por tramo en vez de siete. Los días cerrados se omiten, que es
 * como se expresa "cerrado" en schema.org.
 *
 * Un día partido (cierre al mediodía) genera una entrada por tramo, con los mismos días.
 */
function buildOpeningHours(hours: DayHours[]): Record<string, unknown>[] {
  const ordered = [...hours].sort((a, b) => WEEK_DAYS.indexOf(a.day) - WEEK_DAYS.indexOf(b.day));

  const signature = (day: DayHours): string =>
    day.closed ? 'closed' : day.ranges.map((range) => `${range.open}-${range.close}`).join(',');

  const entries: Record<string, unknown>[] = [];
  let runStart = 0;

  for (let index = 1; index <= ordered.length; index += 1) {
    const previous = ordered[index - 1];
    const current = ordered[index];

    if (previous && current && signature(previous) === signature(current)) continue;

    const run = ordered.slice(runStart, index);
    const first = run[0];

    if (first && !first.closed) {
      const dayOfWeek = run.map((day) => SCHEMA_DAYS[day.day]);

      for (const range of first.ranges) {
        entries.push({
          '@type': 'OpeningHoursSpecification',
          dayOfWeek,
          opens: range.open,
          closes: range.close,
        });
      }
    }

    runStart = index;
  }

  return entries;
}

/**
 * Datos estructurados del negocio local (`DaySpa` y familia).
 *
 * Reglas que se aplican aquí:
 *  - Las claves sin dato **se omiten**, no se mandan en `null`: un `null` es un campo que
 *    existe y está vacío, y se interpreta peor que su ausencia.
 *  - La dirección va con la calle sola. El esquema admite una dirección a medias y la
 *    plantilla no pide ciudad ni país (el panel podrá añadirlos en la Fase 2).
 *  - `sameAs` solo con las redes que existan: es la lista de perfiles del negocio.
 *  - El tipo lo decide `seo_defaults.business_type`, que es un dato del preset.
 */
export function buildBusinessJsonLd(settings: SiteSettings): Record<string, unknown> {
  const { brand, contact, hours, seo_defaults: seo } = settings;

  const telephone = contact.phone ?? (contact.whatsapp ? `+${contact.whatsapp}` : undefined);
  const image = getMediaUrl(seo.default_og_image ?? brand.logo);
  const sameAs = [contact.instagram_url, contact.tiktok_url, contact.facebook_url].filter(
    (value): value is string => Boolean(value),
  );
  const openingHours = buildOpeningHours(hours);

  return {
    '@context': 'https://schema.org',
    '@type': seo.business_type,
    name: brand.name,
    url: getSiteUrl(),
    ...(brand.tagline ? { description: brand.tagline } : {}),
    ...(telephone ? { telephone } : {}),
    ...(contact.email ? { email: contact.email } : {}),
    ...(image ? { image } : {}),
    ...(contact.address
      ? { address: { '@type': 'PostalAddress', streetAddress: contact.address } }
      : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
    ...(openingHours.length > 0 ? { openingHoursSpecification: openingHours } : {}),
  };
}

/**
 * El JSON-LD listo para incrustar en un `<script type="application/ld+json">`.
 *
 * El `<` se escapa a `\u003c` porque dentro de un `<script>` la secuencia `</script>`
 * cerraría la etiqueta: es la única forma de que un texto con `<` (una dirección, una
 * descripción…) no rompa la página.
 */
export function serializeJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

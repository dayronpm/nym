import Link from 'next/link';

import { buildEmailUrl, buildPhoneUrl, socialLinks } from '@/lib/contact';
import { groupHours } from '@/lib/formatting';
import { NAV_ITEMS } from '@/lib/navigation';
import type { SiteSettings } from '@/types/settings';

/**
 * Pie común del sitio.
 *
 * Muestra marca, contacto, horarios agrupados y redes. Cada dato aparece solo si
 * existe en la configuración: el negocio rellena lo que tenga desde el panel y el
 * pie se adapta sin tocar código.
 */
export default function Footer({ settings }: { settings: SiteSettings }) {
  const { brand, contact } = settings;

  const hours = groupHours(settings.hours);
  const socials = socialLinks(contact);
  const phoneUrl = buildPhoneUrl(contact);
  const emailUrl = buildEmailUrl(contact);

  return (
    <footer className="border-t border-border bg-surface-alt">
      <div className="container-page grid gap-10 py-14 md:grid-cols-3">
        <div>
          <p className="font-heading text-xl font-semibold">{brand.name}</p>
          {brand.tagline ? <p className="mt-2 text-sm text-text-muted">{brand.tagline}</p> : null}

          {socials.length > 0 ? (
            <ul className="mt-4 flex flex-wrap gap-4">
              {socials.map((social) => (
                <li key={social.platform}>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="text-sm underline decoration-border hover:text-primary"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div>
          <h2 className="text-sm font-medium uppercase tracking-[0.15em] text-text-muted">
            Contacto
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            {phoneUrl && contact.phone_display ? (
              <li>
                <a href={phoneUrl} className="underline decoration-border hover:text-primary">
                  {contact.phone_display}
                </a>
              </li>
            ) : null}

            {emailUrl && contact.email ? (
              <li>
                <a href={emailUrl} className="underline decoration-border hover:text-primary">
                  {contact.email}
                </a>
              </li>
            ) : null}

            {contact.address ? <li className="text-text-muted">{contact.address}</li> : null}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-medium uppercase tracking-[0.15em] text-text-muted">
            Horarios
          </h2>
          <ul className="mt-4 space-y-1 text-sm">
            {hours.map((line) => (
              <li key={line.days}>
                <span className="font-medium">{line.days}:</span>{' '}
                <span className="text-text-muted">{line.hours}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-page flex flex-col gap-4 py-6 text-sm text-text-muted md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {brand.name}
          </p>

          <nav aria-label="Navegación del pie">
            <ul className="flex flex-wrap gap-4">
              {NAV_ITEMS.map((item) => (
                <li key={item.slug}>
                  <Link href={item.href} className="hover:text-primary">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}

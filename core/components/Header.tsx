import Link from 'next/link';

import Button from '@/components/Button';
import { buildWhatsappUrl, genericBookingMessage } from '@/lib/contact';
import { NAV_ITEMS } from '@/lib/navigation';
import type { SiteSettings } from '@/types/settings';

/**
 * Encabezado común del sitio.
 *
 * El menú de móvil usa `<details>`/`<summary>`, que se despliega **sin
 * JavaScript**. Así el encabezado no necesita ser componente cliente y el sitio
 * público no paga el coste de hidratarlo (el plan exige Lighthouse ≥ 85 en móvil).
 */

/** Texto del botón de reserva del encabezado, siempre con el mensaje genérico. */
const BOOKING_LABEL = 'Reservar';

export default function Header({ settings }: { settings: SiteSettings }) {
  const whatsappUrl = buildWhatsappUrl(settings.contact, genericBookingMessage(settings.contact));

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg">
      <div className="container-page flex items-center justify-between gap-4 py-4">
        <Link href="/" className="font-heading text-xl font-semibold leading-none">
          {settings.brand.name}
        </Link>

        {/* Navegación de escritorio */}
        <nav aria-label="Navegación principal" className="hidden items-center gap-6 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.slug}
              href={item.href}
              className="text-sm text-text-muted transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {whatsappUrl ? (
            <Button href={whatsappUrl} external className="hidden md:inline-flex">
              {BOOKING_LABEL}
            </Button>
          ) : null}

          {/* Navegación de móvil, sin JavaScript */}
          <details className="relative md:hidden">
            <summary className="flex min-h-[44px] cursor-pointer list-none items-center rounded-md border border-border px-4 text-sm font-medium [&::-webkit-details-marker]:hidden">
              Menú
            </summary>

            <nav
              aria-label="Menú"
              className="absolute right-0 z-50 mt-2 w-60 rounded-md border border-border bg-surface p-2 shadow-soft"
            >
              <ul>
                {NAV_ITEMS.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={item.href}
                      className="block rounded-sm px-3 py-2.5 text-sm hover:bg-primary-soft"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>

              {whatsappUrl ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block rounded-sm px-3 py-2.5 text-sm font-medium text-primary hover:bg-primary-soft"
                >
                  {BOOKING_LABEL}
                </a>
              ) : null}
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}

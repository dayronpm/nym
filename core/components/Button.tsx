import Link from 'next/link';

import { cn } from '@/lib/cn';

/**
 * Botón de la plantilla.
 *
 * Renderiza un `<a>`, un `<Link>` o un `<button>` según lo que reciba, para que
 * todos los botones del sitio compartan aspecto y el área táctil mínima de 44 px
 * que pide el plan para móvil. No es un componente cliente: funciona igual en el
 * sitio público renderizado en el servidor.
 */
export type ButtonVariant = 'primary' | 'secondary';

export interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  /** Ruta interna (`/servicios`) o URL completa. Sin `href` renderiza un `<button>`. */
  href?: string;
  /** Para enlaces que salen del sitio: usa `<a>` con `target="_blank"`. */
  external?: boolean;
  type?: 'button' | 'submit';
  className?: string;
  'aria-label'?: string;
}

const BASE_CLASSES =
  'inline-flex min-h-[44px] items-center justify-center rounded-md px-6 py-3 text-center font-medium transition-colors';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-on-primary hover:bg-primary-hover',
  secondary: 'border border-border hover:bg-primary-soft',
};

export default function Button({
  children,
  variant = 'primary',
  href,
  external,
  type = 'button',
  className,
  'aria-label': ariaLabel,
}: ButtonProps) {
  const classes = cn(BASE_CLASSES, VARIANT_CLASSES[variant], className);

  if (href && external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
        aria-label={ariaLabel}
      >
        {children}
      </a>
    );
  }

  if (href) {
    return (
      <Link href={href} className={classes} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} aria-label={ariaLabel}>
      {children}
    </button>
  );
}

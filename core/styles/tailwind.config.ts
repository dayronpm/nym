import type { Config } from 'tailwindcss';

/**
 * Configuración real de Tailwind.
 *
 * Se importa desde el `tailwind.config.ts` de la raíz (shim obligatorio, porque
 * Tailwind resuelve la configuración desde el directorio del proyecto).
 *
 * Regla: los colores, tipografías y radios NO se escriben aquí como valores
 * literales. Se exponen apuntando a las variables CSS de `globals.css`, que son
 * a su vez las que se editan desde el panel (`site_settings.theme`).
 */
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './core/**/*.{ts,tsx}',
    './custom/**/*.{ts,tsx}',
    './core/styles/**/*.css',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        'surface-alt': 'var(--color-surface-alt)',
        text: 'var(--color-text)',
        'text-muted': 'var(--color-text-muted)',
        border: 'var(--color-border)',
        primary: 'var(--color-primary)',
        'primary-hover': 'var(--color-primary-hover)',
        'primary-soft': 'var(--color-primary-soft)',
        'on-primary': 'var(--color-on-primary)',
        danger: 'var(--color-danger)',
        success: 'var(--color-success)',
      },
      fontFamily: {
        heading: ['var(--font-heading)'],
        body: ['var(--font-body)'],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
      },
      maxWidth: {
        container: 'var(--container-max)',
      },
      spacing: {
        section: 'var(--section-padding-y)',
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
      },
    },
  },
  plugins: [],
};

export default config;

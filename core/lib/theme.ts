import { GRADIENT_DIRECTIONS, type SiteTheme, type ThemeGradient } from '@/types/settings';

/**
 * El tema de `site_settings` convertido en variables CSS.
 *
 * Decisión de fondo: el tema **no** se aplica con clases ni con estilos por componente, sino
 * sobrescribiendo los mismos tokens que ya usa `globals.css` (`--color-bg`, `--font-heading`,
 * `--radius-md`…). Así todo lo que ya está escrito sigue valiendo: cambiar de paleta no toca
 * ni un componente.
 *
 * El texto se inyecta en el layout del sitio. Va con `dangerouslySetInnerHTML` porque es una
 * hoja de estilo, no contenido: lo único que entra son colores hexadecimales ya validados por
 * el esquema (`hexColor()`), fuentes de una lista cerrada y radios filtrados por `radius()`.
 * Ninguna cadena del panel llega al CSS tal cual.
 */

/** Familias cargadas por `next/font` en el layout raíz, con su variable y su respaldo. */
const FONT_STACKS: Record<string, string> = {
  Inter: 'var(--font-inter), ui-sans-serif, system-ui, sans-serif',
  'Cormorant Garamond': "var(--font-cormorant), ui-serif, Georgia, serif",
};

/** Respaldo si el nombre guardado no está en la lista curada. */
const FALLBACK_STACK = FONT_STACKS.Inter ?? 'ui-sans-serif, system-ui, sans-serif';

/**
 * Pila de una fuente. Un nombre que no esté en la lista curada se cambia por el respaldo en
 * lugar de escribirse: `next/font` carga las fuentes en tiempo de compilación, así que un
 * nombre escrito a mano no existiría en el navegador.
 */
function fontStack(name: string): string {
  return FONT_STACKS[name] ?? FALLBACK_STACK;
}

/** Radio en `px` o `rem`. Cualquier otra cosa cae al respaldo, para no romper la hoja. */
function radius(value: string, fallback: string): string {
  return /^\d+(?:\.\d+)?(?:px|rem|em)$/.test(value.trim()) ? value.trim() : fallback;
}

/** Declaración `--var:valor`, para leer el código de abajo como una lista. */
function declaration(name: string, value: string): string {
  return `--${name}:${value}`;
}

/** Direcciones válidas, para no escribir CSS que venga de fuera de la lista cerrada. */
const DIRECTIONS = new Set<string>(GRADIENT_DIRECTIONS);

/**
 * Degradado en palabras de CSS, o `none` si el dueño lo tiene apagado.
 *
 * Devolver `none` en lugar de no declarar la variable es deliberado: así la hoja siempre puede
 * escribir `background-image: var(--gradient-page, none)` sin ramificaciones, y apagar un
 * degradado es un cambio de dato, no de código.
 */
function gradientOf(value: ThemeGradient | undefined): string {
  // El `undefined` no es teórico: un tema guardado antes de que existieran los degradados (o
  // una lectura cacheada de entonces) no trae la clave, y esto se ejecuta al pintar **todas**
  // las páginas: sin la guarda, el sitio entero se cae con un 500 por un dato que falta.
  if (!value?.enabled) return 'none';

  const direction = DIRECTIONS.has(value.direction) ? value.direction : 'to bottom';
  return `linear-gradient(${direction}, ${value.from}, ${value.to})`;
}

/**
 * Hoja de estilo con el tema del negocio.
 *
 * Se apunta a `:root` —y no a un contenedor— porque el fondo del `body` y la tipografía base
 * también salen de estos tokens: aplicarlos a un `<div>` dejaría el fondo del documento como
 * estaba. Va después de la hoja global, así que gana por orden.
 */
export function themeCss(theme: SiteTheme): string {
  const { colors, gradients, fonts, radius: corners } = theme;

  const declarations = [
    declaration('color-bg', colors.bg),
    declaration('color-surface', colors.surface),
    declaration('color-surface-alt', colors.surface_alt),
    declaration('color-text', colors.text),
    declaration('color-text-muted', colors.text_muted),
    declaration('color-border', colors.border),
    declaration('color-primary', colors.primary),
    declaration('color-primary-hover', colors.primary_hover),
    declaration('color-primary-soft', colors.primary_soft),
    declaration('color-on-primary', colors.on_primary),
    declaration('gradient-page', gradientOf(gradients?.page)),
    declaration('gradient-section', gradientOf(gradients?.section_alt)),
    declaration('font-heading', fontStack(fonts.heading)),
    declaration('font-body', fontStack(fonts.body)),
    declaration('radius-sm', radius(corners.sm, '6px')),
    declaration('radius-md', radius(corners.md, '12px')),
    declaration('radius-lg', radius(corners.lg, '20px')),
  ];

  return `:root{${declarations.join(';')}}`;
}

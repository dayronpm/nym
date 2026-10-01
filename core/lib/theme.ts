import {
  DEFAULT_THEME_DARK,
  GRADIENT_DIRECTIONS,
  type SiteTheme,
  type ThemeGradient,
} from '@/types/settings';

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
  Jost: 'var(--font-jost), ui-sans-serif, system-ui, sans-serif',
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

/** Declaraciones de los diez colores de una paleta, en el orden de los tokens. */
function colorDeclarations(colors: SiteTheme['colors']): string[] {
  return [
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
  ];
}

/**
 * Hoja de estilo con el tema del negocio.
 *
 * Emite tres reglas y no una, porque el sitio tiene modo claro y oscuro:
 *
 *   1. `:root` — la paleta clara, siempre.
 *   2. `@media (prefers-color-scheme: dark)` — la oscura, para quien no ha elegido nada: el
 *      sitio, por defecto, sigue al sistema (que en el móvil es lo que se espera).
 *   3. `:root[data-theme="…"]` — la elección manual del visitante. El atributo lo escribe un
 *      script del layout raíz antes del primer pintado y el interruptor del encabezado
 *      después; el `:not([data-theme="light"])` de la regla 2 es lo que deja al interruptor
 *      ganar al sistema en los dos sentidos.
 *
 * Se apunta a `:root` —y no a un contenedor— porque el fondo del `body` y la tipografía base
 * también salen de estos tokens: aplicarlos a un `<div>` dejaría el fondo del documento como
 * estaba. Va después de la hoja global, así que gana por orden.
 *
 * Los degradados viven solo en la paleta clara: sus colores se validan contra el texto claro,
 * y reutilizarlos en oscuro sería texto crema sobre un degradado crema. En modo oscuro se
 * apagan (`none`) y queda el color plano, que siempre es legible.
 */
export function themeCss(theme: SiteTheme): string {
  const { colors, gradients, fonts, radius: corners } = theme;
  // El `??` no es teórico, por el mismo motivo que el de `gradientOf`: una lectura cacheada
  // antes de que existiera la paleta oscura no trae la clave, y esto se ejecuta al pintar
  // **todas** las páginas — sin la guarda, el sitio entero se cae con un 500 hasta que
  // caduque la caché. Se cae a la paleta oscura neutra de la plantilla.
  const dark = theme.dark ?? DEFAULT_THEME_DARK;

  // Tipografías y esquinas no cambian con el modo: se declaran una sola vez, en `:root`.
  const shared = [
    declaration('font-heading', fontStack(fonts.heading)),
    declaration('font-body', fontStack(fonts.body)),
    declaration('radius-sm', radius(corners.sm, '6px')),
    declaration('radius-md', radius(corners.md, '12px')),
    declaration('radius-lg', radius(corners.lg, '20px')),
  ];

  const light = [
    ...colorDeclarations(colors),
    declaration('gradient-page', gradientOf(gradients?.page)),
    declaration('gradient-section', gradientOf(gradients?.section_alt)),
    // Con esto los controles nativos (campos, barras de desplazamiento, fondos de página)
    // se pintan claros u oscuros según el modo. En el móvil se nota bastante.
    'color-scheme:light',
    ...shared,
  ];

  const darkRules = [
    ...colorDeclarations(dark),
    declaration('gradient-page', 'none'),
    declaration('gradient-section', 'none'),
    'color-scheme:dark',
  ];

  return [
    `:root{${light.join(';')}}`,
    `@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){${darkRules.join(';')}}}`,
    `:root[data-theme="dark"]{${darkRules.join(';')}}`,
  ].join('');
}

/**
 * Contraste entre dos colores, según WCAG 2.1.
 *
 * Existe porque el tema se elige desde el panel y una paleta puede quedar preciosa e ilegible:
 * texto gris claro sobre crema. La cuenta es la de la norma —luminancia relativa y
 * `(claro + 0.05) / (oscuro + 0.05)`—, no una estimación por brillo.
 *
 * El umbral que se usa al validar es 4.5:1, que es el mínimo de WCAG AA para texto normal.
 */

/** Componentes 0-255 de un color `#rgb` o `#rrggbb`. `null` si no tiene esa forma. */
function channels(hex: string): [number, number, number] | null {
  const value = hex.trim().replace(/^#/, '');

  const full =
    value.length === 3
      ? value
          .split('')
          .map((char) => char + char)
          .join('')
      : value;

  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;

  return [
    Number.parseInt(full.slice(0, 2), 16),
    Number.parseInt(full.slice(2, 4), 16),
    Number.parseInt(full.slice(4, 6), 16),
  ];
}

/** Luminancia relativa de un color, de 0 (negro) a 1 (blanco). */
function luminance(hex: string): number | null {
  const rgb = channels(hex);
  if (!rgb) return null;

  const [r, g, b] = rgb.map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
  }) as [number, number, number];

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Relación de contraste entre dos colores, de 1:1 a 21:1.
 *
 * Si alguno de los dos no es un color válido devuelve 21, que es el máximo: no se penaliza un
 * dato que no se puede leer, porque de la forma del color ya se encarga el esquema.
 */
export function contrastRatio(a: string, b: string): number {
  const first = luminance(a);
  const second = luminance(b);

  if (first === null || second === null) return 21;

  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);

  return (lighter + 0.05) / (darker + 0.05);
}

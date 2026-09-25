/**
 * Utilidad para combinar clases de Tailwind.
 *
 * Implementación propia y sin dependencias. `clsx` + `tailwind-merge` pesarían
 * más de lo que aportan aquí: las clases se escriben a mano en cada componente,
 * así que no hay conflictos que resolver por orden de precedencia. Solo hace
 * falta unir las clases verdaderas y descartar las falsas.
 */
export type ClassValue = string | false | null | undefined;

export function cn(...values: ClassValue[]): string {
  return values.filter((value): value is string => Boolean(value)).join(' ');
}

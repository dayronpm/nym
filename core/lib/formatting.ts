import type { DayHours, WeekDay } from '@/types/settings';

/**
 * Formateo de datos para mostrarlos en español.
 *
 * Nada de esto se escribe en los componentes: así el mismo horario se ve igual en
 * el pie, en el bloque de ubicación y en los datos estructurados, y solo hay un
 * sitio que tocar si el formato cambia.
 */

const DAY_NAMES: Record<WeekDay, string> = {
  mon: 'Lunes',
  tue: 'Martes',
  wed: 'Miércoles',
  thu: 'Jueves',
  fri: 'Viernes',
  sat: 'Sábado',
  sun: 'Domingo',
};

const DAY_ORDER: WeekDay[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

/** "09:00" -> "9:00 a. m." */
export function formatTime(value: string): string {
  const [rawHour = 'x', rawMinute = 'x'] = value.split(':');
  const hour = Number(rawHour);
  const minute = Number(rawMinute);

  // Si el valor no es una hora válida se devuelve tal cual, en lugar de mostrar
  // un "NaN" al visitante.
  if (Number.isNaN(hour) || Number.isNaN(minute)) return value;

  const suffix = hour < 12 ? 'a. m.' : 'p. m.';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;

  return `${hour12}:${String(minute).padStart(2, '0')} ${suffix}`;
}

/** `{ open: "09:00", close: "18:00" }` -> "9:00 a. m. – 6:00 p. m." */
export function formatTimeRange(range: { open: string; close: string }): string {
  return `${formatTime(range.open)} – ${formatTime(range.close)}`;
}

/** "Lunes" / "Lunes y martes" / "Lunes a viernes" */
function formatDayRange(start: WeekDay, end: WeekDay, length: number): string {
  if (length === 1) return DAY_NAMES[start];
  if (length === 2) return `${DAY_NAMES[start]} y ${DAY_NAMES[end]}`;
  return `${DAY_NAMES[start]} a ${DAY_NAMES[end]}`;
}

export interface HoursLine {
  /** Etiqueta de los días agrupados, por ejemplo "Lunes a viernes". */
  days: string;
  /** Horario ya formateado, o "Cerrado". */
  hours: string;
}

/**
 * Agrupa los días consecutivos que comparten horario.
 *
 * Regla del plan: "Lunes a viernes: 9:00 a. m. – 6:00 p. m." y los días cerrados
 * aparecen como "Cerrado". Un día con dos tramos (cierre al mediodía) se muestra
 * con los dos separados por " y ".
 */
export function groupHours(hours: DayHours[]): HoursLine[] {
  // Se ordena por día de la semana por si la fila viniera desordenada.
  const ordered = [...hours].sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day));

  const signature = (day: DayHours): string =>
    day.closed ? 'cerrado' : day.ranges.map((range) => `${range.open}-${range.close}`).join(',');

  const lines: HoursLine[] = [];
  let runStart = 0;

  for (let index = 1; index <= ordered.length; index += 1) {
    const previous = ordered[index - 1];
    const current = ordered[index];

    // Mientras el horario sea el mismo que el del día anterior, el tramo sigue.
    if (previous && current && signature(previous) === signature(current)) continue;

    const first = ordered[runStart];
    const last = ordered[index - 1];

    if (first && last) {
      lines.push({
        days: formatDayRange(first.day, last.day, index - runStart),
        hours: first.closed ? 'Cerrado' : first.ranges.map(formatTimeRange).join(' y '),
      });
    }

    runStart = index;
  }

  return lines;
}

/** Precio en la moneda configurada del sitio. */
export function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat('es-PA', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/** Duración legible: 90 -> "1 h 30 min". */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

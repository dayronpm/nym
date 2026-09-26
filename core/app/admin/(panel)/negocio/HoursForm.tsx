'use client';

import Field from '@/components/admin/Field';
import { DAY_NAMES } from '@/lib/formatting';
import { WEEK_DAYS, type DayHours } from '@/types/settings';

/**
 * Editor de horarios, escrito a mano.
 *
 * Es el caso que el formulario generado no puede cubrir: los horarios son **siete días fijos**
 * (`z.array(DayHours).length(7)`), así que una lista con "añadir" y "quitar" permitiría crear un
 * octavo día o borrar el lunes. Aquí los siete días están siempre, cada uno con su casilla de
 * cerrado y hasta dos tramos (por si se cierra al mediodía).
 *
 * El orden de los tramos y el de los días se mantienen como los espera el esquema: los siete
 * días de `WEEK_DAYS`, en orden.
 */

export interface HoursFormProps {
  value: DayHours[];
  onChange: (value: DayHours[]) => void;
  disabled?: boolean;
  errors?: Record<string, string>;
}

/** Un día que falte en el contenido guardado, con la forma que exige el esquema. */
function dayOrDefault(value: DayHours[], index: number): DayHours {
  const day = WEEK_DAYS[index] ?? 'mon';
  const existing = value.find((item) => item.day === day);
  return existing ?? { day, closed: true, ranges: [] };
}

export default function HoursForm({ value, onChange, disabled, errors }: HoursFormProps) {
  function updateDay(index: number, next: DayHours) {
    const days = WEEK_DAYS.map((_, position) => dayOrDefault(value, position));
    days[index] = next;
    onChange(days);
  }

  return (
    <ul className="space-y-3">
      {WEEK_DAYS.map((day, index) => {
        const current = dayOrDefault(value, index);
        const dayName = DAY_NAMES[day];

        return (
          <li
            key={day}
            className="grid gap-3 rounded-sm border border-border p-3 sm:grid-cols-[9rem_auto_1fr] sm:items-start"
          >
            <span className="text-sm font-medium sm:pt-3">{dayName}</span>

            <label className="flex min-h-[44px] items-center gap-2 text-sm sm:pt-3">
              <input
                type="checkbox"
                checked={current.closed}
                disabled={disabled}
                onChange={(event) =>
                  updateDay(index, {
                    ...current,
                    closed: event.target.checked,
                    // Al reabrir un día cerrado se deja un tramo listo para editar en lugar de
                    // una fila vacía que el esquema rechazaría.
                    ranges:
                      !event.target.checked && current.ranges.length === 0
                        ? [{ open: '09:00', close: '18:00' }]
                        : current.ranges,
                  })
                }
                className="h-5 w-5 shrink-0 rounded-sm border-border text-primary focus:border-primary"
              />
              Cerrado
            </label>

            {current.closed ? (
              <p className="text-sm text-text-muted sm:pt-3">No se atiende este día.</p>
            ) : (
              <div className="space-y-2">
                {current.ranges.map((range, rangeIndex) => (
                  <div key={rangeIndex} className="flex flex-wrap items-end gap-3">
                    <Field
                      label={rangeIndex === 0 ? 'Abre' : 'Vuelve a abrir'}
                      name={`hours-${day}-${rangeIndex}-open`}
                      type="time"
                      disabled={disabled}
                      value={range.open}
                      error={errors?.[`${index}.ranges.${rangeIndex}.open`]}
                      onChange={(event) =>
                        updateDay(index, {
                          ...current,
                          ranges: current.ranges.map((item, position) =>
                            position === rangeIndex ? { ...item, open: event.target.value } : item,
                          ),
                        })
                      }
                    />

                    <Field
                      label="Cierra"
                      name={`hours-${day}-${rangeIndex}-close`}
                      type="time"
                      disabled={disabled}
                      value={range.close}
                      error={errors?.[`${index}.ranges.${rangeIndex}.close`]}
                      onChange={(event) =>
                        updateDay(index, {
                          ...current,
                          ranges: current.ranges.map((item, position) =>
                            position === rangeIndex ? { ...item, close: event.target.value } : item,
                          ),
                        })
                      }
                    />

                    {current.ranges.length > 1 ? (
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() =>
                          updateDay(index, {
                            ...current,
                            ranges: current.ranges.filter((_, position) => position !== rangeIndex),
                          })
                        }
                        aria-label={`Quitar el tramo ${rangeIndex + 1} del ${dayName}`}
                        className="mb-1 flex h-11 w-11 items-center justify-center rounded-sm text-text-muted hover:bg-primary-soft hover:text-text disabled:opacity-40"
                      >
                        ×
                      </button>
                    ) : null}
                  </div>
                ))}

                {current.ranges.length < 2 ? (
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                      updateDay(index, {
                        ...current,
                        ranges: [...current.ranges, { open: '15:00', close: '18:00' }],
                      })
                    }
                    className="min-h-[44px] rounded-sm border border-border px-3 py-1.5 text-sm transition-colors hover:bg-primary-soft disabled:opacity-40"
                  >
                    Añadir segundo tramo
                  </button>
                ) : null}

                {errors?.[String(index)] ? (
                  <p role="alert" className="text-sm text-danger">
                    {errors[String(index)]}
                  </p>
                ) : null}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

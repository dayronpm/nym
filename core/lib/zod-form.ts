import { z } from 'zod';

import { MediaRef, createId } from '@/blocks/shared';

/**
 * Introspección de esquemas zod para generar formularios.
 *
 * El reparto de responsabilidades es la decisión importante de este archivo:
 *
 *   - **zod dice la estructura**: qué campos hay, de qué tipo son, cuáles son
 *     obligatorios, sus límites y su valor inicial. Nada de eso se escribe dos veces.
 *   - **el mapa de campos dice las palabras**: la etiqueta en español, la ayuda y, si
 *     hace falta, el tipo de input concreto. Eso no puede salir del esquema, porque los
 *     nombres de campo son técnicos y en inglés (`summary_limit`) y el panel lo lee el
 *     dueño del negocio.
 *   - **los validadores propios se marcan con `.describe('kind:…')`**, que es API pública
 *     de zod. No se inspeccionan expresiones regulares ni se adivina un tipo por el nombre
 *     del campo: lo que no se reconoce se avisa en el formulario en lugar de pintarse mal,
 *     porque un campo mal pintado que guarda el valor equivocado es peor que un aviso.
 *
 * Todo lo que se usa aquí es API pública de zod (`instanceof`, `unwrap`, `innerType`,
 * `shape`, `options`, `isOptional`, `safeParse`). Leer `_def` a mano funcionaría hoy y se
 * rompería en la siguiente actualización de la librería.
 */

export type FieldKind =
  | 'text'
  | 'textarea'
  | 'color'
  | 'time'
  | 'tel'
  | 'url'
  | 'email'
  | 'number'
  | 'boolean'
  | 'select'
  | 'media'
  | 'array'
  | 'group'
  | 'unsupported';

/** Marcas admitidas en `schema.description` (ver `core/lib/validation.ts`). */
const KIND_MARKS: readonly FieldKind[] = ['textarea', 'color', 'time', 'tel', 'url', 'email'];

export interface SelectOption {
  /** Lo que se manda al `<select>`. */
  value: string;
  /** Lo que se lee en el panel. */
  label: string;
  /** El valor con su tipo original, que es el que se guarda. `undefined` = sin valor. */
  raw: string | number | undefined;
}

export interface FieldEntry {
  name: string;
  schema: z.ZodTypeAny;
  descriptor: FieldDescriptor;
}

export interface FieldDescriptor {
  kind: FieldKind;
  /** Si el campo puede quedarse vacío. */
  optional: boolean;
  /** Valor con el que arranca el campo cuando no hay nada guardado. */
  fallback: unknown;
  min?: number;
  max?: number;
  /** Los números enteros se pintan sin decimales. */
  integer?: boolean;
  options?: SelectOption[];
  /** Elemento, si el campo es una lista. */
  item?: { schema: z.ZodTypeAny; descriptor: FieldDescriptor };
  /** Campos, si el campo es un objeto. */
  fields?: FieldEntry[];
}

/** ¿El esquema lleva una marca de tipo (`kind:color`) en su descripción? */
function markOf(schema: z.ZodTypeAny): FieldKind | null {
  const description = schema.description;
  if (!description?.startsWith('kind:')) return null;

  const value = description.slice('kind:'.length) as FieldKind;
  return KIND_MARKS.includes(value) ? value : null;
}

/**
 * Baja por los envoltorios (`optional`, `nullable`, `default`, `refine`…) hasta el esquema
 * que de verdad describe el dato.
 */
function coreOf(schema: z.ZodTypeAny): z.ZodTypeAny {
  let current = schema;

  for (;;) {
    if (current instanceof z.ZodOptional || current instanceof z.ZodNullable) {
      current = current.unwrap();
      continue;
    }
    if (current instanceof z.ZodDefault) {
      current = current.removeDefault();
      continue;
    }
    if (current instanceof z.ZodEffects) {
      current = current.innerType();
      continue;
    }
    if (current instanceof z.ZodCatch) {
      current = current.removeCatch();
      continue;
    }
    if (current instanceof z.ZodReadonly) {
      current = current.unwrap();
      continue;
    }
    return current;
  }
}

/** Opciones de un `z.union([z.literal(2), z.literal(3)])`, o `null` si no es eso. */
function literalOptions(schema: z.ZodTypeAny): SelectOption[] | null {
  if (!(schema instanceof z.ZodUnion)) return null;

  const options: SelectOption[] = [];

  for (const option of schema.options) {
    if (!(option instanceof z.ZodLiteral)) return null;

    const raw = option.value;
    if (typeof raw !== 'string' && typeof raw !== 'number') return null;

    options.push({ value: String(raw), label: String(raw), raw });
  }

  return options.length > 0 ? options : null;
}

/** Nombre legible para un valor de enum: `summary` -> `summary`. */
function optionForEnum(value: string): SelectOption {
  return { value, label: value, raw: value };
}

function describeKind(schema: z.ZodTypeAny): FieldDescriptor['kind'] {
  const marked = markOf(schema) ?? markOf(coreOf(schema));
  if (marked) return marked;

  const inner = coreOf(schema);

  if (inner === MediaRef) return 'media';
  if (inner instanceof z.ZodBoolean) return 'boolean';
  if (inner instanceof z.ZodNumber) return 'number';
  if (inner instanceof z.ZodEnum || inner instanceof z.ZodNativeEnum) return 'select';
  if (literalOptions(inner)) return 'select';
  if (inner instanceof z.ZodArray) return 'array';
  if (inner instanceof z.ZodObject) return 'group';

  if (inner instanceof z.ZodString) {
    // Un texto largo se edita en un área de texto; corto, en una línea. El corte está en
    // 160 caracteres porque es el ancho a partir del cual un `input` deja de ser cómodo.
    const max = inner.maxLength ?? undefined;
    return max !== undefined && max > 160 ? 'textarea' : 'text';
  }

  return 'unsupported';
}

/** Valor con el que arranca un campo que todavía no tiene nada guardado. */
function fallbackFor(schema: z.ZodTypeAny, kind: FieldDescriptor['kind']): unknown {
  // `safeParse(undefined)` es la forma pública de preguntar "¿este esquema tiene un valor
  // por defecto, o puede quedarse vacío?".
  const parsed = schema.safeParse(undefined);
  if (parsed.success) return parsed.data;

  if (kind === 'boolean') return false;
  if (kind === 'number') return 0;
  if (kind === 'array') return [];

  return '';
}

function buildFields(shape: Record<string, z.ZodTypeAny>): FieldEntry[] {
  return Object.entries(shape).map(([name, fieldSchema]) => ({
    name,
    schema: fieldSchema,
    descriptor: describeField(fieldSchema),
  }));
}

/**
 * Valor vacío de un campo, a partir de su descripción.
 *
 * Los dos casos que no son un valor simple:
 *
 *  - **Objeto**: se construye campo a campo, para que los subcampos que sí tienen valor por
 *    defecto lo traigan.
 *  - **Imagen**: siempre `{ path: '', alt: '' }`. Una cadena vacía aquí no vale: el bloque
 *    guardaría un `MediaRef` roto y el sitio fallaría al pintarlo.
 */
function emptyFromDescriptor(descriptor: FieldDescriptor): unknown {
  if (descriptor.kind === 'group' && descriptor.fields) {
    return buildObjectFallback(descriptor.fields);
  }

  if (descriptor.kind === 'media') {
    return { path: '', alt: '' } satisfies { path: string; alt: string };
  }

  return descriptor.fallback;
}

function buildObjectFallback(fields: FieldEntry[]): Record<string, unknown> {
  const value: Record<string, unknown> = {};

  for (const field of fields) {
    // Regla concreta: un campo obligatorio llamado `id` se genera solo. Es el caso de los
    // elementos de las listas (imágenes, miembros, testimonios), que necesitan un
    // identificador estable y no tiene ningún sentido pedírselo al dueño.
    const isGeneratedId =
      field.name === 'id' &&
      !field.descriptor.optional &&
      coreOf(field.schema) instanceof z.ZodString;

    value[field.name] = isGeneratedId ? createId() : emptyFromDescriptor(field.descriptor);
  }

  return value;
}

/**
 * Describe un campo del formulario a partir de su esquema.
 *
 * Es recursivo: un objeto devuelve sus campos y una lista devuelve la descripción de su
 * elemento, que es lo que permite editar listas de objetos (imágenes, miembros, preguntas)
 * sin escribir un formulario a mano por cada bloque.
 */
export function describeField(schema: z.ZodTypeAny): FieldDescriptor {
  const descriptor = describeFieldInner(schema);

  // Un selector que no tiene valor por defecto en el esquema arranca en su primera opción.
  // Es lo que se ve en pantalla, así que es lo que debe quedar guardado si nadie lo toca:
  // lo contrario es enseñar una cosa y guardar otra.
  if (descriptor.kind === 'select' && descriptor.fallback === '' && descriptor.options?.[0]) {
    descriptor.fallback = descriptor.options[0].raw;
  }

  return descriptor;
}

function describeFieldInner(schema: z.ZodTypeAny): FieldDescriptor {
  const kind = describeKind(schema);
  const inner = coreOf(schema);
  const descriptor: FieldDescriptor = {
    kind,
    optional: schema.isOptional(),
    fallback: fallbackFor(schema, kind),
  };

  if (inner instanceof z.ZodNumber) {
    descriptor.min = inner.minValue ?? undefined;
    descriptor.max = inner.maxValue ?? undefined;
    descriptor.integer = inner.isInt;
    return descriptor;
  }

  if (inner instanceof z.ZodEnum) {
    descriptor.options = inner.options.map((value: string) => optionForEnum(value));
    return descriptor;
  }

  if (inner instanceof z.ZodNativeEnum) {
    descriptor.options = Object.values(inner.enum)
      .filter((value): value is string => typeof value === 'string')
      .map(optionForEnum);
    return descriptor;
  }

  const literals = literalOptions(inner);
  if (literals) {
    descriptor.options = literals;
    return descriptor;
  }

  if (inner instanceof z.ZodArray) {
    descriptor.item = {
      schema: inner.element,
      descriptor: describeField(inner.element),
    };
    return descriptor;
  }

  if (inner instanceof z.ZodObject) {
    descriptor.fields = buildFields(inner.shape as Record<string, z.ZodTypeAny>);
    descriptor.fallback = buildObjectFallback(descriptor.fields);
    return descriptor;
  }

  return descriptor;
}

/**
 * Objeto vacío listo para editar, a partir del esquema del contenido.
 *
 * Se usa al crear un bloque nuevo desde el panel. Los valores por defecto del esquema se
 * respetan, así que un bloque recién creado se ve igual que uno que nunca se ha tocado.
 */
export function emptyValueFor(schema: z.ZodTypeAny): unknown {
  return emptyFromDescriptor(describeField(schema));
}

/**
 * Rellena con los valores por defecto del esquema lo que falte.
 *
 * Se usa al abrir un editor: en la base de datos hay contenido guardado con esquemas
 * anteriores, y un campo que ahora tiene valor por defecto puede no estar en el `jsonb`. Sin
 * esto, el panel enseñaría lo que no hay y guardaría otra cosa.
 *
 * Si el contenido guardado no valida —porque quedó de una versión vieja del esquema— se
 * devuelve tal cual, en lugar de sustituirlo por valores por defecto: así el error se ve al
 * guardar, con los campos señalados, y no se pierde en silencio el contenido del dueño.
 */
export function withSchemaDefaults(schema: z.ZodTypeAny, value: unknown): unknown {
  const parsed = schema.safeParse(value);
  return parsed.success ? parsed.data : value;
}

/**
 * Etiqueta de un elemento de lista, para el resumen plegado.
 *
 * Se busca el primer campo de texto con contenido (el nombre de la persona, el título del
 * reel, la pregunta…) y, si no hay ninguno, se numera el elemento. Sin esto, la lista sería
 * una pila de tarjetas idénticas.
 */
export function itemLabel(item: unknown, index: number, preferredKey?: string): string {
  const record = typeof item === 'object' && item !== null ? (item as Record<string, unknown>) : {};

  const keys = preferredKey ? [preferredKey] : ['name', 'title', 'question', 'caption', 'author_name', 'role'];

  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }

  return `Elemento ${index + 1}`;
}

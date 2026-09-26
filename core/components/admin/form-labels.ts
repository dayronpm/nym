/**
 * Etiquetas y ajustes de los formularios generados.
 *
 * Este archivo es la mitad "palabras" del panel: zod aporta la estructura, la validación y
 * los valores por defecto, y aquí se decide **cómo se llama cada campo** en español, qué
 * ayuda lleva y, cuando hace falta, qué input concreto se usa (`type="url"`, un área de
 * texto…). Es la capa que hace que el dueño del negocio lea "Cuántos servicios se muestran"
 * donde el esquema dice `summary_limit`.
 *
 * Regla: aquí **no se declara ningún campo**. Si un campo del esquema no aparece en el mapa,
 * el formulario lo pinta igualmente con un nombre derivado del técnico. Es un respaldo
 * feo, pero nunca se pierde un campo por un olvido.
 *
 * `itemFields` existe por un choque real: `title` significa "Título del bloque" en casi todos
 * los bloques, pero dentro de la lista de reels es "Título del vídeo". Un mapa plano no puede
 * decir las dos cosas.
 */

export interface FieldConfig {
  label: string;
  /** Aclaración bajo el campo. */
  hint?: string;
  /** Input concreto, cuando no se deduce del esquema. */
  type?: 'text' | 'url' | 'email' | 'textarea';
  /** Etiquetas legibles para un selector cuyos valores son técnicos. */
  optionLabels?: Record<string, string>;
  /** Para listas: el campo que da el título del elemento plegado. */
  itemTitle?: string;
  /** Para listas: texto del botón de añadir. */
  addLabel?: string;
  /** Etiquetas de los campos de dentro de cada elemento de la lista. */
  itemFields?: FormLabels;
  /** Se conserva el valor pero no se muestra el campo (identificadores, por ejemplo). */
  hidden?: boolean;
}

export type FormLabels = Record<string, FieldConfig>;

const PAGE_OPTIONS: Record<string, string> = {
  inicio: 'Inicio',
  servicios: 'Servicios',
  galeria: 'Galería y Reels',
  nosotros: 'Nosotros',
  contacto: 'Contacto',
};

/** Campos que comparten casi todos los bloques. */
const COMMON: FormLabels = {
  title: { label: 'Título' },
  subtitle: { label: 'Subtítulo' },
  id: { label: 'Identificador interno', hidden: true },
  enabled: { label: 'Se muestra', hint: 'Desmárcalo para ocultarlo sin borrarlo.' },
  more: {
    label: 'Enlace a la sección completa',
    hint: 'Texto con flecha que aparece junto al título. Déjalo sin página de destino para no mostrarlo.',
  },
  source_page: {
    label: 'Tomar el contenido de',
    hint: 'Para los resúmenes de la portada: el bloque no guarda su propio contenido, lo lee de la página que elijas.',
    optionLabels: PAGE_OPTIONS,
  },
  limit: {
    label: 'Cuántos elementos se muestran',
    hint: 'Vacío = todos. Es el corte de los resúmenes de Inicio.',
  },
  image: { label: 'Imagen' },
  photo: { label: 'Foto', hint: 'Si no hay foto se muestran las iniciales.' },
  thumbnail: { label: 'Miniatura' },
  alt: { label: 'Texto alternativo' },
};

export const FORM_LABELS: Record<string, FormLabels> = {
  hero: {
    ...COMMON,
    eyebrow: { label: 'Antetítulo', hint: 'Frase corta sobre el título. Opcional.' },
    title: { label: 'Título principal', hint: 'Es el único <h1> de la portada.' },
    subtitle: { label: 'Entradilla' },
    image_position: {
      label: 'Posición de la imagen',
      optionLabels: { right: 'Derecha', left: 'Izquierda' },
    },
  },

  services: {
    ...COMMON,
    mode: {
      label: 'Nivel de detalle',
      hint: 'El catálogo se edita una sola vez, en Negocio → Servicios; aquí solo se decide cómo se muestra.',
      optionLabels: { summary: 'Resumen (unos pocos por categoría)', full: 'Catálogo completo' },
    },
    summary_limit: { label: 'Servicios por categoría en el resumen' },
    show_prices: { label: 'Mostrar precios' },
    show_durations: { label: 'Mostrar duraciones' },
    price_hidden_label: { label: 'Texto cuando no hay precio' },
    show_booking_button: { label: 'Botón de reservar en cada servicio' },
  },

  gallery: {
    ...COMMON,
    aspect_ratio: {
      label: 'Proporción de las fotos',
      optionLabels: { '1:1': 'Cuadrada (1:1)', '4:5': 'Vertical (4:5)', '3:2': 'Horizontal (3:2)' },
    },
    columns_desktop: {
      label: 'Columnas en escritorio',
      hint: 'En móvil siempre son 2.',
      optionLabels: { '2': '2 columnas', '3': '3 columnas', '4': '4 columnas' },
    },
    images: {
      label: 'Fotos',
      itemTitle: 'caption',
      addLabel: 'Añadir foto',
      itemFields: {
        image: { label: 'Imagen' },
        caption: { label: 'Pie de foto', hint: 'Opcional. Se ve al ampliarla.' },
      },
    },
  },

  team: {
    ...COMMON,
    members: {
      label: 'Personas',
      itemTitle: 'name',
      addLabel: 'Añadir persona',
      itemFields: {
        name: { label: 'Nombre' },
        role: { label: 'Cargo' },
        bio: { label: 'Biografía', hint: 'Opcional, una o dos líneas.' },
      },
    },
  },

  faq: {
    ...COMMON,
    items: {
      label: 'Preguntas',
      itemTitle: 'question',
      addLabel: 'Añadir pregunta',
      itemFields: {
        question: { label: 'Pregunta' },
        answer: { label: 'Respuesta' },
      },
    },
  },

  testimonials: {
    ...COMMON,
    show_ratings: { label: 'Mostrar estrellas' },
    items: {
      label: 'Testimonios',
      itemTitle: 'author_name',
      addLabel: 'Añadir testimonio',
      itemFields: {
        quote: { label: 'Testimonio' },
        author_name: { label: 'Quién lo dice', hint: 'Nombre o inicial, por ejemplo "María G.".' },
        service: { label: 'Servicio', hint: 'Opcional. Aparece bajo el nombre.' },
        rating: { label: 'Estrellas (1 a 5)' },
      },
    },
  },

  contact: {
    ...COMMON,
    show_whatsapp: { label: 'Mostrar WhatsApp' },
    show_phone: { label: 'Mostrar teléfono' },
    show_email: { label: 'Mostrar correo' },
    show_address: { label: 'Mostrar dirección' },
    show_social: { label: 'Mostrar redes sociales' },
  },

  location_hours: {
    ...COMMON,
    show_map: { label: 'Mostrar el mapa' },
    directions_label: { label: 'Texto del botón "Cómo llegar"' },
    hours_note: {
      label: 'Nota sobre los horarios',
      hint: 'Por ejemplo "Atención con cita previa". Opcional.',
    },
  },

  reels: {
    ...COMMON,
    show_profile_links: { label: 'Botones a los perfiles' },
    items: {
      label: 'Vídeos',
      itemTitle: 'title',
      addLabel: 'Añadir vídeo',
      itemFields: {
        platform: {
          label: 'Red',
          optionLabels: { instagram: 'Instagram', tiktok: 'TikTok' },
        },
        url: { label: 'Enlace del vídeo', type: 'url' },
        title: { label: 'Título del vídeo' },
        thumbnail: { label: 'Miniatura', hint: 'Vertical (9:16): es lo que se ve en la tarjeta.' },
      },
    },
  },

  booking_cta: {
    ...COMMON,
    text: { label: 'Texto' },
    button_label: { label: 'Texto del botón' },
    message_override: {
      label: 'Mensaje de WhatsApp',
      hint: 'Opcional. Si lo dejas vacío se usa el mensaje general de Negocio → Contacto.',
    },
  },
};

/**
 * Configuración de un campo. Si falta en el mapa, se deriva del nombre técnico para que el
 * formulario nunca deje un campo sin etiqueta.
 */
export function fieldConfig(labelsKey: string, name: string, itemFields?: FormLabels): FieldConfig {
  const specific = itemFields?.[name] ?? FORM_LABELS[labelsKey]?.[name];
  return specific ?? { label: humanize(name) };
}

/** `summary_limit` -> "Summary limit". Respaldo: no debería verse nunca tal cual. */
export function humanize(name: string): string {
  const words = name.replace(/_/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

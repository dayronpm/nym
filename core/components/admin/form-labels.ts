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
  /**
   * Opciones cerradas para un campo de texto (fuentes, radios).
   *
   * Hace falta porque el esquema no puede expresar "solo estas" cuando el dato es un texto
   * libre (`z.string()`): la lista curada vive aquí, que es el archivo de las palabras.
   */
  options?: readonly { value: string; label: string }[];
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
  /**
   * Carpeta del bucket donde se guarda una imagen subida desde este campo.
   *
   * Es una pista para la subida, no una restricción: la ruta se puede escribir a mano y el
   * servidor comprueba la carpeta contra la lista del proyecto de todas formas.
   */
  folder?: string;
}

export type FormLabels = Record<string, FieldConfig>;

const PAGE_OPTIONS: Record<string, string> = {
  inicio: 'Inicio',
  servicios: 'Servicios',
  galeria: 'Galería y Reels',
  nosotros: 'Nosotros',
  contacto: 'Contacto',
};

/** Direcciones de un degradado, en palabras que se entienden sin saber CSS. */
const GRADIENT_DIRECTION_LABELS: Record<string, string> = {
  'to bottom': 'De arriba abajo',
  'to top': 'De abajo arriba',
  'to right': 'De izquierda a derecha',
  'to left': 'De derecha a izquierda',
  'to bottom right': 'En diagonal hacia la derecha',
  'to bottom left': 'En diagonal hacia la izquierda',
};

/** Fuentes que carga `next/font` en el layout raíz (`core/app/layout.tsx`). */
const FONT_OPTIONS = [
  { value: 'Cormorant Garamond', label: 'Cormorant Garamond (serif)' },
  { value: 'Inter', label: 'Inter (sin serif)' },
  { value: 'Jost', label: 'Jost (sin serif)' },
] as const;

/** Radios disponibles, en píxeles. La lista es corta a propósito: cuatro valores por medida. */
const RADIUS_SMALL = [
  { value: '0px', label: 'Sin redondear' },
  { value: '4px', label: '4 px' },
  { value: '6px', label: '6 px' },
  { value: '10px', label: '10 px' },
] as const;

const RADIUS_MEDIUM = [
  { value: '0px', label: 'Sin redondear' },
  { value: '8px', label: '8 px' },
  { value: '12px', label: '12 px' },
  { value: '20px', label: '20 px' },
] as const;

const RADIUS_LARGE = [
  { value: '0px', label: 'Sin redondear' },
  { value: '16px', label: '16 px' },
  { value: '20px', label: '20 px' },
  { value: '32px', label: '32 px' },
] as const;

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

  /* ---- Grupos de `site_settings` (pantallas de configuración) ---- */

  brand_settings: {
    name: { label: 'Nombre del negocio' },
    tagline: { label: 'Lema', hint: 'Una línea corta bajo el nombre. Opcional.' },
    logo: {
      label: 'Logotipo',
      hint: 'Se muestra en el encabezado y el pie del sitio. Si no lo subes, se usa el nombre como texto. También sirve de imagen de reserva al compartir el enlace.',
      folder: 'brand',
    },
    logo_dark: {
      label: 'Logotipo para fondo oscuro',
      hint: 'La versión para el modo oscuro (por ejemplo, en tonos claros). Si no la subes, se usa el logotipo normal.',
      folder: 'brand',
    },
    favicon: { label: 'Icono del navegador', folder: 'brand' },
  },

  contact_settings: {
    whatsapp: {
      label: 'WhatsApp',
      hint: 'Solo dígitos con código de país, sin "+". Ejemplo: 50760000000.',
    },
    phone_display: { label: 'Teléfono (como se muestra)', hint: 'Ejemplo: 6000-0000.' },
    phone: {
      label: 'Teléfono (para llamar)',
      hint: 'Con "+" si es internacional. Ejemplo: +50760000000.',
    },
    email: { label: 'Correo' },
    address: { label: 'Dirección' },
    maps_url: {
      label: 'Enlace de Google Maps',
      hint: 'El que se abre con el botón "Cómo llegar".',
      type: 'url',
    },
    maps_embed_url: {
      label: 'Enlace del mapa para insertar',
      hint: 'De Google Maps: Compartir → Insertar un mapa. Es lo que dibuja el mapa en la página de contacto.',
      type: 'url',
    },
    instagram_url: { label: 'Instagram', type: 'url' },
    tiktok_url: { label: 'TikTok', type: 'url' },
    facebook_url: { label: 'Facebook', type: 'url' },
    booking_message_generic: {
      label: 'Mensaje de reserva general',
      hint: 'Es lo que aparece ya escrito en WhatsApp al pulsar el botón.',
      type: 'textarea',
    },
    booking_message_service: {
      label: 'Mensaje de reserva por servicio',
      hint: 'Escribe {servicio} donde deba ir el nombre del servicio.',
      type: 'textarea',
    },
  },

  theme: {
    colors: {
      label: 'Colores',
      hint: 'El panel comprueba que el texto se lea sobre el fondo: no deja guardar una paleta por debajo de 4.5:1.',
    },
    dark: {
      label: 'Modo oscuro',
      hint: 'La paleta alternativa, para quien lo prefiere o lo lleva así en su sistema. Se le exige el mismo contraste que a la paleta clara. El modo oscuro sigue al sistema del visitante salvo que use el interruptor del encabezado.',
    },
    fonts: {
      label: 'Tipografías',
      hint: 'Se eligen entre las fuentes que carga el sitio. Añadir otra es un cambio de código, no un ajuste del panel.',
    },
    radius: { label: 'Esquinas' },

    gradients: {
      label: 'Degradados',
      hint: 'Un degradado suave en lugar de un color plano. Es opcional: apagado, la zona usa su color y lo que hayas elegido se conserva.',
    },
    page: { label: 'Fondo del sitio', hint: 'Se ve por detrás de todo el contenido.' },
    section_alt: {
      label: 'Secciones alternas',
      hint: 'Las franjas que separan unas secciones de otras.',
    },
    enabled: { label: 'Usar degradado' },
    from: { label: 'Color inicial' },
    to: { label: 'Color final' },
    direction: { label: 'Dirección', optionLabels: GRADIENT_DIRECTION_LABELS },

    bg: { label: 'Fondo del sitio' },
    surface: { label: 'Tarjetas y formularios' },
    surface_alt: {
      label: 'Secciones alternas',
      hint: 'Franjas de fondo distinto que separan unas secciones de otras.',
    },
    text: { label: 'Color del texto' },
    text_muted: { label: 'Texto secundario', hint: 'Fechas, ayudas y textos de apoyo.' },
    border: { label: 'Bordes y líneas finas' },
    primary: { label: 'Color de acento', hint: 'Botones, enlaces y detalles.' },
    primary_hover: { label: 'Acento al pasar el ratón' },
    primary_soft: { label: 'Acento suave', hint: 'Fondos de avisos y resaltados.' },
    on_primary: { label: 'Texto sobre el acento', hint: 'El color de la letra dentro de los botones.' },

    heading: { label: 'Fuente de los títulos', options: FONT_OPTIONS },
    body: { label: 'Fuente del texto', options: FONT_OPTIONS },

    sm: { label: 'Esquinas pequeñas', hint: 'Campos de formulario y etiquetas.', options: RADIUS_SMALL },
    md: { label: 'Esquinas medianas', hint: 'Botones y tarjetas.', options: RADIUS_MEDIUM },
    lg: {
      label: 'Esquinas grandes',
      hint: 'Imágenes destacadas y contenedores.',
      options: RADIUS_LARGE,
    },
  },

  seo_defaults: {
    business_type: {
      label: 'Tipo de negocio',
      hint: 'Cómo se declara el negocio para Google: DaySpa, BeautySalon, HairSalon, NailSalon… Si no estás seguro, deja DaySpa.',
    },
    default_og_image: {
      label: 'Imagen al compartir (reserva)',
      hint: 'La usa cualquier página que no tenga la suya propia.',
    },
  },

  page_meta: {
    title: {
      label: 'Título de la página',
      hint: 'El encabezado que se lee en la propia página. Obligatorio.',
    },
    meta_title: {
      label: 'Título para Google',
      hint: 'Si lo dejas vacío se arma con el título y el nombre del negocio. Máximo 60 caracteres.',
    },
    meta_description: {
      label: 'Descripción para Google',
      hint: 'Lo que se lee bajo el enlace en los resultados. Máximo 160 caracteres.',
    },
    og_image: {
      label: 'Imagen al compartir',
      hint: 'La que se ve en WhatsApp y redes al pegar el enlace de esta página.',
    },
  },

  services_catalog: {
    categories: {
      label: 'Categorías de servicios',
      hint: 'Agrupa los servicios como quieras (por zona, por tipo). Si no necesitas categorías, deja una sola con todo dentro.',
      itemTitle: 'name',
      addLabel: 'Añadir categoría',
      itemFields: {
        id: { label: 'Identificador interno', hidden: true },
        name: { label: 'Nombre de la categoría' },
        description: { label: 'Descripción de la categoría', type: 'textarea' },
        items: {
          label: 'Servicios',
          hint: 'Lo que se ve en Inicio (resumen) y en la página de Servicios.',
          itemTitle: 'name',
          addLabel: 'Añadir servicio',
          itemFields: {
            id: { label: 'Identificador interno', hidden: true },
            name: { label: 'Nombre del servicio' },
            description: { label: 'Descripción', type: 'textarea' },
            price: {
              label: 'Precio (USD)',
              hint: 'Opcional. Se muestra junto a la duración.',
            },
            duration_minutes: {
              label: 'Duración (minutos)',
              hint: 'Opcional. Ejemplo: 60.',
            },
            image: { label: 'Imagen del servicio', folder: 'services' },
            enabled: { label: 'Se muestra', hint: 'Desmárcalo para ocultarlo sin borrarlo.' },
          },
        },
      },
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

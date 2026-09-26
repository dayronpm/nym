import type {
  BrandSettings,
  ContactSettings,
  SeoDefaults,
  ServicesCatalog,
} from '@/types/settings';

/**
 * Preset "Spa" — contenido de ejemplo NEUTRO.
 *
 * Regla dura del proyecto: aquí no puede haber ni un dato de un negocio real. Todo
 * es ficticio y reconociblemente de ejemplo, para que sirva de andamio visual y
 * para que nadie lo confunda con contenido definitivo.
 *
 * Este archivo se importa desde `scripts/seed.mjs`, que lo ejecuta **Node
 * directamente** (Node 22.18+ borra los tipos por su cuenta). Por eso:
 *   - los únicos imports son `import type`, que Node elimina sin resolver;
 *   - NINGÚN import de valor con el alias `@/`, que Node no sabría resolver.
 * Si algún día hace falta traer un valor de `core/`, hay que pasarlo por el seed,
 * no importarlo aquí.
 */

export interface PresetPage {
  slug: string;
  title: string;
  meta_description: string;
}

export interface PresetBlock {
  /** Slug de la página a la que pertenece. */
  page: string;
  /** Clave del bloque en `BLOCK_REGISTRY`. */
  type: string;
  /** Posición dentro de la página. */
  order: number;
  enabled: boolean;
  /** Contenido del bloque. Se valida con el esquema del bloque al renderizar. */
  data: Record<string, unknown>;
}

export interface SpaPreset {
  /**
   * Solo lo que el seed necesita cambiar. Deliberadamente NO incluye `theme` ni
   * `hours`: la migración 000 ya deja esos dos con valores válidos, y repetirlos
   * aquí sería una copia más que mantener sincronizada.
   *
   * `seo_defaults` sí entra, por un motivo concreto: guarda la **imagen Open
   * Graph** y eso es una ruta del bucket, que la migración no puede conocer. Es la
   * foto que se ve al compartir el enlace en WhatsApp, así que sin ella la
   * previsualización sale sin imagen.
   */
  siteSettings: {
    brand: BrandSettings;
    contact: ContactSettings;
    services_catalog: ServicesCatalog;
    seo_defaults: SeoDefaults;
  };
  pages: PresetPage[];
  blocks: PresetBlock[];
}

export const SPA_PRESET: SpaPreset = {
  siteSettings: {
    brand: {
      name: 'Nombre del Negocio',
      tagline: 'Bienestar y cuidado personal',
    },
    seo_defaults: {
      // `DaySpa` es el tipo de negocio de schema.org que corresponde a un spa.
      business_type: 'DaySpa',
      // Imagen de reserva para compartir el enlace. Placeholder generado por el seed.
      default_og_image: {
        path: 'brand/preset-og.png',
        alt: 'Imagen de presentación del negocio (ejemplo)',
      },
    },
    contact: {
      // Número ficticio. Formato: solo dígitos con código de país, sin "+".
      whatsapp: '50760000000',
      phone_display: '6000-0000',
      phone: '+50760000000',
      email: 'hola@ejemplo.com',
      address: 'Calle de Ejemplo 123, Ciudad de Panamá',
      // Enlaces y coordenadas ficticios, solo para que el mapa y las redes se vean.
      maps_url: 'https://www.google.com/maps?q=8.9824,-79.5199',
      maps_embed_url: 'https://www.google.com/maps?q=8.9824,-79.5199&output=embed',
      instagram_url: 'https://www.instagram.com/ejemplo/',
      tiktok_url: 'https://www.tiktok.com/@ejemplo',
      booking_message_generic: 'Hola, quisiera reservar una cita. ¿Me pueden ayudar?',
      booking_message_service: 'Hola, quisiera reservar: {servicio}. ¿Tienen disponibilidad?',
    },
    services_catalog: {
      categories: [
        {
          id: 'preset-cat-masajes',
          name: 'Masajes',
          description: 'Tratamientos para relajar la musculatura y soltar tensión.',
          items: [
            // Las imágenes que se declaran aquí las genera y sube `scripts/seed.mjs`:
            // son PNG de color plano, no fotos. Están para que la estructura se vea
            // tal como quedará cuando el negocio suba sus propias fotos.
            {
              id: 'preset-srv-masaje-relajante',
              name: 'Masaje relajante',
              description: 'Masaje de cuerpo completo con aceites, presión suave y ritmo pausado.',
              price: 45,
              duration_minutes: 60,
              image: {
                path: 'services/preset-srv-masaje-relajante.png',
                alt: 'Masaje relajante (imagen de ejemplo)',
              },
              enabled: true,
            },
            {
              id: 'preset-srv-masaje-descontracturante',
              name: 'Masaje descontracturante',
              description: 'Presión más firme sobre las zonas cargadas, ideal después del deporte.',
              price: 60,
              duration_minutes: 75,
              image: {
                path: 'services/preset-srv-masaje-descontracturante.png',
                alt: 'Masaje descontracturante (imagen de ejemplo)',
              },
              enabled: true,
            },
            {
              id: 'preset-srv-masaje-piedras',
              name: 'Masaje con piedras calientes',
              description: 'Piedras volcánicas templadas para un calor profundo y duradero.',
              price: 70,
              duration_minutes: 90,
              image: {
                path: 'services/preset-srv-masaje-piedras.png',
                alt: 'Masaje con piedras calientes (imagen de ejemplo)',
              },
              enabled: true,
            },
          ],
        },
        {
          id: 'preset-cat-faciales',
          name: 'Tratamientos faciales',
          description: 'Limpieza, hidratación y cuidado de la piel del rostro.',
          items: [
            {
              id: 'preset-srv-limpieza-facial',
              name: 'Limpieza facial profunda',
              description: 'Extracción, exfoliación y mascarilla calmante.',
              price: 40,
              duration_minutes: 50,
              image: {
                path: 'services/preset-srv-limpieza-facial.png',
                alt: 'Limpieza facial profunda (imagen de ejemplo)',
              },
              enabled: true,
            },
            {
              id: 'preset-srv-facial-hidratante',
              name: 'Facial hidratante',
              description: 'Aporta agua y luminosidad a pieles apagadas o deshidratadas.',
              // Sin precio a propósito: sirve para ver cómo se muestra la
              // etiqueta alternativa de "consultar por WhatsApp".
              duration_minutes: 45,
              image: {
                path: 'services/preset-srv-facial-hidratante.png',
                alt: 'Facial hidratante (imagen de ejemplo)',
              },
              enabled: true,
            },
          ],
        },
        {
          id: 'preset-cat-manos-pies',
          name: 'Manos y pies',
          items: [
            {
              id: 'preset-srv-manicure',
              name: 'Manicure completo',
              description: 'Limado, cutículas, hidratación y esmaltado.',
              price: 25,
              duration_minutes: 45,
              image: {
                path: 'services/preset-srv-manicure.png',
                alt: 'Manicure completo (imagen de ejemplo)',
              },
              enabled: true,
            },
            {
              id: 'preset-srv-pedicure',
              name: 'Pedicure completo',
              description: 'Baño de pies, exfoliación y esmaltado.',
              price: 30,
              duration_minutes: 60,
              image: {
                path: 'services/preset-srv-pedicure.png',
                alt: 'Pedicure completo (imagen de ejemplo)',
              },
              enabled: true,
            },
          ],
        },
      ],
    },
  },

  pages: [
    {
      slug: 'inicio',
      title: 'Inicio',
      meta_description: 'Bienestar y cuidado personal: masajes, faciales, manos y pies.',
    },
    {
      slug: 'servicios',
      title: 'Servicios',
      meta_description: 'Catálogo completo de servicios, con precios y duraciones.',
    },
    {
      slug: 'galeria',
      title: 'Galería y Reels',
      meta_description: 'Nuestro espacio y nuestros trabajos, en imágenes.',
    },
    {
      slug: 'nosotros',
      title: 'Nosotros',
      meta_description: 'Quiénes somos y qué puedes esperar de tu visita.',
    },
    {
      slug: 'contacto',
      title: 'Contacto',
      meta_description: 'Cómo llegar, horarios y cómo reservar tu cita.',
    },
  ],

  blocks: [
    /* ---------------------------------------------------------------- Inicio */
    /*
     * Inicio es el índice del sitio: un resumen de cada sección y, en el encabezado de
     * cada resumen, el enlace para entrar donde está el contenido completo.
     *
     * Los bloques de resumen no guardan contenido: con `source_page` toman la lista del
     * bloque del mismo tipo que vive en su sección (`gallery` y `reels` de `/galeria`,
     * `team` y `faq` de `/nosotros`), así que el contenido se edita en un único sitio y
     * esta portada no puede quedarse desfasada. Lo propio de cada resumen es el corte
     * (`limit`), su título y el enlace de salida (`more`).
     *
     * `services` no necesita `source_page` porque su catálogo ya es un dato único de
     * `site_settings`. El mapa (`location_hours`) se queda solo en `/contacto`: aquí
     * pesa demasiado y el enlace ya lleva hasta él.
     */
    {
      page: 'inicio',
      type: 'hero',
      order: 1,
      enabled: true,
      data: {
        eyebrow: 'Nombre del Negocio',
        title: 'Tu momento de calma y bienestar',
        subtitle:
          'Masajes, tratamientos faciales y cuidado de manos y pies en un espacio tranquilo, con cita previa.',
        image_position: 'right',
        // Sin botones: la reserva ya está en el botón fijo del encabezado y en el
        // bloque `booking_cta` al final de la página.
      },
    },
    {
      page: 'inicio',
      type: 'services',
      order: 2,
      enabled: true,
      data: {
        title: 'Nuestros servicios',
        subtitle: 'Un resumen de lo que más nos piden.',
        // Las dos instancias del bloque comparten el catálogo; lo único que cambia
        // es cómo se muestra.
        mode: 'summary',
        summary_limit: 2,
        show_prices: true,
        show_durations: true,
        price_hidden_label: 'Consultar por WhatsApp',
        show_booking_button: true,
        more: { page: 'servicios', label: 'Ver todos los servicios' },
      },
    },
    {
      page: 'inicio',
      type: 'reels',
      order: 3,
      enabled: true,
      data: {
        title: 'Lo último que publicamos',
        subtitle: 'Novedades y trabajos recientes, en vídeo.',
        show_profile_links: true,
        limit: 2,
        // El contenido es el de `/galeria`; aquí solo se decide el corte.
        source_page: 'galeria',
      },
    },
    {
      page: 'inicio',
      type: 'gallery',
      order: 4,
      enabled: true,
      data: {
        title: 'Nuestro espacio',
        subtitle: 'Un vistazo al salón y a algunos de nuestros trabajos.',
        aspect_ratio: '4:5',
        columns_desktop: 3,
        limit: 6,
        source_page: 'galeria',
        more: { page: 'galeria', label: 'Ver la galería completa' },
      },
    },
    {
      page: 'inicio',
      type: 'team',
      order: 5,
      enabled: true,
      data: {
        title: 'Quién te atiende',
        subtitle: 'Profesionales titulados, con años de experiencia en el sector.',
        limit: 3,
        source_page: 'nosotros',
        more: { page: 'nosotros', label: 'Conócenos' },
      },
    },
    {
      page: 'inicio',
      type: 'testimonials',
      order: 6,
      enabled: true,
      data: {
        title: 'Lo que dicen nuestros clientes',
        show_ratings: true,
        // Testimonios ficticios, escritos a mano como en el panel real.
        items: [
          {
            id: 'preset-tst-1',
            quote:
              'Salí como nueva. El sitio es muy tranquilo y se nota que cuidan cada detalle de la sesión.',
            author_name: 'Cliente Ejemplo A.',
            service: 'Masaje relajante',
            rating: 5,
            enabled: true,
          },
          {
            id: 'preset-tst-2',
            quote: 'Me explicaron todo el tratamiento antes de empezar. Se agradece mucho.',
            author_name: 'Cliente Ejemplo B.',
            service: 'Limpieza facial profunda',
            rating: 5,
            enabled: true,
          },
          {
            id: 'preset-tst-3',
            quote: 'Puntualidad y muy buen trato. Repetiré seguro.',
            author_name: 'Cliente Ejemplo C.',
            rating: 4,
            enabled: true,
          },
        ],
      },
    },
    {
      page: 'inicio',
      type: 'faq',
      order: 7,
      enabled: true,
      data: {
        title: 'Antes de tu visita',
        subtitle: 'Las dudas que más nos preguntan.',
        limit: 3,
        source_page: 'nosotros',
        more: { page: 'nosotros', label: 'Ver todas las preguntas' },
      },
    },
    {
      page: 'inicio',
      type: 'contact',
      order: 8,
      enabled: true,
      data: {
        title: 'Dónde estamos',
        subtitle: 'Escríbenos o pásate por el salón.',
        show_whatsapp: true,
        show_phone: true,
        show_email: true,
        show_address: true,
        show_social: true,
        more: { page: 'contacto', label: 'Cómo llegar y horarios' },
      },
    },
    {
      page: 'inicio',
      type: 'booking_cta',
      order: 9,
      enabled: true,
      data: {
        title: 'Reserva tu cita',
        text: 'Atendemos con cita previa. Escríbenos por WhatsApp y te confirmamos la disponibilidad.',
        button_label: 'Reservar por WhatsApp',
      },
    },

    /* ------------------------------------------------------------- Servicios */
    {
      page: 'servicios',
      type: 'services',
      order: 1,
      enabled: true,
      data: {
        title: 'Servicios',
        subtitle: 'Todas las categorías, con precios y duraciones.',
        mode: 'full',
        summary_limit: 4,
        show_prices: true,
        show_durations: true,
        price_hidden_label: 'Consultar por WhatsApp',
        show_booking_button: true,
      },
    },
    {
      page: 'servicios',
      type: 'booking_cta',
      order: 2,
      enabled: true,
      data: {
        title: '¿No sabes cuál elegir?',
        text: 'Cuéntanos qué necesitas y te recomendamos el tratamiento más adecuado.',
        button_label: 'Escribir por WhatsApp',
      },
    },

    /* --------------------------------------------------------------- Nosotros */
    {
      page: 'nosotros',
      type: 'team',
      order: 1,
      enabled: true,
      data: {
        title: 'Nuestro equipo',
        subtitle: 'Profesionales titulados, con años de experiencia en el sector.',
        // Sin fotos a propósito: así se ve el avatar con iniciales, que es el
        // respaldo del bloque cuando el negocio todavía no tiene las imágenes.
        members: [
          {
            id: 'preset-team-1',
            name: 'Ana Ejemplo',
            role: 'Esteticista',
            bio: 'Especialista en tratamientos faciales y cuidado de la piel.',
            enabled: true,
          },
          {
            id: 'preset-team-2',
            name: 'Beto Ejemplo',
            role: 'Masajista',
            bio: 'Terapia manual y masaje descontracturante.',
            enabled: true,
          },
          {
            id: 'preset-team-3',
            name: 'Carla Ejemplo',
            role: 'Especialista en manos y pies',
            enabled: true,
          },
          {
            id: 'preset-team-4',
            name: 'Dani Ejemplo',
            role: 'Terapeuta corporal',
            bio: 'Masaje descontracturante y drenaje linfático.',
            enabled: true,
          },
        ],
      },
    },
    {
      page: 'nosotros',
      type: 'faq',
      order: 2,
      enabled: true,
      data: {
        title: 'Preguntas frecuentes',
        items: [
          {
            id: 'preset-faq-1',
            question: '¿Hace falta cita previa?',
            answer: 'Sí. Trabajamos con cita para poder dedicarte el tiempo completo.',
            enabled: true,
          },
          {
            id: 'preset-faq-2',
            question: '¿Cuánto dura una sesión?',
            answer:
              'Depende del tratamiento: entre 45 y 90 minutos.\nLa duración aparece junto a cada servicio.',
            enabled: true,
          },
          {
            id: 'preset-faq-3',
            question: '¿Cómo puedo pagar?',
            answer: 'Aceptamos efectivo y tarjeta. Te lo confirmamos al reservar.',
            enabled: true,
          },
          {
            id: 'preset-faq-4',
            question: '¿Y si tengo que cambiar o cancelar mi cita?',
            answer:
              'Avísanos por WhatsApp con al menos 24 horas. Así liberamos el hueco para otra persona y te buscamos otro día sin coste.',
            enabled: true,
          },
          {
            id: 'preset-faq-5',
            question: '¿Qué productos utilizan?',
            answer:
              'Marcas profesionales de cosmética y cuidado de la piel. Si tienes alguna alergia o sensibilidad, dínoslo al reservar y adaptamos el tratamiento.',
            enabled: true,
          },
        ],
      },
    },

    /* --------------------------------------------------------------- Contacto */
    {
      page: 'contacto',
      type: 'location_hours',
      order: 1,
      enabled: true,
      data: {
        title: 'Visítanos',
        subtitle: 'Estamos en el centro, con acceso fácil y aparcamiento cerca.',
        show_map: true,
        directions_label: 'Cómo llegar',
        hours_note: 'Atención con cita previa',
      },
    },
    {
      page: 'contacto',
      type: 'contact',
      order: 2,
      enabled: true,
      data: {
        title: 'Contáctanos',
        subtitle: 'Escríbenos o llámanos: te respondemos lo antes posible.',
        show_whatsapp: true,
        show_phone: true,
        show_email: true,
        show_address: true,
        show_social: true,
      },
    },

    /* ---------------------------------------------------------------- Galería */
    {
      page: 'galeria',
      type: 'gallery',
      order: 1,
      enabled: true,
      data: {
        title: 'Galería',
        subtitle: 'Nuestro espacio y algunos de nuestros trabajos.',
        aspect_ratio: '4:5',
        columns_desktop: 3,
        // Las imágenes las genera y sube `scripts/seed.mjs` (son degradados de color,
        // no fotos). Están para poder ver la cuadrícula y probar el visor ampliado.
        images: [
          {
            id: 'preset-gal-1',
            image: { path: 'gallery/preset-gal-1.png', alt: 'Sala de tratamientos (ejemplo)' },
            caption: 'Sala de tratamientos',
            enabled: true,
          },
          {
            id: 'preset-gal-2',
            image: { path: 'gallery/preset-gal-2.png', alt: 'Zona de recepción (ejemplo)' },
            caption: 'Recepción',
            enabled: true,
          },
          {
            id: 'preset-gal-3',
            image: { path: 'gallery/preset-gal-3.png', alt: 'Detalle de productos (ejemplo)' },
            enabled: true,
          },
          {
            id: 'preset-gal-4',
            image: { path: 'gallery/preset-gal-4.png', alt: 'Cabina de masaje (ejemplo)' },
            caption: 'Cabina de masaje',
            enabled: true,
          },
          {
            id: 'preset-gal-5',
            image: { path: 'gallery/preset-gal-5.png', alt: 'Rincón de espera (ejemplo)' },
            enabled: true,
          },
          {
            id: 'preset-gal-6',
            image: { path: 'gallery/preset-gal-6.png', alt: 'Detalle de decoración (ejemplo)' },
            caption: 'Detalles del espacio',
            enabled: true,
          },
          {
            id: 'preset-gal-7',
            image: { path: 'gallery/preset-gal-7.png', alt: 'Zona de manicura (ejemplo)' },
            caption: 'Manicura y pedicura',
            enabled: true,
          },
          {
            id: 'preset-gal-8',
            image: { path: 'gallery/preset-gal-8.png', alt: 'Toallas y ambientación (ejemplo)' },
            enabled: true,
          },
          {
            id: 'preset-gal-9',
            image: { path: 'gallery/preset-gal-9.png', alt: 'Pasillo de acceso (ejemplo)' },
            enabled: true,
          },
        ],
      },
    },
    {
      page: 'galeria',
      type: 'reels',
      order: 2,
      enabled: true,
      data: {
        title: 'Síguenos en redes',
        subtitle: 'Publicamos novedades y trabajos casi cada semana.',
        show_profile_links: true,
        // URLs de ejemplo: llevan al dominio correcto pero no a un reel real.
        items: [
          {
            id: 'preset-reel-1',
            platform: 'instagram',
            url: 'https://www.instagram.com/reel/EJEMPLO0001/',
            title: 'Antes y después de un facial',
            thumbnail: {
              path: 'reels/preset-reel-1.png',
              alt: 'Miniatura del reel de ejemplo 1',
            },
            enabled: true,
          },
          {
            id: 'preset-reel-2',
            platform: 'tiktok',
            url: 'https://www.tiktok.com/@ejemplo/video/0000000000000001',
            title: 'Rutina de cuidado en casa',
            thumbnail: {
              path: 'reels/preset-reel-2.png',
              alt: 'Miniatura del reel de ejemplo 2',
            },
            enabled: true,
          },
          {
            id: 'preset-reel-3',
            platform: 'instagram',
            url: 'https://www.instagram.com/reel/EJEMPLO0002/',
            title: 'Tratamiento facial paso a paso',
            thumbnail: {
              path: 'reels/preset-reel-3.png',
              alt: 'Miniatura del reel de ejemplo 3',
            },
            enabled: true,
          },
          {
            id: 'preset-reel-4',
            platform: 'tiktok',
            url: 'https://www.tiktok.com/@ejemplo/video/0000000000000002',
            title: 'Cuidar la piel en verano',
            thumbnail: {
              path: 'reels/preset-reel-4.png',
              alt: 'Miniatura del reel de ejemplo 4',
            },
            enabled: true,
          },
        ],
      },
    },
  ],
};

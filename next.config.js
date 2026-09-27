/**
 * Configuración de Next.js.
 *
 * Este archivo vive en la raíz porque Next.js exige `next.config.js` en el
 * directorio del proyecto. La lógica propia de la plantilla está en `core/`.
 *
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,

  // Las acciones del servidor aceptan 1 MB de cuerpo por defecto. La subida de imágenes comprime
  // en el navegador antes de enviar, así que el archivo que llega son decenas de KB; este margen
  // es la red de seguridad por si esa compresión no está disponible: mejor aceptar la foto y
  // guardarla que romper por tamaño sin poder explicarlo.
  experimental: {
    serverActions: { bodySizeLimit: '4mb' },
  },

  images: {
    // Supabase Storage sirve las imágenes públicas desde este prefijo.
    // Se usa comodín de hostname para no depender de leer .env.local aquí
    // (next.config.js se evalúa antes de cargar los archivos de entorno).
    formats: ['image/webp'],
    // Menos variantes que generar. Por defecto Next añade 2048 y 3840 px, y con fotos de 1600 px
    // de ancho como máximo esos dos anchos no se sirven nunca: solo alargan el `srcset` de cada
    // imagen (nueve entradas por foto en el HTML) y le piden al optimizador variantes que nadie
    // llega a descargar. Con la lista recortada, el HTML lleva las que se usan de verdad.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  // El panel no debe indexarse. El bloqueo definitivo de bots se completa en
  // robots.txt (Fase 1).
  async headers() {
    return [
      {
        source: '/admin/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];
  },
};

module.exports = nextConfig;

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

  images: {
    // Supabase Storage sirve las imágenes públicas desde este prefijo.
    // Se usa comodín de hostname para no depender de leer .env.local aquí
    // (next.config.js se evalúa antes de cargar los archivos de entorno).
    formats: ['image/webp'],
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

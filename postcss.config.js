/**
 * PostCSS también se resuelve desde la raíz del proyecto.
 * Solo contiene los dos plugins estándar de Tailwind; no hay lógica propia.
 */
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

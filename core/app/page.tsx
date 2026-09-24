/**
 * Página de Inicio (estructura de la Fase 0).
 *
 * En la Fase 0 solo se verifica que el sitio compila y carga. El contenido real
 * (bloque `hero` leído desde la base de datos) se implementa en la Fase 1.
 *
 * No consulta Supabase a propósito: así `npm run build` funciona antes de que
 * exista `.env.local`.
 *
 * OJO: esta página NO enlaza al panel. El panel es una URL privada que se
 * escribe a mano y no puede aparecer en ninguna página pública. Ver README,
 * "Cómo se mantiene oculto el panel".
 */
export default function HomePage() {
  return (
    <main className="section-y">
      <div className="container-page">
        <p className="text-sm uppercase tracking-[0.2em] text-text-muted">Plantilla base</p>
        <h1 className="mt-4 max-w-2xl">Tu momento de calma y bienestar</h1>
        <p className="mt-4 max-w-xl text-text-muted">
          Estructura inicial del proyecto. Las cinco páginas públicas y los diez bloques de
          contenido se implementan en la Fase 1.
        </p>
      </div>
    </main>
  );
}

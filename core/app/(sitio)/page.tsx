import BlockContainer from '@/components/BlockContainer';

/**
 * Página de Inicio.
 *
 * Todavía no itera bloques de la base de datos: el registro solo tiene `hero` y la
 * tabla `blocks` está vacía hasta que exista el seed (Fase 4). En cuanto estén los
 * diez bloques, esta página pasará a recorrer `getPublishedBlocksByPage('inicio')`
 * y a pintar cada uno con su componente.
 */
export default function HomePage() {
  return (
    <BlockContainer>
      <p className="text-sm uppercase tracking-[0.2em] text-text-muted">Plantilla base</p>
      <h1 className="mt-4 max-w-2xl">Tu momento de calma y bienestar</h1>
      <p className="mt-4 max-w-xl text-text-muted">
        Encabezado y pie ya activos. Faltan los bloques de contenido y las cuatro páginas
        restantes.
      </p>
    </BlockContainer>
  );
}

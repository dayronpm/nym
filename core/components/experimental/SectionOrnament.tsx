/**
 * EXPERIMENTO — adornos sueltos del río decorativo.
 *
 * El río en sí NO vive aquí: es una capa de fondo de la página (`.site-main::before`, en el
 * bloque EXPERIMENTO de `core/styles/globals.css`). Un solo trazo que baja de arriba abajo por
 * detrás de todas las secciones y de todo el contenido.
 *
 * Aquí solo van los **adornos sueltos** —estrellas de cuatro puntas pequenas y rellenas— que se
 * cuelan en los huecos entre secciones, alternando de lado. Los inserta `BlockRenderer` entre
 * bloque y bloque.
 *
 * ⚠️ PARA QUITARLO TODO: borra esta carpeta, el bloque EXPERIMENTO de `globals.css` y las dos
 * líneas marcadas con `EXPERIMENTO` en `core/components/BlockRenderer.tsx`.
 */

/** Estrella de cuatro puntas rellena, centrada en (0,0) y con radio 10. */
const STAR = 'M0-10C1.1-5 5-1.1 10 0C5 1.1 1.1 5 0 10C-1.1 5-5 1.1-10 0C-5-1.1-1.1-5 0-10Z';

function Star({ className }: { className?: string }) {
  return (
    <svg viewBox="-12 -12 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d={STAR} />
    </svg>
  );
}

/** `index` decide de qué lado caen los adornos, para que no salgan siempre igual. */
export default function SectionOrnament({ index = 0 }: { index?: number }) {
  const toLeft = index % 2 === 1;

  return (
    <div aria-hidden="true" className="container-page relative -my-6 h-24 text-primary">
      {toLeft ? (
        <>
          <Star className="absolute right-[7%] top-6 h-3 w-3 opacity-70" />
          <Star className="absolute right-[13%] top-14 h-2 w-2 opacity-50" />
          <Star className="absolute left-[10%] top-3 h-2.5 w-2.5 opacity-60" />
          <Star className="absolute left-[16%] top-12 h-1.5 w-1.5 opacity-40" />
        </>
      ) : (
        <>
          <Star className="absolute left-[7%] top-6 h-3 w-3 opacity-70" />
          <Star className="absolute left-[13%] top-14 h-2 w-2 opacity-50" />
          <Star className="absolute right-[10%] top-3 h-2.5 w-2.5 opacity-60" />
          <Star className="absolute right-[16%] top-12 h-1.5 w-1.5 opacity-40" />
        </>
      )}
    </div>
  );
}

import { rmSync } from 'node:fs';

/**
 * Borra el directorio de compilación `.next`.
 *
 * Hace falta más a menudo de lo que parece: Next guarda en `.next/types` los tipos
 * de cada ruta, y `tsconfig.json` los incluye. Si se mueve, renombra o elimina una
 * ruta, esos tipos quedan apuntando a archivos que ya no existen y `npm run
 * type-check` falla con un "Cannot find module" desconcertante.
 *
 * Escrito como script (y no como `node -e "..."` dentro de package.json) porque el
 * entrecomillado de un one-liner se rompe entre cmd y PowerShell.
 */
rmSync('.next', { recursive: true, force: true });
console.log('.next eliminado');

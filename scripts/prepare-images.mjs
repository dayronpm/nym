/**
 * Prepara las fotos de `imagenes-de-prueba/` para subirlas al bucket.
 *
 * Lee los originales (JPG, PNG o WebP), los deja como WebP de 1600 px de ancho como máximo y los
 * escribe en `imagenes-de-prueba/optimizadas/`. **Los originales no se tocan.**
 *
 * Es la misma receta que aplicará la subida desde el panel (Fase 2.5): 1600 px es más que
 * suficiente para el ancho máximo del sitio, y evita servir fotos de 4000 px que nadie llega a
 * ver. La calidad 75 en WebP es el punto habitual para fotografía: se nota muy poco en pantalla
 * y recorta el peso a la mitad respecto a un JPEG de cámara.
 *
 * Uso: node scripts/prepare-images.mjs
 */
import { mkdir, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

import sharp from 'sharp';

const INPUT = 'imagenes-de-prueba';
const OUTPUT = path.join(INPUT, 'optimizadas');
const MAX_WIDTH = 1600;
const QUALITY = 75;

const files = (await readdir(INPUT)).filter((name) => /\.(jpe?g|png|webp)$/i.test(name));

if (files.length === 0) {
  console.log(`No hay fotos en ${INPUT}/`);
  process.exit(0);
}

await mkdir(OUTPUT, { recursive: true });

for (const name of files) {
  const source = path.join(INPUT, name);
  const target = path.join(OUTPUT, `${path.parse(name).name}.webp`);

  // `.rotate()` sin argumentos respeta la orientación de la cámara (EXIF). Sin esto, las fotos
  // hechas con el móvil en vertical salen tumbadas en el navegador.
  const image = sharp(source).rotate();
  const original = await image.metadata();

  const result = await image
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(target);

  const before = Math.round((await stat(source)).size / 1024);
  const after = Math.round((await stat(target)).size / 1024);

  console.log(
    `${name.padEnd(22)} ${original.width}x${original.height} ${String(before).padStart(4)} KB` +
      `  ->  ${result.width}x${result.height} ${String(after).padStart(4)} KB`,
  );
}

console.log(`\n${files.length} foto(s) listas en ${OUTPUT}/`);

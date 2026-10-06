/**
 * Añade fotos sueltas a la galería del sitio.
 *
 *   node --env-file=.env.local scripts/gallery-photos.mjs
 *
 * Toma las fotos de `SOURCES`, las deja como WebP de 1600 px de ancho (la misma receta que
 * `prepare-images.mjs` y que la subida del panel: 1600 px es más que suficiente para el ancho
 * máximo del sitio, y la calidad 75 en WebP apenas se nota y recorta el peso a la mitad), las
 * sube al bucket `media` y las registra en la tabla `media`.
 *
 * Después las inserta al final del bloque `gallery` de la página `galeria`, donde el panel ya
 * permite activarlas, desactivarlas, reordenarlas o borrarlas sin tocar código.
 *
 * Es idempotente: si una ruta ya está en el bloque, se actualiza en su sitio en vez de duplicarla.
 * Los originales de `imagenes-de-prueba/` no se tocan.
 */
import { randomUUID } from 'node:crypto';
import { basename } from 'node:path';

import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';

/* -------------------------------------------------------------------------- */
/* Qué se sube                                                                 */
/* -------------------------------------------------------------------------- */

const SOURCES = [
  {
    file: 'imagenes-de-prueba/WhatsApp Image 2026-10-03 at 1.54.57 PM.jpeg',
    path: 'gallery/depilacion-cera-tibia.webp',
    alt: 'Depilación con cera tibia en N&M Salón Spa',
    caption: 'Depilación con cera tibia',
  },
  {
    file: 'imagenes-de-prueba/WhatsApp Image 2026-10-03 at 1.54.56 PM.jpeg',
    path: 'gallery/dermapen-talento.webp',
    alt: 'Ilustración de una sesión de dermapen con un mensaje motivacional',
    caption: 'Facial con Dermapen',
  },
];

const PAGE = 'galeria';
const BLOCK_TYPE = 'gallery';
const MAX_WIDTH = 1600;
const QUALITY = 75;

/* -------------------------------------------------------------------------- */
/* 1. Credenciales                                                             */
/* -------------------------------------------------------------------------- */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !secretKey) {
  console.error('\n  ✖ Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SECRET_KEY en .env.local.\n');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, secretKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});

/* -------------------------------------------------------------------------- */
/* 2. Optimizar y subir cada foto                                              */
/* -------------------------------------------------------------------------- */

for (const source of SOURCES) {
  // `.rotate()` sin argumentos respeta la orientación EXIF: sin esto, las fotos hechas con el
  // móvil en vertical salen tumbadas en el navegador.
  const webp = await sharp(source.file)
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toBuffer();

  const { error: uploadError } = await supabase.storage
    .from('media')
    .upload(source.path, webp, { contentType: 'image/webp', upsert: true });

  if (uploadError) {
    console.error(`\n  ✖ No se pudo subir "${source.path}": ${uploadError.message}\n`);
    process.exit(1);
  }

  const { error: mediaError } = await supabase.from('media').upsert(
    {
      path: source.path,
      filename: basename(source.path),
      content_type: 'image/webp',
      size_bytes: webp.length,
    },
    { onConflict: 'path' },
  );

  if (mediaError) {
    console.error(`\n  ✖ No se pudo registrar "${source.path}": ${mediaError.message}\n`);
    process.exit(1);
  }

  console.log(`  ✔ ${source.path} (${Math.round(webp.length / 1024)} KB)`);
}

/* -------------------------------------------------------------------------- */
/* 3. Insertar en el bloque de galería                                         */
/* -------------------------------------------------------------------------- */

const { data: blocks, error: readError } = await supabase
  .from('blocks')
  .select('id, data')
  .eq('page', PAGE)
  .eq('type', BLOCK_TYPE)
  .order('order')
  .limit(1);

if (readError || !blocks?.length) {
  console.error(`\n  ✖ No se encontró el bloque ${BLOCK_TYPE} de ${PAGE}: ${readError?.message ?? 'sin filas'}\n`);
  process.exit(1);
}

const block = blocks[0];
const data = block.data;
const images = Array.isArray(data.images) ? data.images : [];

for (const source of SOURCES) {
  const entry = {
    id: randomUUID(),
    image: { path: source.path, alt: source.alt },
    ...(source.caption ? { caption: source.caption } : {}),
    enabled: true,
  };

  const existing = images.findIndex((image) => image?.image?.path === source.path);
  if (existing >= 0) {
    // Conserva el id y el orden ya establecidos: solo refresca alt y caption.
    images[existing] = { ...images[existing], image: entry.image, caption: entry.caption };
  } else {
    images.push(entry);
  }
}

data.images = images;

const { error: saveError } = await supabase
  .from('blocks')
  .update({ data, updated_at: new Date().toISOString() })
  .eq('id', block.id);

if (saveError) {
  console.error(`\n  ✖ No se pudo actualizar el bloque: ${saveError.message}\n`);
  process.exit(1);
}

console.log(`\n  ${SOURCES.length} foto(s) subidas. La galería tiene ahora ${images.length} imagen(es).\n`);

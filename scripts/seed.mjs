/**
 * Carga el preset "Spa" (contenido de ejemplo neutro) en el proyecto de Supabase.
 *
 *   npm run seed          # con ALLOW_SEED_RESET=true en el entorno
 *
 * Se ejecuta con Node directamente: Node 22.18+ borra los tipos de TypeScript por
 * su cuenta, así que este script puede importar `core/presets/spa.ts` sin necesidad
 * de un transpilador. El preset solo usa `import type`, que Node elimina sin
 * resolver: precisamente para que no tropiece con los alias `@/`.
 *
 * GUARDA DE SEGURIDAD (la pide el plan): el seed BORRA los bloques existentes. Para
 * que eso no ocurra por accidente en el proyecto de un cliente con contenido real,
 * exige la variable `ALLOW_SEED_RESET=true`. Si falta, no hace nada.
 *
 * Usa la clave SECRETA, que omite RLS. Es un script de línea de comandos: nunca
 * debe llegar al navegador ni a un route handler.
 */
import { createClient } from '@supabase/supabase-js';

import { SPA_PRESET } from '../core/presets/spa.ts';
import { createPlaceholderPng } from './placeholder-image.mjs';

const RESET_FLAG = 'ALLOW_SEED_RESET';

function abort(message) {
  console.error(`\n  ✖ ${message}\n`);
  process.exit(1);
}

/* -------------------------------------------------------------------------- */
/* 1. Guarda de seguridad                                                      */
/* -------------------------------------------------------------------------- */

if (process.env[RESET_FLAG] !== 'true') {
  abort(
    [
      'El seed borra los bloques existentes, así que exige permiso explícito.',
      '',
      '  Vuelve a lanzarlo así (sin tocar .env.local):',
      '',
      '    PowerShell:  $env:ALLOW_SEED_RESET=\'true\'; npm run seed',
      '',
      '  Y quita la variable del entorno de producción cuando termines.',
    ].join('\n  '),
  );
}

/* -------------------------------------------------------------------------- */
/* 2. Credenciales                                                             */
/* -------------------------------------------------------------------------- */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl) abort('Falta NEXT_PUBLIC_SUPABASE_URL. ¿Se pasó --env-file=.env.local?');
if (!secretKey) abort('Falta SUPABASE_SECRET_KEY en .env.local.');

const supabase = createClient(supabaseUrl, secretKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});

/* -------------------------------------------------------------------------- */
/* 3. Limpieza                                                                 */
/* -------------------------------------------------------------------------- */

// Se borran los bloques: el preset define el contenido completo de las páginas.
// `not('id','is',null)` es la forma de decir "todas las filas" que exige PostgREST,
// que no permite un delete sin filtro.
const { error: deleteError } = await supabase.from('blocks').delete().not('id', 'is', null);
if (deleteError) abort(`No se pudieron borrar los bloques: ${deleteError.message}`);

// `media` NO se toca: la tabla solo registra archivos subidos, y borrar sus filas
// sin borrar los objetos del bucket dejaría archivos huérfanos. El seed no sube
// imágenes, así que no hace falta.

/* -------------------------------------------------------------------------- */
/* 4. Imágenes de ejemplo                                                      */
/* -------------------------------------------------------------------------- */

// El preset declara las rutas de las imágenes que necesita; aquí se materializan. Si
// el archivo no está en el bucket, se genera un PNG de ejemplo y se sube. Así el
// contenido de prueba es reproducible sin guardar binarios en el repositorio.
const imagePaths = new Map();
for (const category of SPA_PRESET.siteSettings.services_catalog.categories) {
  for (const item of category.items) {
    if (item.image) imagePaths.set(item.image.path, item.image.alt);
  }
}

// Se pregunta al bucket qué hay ya, para no volver a subir lo mismo en cada seed.
const folders = [...new Set([...imagePaths.keys()].map((path) => path.split('/')[0]))];
const presentInBucket = new Set();
for (const folder of folders) {
  const { data: objects } = await supabase.storage.from('media').list(folder);
  for (const object of objects ?? []) presentInBucket.add(`${folder}/${object.name}`);
}

let uploadedCount = 0;
for (const path of imagePaths.keys()) {
  if (presentInBucket.has(path)) continue;

  const png = createPlaceholderPng({ path });

  const { error: uploadError } = await supabase.storage
    .from('media')
    .upload(path, png, { contentType: 'image/png', upsert: true });

  if (uploadError) abort(`No se pudo subir la imagen "${path}": ${uploadError.message}`);

  // Se registra en `media` igual que hará el panel al subir una imagen.
  const { error: mediaError } = await supabase.from('media').upsert(
    {
      path,
      filename: path.split('/').pop(),
      content_type: 'image/png',
      size_bytes: png.length,
    },
    { onConflict: 'path' },
  );

  if (mediaError) abort(`No se pudo registrar la imagen "${path}": ${mediaError.message}`);

  uploadedCount += 1;
}

/* -------------------------------------------------------------------------- */
/* 5. Configuración del sitio                                                  */
/* -------------------------------------------------------------------------- */

// Se actualiza la fila única en lugar de recrearla: así `theme` y `hours` quedan
// tal como los dejó la migración (y como los haya editado el dueño desde el panel).
const { error: settingsError } = await supabase
  .from('site_settings')
  .update({
    brand: SPA_PRESET.siteSettings.brand,
    contact: SPA_PRESET.siteSettings.contact,
    services_catalog: SPA_PRESET.siteSettings.services_catalog,
    updated_at: new Date().toISOString(),
  })
  .eq('id', 1);

if (settingsError) abort(`No se pudo actualizar la configuración: ${settingsError.message}`);

/* -------------------------------------------------------------------------- */
/* 6. Páginas                                                                  */
/* -------------------------------------------------------------------------- */

// Las cinco filas ya existen: las creó la migración 000. Aquí solo se rellenan el
// título y la descripción que usa el SEO.
for (const page of SPA_PRESET.pages) {
  const { error } = await supabase
    .from('pages')
    .update({ title: page.title, meta_description: page.meta_description })
    .eq('slug', page.slug);

  if (error) abort(`No se pudo actualizar la página "${page.slug}": ${error.message}`);
}

/* -------------------------------------------------------------------------- */
/* 7. Bloques                                                                  */
/* -------------------------------------------------------------------------- */

const blockRows = SPA_PRESET.blocks.map((block) => ({
  page: block.page,
  type: block.type,
  order: block.order,
  enabled: block.enabled,
  data: block.data,
  version: 1,
}));

const { data: inserted, error: insertError } = await supabase
  .from('blocks')
  .insert(blockRows)
  .select('id, page, type');

if (insertError) abort(`No se pudieron insertar los bloques: ${insertError.message}`);

/* -------------------------------------------------------------------------- */
/* 8. Resumen                                                                  */
/* -------------------------------------------------------------------------- */

const byPage = new Map();
for (const row of inserted ?? []) {
  byPage.set(row.page, [...(byPage.get(row.page) ?? []), row.type]);
}

console.log('\n  ✔ Preset "Spa" cargado\n');
console.log(`    Páginas actualizadas:   ${SPA_PRESET.pages.length}`);
console.log(`    Bloques insertados:     ${inserted?.length ?? 0}`);
console.log(`    Imágenes de ejemplo:    ${uploadedCount} subidas (el resto ya estaban)`);
console.log(
  `    Categorías de servicio: ${SPA_PRESET.siteSettings.services_catalog.categories.length}`,
);
console.log('\n    Reparto por página:');
for (const [page, types] of byPage) {
  console.log(`      ${page.padEnd(10)} ${types.join(', ')}`);
}
console.log(
  '\n    Recordatorio: quita ALLOW_SEED_RESET del entorno de producción si lo pusiste.\n',
);

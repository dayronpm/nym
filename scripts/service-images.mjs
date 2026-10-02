/**
 * Imágenes de ejemplo de los servicios, dibujadas por código.
 *
 *   node --env-file=.env.local scripts/service-images.mjs
 *
 * Genera ilustraciones vectoriales (SVG) con la paleta de la marca, las rasteriza a
 * WebP con `sharp` y las sube al bucket `media`, registrándolas en la tabla `media`
 * igual que hace el panel. Después asigna cada imagen a su servicio en
 * `site_settings.services_catalog`.
 *
 * Por qué a mano y no una foto: son imágenes **de relleno** para que el catálogo se
 * vea con la estética del sitio antes de que el negocio suba sus fotos reales. El
 * dibujo va en la paleta de la marca (esmeralda, marfil, oro), así que no desentona.
 *
 * Es aditivo: no borra nada. Sube (con `upsert`) y actualiza el catálogo. Volver a
 * lanzarlo regenera lo mismo de forma determinista.
 */
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';

/* -------------------------------------------------------------------------- */
/* Paleta de la marca                                                          */
/* -------------------------------------------------------------------------- */

const INK = '#113024';
const EMERALD = '#1F7A4D';
const EMERALD_LIGHT = '#2E9A65';
const GOLD = '#D9B45F';
const GOLD_DEEP = '#A8802F';
const CREAM = '#F6F1E7';
const IVORY = '#FBF9F4';
const SKIN = '#EAC9B4';

/** Acentos que se rotan para variar el matiz entre servicios del mismo tema. */
const ACCENTS = [EMERALD, GOLD_DEEP, EMERALD_LIGHT, '#2A4A3A', '#3B7A5E', '#B98F3E'];

/* -------------------------------------------------------------------------- */
/* Motivos (SVG, ya centrados alrededor de 600x400)                            */
/* -------------------------------------------------------------------------- */

/** Pétalo apuntado, reutilizado por el loto y por las hojas. */
function petal(length) {
  const w = length * 0.32;
  return `M0,${-length} C ${w},${-length * 0.5} ${w},${length * 0.5} 0,${length} C ${-w},${length * 0.5} ${-w},${-length * 0.5} 0,${-length}Z`;
}

const MOTIFS = {
  /** Loto: bienestar, blanqueamiento. */
  lotus: () => `
    <g transform="translate(600 420)">
      <g fill="${EMERALD}" opacity="0.9">
        <path d="${petal(150)}" transform="rotate(-58)"/>
        <path d="${petal(150)}" transform="rotate(58)"/>
      </g>
      <g fill="${EMERALD_LIGHT}">
        <path d="${petal(165)}" transform="rotate(-30)"/>
        <path d="${petal(165)}" transform="rotate(30)"/>
      </g>
      <path d="${petal(185)}" fill="${GOLD}"/>
      <circle r="30" fill="${GOLD_DEEP}"/>
      <circle r="14" fill="${IVORY}"/>
      <path d="M-260 180 C -120 215 120 215 260 180" fill="none" stroke="${EMERALD}" stroke-width="6" opacity="0.5" stroke-linecap="round"/>
    </g>`,

  /** Piedras calientes: masajes. */
  stones: () => `
    <g transform="translate(600 430)">
      <ellipse cy="95" rx="185" ry="62" fill="#2A4A3A"/>
      <ellipse cy="38" rx="148" ry="54" fill="${EMERALD}"/>
      <ellipse cy="-14" rx="110" ry="46" fill="${EMERALD_LIGHT}"/>
      <ellipse cx="-42" cy="-30" rx="36" ry="15" fill="${IVORY}" opacity="0.35"/>
      <ellipse cx="-30" cy="30" rx="44" ry="16" fill="${IVORY}" opacity="0.22"/>
      <path d="M150 -120 C 205 -175 285 -170 300 -120 C 250 -70 190 -75 150 -120Z" fill="${GOLD}"/>
      <path d="M162 -118 C 205 -122 252 -112 292 -126" fill="none" stroke="${IVORY}" stroke-width="4" opacity="0.7"/>
    </g>`,

  /** Gota de agua con ondas: hidratación, drenaje, desintoxicación. */
  droplet: () => `
    <g transform="translate(600 370)">
      <path d="M0,-185 C 70,-75 132,-12 132,60 C 132,142 60,203 0,203 C -60,203 -132,142 -132,60 C -132,-12 -70,-75 0,-185Z" fill="${EMERALD}"/>
      <path d="M-58,-45 C -96,28 -92,112 -42,168" fill="none" stroke="${IVORY}" stroke-width="13" opacity="0.45" stroke-linecap="round"/>
      <ellipse cy="220" rx="172" ry="36" fill="none" stroke="${EMERALD_LIGHT}" stroke-width="6" opacity="0.6"/>
      <ellipse cy="220" rx="112" ry="22" fill="none" stroke="${EMERALD_LIGHT}" stroke-width="5" opacity="0.4"/>
      <g fill="${GOLD}">
        <circle cx="-150" cy="-90" r="9"/><circle cx="156" cy="-60" r="7"/>
        <circle cx="-120" cy="140" r="7"/><circle cx="140" cy="120" r="9"/>
      </g>
    </g>`,

  /** Reloj de arena: masajes reductores (contorno de la cintura). */
  contour: () => `
    <g transform="translate(600 400)">
      <path d="M-120,-180 C -40,-60 -40,60 -120,180 L 120,180 C 40,60 40,-60 120,-180 Z" fill="${EMERALD}"/>
      <path d="M-96,-150 C -30,-55 -30,55 -96,150" fill="none" stroke="${IVORY}" stroke-width="7" opacity="0.4"/>
      <g fill="none" stroke="${GOLD}" stroke-width="6" opacity="0.85" stroke-linecap="round">
        <path d="M-190,-150 C -215,-50 -215,50 -190,150"/>
        <path d="M190,-150 C 215,-50 215,50 190,150"/>
      </g>
    </g>`,

  /** Hoja con venas: exfoliación, faciales. */
  leaf: () => `
    <g transform="translate(600 410)">
      <path d="M0,-195 C 138,-128 138,128 0,195 C -138,128 -138,-128 0,-195Z" fill="${EMERALD}"/>
      <path d="M0,-180 L 0,180" stroke="${IVORY}" stroke-width="7" opacity="0.8"/>
      <g stroke="${IVORY}" stroke-width="5" opacity="0.5" stroke-linecap="round">
        <path d="M0,-120 L 82,-66"/><path d="M0,-66 L 96,-8"/><path d="M0,-10 L 82,50"/>
        <path d="M0,-120 L -82,-66"/><path d="M0,-66 L -96,-8"/><path d="M0,-10 L -82,50"/>
      </g>
    </g>`,

  /** Frasco de esmalte: manicura. */
  polish: () => `
    <g transform="translate(600 400)">
      <rect x="-30" y="-235" width="60" height="96" rx="12" fill="${GOLD_DEEP}"/>
      <rect x="-20" y="-140" width="40" height="34" fill="#2A4A3A"/>
      <path d="M-84 55 C -84 -55 -34 -92 -34 -92 L 34 -92 C 34 -92 84 -55 84 55 C 84 130 42 165 0 165 C -42 165 -84 130 -84 55Z" fill="${EMERALD}"/>
      <path d="M-72 30 C -62 100 -32 143 0 143 C 32 143 62 100 72 30Z" fill="${EMERALD_LIGHT}"/>
      <path d="M-54 -34 C -64 8 -62 62 -44 104" fill="none" stroke="${IVORY}" stroke-width="10" opacity="0.4" stroke-linecap="round"/>
    </g>`,

  /** Huella con uñas pintadas: pedicura. */
  foot: () => `
    <g transform="translate(600 400)">
      <ellipse cx="0" cy="45" rx="112" ry="152" fill="${SKIN}"/>
      <circle cx="-118" cy="-118" r="42" fill="${SKIN}"/>
      <circle cx="-45" cy="-165" r="31" fill="${SKIN}"/>
      <circle cx="12" cy="-182" r="27" fill="${SKIN}"/>
      <circle cx="62" cy="-172" r="22" fill="${SKIN}"/>
      <circle cx="100" cy="-144" r="18" fill="${SKIN}"/>
      <ellipse cx="-118" cy="-122" rx="20" ry="16" fill="${EMERALD}"/>
      <ellipse cx="-45" cy="-170" rx="15" ry="12" fill="${GOLD_DEEP}"/>
      <ellipse cx="12" cy="-187" rx="13" ry="10" fill="${EMERALD_LIGHT}"/>
      <ellipse cx="62" cy="-176" rx="11" ry="9" fill="${GOLD_DEEP}"/>
      <ellipse cx="100" cy="-147" rx="9" ry="7" fill="${EMERALD}"/>
    </g>`,

  /** Cuentagotas de sérum: tratamientos faciales. */
  serum: () => `
    <g transform="translate(600 415)">
      <rect x="-28" y="-240" width="56" height="74" rx="10" fill="${INK}"/>
      <rect x="-17" y="-172" width="34" height="46" rx="6" fill="${GOLD_DEEP}"/>
      <rect x="-26" y="-128" width="52" height="28" rx="6" fill="#2A4A3A"/>
      <path d="M-78 55 C -78 -55 -28 -98 -28 -98 L 28 -98 C 28 -98 78 -55 78 55 C 78 130 38 162 0 162 C -38 162 -78 130 -78 55Z" fill="${EMERALD_LIGHT}"/>
      <path d="M-66 30 C -56 96 -28 140 0 140 C 28 140 56 96 66 30Z" fill="${EMERALD}"/>
      <path d="M-48 -40 C -58 0 -56 54 -38 96" fill="none" stroke="${IVORY}" stroke-width="10" opacity="0.4" stroke-linecap="round"/>
      <circle cy="-200" r="11" fill="${GOLD}"/>
      <circle cy="-160" r="7" fill="${GOLD}" opacity="0.8"/>
    </g>`,

  /** Destellos: rejuvenecimiento. */
  sparkle: () => `
    <g transform="translate(600 400)">
      <path d="M0,-190 C 22,-70 70,-22 190,0 C 70,22 22,70 0,190 C -22,70 -70,22 -190,0 C -70,-22 -22,-70 0,-190Z" fill="${GOLD}"/>
      <path d="M0,-96 C 12,-36 36,-12 96,0 C 36,12 12,36 0,96 C -12,36 -36,12 -96,0 C -36,-12 -12,-36 0,-96Z" fill="${IVORY}" opacity="0.65"/>
      <g fill="${EMERALD_LIGHT}">
        <path d="M210,-150 C 218,-120 238,-100 268,-92 C 238,-84 218,-64 210,-34 C 202,-64 182,-84 152,-92 C 182,-100 202,-120 210,-150Z"/>
        <path d="M-215,120 C -208,146 -190,164 -164,171 C -190,178 -208,196 -215,222 C -222,196 -240,178 -266,171 C -240,164 -222,146 -215,120Z"/>
      </g>
    </g>`,
};

/* -------------------------------------------------------------------------- */
/* Composición de la ilustración                                               */
/* -------------------------------------------------------------------------- */

/** Envuelve el motivo con el marco común (fondo, medallón, hojas de esquina). */
function illustration({ motif, accent }) {
  const inner = MOTIFS[motif]();
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${IVORY}"/>
        <stop offset="1" stop-color="${CREAM}"/>
      </linearGradient>
      <radialGradient id="glow" cx="0.5" cy="0.44" r="0.62">
        <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.95"/>
        <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="1200" height="800" fill="url(#bg)"/>
    <rect width="1200" height="800" fill="url(#glow)"/>
    <circle cx="600" cy="400" r="336" fill="#FFFFFF" opacity="0.6"/>
    <circle cx="600" cy="400" r="336" fill="none" stroke="${GOLD}" stroke-width="2.5" opacity="0.55"/>
    <circle cx="600" cy="400" r="310" fill="none" stroke="${accent}" stroke-width="1.6" opacity="0.35" stroke-dasharray="2 11"/>
    <path d="M96 96 C 178 128 232 200 244 288 C 158 254 106 182 96 96Z" fill="${accent}" opacity="0.2"/>
    <path d="M1104 96 C 1022 128 968 200 956 288 C 1042 254 1094 182 1104 96Z" fill="${accent}" opacity="0.2"/>
    <path d="M96 704 C 178 672 232 600 244 512 C 158 546 106 618 96 704Z" fill="${accent}" opacity="0.14"/>
    <path d="M1104 704 C 1022 672 968 600 956 512 C 1042 546 1094 618 1104 704Z" fill="${accent}" opacity="0.14"/>
    ${inner}
  </svg>`;
}

/* -------------------------------------------------------------------------- */
/* Qué imagen lleva cada servicio                                             */
/* -------------------------------------------------------------------------- */

/**
 * Motivo por servicio. `null`-libre a propósito: el orden del array fija también el
 * acento, así que dos servicios del mismo tema salen con un matiz distinto (variedad
 * sin repetir el dibujo exacto).
 */
const MOTIF_BY_ID = {
  'srv-polygel': 'polish',
  'srv-rubber': 'polish',
  'srv-builder': 'polish',
  'srv-manos-semipermanente': 'polish',
  'srv-manicura-regular': 'polish',
  'srv-pedicura-semipermanente': 'foot',
  'srv-pedicura-regular': 'foot',
  'srv-caballero': 'lotus',
  'srv-masajes-relajantes-deportivos': 'stones',
  'srv-drenaje-linfatico-descontracturante': 'droplet',
  'srv-masajes-reductores': 'contour',
  'srv-desintoxicacion-ionica': 'droplet',
  'srv-blanqueamiento-corporal': 'lotus',
  'srv-exfoliacion-corporal': 'leaf',
  'srv-facial-profundo': 'serum',
  'srv-hidratacion-dermapen': 'droplet',
  'srv-rejuvenecimiento-dermapen': 'sparkle',
};

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
/* 2. Catálogo actual                                                          */
/* -------------------------------------------------------------------------- */

const { data: settingsRow, error: readError } = await supabase
  .from('site_settings')
  .select('services_catalog')
  .eq('id', 1)
  .single();

if (readError) {
  console.error(`\n  ✖ No se pudo leer el catálogo: ${readError.message}\n`);
  process.exit(1);
}

const catalog = settingsRow.services_catalog;
let generated = 0;

/* -------------------------------------------------------------------------- */
/* 3. Generar, subir y asignar                                                 */
/* -------------------------------------------------------------------------- */

for (const category of catalog.categories) {
  for (const service of category.items) {
    const motif = MOTIF_BY_ID[service.id];
    if (!motif) continue;

    const accent = ACCENTS[generated % ACCENTS.length];
    const svg = illustration({ motif, accent });

    const webp = await sharp(Buffer.from(svg))
      .resize(1200, 800)
      .webp({ quality: 82 })
      .toBuffer();

    const path = `services/${service.id}.webp`;

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(path, webp, { contentType: 'image/webp', upsert: true });

    if (uploadError) {
      console.error(`\n  ✖ No se pudo subir "${path}": ${uploadError.message}\n`);
      process.exit(1);
    }

    const { error: mediaError } = await supabase.from('media').upsert(
      {
        path,
        filename: `${service.id}.webp`,
        content_type: 'image/webp',
        size_bytes: webp.length,
      },
      { onConflict: 'path' },
    );

    if (mediaError) {
      console.error(`\n  ✖ No se pudo registrar "${path}": ${mediaError.message}\n`);
      process.exit(1);
    }

    service.image = { path, alt: `Ilustración de ${service.name}` };
    generated += 1;
    console.log(`  ✔ ${motif.padEnd(8)} -> ${path}`);
  }
}

/* -------------------------------------------------------------------------- */
/* 4. Guardar el catálogo                                                      */
/* -------------------------------------------------------------------------- */

const { error: saveError } = await supabase
  .from('site_settings')
  .update({ services_catalog: catalog, updated_at: new Date().toISOString() })
  .eq('id', 1);

if (saveError) {
  console.error(`\n  ✖ No se pudo guardar el catálogo: ${saveError.message}\n`);
  process.exit(1);
}

console.log(`\n  ${generated} imagen(es) generadas y asignadas al catálogo.\n`);

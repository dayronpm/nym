import { deflateSync } from 'node:zlib';

/**
 * Generador de imágenes de ejemplo en PNG.
 *
 * Sirve para que el contenido de prueba del preset tenga algo que mostrar sin
 * depender de fotos reales: sin imágenes, la galería desaparece por completo y las
 * tarjetas de servicios quedan planas.
 *
 * Cómo funciona: se escribe el PNG a mano (cabecera + IHDR + IDAT + IEND) usando
 * `node:zlib` para comprimir. No se añade ninguna dependencia de imágenes: no merece
 * la pena instalar un codificador para generar rectángulos de color.
 *
 * El color se deriva de la propia ruta del archivo, así que la misma ruta produce
 * siempre la misma imagen. Es determinista y reproducible: el seed puede regenerar
 * los placeholders sin que cambien.
 *
 * OJO: son PNG, no WebP. Es una excepción deliberada y limitada al contenido de
 * ejemplo; las imágenes que sube el panel en la Fase 2 sí se comprimirán a WebP en el
 * navegador, como manda el plan.
 */

/** Tonos cálidos del tema, en pares (claro -> oscuro). */
const PALETTES = [
  ['#F3EDE4', '#D8C6B2'],
  ['#F1DDD2', '#D6A88E'],
  ['#EDE7DC', '#C4B29B'],
  ['#E8DED2', '#B39475'],
  ['#F5EFE6', '#D2BFA8'],
  ['#EADFD3', '#BC9A7C'],
  ['#F0E6DA', '#C6A98C'],
  ['#E4DCD2', '#AE9880'],
];

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let value = n;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[n] = value;
  }
  return table;
})();

function crc32(buffer) {
  let crc = -1;
  for (let index = 0; index < buffer.length; index += 1) {
    crc = CRC_TABLE[(crc ^ buffer[index]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ -1) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);

  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData), 0);

  return Buffer.concat([length, typeAndData, crc]);
}

function hexToRgb(hex) {
  const value = hex.replace('#', '');
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ];
}

function hashString(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

/**
 * Genera un PNG RGB con un degradado diagonal suave y un brillo tenue arriba a la
 * izquierda. Suficiente para que se lea como "aquí va una foto" sin parecer un error.
 */
export function createPlaceholderPng({ path, width = 900, height = 600 }) {
  const [fromHex, toHex] = PALETTES[hashString(path) % PALETTES.length];
  const from = hexToRgb(fromHex);
  const to = hexToRgb(toHex);

  // Fila completa + su byte de filtro (0 = sin filtro) por cada línea de píxeles.
  const stride = 1 + width * 3;
  const raw = Buffer.alloc(height * stride);

  for (let y = 0; y < height; y += 1) {
    const rowStart = y * stride;
    raw[rowStart] = 0;

    for (let x = 0; x < width; x += 1) {
      const t = (x / (width - 1)) * 0.45 + (y / (height - 1)) * 0.55;

      // Brillo suave arriba a la izquierda, para que no sea un rectángulo plano.
      const dx = (x - width * 0.3) / width;
      const dy = (y - height * 0.25) / height;
      const glow = Math.max(0, 1 - (dx * dx + dy * dy) * 5) * 0.22;

      const offset = rowStart + 1 + x * 3;
      for (let channel = 0; channel < 3; channel += 1) {
        const base = from[channel] + (to[channel] - from[channel]) * t;
        raw[offset + channel] = Math.min(255, Math.round(base + glow * 255));
      }
    }
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8; // bits por canal
  header[9] = 2; // color: RGB
  header[10] = 0; // compresión: deflate
  header[11] = 0; // filtro: estándar
  header[12] = 0; // sin entrelazado

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

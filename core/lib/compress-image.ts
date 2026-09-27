/**
 * Compresión de una imagen en el navegador, antes de subirla.
 *
 * Se hace aquí y no en el servidor por dos motivos: el archivo no viaja entero (una foto de
 * móvil son 3-5 MB y las acciones del servidor tienen un límite de cuerpo mucho menor) y no
 * hace falta ninguna dependencia nativa en el servidor para algo que el navegador ya sabe hacer.
 *
 * La receta es la misma que la del script `scripts/prepare-images.mjs`: WebP, 1600 px de ancho
 * como máximo y calidad 75. Si cambia una, tiene que cambiar la otra: es la promesa que se le
 * hace al dueño ("las fotos que subes ya vienen optimizadas").
 */

const MAX_WIDTH = 1600;
const QUALITY = 0.75;

export interface CompressedImage {
  blob: Blob;
  /** Ancho y alto finales, para poder contarlo en la interfaz. */
  width: number;
  height: number;
  /** Tamaño en KB, para enseñarlo antes y después. */
  kb: number;
}

/** Carga el archivo en un `<img>` para poder dibujarlo en el canvas. */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('No se pudo leer la imagen.'));
    };

    image.src = url;
  });
}

/**
 * Comprime un archivo de imagen.
 *
 * Si el navegador no sabe escribir WebP (raro hoy) el canvas devuelve `null` y se lanza un
 * error: es preferible decirlo a subir un archivo con la extensión equivocada.
 */
export async function compressImage(file: File): Promise<CompressedImage> {
  const image = await loadImage(file);

  const scale = Math.min(1, MAX_WIDTH / image.naturalWidth);
  const width = Math.round(image.naturalWidth * scale);
  const height = Math.round(image.naturalHeight * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) throw new Error('El navegador no pudo preparar la imagen.');

  // El fondo blanco es por las fotos con transparencia: el WebP la conserva, pero una PNG con
  // zonas transparentes acaba viéndose negra en algunos visores si no se rellena.
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/webp', QUALITY),
  );

  if (!blob) throw new Error('El navegador no pudo convertir la imagen a WebP.');

  return { blob, width, height, kb: Math.round(blob.size / 1024) };
}

/** Nombre del archivo sin extensión, para proponer un texto alternativo. */
export function baseNameOf(file: File): string {
  return file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ');
}

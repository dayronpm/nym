import MediaLibrary, { type MediaFolderGroup } from '@/components/admin/MediaLibrary';
import { MEDIA_FOLDERS } from '@/blocks/shared';
import { createSupabaseServerClient } from '@/data/supabase';

/**
 * Imágenes del bucket.
 *
 * Es el catálogo de lo que ya está subido, agrupado por carpeta. Su razón de ser es la **ruta**:
 * para reutilizar una foto en otro bloque hay que pegar `galeria/abc.webp` en su campo, y sin
 * esta pantalla eso significa acordarse de la ruta o volver a subir el archivo.
 *
 * El listado se pide con el cliente de sesión, así que devuelve lo que las políticas del bucket
 * permiten ver. No se cachea: es una pantalla de trabajo y lo que importa es que esté al día.
 * El buscador y las tarjetas viven en `MediaLibrary` (cliente): allí el filtro no pide nada al
 * servidor.
 */

/** Nombre de cada carpeta, en las palabras que usa el panel. */
const FOLDER_LABELS: Record<string, string> = {
  brand: 'Marca',
  gallery: 'Galería',
  services: 'Servicios',
  team: 'Equipo',
  reels: 'Reels',
};

export default async function AdminImagenesPage() {
  const supabase = createSupabaseServerClient();

  const folders = await Promise.all(
    MEDIA_FOLDERS.map(async (folder) => {
      const { data, error } = await supabase.storage
        .from('media')
        .list(folder, { limit: 200, sortBy: { column: 'created_at', order: 'desc' } });

      return {
        folder,
        // Supabase deja un archivo oculto para que una carpeta vacía exista: no es una imagen.
        files: error ? [] : (data ?? []).filter((file) => file.name !== '.emptyFolderPlaceholder'),
        error: error?.message,
      };
    }),
  );

  const groups: MediaFolderGroup[] = folders
    .filter((item) => item.files.length > 0)
    .map((item) => ({
      folder: item.folder,
      label: FOLDER_LABELS[item.folder] ?? item.folder,
      files: item.files.map((file) => ({ name: file.name, size: file.metadata?.size ?? 0 })),
    }));

  return (
    <>
      <MediaLibrary folders={groups} />

      {folders.some((item) => item.error) ? (
        <p role="alert" className="mt-8 text-sm text-danger">
          Una de las carpetas no se pudo leer. Revisa la consola del servidor.
        </p>
      ) : null}
    </>
  );
}

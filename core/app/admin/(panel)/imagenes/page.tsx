import CopyButton from '@/components/admin/CopyButton';
import DeleteMediaButton from '@/components/admin/DeleteMediaButton';
import { MEDIA_FOLDERS } from '@/blocks/shared';
import { createSupabaseServerClient } from '@/data/supabase';
import { getPublicMediaUrl } from '@/lib/storage';

/**
 * Imágenes del bucket.
 *
 * Es el catálogo de lo que ya está subido, agrupado por carpeta. Su razón de ser es la **ruta**:
 * para reutilizar una foto en otro bloque hay que pegar `galeria/abc.webp` en su campo, y sin
 * esta pantalla eso significa acordarse de la ruta o volver a subir el archivo.
 *
 * El listado se pide con el cliente de sesión, así que devuelve lo que las políticas del bucket
 * permiten ver. No se cachea: es una pantalla de trabajo y lo que importa es que esté al día.
 */

/** Nombre de cada carpeta, en las palabras que usa el panel. */
const FOLDER_LABELS: Record<string, string> = {
  brand: 'Marca',
  gallery: 'Galería',
  services: 'Servicios',
  team: 'Equipo',
  reels: 'Reels',
};

function formatKb(size: number | undefined): string {
  if (!size) return '';
  return `${Math.max(1, Math.round(size / 1024))} KB`;
}

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

  const total = folders.reduce((sum, item) => sum + item.files.length, 0);

  return (
    <main className="container-page section-y">
      <h1 className="text-3xl">Imágenes</h1>
      <p className="mt-2 text-text-muted">
        Todo lo que hay en el bucket. Copia la ruta de una imagen para usarla en cualquier bloque,
        o sube nuevas desde el propio campo de imagen.
      </p>

      {total === 0 ? (
        <p className="mt-8 rounded-md border border-border bg-surface p-6 text-text-muted">
          Todavía no hay imágenes. Se suben desde el campo de imagen de cualquier bloque.
        </p>
      ) : (
        <div className="mt-8 space-y-10">
          {folders.map(({ folder, files }) =>
            files.length === 0 ? null : (
              <section key={folder}>
                <h2 className="text-xl">
                  {FOLDER_LABELS[folder] ?? folder}{' '}
                  <span className="text-sm text-text-muted">({files.length})</span>
                </h2>

                <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {files.map((file) => {
                    const path = `${folder}/${file.name}`;
                    const url = getPublicMediaUrl(path);

                    return (
                      <li
                        key={file.name}
                        className="overflow-hidden rounded-md border border-border bg-surface"
                      >
                        {/* Imagen corriente y no `next/image`: el archivo ya se subió en WebP y
                            con el tamaño correcto, así que no hay nada que optimizar aquí y sí
                            una razón para no pedirle trabajo al optimizador en cada visita. */}
                        {url ? (
                          <img
                            src={url}
                            alt={file.name}
                            loading="lazy"
                            className="aspect-[4/5] w-full bg-surface-alt object-cover"
                          />
                        ) : null}

                        <div className="space-y-2 p-3">
                          <code className="block break-all text-xs text-text-muted">{path}</code>

                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-text-muted">
                              {formatKb(file.metadata?.size)}
                            </span>
                            <div className="flex items-center gap-2">
                              <CopyButton value={path} />
                              <DeleteMediaButton path={path} />
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ),
          )}
        </div>
      )}

      {folders.some((item) => item.error) ? (
        <p role="alert" className="mt-8 text-sm text-danger">
          Una de las carpetas no se pudo leer. Revisa la consola del servidor.
        </p>
      ) : null}
    </main>
  );
}

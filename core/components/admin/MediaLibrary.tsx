'use client';

import { useMemo, useState } from 'react';

import { getPublicMediaUrl } from '@/lib/storage';

import ControlPanel from './ControlPanel';
import CopyButton from './CopyButton';
import DeleteMediaButton from './DeleteMediaButton';

/**
 * Biblioteca de imágenes, con buscador.
 *
 * El buscador va en el «panel de control», como el de Odoo: filtra por ruta (`carpeta/archivo`)
 * mientras se escribe y esconde las carpetas que se quedan vacías. Es un filtro de cliente, así
 * que escribir no pide nada al servidor; el listado llega ya completo desde la página.
 */
export interface MediaFileInfo {
  name: string;
  size: number;
}

export interface MediaFolderGroup {
  folder: string;
  label: string;
  files: MediaFileInfo[];
}

function formatKb(size: number): string {
  return size > 0 ? `${Math.max(1, Math.round(size / 1024))} KB` : '';
}

export default function MediaLibrary({ folders }: { folders: MediaFolderGroup[] }) {
  const [query, setQuery] = useState('');
  const search = query.trim().toLowerCase();

  const filtered = useMemo(
    () =>
      folders
        .map((group) => ({
          ...group,
          files: search
            ? group.files.filter((file) =>
                `${group.folder}/${file.name}`.toLowerCase().includes(search),
              )
            : group.files,
        }))
        .filter((group) => group.files.length > 0),
    [folders, search],
  );

  const total = folders.reduce((sum, group) => sum + group.files.length, 0);
  const shown = filtered.reduce((sum, group) => sum + group.files.length, 0);

  return (
    <>
      <ControlPanel
        title="Imágenes"
        subtitle="Todo lo que hay en el bucket. Copia la ruta de una imagen para usarla en cualquier bloque, o sube nuevas desde el propio campo de imagen."
        breadcrumb={[{ label: 'Panel', href: '/admin' }, { label: 'Imágenes' }]}
      >
        <label className="flex items-center">
          <span className="sr-only">Buscar imágenes por ruta</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por ruta…"
            className="w-56 rounded-sm border border-border bg-surface px-3 py-2 text-sm focus:border-primary"
          />
        </label>
      </ControlPanel>

      {search ? (
        <p className="mb-4 text-sm text-text-muted">
          {shown} de {total} {total === 1 ? 'imagen' : 'imágenes'} para «{query.trim()}».
        </p>
      ) : null}

      {total === 0 ? (
        <p className="rounded-md border border-border bg-surface p-6 text-text-muted">
          Todavía no hay imágenes. Se suben desde el campo de imagen de cualquier bloque.
        </p>
      ) : filtered.length === 0 ? (
        <p className="rounded-md border border-border bg-surface p-6 text-text-muted">
          Ninguna imagen coincide con la búsqueda.
        </p>
      ) : (
        <div className="space-y-10">
          {filtered.map((group) => (
            <section key={group.folder}>
              <h2 className="text-xl">
                {group.label}{' '}
                <span className="text-sm text-text-muted">({group.files.length})</span>
              </h2>

              <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                {group.files.map((file) => {
                  const path = `${group.folder}/${file.name}`;
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
                          <span className="text-xs text-text-muted">{formatKb(file.size)}</span>
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
          ))}
        </div>
      )}
    </>
  );
}

-- ===========================================================================
-- Migración 001 — Bucket de Storage y sus políticas
-- ===========================================================================
-- Se aplica con:  supabase db push
--
-- Va en un archivo aparte de 000 a propósito: crear objetos y políticas en el
-- esquema `storage` puede requerir permisos que el rol de migraciones no
-- siempre tiene. Si esta migración fallara, el esquema propio del proyecto ya
-- está aplicado y el resto sigue funcionando.
--
-- Alternativa si el push falla aquí:
--   Crear el bucket y sus políticas desde el panel de Supabase
--   (Storage > New bucket, y luego Policies con las mismas reglas de abajo).
--
-- Convención:
--   - Un único bucket público de lectura: `media`.
--   - Carpetas por tipo de contenido: hero/, services/, gallery/, team/,
--     testimonials/, reels/, brand/.
--   - Nombre de archivo: {uuid}.webp
-- ===========================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  -- La compresión en el navegador deja las imágenes muy por debajo de este
  -- límite; el tope existe como red de seguridad.
  5242880,
  array['image/webp', 'image/jpeg', 'image/png']
)
on conflict (id) do nothing;

-- Lectura pública: el bucket ya es público, pero se declara explícitamente para
-- que la política no dependa solo del ajuste del bucket.
drop policy if exists "media_objects_select_public" on storage.objects;
create policy "media_objects_select_public"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'media');

-- Escritura solo para administradores. Reutiliza `public.is_admin()`, la misma
-- función que usan las políticas de las tablas.
drop policy if exists "media_objects_insert_admin" on storage.objects;
create policy "media_objects_insert_admin"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media_objects_update_admin" on storage.objects;
create policy "media_objects_update_admin"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media_objects_delete_admin" on storage.objects;
create policy "media_objects_delete_admin"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media' and public.is_admin());

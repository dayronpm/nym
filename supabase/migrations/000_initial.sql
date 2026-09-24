-- ===========================================================================
-- Migración 000 — Tablas, índices, RLS, permisos y valores iniciales
-- ===========================================================================
-- Se aplica con:  supabase db push
--
-- Cada instalación nueva (cliente nuevo) ejecuta esta migración y queda con el
-- esquema completo. No contiene ningún dato de un negocio real: los valores
-- iniciales son neutros y los carga/editables desde el panel.
--
-- ---------------------------------------------------------------------------
-- Correcciones aplicadas respecto al borrador del plan:
--
--   1. `site_settings.contact`, `hours` y `seo_defaults` eran NOT NULL SIN
--      DEFAULT, pero el INSERT inicial solo aportaba `theme`. La migración
--      fallaba por violación de constraint. Ahora tienen DEFAULT y el INSERT
--      los declara explícitamente.
--
--   2. Las políticas de administrador comprobaban
--      `auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')`.
--      Con RLS activo en `profiles` y ninguna política de lectura, esa
--      subconsulta devuelve 0 filas: nadie habría sido admin nunca. Ahora se
--      usa la función SECURITY DEFINER `is_admin()`.
--
--   3. Faltaban las políticas DELETE (blocks, media) y la de INSERT en `pages`.
--
--   4. El rol de un usuario nuevo se crea automáticamente en `profiles` con
--      `role = 'viewer'`. El seed promueve después al administrador a 'admin'.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- Tablas
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text unique not null,
  role text not null default 'viewer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_role_check check (role in ('admin', 'viewer'))
);

comment on table public.profiles is
  'Perfiles de usuarios autenticados. La v1 solo usa el rol admin; viewer queda preparado para más adelante.';

create table public.pages (
  slug text primary key,
  title text not null,
  meta_title text,
  meta_description text,
  og_image jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pages_slug_check check (slug in ('inicio', 'servicios', 'galeria', 'nosotros', 'contacto'))
);

comment on table public.pages is
  'Metadatos y SEO de cada una de las cinco páginas públicas. Los bloques viven en la tabla blocks (campo page).';

create table public.blocks (
  id uuid primary key default gen_random_uuid(),
  page text not null references public.pages (slug) on delete cascade,
  type text not null,
  data jsonb not null default '{}'::jsonb,
  version integer not null default 1,
  "order" integer not null default 0,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.blocks is
  'Contenido por bloques. `data` es jsonb validado con zod; su forma la define el esquema del bloque en core/blocks.';
comment on column public.blocks.version is
  'Versión del esquema del bloque, para migrar contenido cuando el esquema cambie.';
comment on column public.blocks."order" is
  'Posición dentro de la página. Existe desde la fase 0 aunque el panel solo lo edite en la fase 3.';

create table public.site_settings (
  id integer primary key default 1,
  brand jsonb not null default '{"name": "Nombre del Negocio"}'::jsonb,
  currency text not null default 'USD',
  timezone text not null default 'America/Panama',
  theme jsonb not null default '{}'::jsonb,
  contact jsonb not null default '{}'::jsonb,
  hours jsonb not null default '[]'::jsonb,
  services_catalog jsonb not null default '{"categories": []}'::jsonb,
  seo_defaults jsonb not null default '{"business_type": "DaySpa"}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site_settings_single_row check (id = 1)
);

comment on table public.site_settings is
  'Configuración única del sitio (una sola fila, id = 1): marca, tema, contacto, horarios, catálogo de servicios y SEO por defecto.';

create table public.media (
  id uuid primary key default gen_random_uuid(),
  path text not null unique,
  filename text,
  content_type text,
  size_bytes integer,
  uploaded_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

comment on table public.media is
  'Registro de los archivos subidos al bucket `media` de Supabase Storage. Guarda la ruta relativa, nunca la URL completa.';

-- ---------------------------------------------------------------------------
-- Índices
-- ---------------------------------------------------------------------------

create index idx_blocks_page on public.blocks (page);
create index idx_blocks_page_order on public.blocks (page, "order");
create index idx_media_uploaded_by on public.media (uploaded_by);

-- ---------------------------------------------------------------------------
-- Funciones auxiliares
-- ---------------------------------------------------------------------------

-- Comprobación de administrador usada por todas las políticas de escritura.
--
-- Es SECURITY DEFINER a propósito: así la consulta a `profiles` no vuelve a
-- pasar por RLS (lo que la dejaría en 0 filas y bloquearía a todos los admin).
-- El `set search_path` evita que un search_path manipulado redirija la consulta.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- Crea el perfil automáticamente al registrarse un usuario.
--
-- El alta de usuarios se hace a mano (no hay registro público), pero el
-- administrador de cada instalación se crea desde el seed, y este disparador
-- garantiza que su fila en `profiles` exista siempre.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'viewer')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.pages enable row level security;
alter table public.blocks enable row level security;
alter table public.site_settings enable row level security;
alter table public.media enable row level security;

-- Sitio público: solo lectura.
--
-- Nota: `blocks` es la única tabla con lectura filtrada. El resto es contenido
-- publicable por definición. Las políticas de SELECT se aplican a `anon` y
-- `authenticated` (el panel necesita leer lo mismo que el sitio).

create policy "pages_select_public"
  on public.pages for select
  to anon, authenticated
  using (true);

create policy "blocks_select_public"
  on public.blocks for select
  to anon, authenticated
  using (enabled = true);

create policy "site_settings_select_public"
  on public.site_settings for select
  to anon, authenticated
  using (true);

create policy "media_select_public"
  on public.media for select
  to anon, authenticated
  using (true);

-- Cada usuario ve su propio perfil; un admin ve todos.
create policy "profiles_select_self_or_admin"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id or public.is_admin());

-- Panel: escritura solo para administradores.

create policy "pages_insert_admin"
  on public.pages for insert
  to authenticated
  with check (public.is_admin());

create policy "pages_update_admin"
  on public.pages for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "pages_delete_admin"
  on public.pages for delete
  to authenticated
  using (public.is_admin());

create policy "blocks_insert_admin"
  on public.blocks for insert
  to authenticated
  with check (public.is_admin());

create policy "blocks_update_admin"
  on public.blocks for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "blocks_delete_admin"
  on public.blocks for delete
  to authenticated
  using (public.is_admin());

create policy "site_settings_update_admin"
  on public.site_settings for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "media_insert_admin"
  on public.media for insert
  to authenticated
  with check (public.is_admin());

create policy "media_update_admin"
  on public.media for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "media_delete_admin"
  on public.media for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Permisos explícitos para la Data API
-- ---------------------------------------------------------------------------
-- Desde finales de 2026 las tablas nuevas del esquema `public` no se exponen
-- automáticamente: sin estos GRANT, la Data API devuelve 403 aunque las
-- políticas RLS sean correctas.

grant select on public.profiles to authenticated;

grant select on public.pages to anon, authenticated;
grant select on public.blocks to anon, authenticated;
grant select on public.site_settings to anon, authenticated;
grant select on public.media to anon, authenticated;

grant insert, update, delete on public.pages to authenticated;
grant insert, update, delete on public.blocks to authenticated;
grant insert, update, delete on public.media to authenticated;

-- site_settings es una fila única: no se crea ni se borra desde la API.
grant insert, update on public.site_settings to authenticated;

-- ---------------------------------------------------------------------------
-- Valores iniciales
-- ---------------------------------------------------------------------------

-- Una única fila de configuración, con el tema por defecto de la plantilla.
-- Estos colores coinciden con los tokens de core/styles/globals.css.
insert into public.site_settings (id, theme, brand, contact, hours, seo_defaults, services_catalog)
values (
  1,
  '{
    "colors": {
      "bg": "#FAF7F2",
      "surface": "#FFFFFF",
      "surface_alt": "#F3EDE4",
      "text": "#2B2622",
      "text_muted": "#6B625A",
      "border": "#E5DCD0",
      "primary": "#B0603F",
      "primary_hover": "#93502F",
      "primary_soft": "#F1DDD2",
      "on_primary": "#FFFFFF"
    },
    "fonts": {
      "heading": "Cormorant Garamond",
      "body": "Inter"
    },
    "radius": {
      "sm": "6px",
      "md": "12px",
      "lg": "20px"
    }
  }'::jsonb,
  '{"name": "Nombre del Negocio"}'::jsonb,
  '{
    "booking_message_generic": "Hola, quisiera reservar una cita. ¿Me pueden ayudar?",
    "booking_message_service": "Hola, quisiera reservar: {servicio}. ¿Tienen disponibilidad?"
  }'::jsonb,
  '[
    {"day": "mon", "closed": false, "ranges": [{"open": "09:00", "close": "18:00"}]},
    {"day": "tue", "closed": false, "ranges": [{"open": "09:00", "close": "18:00"}]},
    {"day": "wed", "closed": false, "ranges": [{"open": "09:00", "close": "18:00"}]},
    {"day": "thu", "closed": false, "ranges": [{"open": "09:00", "close": "18:00"}]},
    {"day": "fri", "closed": false, "ranges": [{"open": "09:00", "close": "18:00"}]},
    {"day": "sat", "closed": false, "ranges": [{"open": "09:00", "close": "18:00"}]},
    {"day": "sun", "closed": true,  "ranges": []}
  ]'::jsonb,
  '{"business_type": "DaySpa"}'::jsonb,
  '{"categories": []}'::jsonb
)
on conflict (id) do nothing;

-- Las cinco páginas públicas. Los bloques de cada una se crean con el seed.
insert into public.pages (slug, title)
values
  ('inicio', 'Inicio'),
  ('servicios', 'Servicios'),
  ('galeria', 'Galería y Reels'),
  ('nosotros', 'Nosotros'),
  ('contacto', 'Contacto')
on conflict (slug) do nothing;

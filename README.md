# Plantilla de sitio web + panel para negocios de bienestar

Plantilla genérica de **sitio web público + panel de administración** para
negocios tipo spa, salón de belleza o estética. Se construye **una sola vez** y
se reutiliza por cliente: cada negocio es una copia limpia de este repositorio
con sus propios datos.

- **5 páginas públicas:** Inicio, Servicios, Galería y Reels, Nosotros, Contacto
- **10 bloques de contenido** editables sin tocar código
- **Panel propio** con login, edición de bloques, tema, imágenes y SEO
- **Todo en español**, pensado primero para móvil

---

## Stack

| Capa | Tecnología |
| --- | --- |
| Frontend | Next.js 14 (App Router) + React 18 |
| Lenguaje | TypeScript en modo estricto |
| Estilos | Tailwind CSS + variables CSS (tokens editables) |
| Validación | zod |
| BD, Auth y Storage | Supabase (Postgres + Auth + Storage) |
| Cliente de datos | `@supabase/supabase-js` + `@supabase/ssr` |
| Despliegue | Vercel |

**Sin ORM** (nada de Prisma ni Drizzle) y **sin librerías de UI**: la capa
`core/data/` traduce Supabase a TypeScript y los estilos salen de Tailwind.

---

## Requisitos

- **Node.js 22.18 o superior** (`node --version`)
- **npm 10 o superior**
- **Git**
- Una cuenta de **Supabase** con un proyecto creado
- Opcional: cuenta de **Vercel** para desplegar

---

## Puesta en marcha

```bash
# 1. Dependencias
npm install

# 2. Entorno: copia el ejemplo y rellena los datos del proyecto de Supabase
#    (Panel de Supabase > Project Settings > API)
cp .env.example .env.local

# 3. Aplicar el esquema a tu proyecto de Supabase
npm run db:login          # abre el navegador para autorizar el CLI
npm run db:link           # pide el project-ref y la contraseña de la base de datos
npm run db:push

# 4. Generar los tipos reales de la base de datos
npm run db:types

# 5. Arrancar
npm run dev          # http://localhost:3000
```

### Scripts disponibles

| Script | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compilación de producción |
| `npm run start` | Sirve la compilación de producción |
| `npm run clean` | Borra `.next` (necesario antes de verificar si se movieron rutas) |
| `npm run type-check` | Verifica TypeScript (`tsc --noEmit`) |
| `npm run lint` | ESLint |
| `npm run format` | Prettier sobre todo el proyecto |
| `npm run verify` | `type-check` + `lint` + `build` |
| `npm run db:login` | Inicia sesión en el CLI de Supabase (`supabase login`) |
| `npm run db:link` | Vincula el proyecto local con el de Supabase (`supabase link`) |
| `npm run db:push` | Aplica las migraciones (`supabase db push`) |
| `npm run db:types` | Regenera `core/types/supabase.ts` |
| `npm run seed` | Carga el contenido de ejemplo en Supabase y crea el usuario administrador (con `ADMIN_EMAIL`/`ADMIN_PASSWORD`). Exige `ALLOW_SEED_RESET=true` porque **borra los bloques existentes** |

---

## Estructura del proyecto

```
core/      plantilla genérica. NUNCA se personaliza por cliente
custom/    overlay del cliente. Vacío en la plantilla
app/       shims de Next.js (ver más abajo)
supabase/  migraciones SQL versionadas
middleware.ts   shim del middleware
```

Dentro de `core/`:

| Carpeta | Contenido |
| --- | --- |
| `app/` | Rutas de Next.js: las 5 páginas públicas y el panel |
| `blocks/` | Los 10 bloques, cada uno con su esquema, componente y formulario |
| `components/` | Header, Footer, botones y componentes del panel |
| `data/` | **Única** capa que habla con la base de datos |
| `lib/` | Utilidades: contacto, storage, validación |
| `styles/` | `globals.css` con los tokens y la configuración de Tailwind |
| `types/` | Tipos compartidos y los generados por Supabase |
| `presets/` | Contenido de ejemplo neutro |

### Por qué existe la carpeta `app/` en la raíz

Next.js solo descubre rutas dentro de `app/` (o `src/app/`) en la raíz del
proyecto; no acepta `core/app/`. La solución es una capa de **shims**: cada
archivo de la raíz es un reexport de una línea.

```ts
// app/page.tsx
export { default } from '@/app/page';   // -> core/app/page.tsx
```

Al añadir una ruta nueva hay que crear el archivo en `core/app/...` **y** su shim
en `app/...`. El mismo patrón se aplica a `middleware.ts`, `tailwind.config.ts`
y `postcss.config.js`.

### Alias de importación

| Alias | Apunta a |
| --- | --- |
| `@/...` | `core/...` |
| `@custom/...` | `custom/...` |

---

## Montar el sitio de un negocio nuevo (guía paso a paso)

Cada negocio es una **copia limpia** de esta plantilla, con su propio repositorio
y su propio proyecto de Supabase. La plantilla original no se toca nunca: si
aparece una mejora genérica, se corrige aquí, se etiqueta una versión nueva y se
trae a las copias.

> El preset "Spa" (`core/presets/spa.ts`) es **contenido de ejemplo neutro**: un
> negocio llamado "Nombre del Negocio", con servicios, precios, horarios y fotos
> ficticios. El contenido real del cliente se mete **desde el panel** (`/admin`),
> bloque a bloque. El seed solo sirve para no empezar con las páginas vacías.

Los comandos base (instalar, `db:login`/`db:link`/`db:push`/`db:types`) están en
[Puesta en marcha](#puesta-en-marcha); aquí van en el orden concreto de una
instalación por cliente.

### 1. Crear el repositorio del cliente y clonarlo

```bash
# En GitHub: botón "Use this template" sobre esta plantilla y crear el
# repositorio del cliente. Después, en tu máquina:
git clone https://github.com/<cuenta>/<negocio>.git
cd <negocio>
npm install
```

Se usa *Use this template* y no un *fork* a propósito: un fork mantiene el enlace
con el repositorio original y un `git pull` traería cambios de la plantilla, así
que cada cliente dejaría de ser una copia independiente. Si ya clonaste la
plantilla, cambia el remoto:
`git remote set-url origin https://github.com/<cuenta>/<negocio>.git`.

### 2. Crear el proyecto de Supabase del cliente y aplicar las migraciones

Crea el proyecto en el panel de Supabase (elige la región más cercana al negocio y
guarda la contraseña de la base de datos). Después:

```bash
npm run db:login   # autoriza el CLI en el navegador
npm run db:link    # pide el project-ref y la contraseña de la base de datos
npm run db:push    # aplica supabase/migrations/ en orden
npm run db:types   # regenera core/types/supabase.ts con el esquema real
```

Las dos migraciones que se aplican:

| Migración | Qué crea |
| --- | --- |
| `000_initial.sql` | Las tablas `profiles`, `pages`, `blocks`, `site_settings` y `media`, sus índices, la función `is_admin()`, el disparador que crea el perfil al dar de alta un usuario, las políticas RLS y los `GRANT`. Deja además las cinco páginas y la fila única de configuración |
| `001_storage.sql` | El bucket de lectura pública `media` y sus políticas (lectura pública, escritura solo `admin`). Si el `push` fallara aquí, se crean a mano desde Storage en el panel |

El esquema va **versionado en el repo**, no se toca a mano en el panel del
cliente: así todas las instalaciones parten del mismo punto y una mejora futura se
aplica con otra migración.

### 3. Configurar las variables de entorno

```bash
cp .env.example .env.local   # en PowerShell: Copy-Item .env.example .env.local
```

Rellena `.env.local` con los valores del proyecto del cliente. Cada clave sale de
**Project Settings > API** del panel de Supabase:

| Variable | Qué es |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto: `https://<project-ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clave publicable (`sb_publishable_...`). Se expone al navegador a propósito: la protegen las políticas RLS |
| `SUPABASE_SECRET_KEY` | Clave secreta (`sb_secret_...`). **Omite RLS**: solo vale en servidor (seed y tareas administrativas). Nunca lleva el prefijo `NEXT_PUBLIC_` |
| `NEXT_PUBLIC_SITE_URL` | URL pública del sitio, sin barra final. La usan el `sitemap`, el `canonical` y Open Graph (que tienen que ser absolutos). Puede quedarse vacía hasta que exista el dominio: en Vercel se usa `VERCEL_URL` y en local `http://localhost:3000` |
| `ADMIN_EMAIL` | Correo del administrador que crea el seed (paso 5). Si falta, el seed no lo crea y lo avisa |
| `ADMIN_PASSWORD` | Contraseña inicial de ese administrador. **Provisional:** se cambia desde el panel en la primera entrada. Si falta, el seed no lo crea y lo avisa |
| `ALLOW_SEED_RESET` | Interruptor de seguridad del seed (ver paso 4). En producción se deja en `false` o sin definir |

`.env.local` **nunca se versiona** (ya está en `.gitignore`) y no se comparte ni se
pega en un chat: la clave secreta omite RLS y quien la tenga puede escribir en la
base de datos. Si se expone, se rota antes de entregar (paso 8).

### 4. Cargar el contenido de ejemplo con el seed

```powershell
$env:ALLOW_SEED_RESET='true'; npm run seed
```

El seed usa la **clave secreta** y hace, en este orden: borra los `blocks`
existentes; genera y sube al bucket las imágenes que declara el preset (PNG de
color plano, no fotos) y las registra en `media`; actualiza la marca, el contacto,
el catálogo de servicios y los valores de SEO de `site_settings` (deja el tema y
los horarios tal como los dejó la migración); rellena los títulos y las
descripciones de las cinco páginas; inserta los bloques; y crea el usuario
administrador a partir de `ADMIN_EMAIL` y `ADMIN_PASSWORD`. Si falta alguna de
esas dos variables, se salta ese paso y lo avisa por consola, en lugar de
inventar credenciales; relanzar el seed con el usuario ya creado tampoco falla
(detecta el "ya registrado" y solo se asegura de que el rol siga en `admin`).

La guarda `ALLOW_SEED_RESET` existe porque el seed **borra los bloques**: sin
ella, un `npm run seed` despistado en el proyecto de un cliente con contenido real
lo dejaría vacío. Si el valor no es `true`, el script se detiene sin tocar nada. En
producción se queda sin definir o en `false`. La variable se pasa en la propia
línea de comandos, sin tocar `.env.local`.

Si editas el preset (`core/presets/spa.ts`) para acercarlo al negocio, vuelve a
lanzar el seed; y si ya habías compilado, ejecuta antes `npm run clean` o el build
seguirá sirviendo el contenido cacheado (ver las trampas en
[`docs/PROGRESS.md`](docs/PROGRESS.md)).

### 5. Usuario administrador y entrada al panel

No hay registro público: cada instalación tiene un solo administrador, y **lo crea el
propio seed** (paso 4) a partir de `ADMIN_EMAIL` y `ADMIN_PASSWORD` de `.env.local`. El
correo queda confirmado y el perfil con `role = 'admin'`, así que no hace falta ningún
paso manual.

Si el seed **se saltó** ese paso (porque faltaba alguna de las dos variables), lo avisa
por consola y el administrador se puede crear a mano, como alternativa:

1. En el panel de Supabase: *Authentication > Users > Add user*, con el correo y
   la contraseña del dueño, y marca *Auto Confirm User* (si no, no podrá entrar
   hasta confirmar el correo).
2. El disparador de la migración crea su fila en `profiles` con `role = 'viewer'`.
   Cámbialo a administrador desde el *SQL Editor*:

   ```sql
   update public.profiles set role = 'admin' where email = '<correo-del-dueño>';
   ```

   Sin `role = 'admin'` el panel deja entrar pero no deja guardar: la escritura
   está reservada a `is_admin()`.

En ambos casos, **cambia la contraseña en la primera entrada**: la de `ADMIN_PASSWORD`
es provisional. Se cambia desde el panel abriendo `/admin/nueva-clave` con la sesión
iniciada.

Añade además en *Authentication > URL Configuration > Redirect URLs* el
`.../admin/auth/callback` de local y de producción
(`http://localhost:3000/admin/auth/callback` y
`https://<dominio>/admin/auth/callback`). Sin ellas, el enlace de "olvidé mi
contraseña" no puede volver al panel.

El panel no se enlaza desde ninguna página pública: se entra escribiendo
`/admin/login` a mano y con correo y contraseña.

### 6. Arrancar en local y desplegar

```bash
npm run dev   # http://localhost:3000
```

Para publicar, sigue [Despliegue en Vercel](#despliegue-en-vercel). El detalle que
no conviene olvidar: la raíz trae `vercel.json` con `"framework": "nextjs"` porque
sin él Vercel no detecta el preset de Next.js y busca un sitio estático (falla con
*"No Output Directory named `public`"*). Deja *Output Directory* y *Root Directory*
vacíos y añade en Vercel las mismas variables de `.env.local`, con
`ALLOW_SEED_RESET` sin definir.

### 7. Conectar el dominio propio

En Vercel: *Project > Settings > Domains > Add* y sigue las instrucciones de DNS
del registrador del cliente (`A` o `CNAME`). Cuando el dominio ya resuelva, pon
`NEXT_PUBLIC_SITE_URL` en `https://<dominio>` (sin barra final) y vuelve a
desplegar: el `sitemap`, el `canonical` y Open Graph son absolutos y, sin ese
valor, seguirían apuntando a la URL de Vercel. Y añade el `.../admin/auth/callback`
del dominio en Supabase (paso 5).

### 8. Precauciones de cada instalación

- **Las claves son de cada cliente.** No se comparten entre proyectos ni se copian
  de la plantilla. La clave secreta no se pega en chats, issues ni capturas.
- **Rotar las claves antes de entregar**, y actualizar la plantilla con las nuevas.
  (La clave secreta del proyecto de desarrollo se expuso en un chat el 25/09; la
  decisión fue no rotar en ese momento y hacerlo justo antes de la entrega.)
- **El panel no se indexa.** Tiene tres capas (`X-Robots-Tag`, `noindex` en los
  metadatos y `Disallow: /admin`); ver más arriba *Cómo se mantiene oculto el
  panel*. Nunca se enlaza a `/admin` desde el sitio público.
- **`ALLOW_SEED_RESET` no se queda activo** en el entorno de producción.
- **La contraseña del administrador que crea el seed es provisional.** `ADMIN_PASSWORD`
  sirve solo para la primera entrada; se cambia desde el panel (`/admin/nueva-clave`).
- **El contenido real se edita desde el panel.** El preset es solo el andamio
  inicial. Lo que no se pueda hacer desde el panel va en `custom/`
  (`custom/components/`, `custom/styles/`, `custom/public/`), **nunca** en `core/`.
  Antes de duplicar un componente en `custom/`, valora si la mejora es genérica:
  si lo es, va a `core/` y se trae a la copia.

La lista de comprobación completa por instalación está en la sección 6.9 de
[`plan-desarrollo-plantilla-spa.md`](plan-desarrollo-plantilla-spa.md).

---

## Despliegue en Vercel

1. Importa el repositorio en Vercel.
2. Añade las variables de entorno del `.env.local` en
   *Project Settings > Environment Variables*.
   **`SUPABASE_SECRET_KEY` no lleva el prefijo `NEXT_PUBLIC_`**: no debe llegar
   nunca al navegador.
3. Deja `ALLOW_SEED_RESET` sin definir en producción (o en `false`): protege el
   contenido real del negocio.
4. Conecta el dominio propio del cliente cuando esté comprado.

---

## Seguridad

- RLS activo en **todas** las tablas.
- El sitio público solo puede leer; `blocks` filtra además por `enabled = true`.
- La escritura está reservada a usuarios con `role = 'admin'`, mediante la
  función `is_admin()`.
- La clave secreta de Supabase omite RLS: se usa **solo** en el servidor.
- `.env.local` nunca se versiona.

## Cómo se mantiene oculto el panel

El panel vive en `/admin`, pero **no se enlaza desde ninguna página pública**:
se accede escribiendo la URL a mano. Además hay tres capas que evitan que acabe
en un buscador:

| Capa | Dónde |
| --- | --- |
| Encabezado HTTP `X-Robots-Tag: noindex, nofollow` | `next.config.js` |
| `robots: { index: false, follow: false }` en los metadatos | `core/app/admin/**` |
| `Disallow: /admin` en `robots.txt` | `core/app/robots.ts` |

La capa que de verdad impide la indexación es el `noindex`: una URL bloqueada en
`robots.txt` todavía puede aparecer en resultados (sin descripción), porque el
buscador no llega a leerla. Se declaran las tres para que ninguna configuración
suelta deje el panel expuesto.

> **Regla al añadir páginas o bloques:** nunca enlazar a `/admin` desde el sitio
> público, ni con `<Link>` ni con `<a>`. El acceso al panel es siempre manual.

---

## Documentación

- [`docs/PROGRESS.md`](docs/PROGRESS.md) — **estado actual, checklist por fases y
  trampas conocidas. Empieza por aquí si retomas el proyecto.**
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — arquitectura, sistema de
  bloques y decisiones técnicas.
- [`plan-desarrollo-plantilla-spa.md`](plan-desarrollo-plantilla-spa.md) —
  plan de desarrollo completo por fases.

## Enlaces

- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de Supabase](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [zod](https://zod.dev)

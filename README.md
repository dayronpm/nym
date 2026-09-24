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
npx supabase login
npx supabase link --project-ref <project-ref>
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
| `npm run type-check` | Verifica TypeScript (`tsc --noEmit`) |
| `npm run lint` | ESLint |
| `npm run format` | Prettier sobre todo el proyecto |
| `npm run verify` | `type-check` + `lint` + `build` |
| `npm run db:push` | Aplica las migraciones (`supabase db push`) |
| `npm run db:types` | Regenera `core/types/supabase.ts` |
| `npm run seed` | Carga el contenido de ejemplo (requiere `ALLOW_SEED_RESET=true`) |

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

## Cómo personalizar para un negocio nuevo

1. **No toques este repositorio.** Créate una copia (botón *Use this template*
   en GitHub, o `git clone`).
2. En la copia, rellena `.env.local` con el proyecto de Supabase del cliente.
3. `npm run db:push` y `npm run db:types`.
4. `npm run seed` con `ALLOW_SEED_RESET=true` para cargar el contenido de
   ejemplo.
5. Edita el contenido desde `/admin` (textos, servicios, fotos, tema, SEO).
6. Lo que no se pueda hacer desde el panel, va en `custom/`:
   - `custom/components/` componentes propios
   - `custom/styles/` estilos adicionales (nunca reescribir `globals.css`)
   - `custom/public/` logo y otros assets

Reglas de `custom/`:

- **Nunca** se escribe nada específico de un negocio dentro de `core/`.
- Antes de duplicar un componente en `custom/`, considera si la mejora es
  genérica: si lo es, va a `core/` y se trae a la copia.

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

---

## Documentación

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — arquitectura, sistema de
  bloques y decisiones técnicas.
- [`plan-desarrollo-plantilla-spa.md`](plan-desarrollo-plantilla-spa.md) —
  plan de desarrollo completo por fases.

## Enlaces

- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de Supabase](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [zod](https://zod.dev)

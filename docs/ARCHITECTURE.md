# Arquitectura

Documento de referencia técnica de la plantilla. El plan de producto está en
[`plan-desarrollo-plantilla-spa.md`](../plan-desarrollo-plantilla-spa.md).

---

## 1. Visión general

```
Sitio público (5 páginas)  ─┐
                            ├─> core/data/ ─> Supabase (Postgres + RLS)
Panel /admin               ─┘                     └─> Storage (bucket `media`)
```

Dos ideas sostienen todo lo demás:

1. **`core/` es genérico y no se toca; `custom/` es el overlay de cada cliente.**
   Clonar la plantilla para un negocio nuevo significa tener `custom/` vacío.
2. **El contenido vive en la base de datos, no en el código.** Los componentes
   nunca leen textos ni colores directamente: reciben los datos del bloque y los
   tokens del tema.

### Los tres niveles de cambio

| Nivel | Qué cambia | Quién | Dónde |
| --- | --- | --- | --- |
| 1. Contenido | Textos, precios, fotos | El dueño | Panel |
| 2. Composición | Orden y activar/desactivar bloques | El dueño | Panel |
| 3. Estructura | Diseño interno, bloques nuevos | El desarrollador | `core/` o `custom/` |

---

## 2. El patrón de shims (por qué hay una carpeta `app/` en la raíz)

**Problema.** El plan original situaba todas las rutas en `core/app/`. Next.js
exige por su parte que el App Router esté en `app/` o `src/app/` en la raíz del
proyecto: no acepta una carpeta con otro nombre ni en otro lugar.

**Solución.** Una capa de shims: cada ruta existe dos veces, con la
implementación en `core/` y un reexport de una línea en la raíz.

```ts
// app/admin/(panel)/layout.tsx
export { default, dynamic } from '@/app/admin/(panel)/layout';
```

`core/` sigue siendo la unidad completa y portable que se clona como plantilla;
la raíz solo contiene el pegamento que Next.js necesita.

**Archivos afectados:** `app/**`, `middleware.ts`, `tailwind.config.ts`,
`postcss.config.js`.

**Al añadir una ruta nueva:** crear el archivo real en `core/app/...` y su shim
en `app/...`. Si la ruta necesita exports de configuración (`metadata`,
`dynamic`, `revalidate`, `generateStaticParams`…), hay que reexportarlos también
en el shim.

### Excepción: el `config` del middleware NO se puede reexportar

Los reexports de configuración de segmento **sí** funcionan (`metadata`,
`dynamic`…), pero el `config.matcher` del middleware **no**: Next.js lo extrae
con análisis estático y no sigue los reexports.

Síntoma cuando se reexporta: el matcher se pierde, Next aplica el middleware a
**todas** las rutas y el manifiesto generado lo delata.

```json
// .next/server/middleware-manifest.json  (mal)
"matchers": [{ "regexp": "^/.*$", "originalSource": "/:path*" }]
```

Consecuencia real que tuvo: el sitio público entero redirigía a `/admin/login`,
porque el middleware se ejecutaba también en `/`.

**Reglas que se derivan de esto:**

1. El `config` del middleware se declara **literal** en `middleware.ts` (raíz).
2. El middleware comprueba la ruta **por su cuenta** y no confía en el matcher.
3. Si algo del panel o del sitio se comporta raro, revisar
   `.next/server/middleware-manifest.json` antes de tocar la lógica.

---

## 3. Sistema de bloques (`defineBlock`)

Un bloque es la unión de cuatro piezas declaradas en un solo sitio:

```ts
// core/blocks/hero/index.ts
export const heroBlock = defineBlock(
  'hero',        // tipo, es lo que se guarda en blocks.type
  HeroSchema,    // esquema zod: el contrato de los datos
  HeroBlock,     // componente del sitio público
  HeroForm,      // formulario del panel
  HERO_DEFAULTS, // valores por defecto
  1,             // versión del esquema
  { label: 'Hero', description: 'Portada de Inicio.' },
);
```

**El esquema es la fuente única de verdad.** De él salen los tipos TypeScript, la
validación al guardar y la validación al leer.

Se usa en los tres puntos donde los datos cruzan un límite:

| Momento | Función | Por qué |
| --- | --- | --- |
| Guardar desde el panel | `parseBlockData` | No escribir datos inválidos en la BD |
| Leer de la BD | `parseBlockData` | Un `jsonb` puede venir de una versión anterior del esquema |
| Crear un bloque | `withBlockDefaults` | Rellenar campos añadidos después |

### Versionado

`blocks.version` guarda la versión del esquema con la que se escribió el
contenido. **Regla:** cambiar un nombre de campo o el tipo de un campo obliga a
subir la versión y a escribir la migración de contenido correspondiente. Añadir
un campo opcional con `default` no la obliga.

### Estructura de cada bloque

```
core/blocks/<tipo>/
├── schema.ts          esquema zod + valores por defecto
├── <Tipo>Block.tsx    componente público
├── <Tipo>Form.tsx     formulario del panel
└── index.ts           defineBlock + reexports
```

El registro global está en `core/blocks/registry.ts`. Es la única lista que hay
que tocar al añadir un bloque.

---

## 4. Capa de datos

**Regla:** ningún componente importa de `@supabase/*`. Todo pasa por
`core/data/`.

```
core/data/
├── supabase.ts             cliente de navegador, de servidor y administrativo
├── supabase-middleware.ts  cliente del middleware (runtime edge, aparte)
├── queries/                lectura
└── mutations/              escritura
```

Por qué el cliente del middleware vive en un archivo aparte: el middleware se
empaqueta para el runtime edge, donde `next/headers` y `react.cache` no existen.
Compartir módulo con el cliente de servidor hacía que el bundle edge intentara
resolver esos imports (y el build avisaba de ello).

### Clientes

| Función | Contexto | Clave |
| --- | --- | --- |
| `createSupabaseBrowserClient` | Componentes cliente del panel | publicable |
| `createSupabaseServerClient` | Server Components, route handlers | publicable |
| `createSupabaseMiddlewareClient` | Solo middleware | publicable |
| `createSupabaseAdminClient` | Solo servidor y scripts | **secreta** |

---

## 5. Modelo de datos

| Tabla | Papel | Notas |
| --- | --- | --- |
| `profiles` | Usuarios autenticados | `role`: `admin` o `viewer` |
| `pages` | Metadatos y SEO de las 5 páginas | `slug` es la PK |
| `blocks` | Contenido | `data` jsonb, `version`, `order`, `enabled` |
| `site_settings` | Configuración del sitio | Una sola fila (`id = 1`) |
| `media` | Registro de archivos subidos | Guarda la ruta, nunca la URL |

`order` y `enabled` existen desde la fase 0 aunque el panel no los use hasta la
fase 3. Así la fase 3 es solo interfaz.

### El catálogo de servicios es un dato único

El bloque `services` aparece dos veces: en Inicio en modo resumen y en
`/servicios` en modo completo. Si cada instancia guardara su propia lista de
categorías, el dueño tendría que editar el mismo servicio dos veces y las dos
versiones podrían desincronizarse.

Por eso el catálogo vive en `site_settings.services_catalog` y cada instancia del
bloque guarda **solo cómo mostrarlo**: `mode` (`summary` o `full`),
`summary_limit`, `show_prices`, `show_durations`, `show_booking_button`.

### RLS y permisos

- RLS activo en todas las tablas.
- Lectura pública (`anon` + `authenticated`); `blocks` filtra por
  `enabled = true`.
- Escritura solo para `public.is_admin()`.
- **`is_admin()` es `SECURITY DEFINER` a propósito.** Si la política consultara
  `profiles` directamente, la propia RLS de `profiles` la dejaría en 0 filas y
  nadie sería admin nunca.
- Cada migración que crea una tabla incluye sus `GRANT` explícitos: desde
  finales de 2026 las tablas nuevas no se exponen solas a la Data API y sin
  `GRANT` la API devuelve 403 aunque las políticas sean correctas.

---

## 6. Tokens de diseño

Los colores, tipografías y radios no se escriben en los componentes. Viven en
tres sitios que hay que mantener sincronizados:

| Sitio | Papel |
| --- | --- |
| `core/styles/globals.css` | Variables CSS en `:root` (lo que consume el CSS) |
| `core/styles/tailwind.config.ts` | Expone las variables como utilidades (`bg-primary`, `rounded-md`…) |
| `site_settings.theme` | Copia editable desde `/admin/apariencia` |

`DEFAULT_THEME` (`core/types/settings.ts`) y el `INSERT` de la migración 000
deben tener exactamente los mismos valores que `globals.css`. Al cambiar un token
hay que tocar los tres.

> **Pendiente (Fase 2):** hoy `theme` se guarda en la base de datos pero el sitio
> todavía lee los tokens de `globals.css`. Falta inyectar el tema en un `<style>`
> del root layout y comprobar el contraste 4.5:1 antes de guardar.

---

## 7. Convenciones de Storage

- Un único bucket **público de lectura**: `media`.
- Escritura solo para administradores.
- Carpetas por tipo: `hero/`, `services/`, `gallery/`, `team/`,
  `testimonials/`, `reels/`, `brand/`.
- Nombre de archivo: `{uuid}.webp`, tras comprimir en el navegador a WebP con un
  máximo de 1600 px de ancho.
- `MediaRef.path` guarda la ruta relativa; la URL pública se construye con
  `getPublicMediaUrl()` (`core/lib/storage.ts`).

---

## 8. Cómo añadir un bloque nuevo

1. Crear `core/blocks/<tipo>/schema.ts` con el esquema zod y los valores por
   defecto.
2. Crear `<Tipo>Block.tsx`, el componente público. No escribe colores ni textos
   literales: recibe `data` y `settings`.
3. Crear `<Tipo>Form.tsx`, el formulario del panel. Emite cambios con
   `onChange`, no guarda nada por su cuenta.
4. Crear `index.ts` con `defineBlock(...)`.
5. Registrarlo en `core/blocks/registry.ts`.
6. Si el bloque usa una tabla nueva, añadir una migración en
   `supabase/migrations/` con sus `GRANT` y sus políticas.

El resto de la plantilla no se toca.

---

## 9. Correcciones aplicadas al plan original

El plan de desarrollo tenía varios puntos que, tal como estaban escritos,
impedían que la Fase 0 funcionara. Se corrigieron al implementar:

| # | Problema en el plan | Solución aplicada |
| --- | --- | --- |
| 1 | `core/app/` no lo detecta Next.js | Capa de shims en la raíz (sección 2) |
| 2 | `site_settings.contact`, `hours` y `seo_defaults` eran `NOT NULL` sin `DEFAULT`, y el `INSERT` inicial solo aportaba `theme` → la migración fallaba | `DEFAULT` en las tres columnas y `INSERT` explícito |
| 3 | Las políticas de admin usaban `auth.uid() IN (SELECT id FROM profiles ...)`; con RLS activo y sin política de lectura devuelve 0 filas y **nadie sería admin** | Función `public.is_admin()` `SECURITY DEFINER` |
| 4 | Faltaban políticas `DELETE` y la de `INSERT` en `pages` | Añadidas |
| 5 | `/admin/servicios` se usaba en las reglas del bloque `services` pero no existía ni en la navegación ni en el árbol de carpetas | Ruta añadida al plan de trabajo de la fase 2 |
| 6 | Inconsistencias de rutas: `core/types/` vs `src/types/supabase.ts`; `supabase/seed.ts` vs `scripts/seed.js` | Todo en `core/types/` y `scripts/seed.ts` |
| 7 | `zod`, `@supabase/supabase-js` y `@supabase/ssr` estaban en `devDependencies` | Movidos a `dependencies` |
| 8 | `@supabase/cli` no es el paquete correcto, y `supabase gen types >` no es la sintaxis válida | CLI oficial (`supabase`) como devDependency y `supabase gen types typescript --linked` |
| 9 | El esquema del bloque `services` se exportaba como `ServicesBlock`, igual que su entrada en el registro | Se nombrará `ServicesSchema` |
| 10 | Las listas de bloques de `/` y `/nosotros` no coincidían entre dos secciones del plan | Se unificará en la tabla de la sección 3 |
| 11 | ESLint 9 con `eslint-config-next` 14 es una combinación problemática (flat config) | ESLint 8, que es con el que `eslint-config-next@14` está probado |

Desviaciones deliberadas respecto al plan:

- **Migración `001_storage.sql` separada de `000`.** Crear objetos y políticas en
  el esquema `storage` puede requerir permisos que el rol de migraciones no
  siempre tiene; en archivo aparte, si falla, no bloquea el esquema propio.
- **Grupo de rutas `(panel)`** dentro de `core/app/admin/` para que
  `/admin/login` quede fuera del layout protegido. Un `layout.tsx` que envuelve
  a `login` no puede proteger `admin` sin proteger también el login.
- **`core/lib/contact.ts`** añadido al árbol: la construcción de enlaces de
  WhatsApp, teléfono y correo se repite en cinco bloques y merece un sitio
  propio.

---

## 10. Deuda conocida

- Los tipos de `core/types/models.ts` están escritos a mano y reflejan la
  migración 000. Se sustituyen por los generados con `npm run db:types` en la
  Fase 1.
- El tema guardado en `site_settings.theme` todavía no se inyecta en el sitio
  (sección 6).
- Los formularios de bloque están generados a mano; el `DynamicForm` genérico
  que los deriva del esquema zod es trabajo de la Fase 2.

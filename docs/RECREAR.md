# Recrear la plantilla desde cero

Este documento explica **cómo se llega** al estado actual de la plantilla: los pasos, en
orden, y el porqué de cada decisión que no es evidente. Para otra cosa hay otros documentos:

- [`ARCHITECTURE.md`](ARCHITECTURE.md) — cómo está hecha la plantilla **hoy** (referencia técnica).
- [`PROGRESS.md`](PROGRESS.md) — el registro vivo: fases, decisiones y la lista numerada de
  trampas. **Es la fuente principal de este documento.**
- [`README.md`](../README.md) — la guía de **clonado** para montar el negocio de un cliente.
- [`plan-desarrollo-plantilla-spa.md`](../plan-desarrollo-plantilla-spa.md) — el plan original,
  del que se conserva la **intención** de cada fase.

La regla de este documento: explicar el *porqué*, no solo el *qué*. Un paso sin su motivo se
puede repetir, pero no se puede volver a decidir bien cuando algo cambie.

---

## 1. Qué es esta plantilla y qué promete

Un **sitio web público** de cinco páginas más un **panel de administración**, para negocios de
bienestar (spa, salón, estética). Se construye una sola vez y se reutiliza por cliente: cada
negocio es una copia limpia del repositorio, con su propio proyecto de Supabase.

Lo que promete:

- **Cinco páginas públicas** (Inicio, Servicios, Galería, Nosotros, Contacto) armadas con
  **diez bloques reutilizables** (hero, services, gallery, team, faq, contact, location_hours,
  testimonials, booking_cta, reels).
- El **dueño cambia el contenido, el SEO, el tema y las imágenes sin tocar código**, desde
  `/admin`.
- **Regla dura:** `core/` es la plantilla genérica y **no se personaliza nunca**. Lo específico
  de un cliente vive en `custom/` (overlay vacío por defecto) o en **la base de datos**. Si algo
  de un cliente hay que cambiarlo dentro de `core/`, es que la plantilla tiene una carencia: se
  corrige en la plantilla y se trae a la copia.

Los tres niveles de cambio de `ARCHITECTURE.md` §1 (contenido, composición, estructura) son la
forma de leer esa promesa: los dos primeros los hace el dueño desde el panel; el tercero, el
desarrollador en `core/` o `custom/`.

---

## 2. La arquitectura en dos capas (y por qué)

El plan original situaba las rutas en `core/app/`. **Next.js no acepta eso:** el App Router
tiene que estar en `app/` o `src/app/` en la raíz del proyecto. La solución es no elegir entre
las dos, sino tenerlas ambas:

- `core/app/...` — la **implementación real** de cada ruta. `core/` es la unidad completa y
  portable que se clona como plantilla.
- `app/...` — un **shim de una línea** por ruta que la reexporta. La raíz solo tiene el pegamento
  que Next.js exige.

```ts
// app/page.tsx
export { default, generateMetadata } from '@/app/(sitio)/page';
```

**Consecuencias que hay que asumir al recrear esto:**

- Cada ruta nueva se escribe **dos veces**: el archivo real en `core/app/...` y su shim en
  `app/...`. Si la ruta exporta configuración de segmento (`metadata`, `dynamic`, `revalidate`,
  `generateStaticParams`…), **también hay que reexportarla** en el shim, o Next no la ve.
- El patrón alcanza a `middleware.ts`, `tailwind.config.ts` y los shims de `sitemap.ts`,
  `robots.ts` y `favicon/route.ts`. (`postcss.config.js` vive en la raíz por la misma razón
  —PostCSS se resuelve desde ahí— pero es configuración real, no un reexport.)
- El **`config.matcher` del middleware es la excepción**: Next.js lo extrae con análisis
  estático y **no sigue los reexports**. Por eso el `config` va literal en `middleware.ts` (raíz)
  y el middleware, además, comprueba la ruta por su cuenta. Si se reexporta, el matcher se
  pierde, el middleware corre en **todo** el sitio y el público entero redirige a `/admin/login`.
  El detalle y la forma de diagnosticarlo están en `ARCHITECTURE.md` §2.

Alias de importación: `@/...` apunta a `core/...` y `@custom/...` a `custom/...` (en
`tsconfig.json`).

---

## 3. Los pasos, en orden de fases

La plantilla se construyó en **dos etapas separadas por un hito**: la Etapa 1 (fases 0 a 4,
genérica, sin ningún dato real) y, tras congelarla como `template-v1.0`, la Etapa 2 (fase 5,
personalización de un negocio real, ya **en una copia**). Aquí se recrean las fases 0 a 4.

### Fase 0 — Base

**Qué se construye:** el esqueleto completo. Next.js 14 (App Router) + TypeScript estricto +
Tailwind + zod + Supabase, la capa de datos, el sistema de bloques, las migraciones y el
despliegue.

**Piezas clave:**

- `tsconfig.json` con `strict`, `noUncheckedIndexedAccess`, `noUnusedLocals/Parameters` y los
  alias `@/*` → `core/*`, `@custom/*` → `custom/*`.
- `core/config/env.ts` — lectura de las variables de entorno con errores **en español** en vez de
  `undefined` silencioso.
- `core/data/supabase.ts` — cuatro clientes, uno por contexto: público (sin sesión), de navegador,
  de servidor y administrativo (clave secreta). Y `core/data/supabase-middleware.ts` **aparte**,
  porque el middleware se empaqueta para el runtime edge, donde `next/headers` y `react.cache` no
  existen (compartir módulo metía esos imports en el bundle edge).
- `core/blocks/defineBlock.ts` + `core/blocks/registry.ts` — un bloque une en un solo sitio su
  esquema zod, su componente público, sus valores por defecto y su versión.
- `core/types/` — `supabase.ts` (generado), `models.ts` (filas derivadas) y `settings.ts` (el
  esquema maestro de `site_settings`).
- Migraciones `supabase/migrations/000_initial.sql` y `001_storage.sql` (detalle en la sección 4).
- `middleware.ts` y los shims de raíz.

**Decisiones que no son obvias:**

- **El esquema zod es la fuente única de verdad.** De él salen el tipo TypeScript, la validación
  al guardar y la validación al leer. `parseBlockData` se usa en los dos límites (escribir en la
  BD y leer de ella) porque un `jsonb` puede venir de una versión anterior del esquema;
  `withBlockDefaults` rellena los campos añadidos después. Cambiar el tipo de un campo obliga a
  subir `blocks.version`; añadir un campo opcional con valor por defecto, no.
- **`AnyBlock` en vez de un genérico.** `Block<z.ZodTypeAny>` no sirve como comodín del registro:
  TypeScript no resuelve `z.infer<S>` cuando `S` es el comodín y obliga a un `as unknown` por
  entrada. El registro usa una interfaz sin genéricos (trampa 3).
- **ESLint 8, no 9.** `eslint-config-next@14` está probado con ESLint 8; la combinación con 9
  (flat config) da problemas. Es una desviación deliberada del plan.
- **Grupo de rutas `(panel)`.** `/admin/login` tiene que quedar **fuera** del layout protegido: un
  `layout.tsx` que envuelve a `login` no puede proteger `admin` sin proteger también el login.
- **El panel se protege en dos capas.** El `middleware` valida la sesión en el servidor antes de
  renderizar (redirección temprana) y el layout del panel **repite** la comprobación como
  garantía final. Además hay tres capas `noindex` (`X-Robots-Tag` en `next.config.js`,
  `robots: { index: false }` y `Disallow: /admin` en `robots.txt`), porque una URL bloqueada en
  `robots.txt` todavía puede indexarse: la que de verdad lo impide es el `noindex`.
- **`core/lib/contact.ts` propio.** La construcción de enlaces de WhatsApp, teléfono y correo se
  repite en cinco bloques; merece un sitio. (No se usó ninguna librería: `core/lib/cn.ts` combina
  clases a mano y se descartó `clsx`.)

### Fase 1 — Sitio público

**Qué se construye:** las cinco páginas, los diez bloques, el chrome común (encabezado y pie), el
SEO técnico y el contenido de ejemplo. Aquí es donde el plan y la realidad chocaron: el criterio
de aceptación pedía "el contenido del seed del preset Spa", pero el preset era un entregable de la
Fase 4. Sin contenido, las páginas quedaban vacías y no se podía comprobar nada, así que **se
adelantó lo mínimo**: `core/presets/spa.ts` (neutro), `scripts/seed.mjs` con su guarda y
`npm run seed`. A la Fase 4 le quedó ampliarlo y documentar el clonado.

**Decisiones que no son obvias:**

- **El sitio público no usa el cliente con cookies.** Usa `createSupabasePublicClient` (sin
  sesión). `cookies()` obligaría a renderizar en cada petición y tiraría la caché y la
  revalidación (trampa 4).
- **Todo es componente de servidor salvo uno.** El único componente cliente de todo el sitio es el
  visor de la galería. El menú de móvil usa `<details>` y el acordeón de `faq` usa
  `<details>/<summary>`: se despliegan **sin JavaScript**, y `<summary>` ya es accesible de forma
  nativa. Con eso se llega al objetivo de Lighthouse.
- **Inicio es el índice del sitio, no una página más.** Muestra un resumen de cada sección con el
  enlace a la sección completa. La decisión de fondo: **los resúmenes no duplican contenido**.
  Con `source_page` toman la lista del bloque del mismo tipo que vive en su sección
  (`SHARED_CONTENT_FIELD` dice qué campo es contenido), así que se edita en un único sitio y el
  resumen no puede quedarse desfasado. Se resuelve en la lectura pública, no en el renderizador.
- **El catálogo de servicios es un dato único.** El bloque `services` aparece en modo `summary` en
  Inicio y `full` en `/servicios`, pero la lista vive en `site_settings.services_catalog`; cada
  instancia guarda solo **cómo mostrarla**. Si cada instancia tuviera su lista, el dueño editaría
  el mismo servicio dos veces.
- **Hero sin botones (v2).** La página ya reserva en el botón del encabezado y al final; el hero no
  repite. Quitar los CTA subió el bloque a la versión 2.
- **Alternar el fondo es cosa del CSS.** Lo decide una sola regla
  (`.site-main > section:nth-of-type(even)` en `globals.css`), no una prop por bloque. Así ningún
  bloque puede romper el ritmo visual y nadie tiene que acordarse de pasar una prop.
- **Los iconos de marca son etiquetas de texto** ("WhatsApp", "Instagram", "TikTok"), no SVG
  dibujados a mano: son marcas registradas y era un detalle estético.
- **`BlockRenderer` no tumba la página.** Busca cada bloque en el registro, valida su `jsonb` con
  el esquema y lo pinta; si el bloque es desconocido o inválido, **lo omite**.
- **SEO generado desde los datos.** `core/lib/seo.ts` produce metadatos por página; `generateMetadata`
  **tiene que salir del archivo de la ruta**, así que los shims de `app/` lo reexportan junto al
  `default`. El JSON-LD (`DaySpa`) sale de `site_settings` y va en el `<body>`. `sitemap.xml` se
  genera desde `pages` y `PAGE_SLUGS`; el favicon es una **ruta** (`core/app/favicon/route.ts`)
  porque los archivos estáticos no se pueden reexportar con un shim. Los enlaces de navegación se
  derivan de `PAGE_SLUGS`: no hay listas a mano.
- **Un fallo de importación circular que solo se ve en ejecución.** Añadir a `blocks/shared.ts` un
  import desde `types/settings.ts` cerró el círculo y el build murió con
  `ReferenceError: Cannot access 'w' before initialization` **al recopilar las páginas** — y el
  type-check, el lint y el `Compiled successfully` pasaban. Las referencias a otras páginas viven
  en `core/blocks/links.ts` (trampa 23).

### Fase 2 — Panel A (editar contenido)

Cinco bloques: autenticación, `DynamicForm`, páginas y bloques, pantallas de configuración,
imágenes y avisos.

**2.1 Autenticación.** Login con `signInWithPassword` desde una **Server Action** (el formulario se
envía sin JavaScript y la contraseña va del formulario al servidor), `/admin/recuperar` y
`/admin/auth/callback` (canje PKCE) y `/admin/nueva-clave`. Las rutas públicas del panel se
declaran en un solo sitio (`PUBLIC_ADMIN_PATHS`, en `core/middleware.ts`). Decisiones: los
mensajes de error son **neutros** (no se distingue "ese correo no existe" de "esa contraseña no
es"); el `?next=` se valida para que no sea una redirección abierta.

**2.2 `DynamicForm` desde zod.** El motor del panel recorre el esquema y pinta sus campos: añadir
un campo a un esquema lo añade al panel sin tocar el motor. El reparto de responsabilidades es la
decisión importante:

- **zod dice la estructura** (campos, tipos, límites, valores por defecto).
- **`core/components/admin/form-labels.ts` dice las palabras** (etiquetas en español, ayudas y el
  input concreto). Los nombres de campo son técnicos y en inglés (`summary_limit`), y el panel lo
  lee el dueño: las etiquetas **no van en los esquemas**, que son el contrato de los datos y los
  lee también el sitio público.
- **Los validadores propios se marcan con `.describe('kind:color')`** y compañía, en
  `core/lib/validation.ts`: cualquier esquema que use `hexColor()` hereda el selector de color sin
  repetir nada.
- La introspección usa **API pública de zod** (`instanceof`, `unwrap`, `innerType`, `shape`,
  `options`, `isOptional`, `safeParse`), nunca `_def` a mano: funcionaría hoy y se rompería en la
  siguiente actualización.
- Un tipo no soportado **se avisa** en el formulario en lugar de desaparecer en silencio.

Dos trampas de esta fase, ya resueltas: un `onChange: (data: unknown) => void` rompe a quien pasa
un tipo concreto por contravarianza (por eso `DynamicForm` es genérico y el `unknown` se queda
dentro, trampa 34), y dos formularios en la misma pantalla chocan en los `id` (por eso el motor
acepta `idPrefix`, trampa 36).

**2.3 Páginas y bloques.** `/admin/paginas` (lista desde la tabla `pages`) y `/admin/paginas/[slug]`
(los bloques en su orden, cada uno plegable con su formulario). Se guarda con una Server Action que
valida en el servidor y devuelve los errores al formulario. La decisión de fondo es la
**revalidación doble** al guardar: `revalidateTag` para las lecturas y `revalidatePath` para el
HTML; y si el bloque no es de Inicio, **se rehace Inicio también**, porque resume las demás
secciones. El estado del borrador se centralizó en `core/components/admin/useDraft.ts`.

**2.4 Pantallas de configuración.** Se agrupan **por temas, no por columnas de la base de datos**:
cada tarjeta lee y guarda **su grupo** de `site_settings`, así que guardar el teléfono no reenvía la
marca. `/admin/negocio` (marca, contacto y horarios), `/admin/servicios` (el catálogo único, con
listas anidadas), `/admin/seo` (valores por defecto y una tarjeta por página — necesitó una mutación
propia, `core/data/mutations/update-page.ts`, porque `pages` no es `site_settings`) y
`/admin/apariencia` (el tema).

Decisiones:

- Los horarios van **escritos a mano**: son siete días fijos (`z.array(DayHours).length(7)`), así
  que una lista con "añadir"/"quitar" dejaría crear un octavo día o borrar el lunes.
- **La tarjeta compartida** es `core/components/admin/DraftCard.tsx`: recibe la función de guardado
  y el prefijo de los errores, así que le sirve lo mismo a un grupo de `site_settings` que a los
  metadatos de una página.
- **El tema deja de ser decorativo.** `core/lib/theme.ts` convierte `site_settings.theme` en las
  **mismas variables CSS** que ya usa `globals.css` y el layout del sitio las inyecta en `:root`
  (después de `globals.css`, para ganar por orden). Cambiar de paleta no toca ni un componente. Los
  colores se validan con **contraste ≥ 4.5:1** (`core/lib/contrast.ts`): una paleta bonita pero
  ilegible es un sitio roto que nadie revisa.
- **Las fuentes y las esquinas se eligen de listas cerradas.** `next/font` carga en tiempo de
  compilación, así que un nombre escrito a mano no existiría en el navegador. Añadir una fuente es
  un cambio de código (hay que añadirla a `FONT_STACKS` en `lib/theme.ts`).
- **Las variables de `next/font` se llaman por familia** (`--font-cormorant`, `--font-inter`), no
  por papel (`--font-heading`): el papel lo decide el tema (trampa 38).

**2.5 Imágenes y avisos.** La subida va **desde cada campo de imagen**. La compresión ocurre **en el
navegador** (canvas a WebP, 1600 px de ancho máximo, calidad 75 — la misma receta que
`scripts/prepare-images.mjs`): la foto del móvil (3-5 MB) no viaja entera y el servidor no necesita
`sharp` ni ver el archivo completo. Dos decisiones: la acción de subida guarda con el **cliente de
sesión**, así que quien autoriza son las políticas del bucket y no la función (y la carpeta se
comprueba contra `MEDIA_FOLDERS`); y se informa del antes y el después (peso y medidas), que es el
argumento que convence al dueño de subir las fotos tal como salen del móvil. `/admin/imagenes` es el
catálogo de lo subido, con la ruta a la vista y botón de copiar. Los **avisos flotantes** salen del
gancho compartido `useDraft`: un módulo con suscriptores y `useSyncExternalStore`, con el estado
fuera de React para que el aviso sobreviva a los re-renders.

### Fase 3 — Panel B (composición)

Interruptor `enabled` por bloque y reordenar. Las acciones van en
`core/app/admin/(panel)/paginas/[slug]/actions.ts`, los componentes de la tarjeta y de las flechas en
`core/components/admin/`, y las mutaciones en `core/data/mutations/` (`set-block-enabled.ts` y
`reorder-blocks.ts`).

**Decisión de fondo: el arrastre se descartó a propósito.** El plan pedía arrastrar y soltar, pero
arrastrar con el dedo exige eventos de puntero, umbrales y una zona de soltado, y en un móvil se
falla mucho. `core/components/admin/BlockOrderButtons.tsx` usa **botones de subir y bajar**: funcionan
igual con ratón, con el dedo y con el teclado, y anuncian lo que hacen a quien usa un lector de
pantalla. Si el arrastre llega algún día, será un atajo **además** de esto, nunca en lugar de esto.

Otras decisiones: la acción de reordenar recibe la **lista completa de identificadores** (mandar
solo el bloque movido dejaría al servidor adivinando dónde va), y `order` y `enabled` existían ya
desde la fase 0, así que la fase 3 fue **solo interfaz**.

### Fase 4 — Preset y proceso de clonado

El contenido de ejemplo neutro (`core/presets/spa.ts`), el seed ampliado (con la **creación del
usuario administrador**, sección 4) y la guía de clonado en el `README.md`. El cierre de la etapa es
el hito: etiquetar `template-v1.0`, marcar el repositorio como **template** en GitHub y, solo
entonces, crear la copia del negocio real para la fase 5.

**Pendiente de la fase:** el **ensayo del seed en un Supabase limpio** (ver sección 7).

---

## 4. Los datos

### Migraciones y políticas

`supabase/migrations/000_initial.sql` crea las tablas `profiles`, `pages`, `blocks`,
`site_settings` y `media`, sus índices, la función `is_admin()`, el disparador que crea el perfil al
darse de alta un usuario, las políticas RLS y los `GRANT`. Deja además las cinco páginas y la fila
única de configuración.

Decisiones:

- **`is_admin()` es `SECURITY DEFINER`.** Las políticas de admin del plan usaban
  `auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')`; con RLS activo en `profiles` y sin
  política de lectura, esa subconsulta devuelve 0 filas y **nadie sería admin nunca**. La función
  `SECURITY DEFINER` es lo que rompe ese círculo.
- **`GRANT` explícitos en cada migración que crea una tabla.** Desde finales de 2026 las tablas
  nuevas no se exponen solas a la Data API; sin `GRANT`, la API devuelve 403 aunque las políticas
  sean correctas.
- **`order` y `enabled` existen desde la fase 0** aunque el panel no los usara hasta la fase 3: así
  la fase 3 fue solo interfaz, sin migración de datos.
- **Lectura pública, escritura solo `is_admin()`.** `blocks` filtra por `enabled = true` en la
  lectura pública.

`supabase/migrations/001_storage.sql` va **aparte** de `000` a propósito: crear objetos y políticas
en el esquema `storage` puede requerir permisos que el rol de migraciones no siempre tiene; en un
archivo separado, si falla, no bloquea el esquema propio. Crea el bucket **público de lectura**
`media` (escritura solo `is_admin()`), con carpetas por tipo de contenido (`MEDIA_FOLDERS`) y la
convención de nombre `{uuid}.webp`.

### El preset de contenido neutro

`core/presets/spa.ts` es **contenido de ejemplo neutro**: nada de un negocio real. Se ejecuta desde
Node directamente, así que solo usa `import type` y **ningún import de valor con el alias `@/`**
(Node no sabría resolverlo).

### El seed

`scripts/seed.mjs`, lanzado con `npm run seed`. En orden: borra los `blocks` existentes; genera y
sube al bucket las imágenes que declara el preset (PNG de color plano creados con
`scripts/placeholder-image.mjs`, escritos a mano con `node:zlib` — el repositorio no carga binarios)
y las registra en `media`; actualiza la marca, el contacto, el catálogo y el SEO de `site_settings`;
rellena los títulos y descripciones de las cinco páginas; inserta los bloques; y **crea el usuario
administrador** a partir de `ADMIN_EMAIL` y `ADMIN_PASSWORD`.

Decisiones:

- **La guarda `ALLOW_SEED_RESET`.** El seed **borra los bloques**: sin ella, un `npm run seed`
  despistado en el proyecto de un cliente con contenido real lo dejaría vacío. Si el valor no es
  `true`, el script se detiene sin tocar nada. Se pasa en la línea de comandos, sin tocar
  `.env.local`.
- **La tabla `media` no se toca.** Borrar sus filas sin borrar los objetos del bucket dejaría
  archivos huérfanos.
- **El administrador: el seed nunca inventa una contraseña.** Las credenciales salen de
  `ADMIN_EMAIL` y `ADMIN_PASSWORD`; si falta cualquiera de las dos, avisa y **se salta el paso**. El
  correo queda confirmado (`auth.admin.createUser({ email_confirm: true })`) y el perfil con
  `role = 'admin'`. La migración ya trae el disparador `on_auth_user_created` que crea el perfil con
  `role = 'viewer'`, así que el seed **actualiza** ese perfil; si no existiera, lo crea. Es
  **idempotente**: si el usuario ya existe, detecta el "already registered" y no falla, solo vuelve
  a asegurar el rol. Y la contraseña no se imprime nunca.

---

## 5. Cómo se comprueba que sigue en pie

### Comandos

Los scripts reales de `package.json`:

```bash
npm run type-check   # tsc --noEmit
npm run lint         # next lint
npm run build        # next build
npm run verify       # type-check + lint + build (lo que hay que pasar antes de cada commit)
npm run clean        # borra .next
```

Dos avisos sobre el orden:

- **Si se movió, renombró o borró una ruta, `npm run clean` antes de verificar.** Next guarda en
  `.next/types` los tipos de cada ruta y `tsconfig.json` los incluye; si quedan apuntando a archivos
  que ya no existen, `type-check` falla con un `Cannot find module` desconcertante (trampa 11).
- **No mezclar `next dev` y `next start` sobre el mismo `.next`** (trampa 29). Y después de cargar
  contenido con el seed, `npm run clean` antes de compilar: Next cachea las lecturas en
  `.next/cache` y esa caché sobrevive entre compilaciones (trampa 14).

### Pruebas manuales (lo que no cubre ningún test)

No hay tests automatizados. Estas son las comprobaciones que hay que hacer **a mano** en cada cambio
importante:

- **Guardar un bloque.** Editar un bloque en `/admin/paginas/[slug]`, guardar y recargar el sitio
  público: el cambio se ve (revalidación doble, incluida Inicio si el bloque no era de Inicio).
- **Cambiar el tema y verlo en el sitio.** En `/admin/apariencia`, cambiar la paleta y comprobar que
  el sitio público cambia de color **sin tocar código** (el tema se inyecta en `:root`). Y que una
  paleta sin contraste suficiente **no se deja guardar**.
- **Subir una imagen.** Subir una foto desde un campo de imagen y comprobar el aviso de antes/después
  (peso y medidas) y que la foto aparece con `next/image`.
- **Ocultar un bloque.** Desactivar un bloque y ver que desaparece del sitio al recargar.
- **Reordenar un bloque.** Con las flechas, subir/bajar y ver que el orden nuevo es el del sitio.
- **El aviso de guardado con el servidor apagado.** Con el servidor caído (o sin respuesta), guardar
  debe **avisar** con un aviso flotante, no romper la pantalla.
- **Login y recuperación con credenciales reales.** Lo único que no se puede probar sin las
  credenciales del administrador: el login correcto y el ciclo completo del correo de
  restablecimiento (necesita las *Redirect URLs* configuradas en Supabase).

> **Nota sobre los harness temporales:** las pantallas con sesión se miran con una página de prueba
> en `app/dev-…` que monta el componente. Sirve para **mirar**, nunca para pulsar Guardar: esa ruta
> no cuelga de `/admin`, el middleware no la protege y la Server Action escribiría de verdad con la
> clave secreta (trampa 37). Se borra antes de cerrar el bloque.

---

## 6. Dónde están las trampas

La lista completa y numerada está en [`PROGRESS.md` §6](PROGRESS.md), y es de lectura obligada antes
de tocar algo raro. Las que más tiempo costaron:

1. **El `config.matcher` del middleware no se puede reexportar.** Next lo extrae con análisis
   estático: se pierde el matcher, el middleware corre en todo el sitio y el público entero redirige
   a `/admin/login`.
2. **`core/app/` no lo detecta Next.js.** Hace falta un shim de una línea por ruta en `app/` (y el
   mismo patrón para `middleware.ts`, `tailwind.config.ts`, `sitemap.ts`, `robots.ts`,
   `favicon/route.ts`).
23. **Una importación de más rompe el build con un error que no explica nada.** Cerrar el círculo
   entre `blocks/shared.ts` y `types/settings.ts` mata el build al recopilar las páginas, y el
   type-check y el lint pasan.
29. **No mezclar `next dev` y `next start`.** El dev reescribe `.next`; el `start` sigue vivo con el
   mapa de rutas viejo y empieza a devolver 500 en las páginas que no tenía cacheadas. Parece
   aleatorio y no lo es. Comprobación rápida: si no existe `.next\BUILD_ID`, el directorio está roto.
30. **Una función de un módulo `'use client'` no se puede *llamar* desde el servidor.** El registro
   de bloques la llama al cargarse; el build muere con un `TypeError` que no menciona ni el archivo
   ni el bloque.
37. **Un harness que monta una pantalla del panel salta el guardia de sesión.** Su botón Guardar
   escribiría de verdad con la clave secreta; sirve para mirar, nunca para guardar.

---

## 7. Qué queda pendiente

- **El ensayo del seed en un Supabase limpio.** `npm run seed` está probado contra el proyecto de
  desarrollo, pero falta el ensayo completo en un proyecto nuevo (con la lista de verificación de la
  sección 6.9 del plan). Es la única diferencia real que queda entre el plan y el código.
- **Los reels son manuales.** La miniatura y el enlace se suben a mano; la intención es que algún día
  se actualicen solos desde Instagram o TikTok.
- **El arrastre de bloques está descartado a propósito.** El reordenado es con flechas (sección 3,
  Fase 3). Si algún día se añade, será un atajo además de las flechas.
- **Elegir una imagen ya subida desde el propio campo.** Hoy se copia la ruta desde `/admin/imagenes`
  y se pega en el campo del bloque.
- **Añadir una tipografía es un cambio de código**, no un cambio desde el panel: `next/font` carga
  en tiempo de compilación y las fuentes elegibles son las de `FONT_STACKS`.
- **La invalidación de caché es gruesa** (una etiqueta por tipo de contenido, no por página). Es
  deliberado y está razonado en `core/data/cache-tags.ts`; se afina si el sitio crece.
- **`docs/DEPLOYMENT.md` y `docs/SCHEMA.md` están pendientes** (opcionales en el plan).

El resto de la deuda conocida está en [`PROGRESS.md` §7](PROGRESS.md).

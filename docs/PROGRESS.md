# Estado del proyecto y checklist por fases

> **Este es el documento que hay que leer primero al retomar el proyecto.**
> Se actualiza al cerrar cada bloque de trabajo: se marcan las casillas hechas, se
> anota el commit y se listan las trampas nuevas que hayan aparecido.
>
> Documentos relacionados:
> - [`plan-desarrollo-plantilla-spa.md`](../plan-desarrollo-plantilla-spa.md) — el plan
>   original completo (fuente de verdad del **qué**).
> - [`docs/ARCHITECTURE.md`](ARCHITECTURE.md) — arquitectura y decisiones técnicas (el **cómo**).
>
> Última actualización: **25 de septiembre de 2026**.

---

## 1. Dónde estamos

| | |
| --- | --- |
| **Fase actual** | **Fase 1 CERRADA** — sitio público completo: 5 páginas, los 10 bloques, Inicio como índice y SEO. Lo siguiente es la Fase 2 (el panel) |
| **Rama** | `main` |
| **Repositorio** | https://github.com/dayronpm/nym.git |
| **Supabase** | Proyecto `lpdxxdexneztgydrvixs` · migraciones aplicadas · usuario admin creado |
| **Vercel** | Desplegando correctamente (`vercel.json` fuerza el preset Next.js) |
| **Salud del código** | `type-check` ✅ · `lint` ✅ (0 warnings) · `build` ✅ · 5 páginas estáticas, 116 kB de First Load JS |
| **Rendimiento** | Lighthouse **móvil** sobre el build de producción (25/09): 99 · 100 · 100 · 100 |
| **Grafo de conocimiento** | 566 nodos · 1223 aristas · 36 comunidades (Graphify, backend DeepSeek) |

### Arranque rápido en una sesión nueva

```powershell
# 1. Comprobar el entorno (Node se instaló con winget y npm puede necesitar esto)
node --version          # esperado: v24.x
npm --version           # esperado: 11.x

# 2. Dependencias
npm install

# 3. Verificar que todo sigue en pie antes de tocar nada
npm run verify          # type-check + lint + build

# 4. Arrancar
npm run dev             # http://localhost:3000
```

`.env.local` ya está configurado con el proyecto real. **No se versiona.**

---

## 2. Fase 0 — Base ✅ CERRADA

Criterios de aceptación del plan, uno por uno:

- [x] El repositorio clona, instala dependencias sin errores y corre con `npm run dev`
- [x] Proyecto de Supabase con las migraciones aplicadas
      *(se sustituyó `supabase start` por el proyecto remoto: se decidió no usar Docker)*
- [x] `supabase gen types` genera los tipos sin errores
      *y además están **conectados**: los tipos de fila derivan del `Database` generado*
- [x] El sitio público carga en `http://localhost:3000`
- [x] El panel redirige `/admin` a `/admin/login` sin sesión
- [x] Las variables de entorno no exponen la clave secreta al navegador
- [ ] `npm run seed` funciona con `ALLOW_SEED_RESET=true` → **movido a la Fase 4**

> El último punto es una **contradicción del plan**: su criterio de la Fase 0 exige que
> `npm run seed` funcione, pero el contenido que el seed carga (el preset "Spa") es un
> entregable de la Fase 4. Se decidió no escribir un seed a medias que borrase contenido
> sin cargar nada. `package.json` mantiene el script, y el README avisa de que todavía
> no existe.

### Lo que se construyó

```
core/
├── app/                  5 rutas (Inicio, admin, login, robots.txt) + rutas de Fase 1
├── blocks/               shared · defineBlock · registry · bloque hero completo
├── config/env.ts         lectura de variables con errores en español
├── data/                 4 clientes de Supabase + queries + mutations + errores tipados
├── lib/                  validation · contact · storage
├── styles/               globals.css (tokens) + tailwind.config.ts
└── types/                supabase (generado) · models (derivado) · settings (zod)
app/ · middleware.ts · tailwind.config.ts · postcss.config.js   ← shims de raíz
supabase/migrations/      000_initial.sql · 001_storage.sql
docs/                     ARCHITECTURE.md · PROGRESS.md · custom/README.md
```

### Commits de la Fase 0

| Commit | Qué |
| --- | --- |
| `e234ab3` | Base del proyecto y sistema de bloques |
| `91c230f` | Inicializar proyecto de Supabase CLI |
| `85983dd` | Aclarar que el seed se implementa en la Fase 4 |
| `1acdc57` | Comandos npm para el CLI de Supabase |
| `87d4f85` | **Fix:** el `config.matcher` del middleware se perdía al reexportarse |
| `006109d` | **Fix:** el panel deja de estar enlazado en el sitio público y se marca `noindex` |
| `a4bc72d` | Configurar el skill de Graphify para VS Code Copilot Chat |
| `db4434b` | Capa de datos, tipos generados de Supabase y `vercel.json` |

---

## 3. Fase 1 — Sitio público ✅ CERRADA

Criterios de aceptación del plan:

- [x] Las 5 páginas cargan y muestran los bloques con el contenido del seed
      *(verificado leyendo el HTML prerenderizado de las 5 rutas)*
- [x] Cada bloque se renderiza bien en móvil (~375 px) y escritorio (~1280 px)
      *(auditado en el navegador a 375 px: ninguna de las 5 páginas desborda en horizontal
      y la cuadrícula de la galería pasa de 3 a 2 columnas)*
- [x] Los botones de WhatsApp abren `https://wa.me/...` con el mensaje prellenado correcto
      *(el mensaje viaja codificado en la propia URL: `?text=Hola%2C%20quisiera...`)*
- [x] Las imágenes se cargan desde Supabase Storage con `next/image`
      *(88 imágenes optimizadas en `/galeria`, servidas desde `/_next/image`)*
- [x] El visor de galería se abre al tocar, navega con flechas y se cierra con Esc
      *(comprobado en el navegador paso a paso; ver trampa 18)*
- [x] Los horarios se agrupan correctamente ("Lunes a Sábado: 9:00 a. m. – 6:00 p. m.",
      "Domingo: Cerrado")
- [x] El mapa incrustado carga con `loading="lazy"` *(y carga de verdad: el iframe de
      Google Maps responde dentro de la página)*
- [x] `<title>`, `<meta name="description">`, Open Graph y `sitemap.xml`
      *(los cinco títulos y descripciones comprobados en el HTML generado, cada uno con su
      `canonical`)*
- [x] El JSON-LD de negocio local incluye nombre, teléfono, dirección, horarios y `sameAs`
      *(tipo `DaySpa`, domingo omitido por estar cerrado, según schema.org)*
- [x] Los enlaces internos funcionan *(navegación y pie derivados de `PAGE_SLUGS`)*
- [x] Lighthouse móvil ≥ 85 en Performance, Accessibility, Best Practices y SEO
      *→ **99 · 100 · 100 · 100** sobre el build de producción*

### Tareas, en orden propuesto

**1.1 Componentes compartidos** ✅ *(hecho)*

- [x] `core/components/BlockContainer.tsx` — envoltorio de sección (ancho y padding desde tokens)
- [x] `core/components/Button.tsx` — variantes primaria y secundaria, área táctil ≥ 44 px
- [x] `core/components/Header.tsx` — navegación + botón de WhatsApp. El menú de móvil usa
      `<details>`, así que se despliega **sin JavaScript** y no es componente cliente
- [x] `core/components/Footer.tsx` — marca, contacto, horarios agrupados y redes
- [x] `core/components/PageHeading.tsx` — `<h1>` de las páginas sin Hero
- [x] `core/components/ui/Image.tsx` — envoltorio de `next/image` a partir de un `MediaRef`
- [x] `core/lib/cn.ts` — combinar clases (propio, sin dependencias: se descartó `clsx`)
- [x] `core/lib/formatting.ts` — horarios agrupados, precio y duración en español
- [x] `core/lib/navigation.ts` — enlaces derivados de `PAGE_SLUGS`, sin listas a mano

**1.1b Chrome público en vivo** ✅ *(hecho)*

- [x] `core/app/(sitio)/layout.tsx` — lee `site_settings` una sola vez y pinta Header y Footer
- [x] `core/app/(sitio)/page.tsx` — Inicio movida dentro del grupo
- [x] Shims `app/(sitio)/layout.tsx` y `app/(sitio)/page.tsx`, y **eliminados** los antiguos
      `core/app/page.tsx` y `app/page.tsx` (habrían dado conflicto: dos páginas resolviendo a `/`)
- [x] `revalidate = 3600` en el layout del sitio
- [x] `scripts/clean.mjs` + `npm run clean` — borra `.next` (ver trampa 11)

Verificado leyendo el HTML prerenderizado: la marca, la navegación, un único `<main>` y los
horarios agrupados por el servidor → **"Lunes a Sábado: 9:00 a. m. – 6:00 p. m."** y
**"Domingo: Cerrado"**. Es decir, la cadena completa funciona: Supabase → `site_settings` →
componentes → HTML.

**1.2 Bloques** ✅ *(10 de 10)*

- [x] `hero` — v2, sin botones (ver decisiones). Viene de la Fase 0
- [x] `services` — lee el catálogo único de `site_settings`; modos `summary` y `full`;
      precios ocultables con etiqueta alternativa; botón de reserva por servicio;
      tarjeta con franja de imagen 3:2
- [x] `team` — tarjetas 4:5, avatar con iniciales si no hay foto
- [x] `faq` — acordeón (ver nota)
- [x] `testimonials` — se oculta por completo si no hay testimonios activos
- [x] `booking_cta` — se oculta si el negocio no tiene WhatsApp configurado
- [x] `gallery` — cuadrícula (2 columnas en móvil, 3-4 en escritorio, proporción
      configurable) + visor ampliado. **Único componente cliente de todo el sitio**: el
      resto es HTML del servidor
- [x] `contact` — datos y botones desde `site_settings.contact` (ver nota)
- [x] `location_hours` — mapa en iframe con `loading="lazy"` + horarios agrupados
- [x] `reels` — tarjetas 9:16 con miniatura propia; la plataforma se valida por dominio

Añadido de paso: `core/components/BlockHeading.tsx` (encabezado estándar de bloque, lo
usan 8 bloques) y `core/components/admin/BlockFormPending.tsx`.

> **Nota sobre `faq`:** usa `<details>/<summary>` en lugar del `<button>` con
> `aria-expanded`/`aria-controls` del plan. Hace lo mismo sin una línea de JavaScript
> (mejor para el Lighthouse ≥ 85) y `<summary>` ya es accesible de forma nativa. Lo que
> sí se respeta: todas las respuestas están en el HTML aunque estén cerradas.

> **Nota sobre los iconos de marca:** `contact` y `reels` usan **etiquetas de texto**
> ("WhatsApp", "Instagram", "TikTok") en lugar de los iconos del plan. Son marcas
> registradas y dibujarlos a mano habría metido SVG de terceros en la plantilla por un
> detalle puramente estético. Se puede cambiar en cualquier momento sin tocar los esquemas.

> **Nota sobre los formularios:** los bloques se registran con `BlockFormPending` en lugar
> de con formularios propios. En la Fase 1 no hay ninguna pantalla que los alcance, y el
> plan pide que se generen desde el esquema zod: escribirlos a mano ahora sería trabajo
> sin verificar y condenado a reescribirse. La Fase 2 los sustituye por `DynamicForm`.

> ✅ **Resuelto.** El criterio de aceptación de la Fase 1 pide ver "el contenido del seed
> del preset Spa", pero el preset era un entregable de la Fase 4: sin contenido de ejemplo
> las páginas quedaban vacías y la Fase 1 no se podía comprobar. Se adelantó lo necesario:
> `core/presets/spa.ts` (contenido neutro), `scripts/seed.mjs` **con la guarda
> `ALLOW_SEED_RESET` ya en funcionamiento** y el comando `npm run seed`. A la Fase 4 le
> queda ampliar el preset y documentar el proceso de clonado.
>
> Para recargarlo:
> `$env:ALLOW_SEED_RESET='true'; npm run seed` (no hace falta tocar `.env.local`).
>
> El seed también genera y sube las imágenes de ejemplo que declare el preset: recorre el
> preset entero buscando `MediaRef`, en cualquier bloque, así que al añadir imágenes
> nuevas basta con volver a lanzarlo. **Después hay que hacer `npm run clean`** antes de
> compilar, o el build seguirá sirviendo el contenido cacheado (trampa 14).

**1.3 Las 5 páginas** ✅ *(hechas)*

- [x] `/` — Hero · Servicios (resumen) · Testimonios · Reservar por WhatsApp
- [x] `/servicios` — Servicios en modo completo
- [x] `/nosotros` — Equipo · Preguntas frecuentes
- [x] `/galeria` — Galería · Reels
- [x] `/contacto` — Ubicación y horarios · Contacto
- [x] `core/components/SitePage.tsx` — cuerpo común de las cuatro páginas interiores
- [x] `core/components/BlockRenderer.tsx` — busca cada bloque en el registro, valida su
      `jsonb` con el esquema y lo pinta; un bloque desconocido o inválido se omite en
      lugar de tumbar la página

Verificado leyendo el HTML prerenderizado de las cinco rutas.

**1.4 SEO y rendimiento** ✅ *(hecha, 25/09)*

- [x] `core/lib/seo.ts` — metadatos por página: `<title>`, `description`, `canonical` y Open
      Graph/Twitter. La **portada se titula con la marca y su lema**, no con la palabra
      "Inicio": es lo que aparece en Google
- [x] `generateMetadata` en cada ruta. **Tiene que salir del archivo de la ruta**, así que
      los shims de `app/` lo reexportan junto al `default` (comprobado que Next lo lee)
- [x] JSON-LD de negocio local (`DaySpa`) con `openingHoursSpecification`, `sameAs` y
      dirección, generado desde `site_settings`. Va en el `<body>`, que es donde Google
      acepta el JSON-LD sin necesidad de `next/script`
- [x] `sitemap.xml` (`core/app/sitemap.ts`) generado desde `pages`, en el orden de
      `PAGE_SLUGS`, y `robots.txt` con la referencia al mapa
- [x] Imagen Open Graph (`seo_defaults.default_og_image`, con el logotipo como último
      respaldo). Sin ella el enlace compartido se ve **sin foto** en WhatsApp
- [x] Favicon generado en `/favicon` con la inicial del negocio sobre el color del tema,
      en lugar de un binario en el repositorio
- [x] Etiquetas de caché en las queries (`blocks`, `pages`, `site-settings`), listas para
      que la Fase 2 invalide al guardar (ver `core/data/cache-tags.ts`)
- [x] `core/lib/formatting.ts` — horas agrupadas y moneda con `Intl.NumberFormat` *(hecho en 1.1)*
- [x] Lighthouse móvil ≥ 85 → **99 · 100 · 100 · 100**, sobre el build de producción

Lighthouse encontró tres cosas y **se arreglaron las tres**, no se ignoraron: un
`aria-label` sobre un párrafo (prohibido por ARIA), el nombre accesible de los enlaces de
reels (no contenía el texto visible) y un 404 de `/favicon.ico` que Chromium pide siempre.
La accesibilidad y las buenas prácticas pasaron de 96 a 100 con esos tres arreglos.

**Nota sobre la medición:** se hizo con Lighthouse 12 apuntando al build de producción y
al perfil **móvil** (el que pide el plan). En esta máquina no hay Chrome, así que se usó
Edge como motor (`CHROME_PATH`), que es el mismo motor. En el día a día, la vía simple es
Chrome > DevTools > Lighthouse > *Analyze page load*.

**1.5 Inicio como índice del sitio** ✅ *(hecho, 25/09)*

Decisión de producto: Inicio no es una página más, es el **índice del sitio**. Muestra un
resumen de cada sección y, en el encabezado de cada resumen, el enlace para entrar donde
está el contenido completo.

- [x] 9 bloques en Inicio: hero · services · reels · gallery · team · testimonials · faq ·
      contact · booking_cta
- [x] Los **reels van antes que las fotos**: son lo que se mueve, y la intención es que
      algún día se actualicen solos
- [x] El mapa (`location_hours`) se queda solo en `/contacto`: en Inicio pesa demasiado y
      el enlace ya lleva hasta él
- [x] El enlace de salida es **texto con flecha** (`Ver todos los servicios →`), no un botón
- [x] El corte (`limit`) y el enlace (`more`) se configuran por bloque, como todo lo demás
- [x] Los resúmenes **no duplican contenido**: lo leen de su propia sección

Contenido de ejemplo ampliado para que el resumen se note frente a la sección completa: 4
personas en el equipo, 5 preguntas frecuentes, 9 fotos y 4 reels (Inicio muestra 3, 3, 6 y 2).
Verificado en el navegador: las 9 secciones con la alternancia de fondos correcta, los cinco
enlaces con su flecha y cada corte exacto (6 de 9 fotos, 2 de 4 reels, 3 de 4 personas y 3 de
5 preguntas).

### Commits de la Fase 1

| Commit | Qué |
| --- | --- |
| `a168350` | Documento de progreso (`docs/PROGRESS.md`) y las trampas conocidas |
| `8bb70e1` | Componentes compartidos base (Header, Footer, Button y contenedores) |
| `4c4cb5d` | Grupo `(sitio)` con encabezado y pie en vivo, y comando `clean` |
| `172773c` | Bloques `services`, `team`, `faq`, `testimonials` y `booking_cta` |
| `28e20c1` | Preset de ejemplo, seed funcional, `BlockRenderer` y las 4 páginas restantes |
| `18ae417` | Diseño: hero sin botones y tarjetas de servicio con imagen de ejemplo |
| `bbeb66a` | Bloques `contact`, `location_hours`, `reels` y `gallery` (10 de 10) |
| `b11a23b` | Inicio como índice del sitio: resumen de cada sección, `source_page` para no duplicar contenido y el enlace de salida |
| `4924587` | SEO: metadatos por página, JSON-LD, sitemap, favicon, caché con etiquetas y los tres arreglos de Lighthouse |

---

## 4. Decisiones tomadas que afectan a la Fase 1

Estas venían de ambigüedades del plan. Ya están resueltas; **no volver a preguntarlas**:

| Tema | Decisión |
| --- | --- |
| Bloques de `/` | Hero · Servicios (resumen) · Testimonios · Reservar por WhatsApp |
| Bloques de `/nosotros` | Equipo · Preguntas frecuentes |
| Bloques de `/galeria` | Galería · Reels |
| Bloques de `/servicios` | Servicios (completo) · Reservar por WhatsApp |
| Bloques de `/contacto` | Ubicación y horarios · Contacto (el mapa primero: se entra para saber dónde está) |
| Qué hay en Inicio | **Índice del sitio (25/09):** un resumen de cada sección más el enlace a la sección completa. 9 bloques, con `reels` antes que `gallery` |
| Bloques de resumen | **No guardan contenido** (25/09). Con `source_page` toman la lista del bloque del mismo tipo de su sección, así que el contenido se edita en un único sitio y el resumen no puede quedarse desfasado. `services` no lo necesita: su catálogo ya es único en `site_settings` |
| Enlace a la sección completa | Texto con flecha, no botón. Se guarda la **página** (`more.page`), no la URL: la ruta se deriva con `pageHref()`, así que desde el panel no se puede dejar un enlace roto |
| Mapa y horarios | El mapa (`location_hours`) solo en `/contacto`; los horarios ya se ven en el pie de todas las páginas |
| Nombre del esquema de `services` | `ServicesSchema` (en el plan chocaba con su entrada del registro) |
| Ruta `/admin/servicios` | Se añade en la Fase 2 |
| Cliente para el sitio público | **Sin sesión** (`createSupabasePublicClient`), para poder cachear |
| Hero sin botones | **Decisión de producto (25/09):** la página ya tiene reserva en el botón fijo del encabezado y al final, así que el hero no repite ninguno. Se quitaron `primary_cta` y `secondary_cta` y el bloque sube a **v2**. La portada empieza más natural |
| Tarjetas de servicio | Reservan una franja 3:2 arriba para la imagen del servicio. Si el servicio no tiene imagen, la tarjeta se queda sin esa franja (no se deja un hueco vacío) |
| Chrome del sitio público | Grupo de rutas `core/app/(sitio)/` con su propio `layout.tsx` (Header + Footer). El `layout.tsx` raíz solo pone `<html>`, fuentes y tema, porque también envuelve `/admin` |
| Esquemas de bloque en el panel | `DynamicForm` genérico en la Fase 2; hasta entonces, formularios a mano |

Las desviaciones respecto al plan (shims, grupo `(panel)`, migración `001_storage`, ESLint 8,
`core/lib/contact.ts`) están documentadas y justificadas en
[`docs/ARCHITECTURE.md` §9](ARCHITECTURE.md).

---

## 5. Fases siguientes (resumen, sin detallar todavía)

- **Fase 2 — Panel A (editar contenido).** Login real con Supabase Auth y "olvidé mi
  contraseña" · `DynamicForm` generado desde zod · `/admin/paginas` y
  `/admin/paginas/[slug]` · `/admin/negocio` · `/admin/apariencia` · `/admin/imagenes` ·
  `/admin/seo` · `/admin/servicios` · subida de imágenes con compresión WebP ≤1600 px ·
  toasts e indicador de estado por tarjeta · revalidación al guardar · **inyectar
  `site_settings.theme` en el sitio (hoy el tema vive solo en `globals.css`)**.
- **Fase 3 — Panel B (composición).** Interruptor `enabled` por bloque · arrastrar y
  soltar para reordenar · persistir `order` · funciona en móvil (toque) y escritorio.
- **Fase 4 — Preset y clonado.** `core/presets/spa.ts` con contenido neutro ·
  `scripts/seed.ts` con la guarda `ALLOW_SEED_RESET` y creación del admin · README de
  clonado · checklist de la sección 6.9 del plan.
- **Hito.** Congelar la plantilla (`template-v1.0`), marcarla como repositorio plantilla
  en GitHub y crear la copia de N&M.
- **Fase 5 — Personalización de N&M.** Solo en la copia. Verde y dorado por tokens,
  contenido real, dominio propio.

---

## 6. Trampas ya encontradas (no volver a caer)

Cada una costó tiempo; están ordenadas por gravedad.

1. **El `config.matcher` del middleware NO se puede reexportar.** Next.js lo extrae con
   análisis estático y no sigue reexports: el matcher desaparece, el middleware corre en
   **todas** las rutas y el sitio público entero redirige a `/admin/login`. El `config`
   va literal en `middleware.ts` (raíz), y el middleware además comprueba la ruta por su
   cuenta. **Cómo diagnosticarlo:** mirar `"matchers"` en
   `.next/server/middleware-manifest.json`.
2. **`core/app/` no lo detecta Next.js.** Hace falta un shim de una línea por ruta en
   `app/`, y lo mismo para `middleware.ts`, `tailwind.config.ts` y `postcss.config.js`.
3. **`Block<z.ZodTypeAny>` no sirve como comodín del registro.** TypeScript no resuelve
   `z.infer<S>` cuando `S` es el comodín y obliga a un `as unknown` por entrada. Se usa
   la interfaz `AnyBlock` de `core/blocks/registry.ts`, sin genéricos y sin casts.
4. **El sitio público no debe usar el cliente con cookies.** `cookies()` obliga a
   renderizar en cada petición y tira por tierra la caché y la revalidación. Para leer
   contenido público, `createSupabasePublicClient`.
5. **Vercel: "No Output Directory named `public`".** La causa es que el *Framework
   Preset* no es Next.js y Vercel busca un sitio estático. Arreglado con `vercel.json`
   (`"framework": "nextjs"`) y, en el panel, preset **Next.js** con *Output Directory* y
   *Root Directory* vacíos.
6. **Graphify necesita dos extras para este proyecto:** `tree_sitter_sql` (sin él, las
   migraciones no entran al grafo) y `openai` (el backend de DeepSeek lo usa por debajo).
7. **Graphify lee las claves SOLO de variables de entorno**, nunca de un `.env`.
8. **PowerShell bloqueaba `npm.ps1` y `npx.ps1`.** Se resolvió con
   `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`. Por eso el
   proyecto usa scripts de npm (`db:login`, `db:link`, `db:push`, `db:types`) en lugar de
   `npx`: npm los ejecuta desde `node_modules/.bin` y se salta el problema.
9. **La terminal integrada de VS Code se atasca con salidas largas** o comandos
   interactivos. Cuando pase, redirigir a un archivo y leerlo:
   `comando 2>&1 | Out-File -Encoding utf8 log.txt`.
10. **`graphify-out/` está en `.gitignore`** (estado de cada máquina, no se versiona).
    Comprobado que los secretos no entran en el grafo: respeta `.gitignore`.
11. **Al mover o borrar rutas, `.next/types` queda obsoleto** y `npm run type-check` falla
    con un `Cannot find module '../../../app/page.js'` desconcertante, porque
    `tsconfig.json` incluye esos tipos generados. Se arregla con **`npm run clean`** antes
    de verificar.
12. **Los secretos no se pegan en el chat.** El 25/09 se compartió `.env.local` en la
    conversación y la clave secreta quedó expuesta en el historial. No llegó al
    repositorio ni al grafo (comprobado). **Decisión acordada:** no se rota ahora; se
    rotarán todas las claves justo antes de entregar al cliente final y se actualizará la
    plantilla. Si algún día el proyecto pasa a tener datos reales antes de eso, rotar.
13. **`export const X = z.object(...)` NO crea un tipo.** Al usar `X` como tipo hay que
    añadir también `export type X = z.infer<typeof X>;`. Se olvidó con `ServiceItem` y el
    error que sale ("refers to a value, but is being used as a type") no apunta al sitio
    del problema. Revisar esto al añadir cualquier esquema nuevo.
14. **Next cachea las lecturas de datos en `.next/cache`, y esa caché sobrevive entre
    compilaciones.** Después de cargar contenido con el seed, el build siguió sirviendo la
    configuración anterior: el bloque `services` no se pintaba y el pie no tenía
    dirección. Se arregla con **`npm run clean`** antes de compilar. En producción este
    comportamiento es el ISR que pide el plan (`revalidate = 3600`), no un fallo; en
    desarrollo desconcierta mucho si no se sabe.
15. **Al añadir una ruta dentro de `(sitio)`, el shim debe ir también dentro del grupo.**
    Una página fuera del grupo NO hereda el layout, así que perdería encabezado y pie sin
    ningún aviso.
16. **`next/image` necesita `sharp`.** Sin él la optimización de imágenes falla y las
    fotos se ven rotas. Se añadió `sharp` a las dependencias (en Vercel ya viene).
17. **Las imágenes de ejemplo las genera el seed, no se versionan.** `scripts/seed.mjs`
    crea PNG de color plano con `scripts/placeholder-image.mjs` (escritos a mano con
    `node:zlib`, sin dependencias) y los sube al bucket. Así el contenido de prueba es
    reproducible y el repositorio no carga binarios. Son PNG, no WebP: excepción
    deliberada limitada al contenido de ejemplo.
18. **Escape en un `<dialog>` modal no es de fiar.** El cierre con Esc lo ejecuta el motor
    al disparar `cancel`, y el navegador integrado de VS Code (Electron) **no lo dispara**.
    Se comprobó que el fallo es del entorno y no del código (a un `<dialog>` vacío creado
    al vuelo le pasa lo mismo), pero la conclusión práctica es la misma: si el visor tiene
    que cerrarse con Esc, hay que escucharlo a mano en el `keydown`. Delegarlo en `cancel`
    significa depender del navegador y, de paso, no poder verificarlo (trampa 9).
19. **TypeScript no afina un índice a partir de un valor derivado.** Con
    `const current = openIndex === null ? undefined : images[openIndex]`, dentro de
    `{current && ...}` el `openIndex` sigue siendo `number | null` y usarlo directamente da
    `TS18047`. La salida limpia es derivar el valor que se necesita
    (`const position = openIndex === null ? 0 : openIndex + 1`) en lugar de castear a
    `number` y perder la comprobación.
20. **`min-h-80` no existe en Tailwind 3.** La escala de `min-height` no es la de
    espaciado: esa clase no genera nada y **no avisa de nada**. Para alturas mínimas
    arbitrarias, `min-h-[320px]`.
21. **Alternar el fondo de las secciones es cosa del CSS, no de cada bloque.** El plan
    daba una prop `alternate` por bloque; con ese enfoque el hero (sin imagen) y
    `services` cayeron juntos en el mismo color de fondo. Ahora lo decide una sola regla
    (`.site-main > section:nth-of-type(even)`, en `globals.css`), así que ningún bloque
    puede volver a romper el ritmo visual y nadie tiene que acordarse de pasar la prop.
    *La prop `alternate` de `BlockContainer` se eliminó.*
22. **`isGoogleMapsEmbedUrl` tiene que aceptar las dos formas de URL.** El embed “clásico”
    de Google Maps es `.../maps?q=<lat>,<lng>&output=embed`, sin `/embed` en la ruta. La
    validación solo miraba el segundo formato y rechazaba el que la gente copia de verdad.
    Ancho de miras: validar dominios de terceros mirando solo un formato es una trampa
    fácil de repetir (pasa igual con Instagram y TikTok).
23. **Una importación de más rompe el build con un error que no explica nada.**
    `core/types/settings.ts` importa `MediaRef` de `core/blocks/shared.ts`; al añadir en
    `shared.ts` un `import { PAGE_SLUGS } from '@/types/settings'` se cerró el círculo y el
    build murió con `ReferenceError: Cannot access 'w' before initialization` **al recopilar
    los datos de las páginas**. Lo traicionero es que el type-check, el lint y el propio
    `Compiled successfully` pasan: solo falla en tiempo de ejecución. Se arregló sacando
    las referencias a otras páginas a `core/blocks/links.ts`. **Antes de añadir una
    importación a `blocks/shared.ts` o a `types/settings.ts`, comprobar que no cierra el
    círculo.**
24. **`next/font/google` descarga las tipografías durante el build.** Si la red falla, el
    build muere con `An error occurred in next/font. TypeError: Cannot read properties of
    null (reading '1')`, que no menciona las fuentes por ningún lado. Pasó una vez y
    desapareció al reintentar: era red, no código. Si se vuelve crónico, la salida es pasar
    a `next/font/local` con los archivos dentro del repositorio.
25. **`aria-label` no vale en cualquier elemento.** Sobre un `<p>` o un `<div>` (roles
    `paragraph`/`generic`) ARIA lo **prohíbe**: el navegador lo ignora, un lector de
    pantalla no oye la etiqueta y Lighthouse lo marca (`aria-prohibited-attr`). Si hay que
    nombrar algo, se le da un rol que lo admita —las estrellas de valoración llevan
    `role="img"`— o se usa texto visualmente oculto.
26. **Un `aria-label` que no contiene el texto visible incumple WCAG 2.5.3**
    (`label-content-name-mismatch`): quien navega dictando por voz dice lo que ve, así que
    el nombre accesible tiene que incluir la etiqueta visible. En los reels, el contexto
    ("Ver reel en…") pasó a ser un `<span className="sr-only">` en vez de un `aria-label`.
27. **Chromium pide `/favicon.ico` aunque no haya ninguna etiqueta que lo declare.** Si no
    existe, es un 404 en la consola y cuenta en las buenas prácticas de Lighthouse. Y ojo
    con la salida fácil: los archivos **estáticos** de `app/` (un `icon.svg`, por ejemplo)
    no se pueden reexportar desde `core/` con un shim —se copiarían, y habría dos
    originales—, así que el favicon es una **ruta** (`core/app/favicon/route.ts`).

---

## 7. Deuda técnica y pendientes conocidos

- El seed se adelantó a la Fase 1 (existe, funciona y sube imágenes), así que a la Fase 4
  le queda ampliar el preset a contenido neutro más completo y documentar el clonado en el
  README. El README ya avisa de que el preset es de ejemplo.
- Los reels son **manuales**: la miniatura y el enlace se suben a mano. La intención es que
  algún día se actualicen solos cuando el negocio publique en Instagram o TikTok (API o
  feed). Hasta entonces, cada reel nuevo se añade desde el panel.
- El favicon es un **monograma generado** a partir del nombre y la paleta. Cuando el panel
  permita subir uno propio (`brand.favicon`, Fase 2), la ruta `/favicon` lo servirá y el
  monograma quedará de respaldo.
- Open Graph usa **una sola imagen de reserva para todo el sitio**. El campo
  `pages.og_image` ya existe y `buildPageMetadata` lo respeta, pero todavía no hay panel
  para subir una imagen por página (Fase 2).
- La invalidación de la caché es **gruesa** (una etiqueta por tipo de contenido, no por
  página). Es deliberado y está razonado en `core/data/cache-tags.ts`; se afina si el sitio
  crece.
- `next/font/google` descarga las fuentes en tiempo de compilación. En esta máquina la
  descarga de `fonts.gstatic.com` falló durante `next dev` y Next siguió con la fuente de
  reserva sin quejarse (`El build sí las resolvió`). Si algún día el build falla por las
  fuentes, es esto.
- El tema de `site_settings.theme` **se guarda pero no se aplica**: el sitio lee los
  tokens de `globals.css`. Falta inyectarlo en el `<style>` del root layout y validar el
  contraste 4.5:1 antes de guardar (Fase 2).
- Los formularios de bloque se escriben a mano hasta que exista `DynamicForm` (Fase 2).
- `docs/DEPLOYMENT.md` y `docs/SCHEMA.md` están pendientes (opcionales en el plan).
- `core/app/admin/[seccion]/page.tsx` todavía no existen: el dashboard lista las
  secciones pero ninguna es navegable (Fase 2).
- Las migraciones `001_storage.sql` crean el bucket y sus políticas; si algún push falla
  por permisos sobre el esquema `storage`, el bucket se puede crear desde el panel.

---

## 8. Rutina al cerrar un bloque de trabajo

1. `npm run verify` (type-check + lint + build) y dejarlo en verde.
2. `graphify update .` — gratis, sin LLM. Refrescar también el informe.
   *(la parte semántica, que sí cuesta, solo cuando cambien los **documentos**)*
3. Actualizar **este archivo**: marcar casillas, anotar el commit, y añadir cualquier
   trampa nueva a la sección 6.
4. `git add . && git commit -m "Fase X: descripción"` y `git push origin main`.
5. Si algo queda a medias, dejarlo escrito aquí con su estado.

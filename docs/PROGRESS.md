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
| **Fase actual** | **Fase 1 en curso** — encabezado, pie y navegación ya en vivo. Fase 0 cerrada |
| **Rama** | `main` |
| **Repositorio** | https://github.com/dayronpm/nym.git |
| **Supabase** | Proyecto `lpdxxdexneztgydrvixs` · migraciones aplicadas · usuario admin creado |
| **Vercel** | Desplegando correctamente (`vercel.json` fuerza el preset Next.js) |
| **Salud del código** | `type-check` ✅ · `lint` ✅ · `build` ✅ |
| **Grafo de conocimiento** | 332 nodos · 513 aristas · 27 comunidades (Graphify, backend DeepSeek) |

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

## 3. Fase 1 — Sitio público ⏳ SIGUIENTE

Criterios de aceptación del plan:

- [ ] Las 5 páginas cargan y muestran los bloques con el contenido del seed
- [ ] Cada bloque se renderiza bien en móvil (~375 px) y escritorio (~1280 px)
- [ ] Los botones de WhatsApp abren `https://wa.me/...` con el mensaje prellenado correcto
- [ ] Las imágenes se cargan desde Supabase Storage con `next/image`
- [ ] El visor de galería se abre al tocar, navega con flechas y se cierra con Esc
- [ ] Los horarios se agrupan correctamente ("Lunes a viernes: 9:00 a. m. – 6:00 p. m.")
- [ ] El mapa incrustado carga con `loading="lazy"`
- [ ] `<title>`, `<meta name="description">`, Open Graph y `sitemap.xml`
- [ ] El JSON-LD de negocio local incluye nombre, teléfono, dirección, horarios y `sameAs`
- [ ] Los enlaces internos funcionan
- [ ] Lighthouse móvil ≥ 85 en Performance, Accessibility, Best Practices y SEO

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

**1.2 Bloques restantes** (falta 9 de 10)

- [ ] `services` — el más complejo: lee el catálogo único de `site_settings`, dos modos
- [ ] `gallery` — cuadrícula + visor ampliado con navegación por teclado y foco atrapado
- [ ] `team` — tarjetas 4:5, avatar con iniciales si no hay foto
- [ ] `faq` — acordeón con `aria-expanded`, respuestas presentes en el HTML
- [ ] `contact` — datos y botones desde `site_settings.contact`
- [ ] `location_hours` — mapa en iframe con `loading="lazy"` + horarios agrupados
- [ ] `testimonials` — existe en la plantilla; el bloque no se muestra si está vacío
- [ ] `booking_cta` — botón de WhatsApp con mensaje genérico o propio
- [ ] `reels` — tarjetas 9:16 con miniatura propia y validación de dominio por plataforma

**1.3 Las 4 páginas que faltan** (con sus shims en `app/`)

- [ ] `/servicios` — Servicios en modo completo
- [ ] `/galeria` — Galería + Reels
- [ ] `/nosotros` — Equipo + Preguntas frecuentes
- [ ] `/contacto` — Contacto + Ubicación y horarios
- [ ] `/` — completar con el reparto decidido (ver sección 4)

**1.4 SEO y rendimiento**

- [ ] `core/lib/seo.ts` — generación de metadatos por página
- [ ] JSON-LD de negocio local (`DaySpa`) con `openingHoursSpecification` y `sameAs`
- [ ] `sitemap.xml` (`core/app/sitemap.ts`)
- [ ] Etiquetas de caché + `revalidateTag` en las queries (la base para la Fase 2)
- [ ] `core/lib/formatting.ts` — horas agrupadas y moneda con `Intl.NumberFormat`
- [ ] Pasar Lighthouse móvil ≥ 85

---

## 4. Decisiones tomadas que afectan a la Fase 1

Estas venían de ambigüedades del plan. Ya están resueltas; **no volver a preguntarlas**:

| Tema | Decisión |
| --- | --- |
| Bloques de `/` | Hero · Servicios (resumen) · Testimonios · Reservar por WhatsApp |
| Bloques de `/nosotros` | Equipo · Preguntas frecuentes |
| Bloques de `/galeria` | Galería · Reels |
| Bloques de `/servicios` | Servicios (completo) · Reservar por WhatsApp |
| Bloques de `/contacto` | Contacto · Ubicación y horarios |
| Nombre del esquema de `services` | `ServicesSchema` (en el plan chocaba con su entrada del registro) |
| Ruta `/admin/servicios` | Se añade en la Fase 2 |
| Cliente para el sitio público | **Sin sesión** (`createSupabasePublicClient`), para poder cachear |
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
    repositorio ni al grafo (comprobado), pero hubo que rotarla. La forma correcta de
    pasarla es editando el archivo a mano o ejecutando el comando uno mismo.

---

## 7. Deuda técnica y pendientes conocidos

- `npm run seed` no existe todavía (Fase 4). El README lo advierte.
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

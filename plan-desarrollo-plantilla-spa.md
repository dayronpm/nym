# Plan de desarrollo: plantilla de sitio web + panel para spa

Primer cliente: **N&M Salón Spa**. Objetivo: construir primero una plantilla genérica y editable, reutilizable en otros negocios, y después personalizarla para cada cliente.

> Última actualización: 23 de septiembre de 2026. Las fechas y estados de Supabase deben verificarse de nuevo antes de empezar (ver sección 6).

---

## 📖 INSTRUCCIONES PARA DEEPSEEK V4.1 FLASH

**¿Qué es este documento?**

Este es el plan completo de arquitectura, especificación y entregables para construir una plantilla de sitio web + panel de administración para negocios tipo spa, salón de belleza, estética, etc. Todo el código estará en este repositorio y será reutilizable para múltiples clientes.

**¿Qué vas a construir?**

Un sistema completo de **5 páginas públicas** (Inicio, Servicios, Galería, Nosotros, Contacto) + **panel de administración** con:
- 10 bloques de contenido (Hero, Servicios, Galería, Equipo, Horarios, Contacto, Testimonios, FAQ, Reels, WhatsApp)
- Gestión de contenido sin código (editar bloques, tema, SEO)
- Subida de imágenes con compresión automática
- Login seguro con Supabase Auth
- Revalidación automática del sitio público

**¿Cuántas fases hay?**

**5 fases** (0 a 4), cada una con criterios de aceptación claros (sección 4):

1. **Fase 0:** Base (repositorio, estructura, Next.js, Supabase, migraciones).
2. **Fase 1:** Sitio público completo (5 páginas, 10 bloques, SEO).
3. **Fase 2:** Panel A (editar contenido, subir imágenes, theme).
4. **Fase 3:** Panel B (reordenar bloques, activar/desactivar).
5. **Fase 4:** Preset y documentación (contenido ejemplo neutro, guía de setup).

**¿Qué tecnologías usarás?**

Ver sección 2.1 (Stack completo) y sección 2.2 (Herramientas). Resumen:
- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **BD/Auth:** Supabase (Postgres, Auth, Storage)
- **Validación:** zod
- **Despliegue:** Vercel
- **Versionado:** Git + GitHub

**¿Qué herramientas debes tener instaladas?**

Ver checklist en sección 2.3. En resumen:
- Node.js 22+, npm
- Supabase CLI (`supabase login`)
- Git + GitHub
- VSCode (recomendado)
- Vercel CLI (opcional, para Fase 4)

**¿Cómo debes trabajar?**

1. **Antes de empezar:** ejecuta el setup (sección 2.3).
2. **Cada fase en una rama:** `git checkout -b fase-X`.
3. **Después de cambios:** `npm run type-check && npm run format && npm run build`.
4. **Antes de cada commit:** `git add . && git commit -m "Fase X: descripción"`.
5. **Al terminar la fase:** crea una PR o mergea a `dev`, y lista los criterios de aceptación cumplidos.

**¿Qué NO debes hacer?**

- ❌ Usar librerías UI (shadcn/ui, Chakra, daisyUI, etc.). Tailwind vanilla es suficiente.
- ❌ Usar ORM (Prisma, Drizzle, TypeORM). Solo `supabase-js` directamente.
- ❌ Frameworks de formularios complejos (React Hook Form, Formik). zod + HTML puro es suficiente.
- ❌ Meter datos de N&M Salón Spa en `core/`. Todo debe ser genérico en la Etapa 1.
- ❌ Crear dependencias innecesarias. La simplicidad es la meta.
- ❌ Saltarse fases. Termina cada una completamente antes de la siguiente.

**¿Qué se espera al final?**

Un repositorio Git limpio, versionado, con:
- **Código:** ~3000–3500 líneas de TypeScript + JSX.
- **Migraciones SQL:** tablas, RLS, GRANT.
- **Documentación:** README.md + docs opcionales.
- **Tests:** Lighthouse ≥ 85, todas las 5 páginas públicas y panel funcional.
- **Deployable:** con `npm install`, `npm run dev` funciona en 30 segundos.

---

## 0. Instrucciones para la IA (léelas primero)

Este documento es la fuente única de verdad del proyecto. Tú vas a generar el código.

1. **Trabaja por fases, en orden.** No empieces una fase sin haber cumplido los criterios de la anterior. El orden y las dos etapas están en la sección 4.
2. **Etapa 1 = plantilla genérica.** Durante la Etapa 1 **no puede haber ningún dato de N&M Salón Spa** en el código, en la base de datos ni en los textos: usa nombre y contenido de ejemplo neutros ("Nombre del Negocio"). La personalización ocurre solo en la Etapa 2, en una copia.
3. **No inventes datos.** Si falta un dato, usa un valor de ejemplo claramente marcado como tal y anótalo en una lista de pendientes; no lo presentes como definitivo.
4. **Verifica en la documentación oficial** todo lo que cambia con el tiempo (claves de Supabase, permisos de la Data API, versiones mínimas de Node y TypeScript, API de Next.js). La sección 6 lista lo conocido a 20 de septiembre de 2026, pero puede haber cambiado.
5. **Seguridad:** nunca expongas la clave secreta de Supabase al navegador; RLS activado en todas las tablas.
6. **Idioma:** toda la interfaz (sitio y panel) en español. El código y los comentarios técnicos pueden estar en inglés.
7. **Código simple y modular:** TypeScript estricto, sin dependencias innecesarias, una capa propia para el acceso a datos y nada específico de un negocio dentro de `core/`.
8. **Al terminar cada fase**, entrega: resumen de lo hecho, lista de archivos creados o modificados, cómo probarlo y qué queda pendiente.

---

## 1. Decisiones tomadas

| Tema | Decisión |
|---|---|
| Enfoque | Plantilla genérica primero; personalización por negocio después |
| Edición de contenido | Panel de administración propio (sin CMS externo), modular por bloques |
| Instalaciones | Una instalación independiente por negocio (no multi-tenant) |
| Mantenimiento de la plantilla | Repositorio plantilla + copia por negocio, con carpetas `core/` y `custom/` |
| Costos | Cada cliente asume sus propias cuentas (Supabase, Vercel, dominio) |
| Bloques v1 | Hero, Servicios, Galería, Ubicación y horarios, Contacto, Testimonios, Equipo, Preguntas frecuentes, Reservar por WhatsApp y **Reels / Redes** |
| Control del dueño | Fase A: solo editar contenido. Fase B: reordenar y activar/desactivar bloques |
| Idioma | Solo español |
| Estilo visual | Tokens de diseño editables (colores, tipografías, radios), un layout por bloque |
| Imágenes | Supabase Storage, con compresión y redimensionado en el navegador |
| Acceso al panel | Un administrador en la fase 1; modelo de datos preparado para varios perfiles (`role`) |
| Dominio | Desarrollo en `.vercel.app`; al lanzar, dominio propio comprado por el cliente |
| SEO | SEO técnico básico incluido en la plantilla |
| Acceso a datos | **`supabase-js`** con migraciones SQL (sin Prisma) |
| Páginas del sitio | Multipágina básica: Inicio, Servicios, Galería y Reels, Nosotros y Contacto (una página por servicio queda para más adelante) |
| Dirección visual base | Opción A: minimalista y sereno (mucho espacio en blanco, títulos serif, fotos grandes, colores suaves, detalles finos) |
| Paleta base | Opción A: neutros cálidos (crema y arena) con acento terracota suave; valores concretos en la sección 3 |
| Testimonios | Escritos a mano en el panel, con imagen opcional. El bloque está en la plantilla, pero N&M no lo usa por ahora (desactivado) |
| Galería | Cuadrícula uniforme con visor ampliado; proporción de recorte configurable |
| Equipo | Foto, nombre, cargo y biografía corta opcional |
| Preguntas frecuentes | Acordeón simple |
| Hero | Texto e imagen lado a lado (en móvil, imagen arriba) |
| Ubicación y horarios | Mapa de Google Maps incrustado con carga diferida, más botón "Cómo llegar"; horarios guardados en los ajustes del sitio |
| Contacto | Datos y botones, sin formulario (el formulario queda para el módulo futuro de reservas) |
| Reels / Redes | Tarjetas con miniatura subida a mano y enlace, sin embeds |
| Navegación del panel | Menú por secciones: Páginas y bloques, Negocio, Apariencia, Imágenes, SEO |
| Dispositivo del panel | Móvil primero, adaptable a escritorio |
| Login del panel | Correo y contraseña (Supabase Auth), con "olvidé mi contraseña" |
| Avisos de guardado | Toast breve + indicador fijo de estado por tarjeta |
| Seed de datos | Limpia las tablas antes de cargar el preset, con confirmación de seguridad |
| Dirección de marca de N&M | Rebranding a posicionamiento premium, inspirado en el estilo de marcas como Apple: minimalista pero con suficiente información (ver sección "Personalización de N&M") |
| Organización del trabajo | **Etapa 1:** plantilla genérica completa. **Hito:** congelarla como plantilla. **Etapa 2:** copia para N&M y personalización |
| Formato de entrega | Un solo documento (este), pensado para pasárselo a una IA que genere el código (DeepSeek V4.1 Flash) |

---

## 2. Stack y herramientas

### 2.1 Stack tecnológico

| Capa | Tecnología | Por qué | Versión mínima |
|---|---|---|---|
| **Frontend** | Next.js 14 (App Router) | SSR/SSG, SEO, opt. imágenes | 14.0+ |
| **Lenguaje** | TypeScript | tipado estricto, menos bugs | 5.0+ |
| **Estilos** | Tailwind CSS + CSS Variables | tokens editables, responsive | 3.3+ |
| **Validación** | zod | tipado, runtime validation | 3.20+ |
| **BD & Auth** | Supabase (Postgres + Auth + Storage) | serverless, RLS, escalable | Jul 2026+ |
| **Cliente BD** | @supabase/supabase-js + @supabase/ssr | evita agotamiento conexiones | 2.38+ |
| **Despliegue** | Vercel | optimizado para Next.js, edge | — |
| **Versionado** | Git + GitHub | control de versiones, CI/CD | — |
| **Testing** | Manual + Lighthouse | validación de performance | — |
| **Runtime** | Node.js | ejecutar scripts, build | 22.0+ |
| **Package Mgr** | npm | instalar dependencias | 10.0+ |

**Por qué Next.js y no React solo?**  
El sitio depende del SEO, y Next.js entrega el HTML ya renderizado desde el servidor, genera metadata, sitemap y optimiza imágenes automáticamente.

**Por qué `supabase-js` y no Prisma?**  
Supabase usa HTTPS (consulta por API), evitando agotamiento de conexiones que Prisma tiene en Vercel (entorno serverless). El clonado por cliente es más simple: ejecutar SQL directamente.

**Por qué Tailwind + CSS Variables y no styled-components / Emotion?**  
Tailwind es lightweight, se precompila, y las CSS variables permiten editar el tema en la BD sin recompilar el sitio.

---

### 2.2 Herramientas y MCPs (Model Context Protocol)

**¿Qué es un MCP?** Extensión de VSCode que le da a Deepseek acceso a herramientas externas (Git, npm, Supabase CLI, etc.) sin dejar VSCode.

#### **NIVEL 1: Esenciales (Deepseek DEBE usar)**

**1. Git / GitHub**
- **Qué hace:** control de versiones, ramas, commits.
- **Por qué:** Deepseek crea ramas por fase (`fase-0`, `fase-1`, etc.), hace commits atómicos, revisa diffs.
- **Comandos típicos:**
  ```bash
  git checkout -b fase-0
  git add . && git commit -m "Fase 0: setup inicial"
  git push origin fase-0
  ```
- **Integración:** VSCode tiene Git integrado; Deepseek lo usa con terminal.
- **Recomendación de ramas:**
  ```
  main (plantilla estable, tags v1.0.0)
  dev (rama de desarrollo activo)
  fase-0, fase-1, ... (una por fase)
  ```

**2. Node.js / npm**
- **Qué hace:** instalar dependencias, ejecutar scripts, tests.
- **Comandos críticos:**
  ```bash
  npm install
  npm run dev         # levanta servidor local
  npm run build       # compila para producción
  npm run type-check  # verifica TypeScript
  npm run lint        # ESLint
  npm run format      # Prettier
  npm run seed        # carga datos ejemplo
  ```
- **Dependencias que Deepseek instalará:**
  ```json
  {
    "dependencies": {
      "next": "^14",
      "react": "^18",
      "typescript": "^5",
      "tailwindcss": "^3",
      "zod": "^3",
      "@supabase/supabase-js": "^2",
      "@supabase/ssr": "^0.10"
    },
    "devDependencies": {
      "@types/node": "^22",
      "@types/react": "^18",
      "postcss": "^8",
      "autoprefixer": "^10",
      "prettier": "^3",
      "eslint": "^9",
      "eslint-config-next": "^14"
    }
  }
  ```

**3. Supabase CLI**
- **Qué hace:** migraciones SQL, generación de tipos, emulador local, seed.
- **Comandos críticos:**
  ```bash
  supabase login                    # conectar a cuenta
  supabase db push                  # aplicar migraciones
  supabase gen types > src/types/supabase.ts
  supabase start                    # emulador local
  supabase seed restore             # cargar seed
  ```
- **Integración:** se ejecuta desde terminal o bash en VSCode.
- **Requisito:** Deepseek debe crear un proyecto en supabase.com (gratis) y tener las claves en `.env.local`.

**4. TypeScript Compiler (tsc)**
- **Qué hace:** verifica tipos, detecta errores.
- **Script recomendado en `package.json`:**
  ```json
  "scripts": {
    "type-check": "tsc --noEmit",
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "seed": "node supabase/seed.ts",
    "lint": "eslint . --ext .ts,.tsx",
    "format": "prettier --write ."
  }
  ```
- **Deepseek debe:** ejecutar `npm run type-check` después de cambios para asegurar TypeScript strict.

---

#### **NIVEL 2: Muy recomendados (mejoran mucho la calidad)**

**5. ESLint + Prettier**
- **Qué hace:** atrapa errores, formatea código consistentemente.
- **Setup recomendado:** crear `.eslintrc.json` (ver Anexo D).
- **Scripts:**
  ```bash
  npm run lint       # detectar errores
  npm run format     # formatear automáticamente
  ```
- **Deepseek debe:** ejecutar antes de cada commit:
  ```bash
  npm run format && npm run lint
  git add .
  git commit -m "..."
  ```

**6. Vercel CLI** (opcional pero muy útil)
- **Qué hace:** despliegue, variables de entorno, preview links.
- **Comandos:**
  ```bash
  vercel login
  vercel env pull           # descargar .env.local desde Vercel
  vercel deploy             # despliegue a preview URL
  vercel --prod             # despliegue a producción
  ```
- **¿Cuándo?** Fase 4, antes de lanzar.
- **Recomendación:** Deepseek NO hace deploy automático; tú lo revisas primero.

**7. Lighthouse CI** (métricas de rendimiento)
- **Qué hace:** mide performance, accesibilidad, SEO (score ≥ 85 requerido).
- **Opción simple:** abrir página en Chrome > DevTools > Lighthouse > "Analyze page load" (manual).
- **Opción automatizada:** instalar Lighthouse CI:
  ```bash
  npm install -g @lhci/cli@latest
  lhci autorun
  ```
- **Requerimiento crítico:** el sitio debe pasar con score ≥ 85 en móvil antes de terminar Fase 1.

---

### 2.3 Checklist de setup para Deepseek

**Deepseek debe confirmar que tiene todo esto instalado y configurado:**

- [ ] **Node.js 22+** instalado: `node --version`
- [ ] **npm 10+** instalado: `npm --version`
- [ ] **Git** configurado: `git config --global user.name "Deepseek"`
- [ ] **VSCode** con terminal integrada.
- [ ] **Supabase CLI**: `supabase --version`
- [ ] **Supabase account** creada (supabase.com, gratis).
- [ ] **GitHub repository** creado y clonado localmente.

**Antes de empezar Fase 0:**

```bash
# 1. Clonar y navegar
git clone <URL del repositorio>
cd spa-plantilla

# 2. Crear rama dev
git checkout -b dev

# 3. Crear .gitignore
echo "node_modules
.env.local
.vercel
.next
out
dist
*.log
.DS_Store" > .gitignore

# 4. Inicializar npm
npm init -y

# 5. Instalar dependencias base
npm install next@14 react react-dom typescript tailwindcss postcss autoprefixer
npm install -D @types/node @types/react prettier eslint eslint-config-next zod @supabase/supabase-js @supabase/ssr

# 6. Crear tsconfig.json (Next.js lo hace automático, pero verifica que sea strict)

# 7. Instalar Supabase CLI
npm install -D @supabase/cli

# 8. Configurar Supabase
supabase login
supabase projects list    # copiar ID del proyecto

# 9. Crear .env.local (llenar con claves de Supabase)
echo "NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJ...
SUPABASE_SECRET_KEY=eyJ...
ALLOW_SEED_RESET=false" > .env.local

# 10. Aplicar migraciones
supabase db push

# 11. Generar tipos
supabase gen types typescript --linked > src/types/supabase.ts

# 12. Verificar
npm run type-check    # debe pasar sin errores
npm run dev           # debe abrir http://localhost:3000

# 13. Primer commit
git add .
git commit -m "Fase 0: setup inicial"
git push origin dev
```

**Después de cada fase:**

```bash
# Verificar que todo funciona
npm run type-check      # TypeScript sin errores
npm run format          # formatear código
npm run lint            # sin errores de linting
npm run build           # compila para producción
npm run dev             # visually verify

# Commit y push
git add .
git commit -m "Fase X: descripción clara"
git push origin fase-X

# (Opcional) Merge a dev o crear PR
git checkout dev
git pull origin dev
git merge fase-X
git push origin dev
```

---

## 3. Arquitectura

### Estructura del repositorio

```
/core        panel, bloques base, lógica compartida, presets
/custom      tema, contenido y bloques propios del negocio
/supabase
  /migrations   SQL versionado (tablas, RLS, permisos)
```

Regla: los componentes nunca leen textos ni colores directamente. Todo llega desde el contenido en base de datos y los tokens del tema.

### Estructura exacta de carpetas

```
/
├── core/                          plantilla genérica, nunca se personaliza
│   ├── app/                       rutas de Next.js
│   │   ├── layout.tsx             root layout con fuentes y variables CSS
│   │   ├── page.tsx               página de Inicio (/)
│   │   ├── servicios/
│   │   │   └── page.tsx
│   │   ├── galeria/
│   │   │   └── page.tsx
│   │   ├── nosotros/
│   │   │   └── page.tsx
│   │   ├── contacto/
│   │   │   └── page.tsx
│   │   ├── admin/
│   │   │   ├── layout.tsx         protección con sesión
│   │   │   ├── login/page.tsx
│   │   │   ├── page.tsx           dashboard
│   │   │   ├── paginas/
│   │   │   │   ├── page.tsx       lista de páginas
│   │   │   │   └── [slug]/page.tsx   bloques de la página
│   │   │   ├── negocio/page.tsx
│   │   │   ├── apariencia/page.tsx
│   │   │   ├── imagenes/page.tsx
│   │   │   └── seo/page.tsx
│   │   └── api/
│   │       ├── auth/[...auth]/route.ts   Supabase Auth callback
│   │       ├── revalidate/route.ts       webhook de revalidación (si se usa)
│   │       └── upload/route.ts           subida de imágenes (compresión servidor)
│   ├── blocks/
│   │   ├── shared.ts              tipos y esquemas comunes (MediaRef, etc.)
│   │   ├── defineBlock.ts         función para registrar bloques
│   │   ├── registry.ts            lista global de bloques registrados
│   │   ├── hero/
│   │   │   ├── schema.ts
│   │   │   ├── HeroBlock.tsx      componente público
│   │   │   ├── HeroForm.tsx       formulario del panel
│   │   │   └── index.ts           export e índice
│   │   ├── services/
│   │   │   ├── schema.ts
│   │   │   ├── ServicesBlock.tsx
│   │   │   ├── ServicesForm.tsx
│   │   │   └── index.ts
│   │   ├── [gallery, team, faq, contact, location_hours, testimonials, booking_cta, reels]/
│   │   │   └── (misma estructura que services/)
│   ├── components/
│   │   ├── Header.tsx             encabezado común
│   │   ├── Footer.tsx             pie común
│   │   ├── BlockContainer.tsx     wrapper de contenedor max-width
│   │   ├── Button.tsx             botón reutilizable
│   │   ├── FormField.tsx          campo de formulario con validación
│   │   ├── toast/                 notificaciones
│   │   ├── ui/                    componentes sin lógica (Image, Card, etc.)
│   │   └── admin/
│   │       ├── BlockEditor.tsx    editor genérico de un bloque
│   │       ├── BlockCard.tsx      tarjeta del bloque en el listado
│   │       ├── ImageUpload.tsx
│   │       ├── Navbar.tsx         navegación del panel
│   │       └── forms/
│   │           ├── HeroForm.tsx   (igual que bloques, aquí si es compartida)
│   │           ├── DynamicForm.tsx   genera formulario desde esquema zod
│   │           └── ...
│   ├── data/
│   │   ├── supabase.ts            cliente Supabase (ssr + cliente)
│   │   ├── queries/
│   │   │   ├── pages.ts
│   │   │   ├── blocks.ts
│   │   │   ├── site-settings.ts
│   │   │   ├── media.ts
│   │   │   └── auth.ts
│   │   └── mutations/
│   │       ├── save-block.ts
│   │       ├── update-site-settings.ts
│   │       ├── upload-media.ts
│   │       └── ...
│   ├── hooks/
│   │   ├── useBlocks.ts           carga bloques de una página
│   │   ├── useSiteSettings.ts
│   │   ├── useAuth.ts
│   │   ├── useFormState.ts        para los avisos de guardado
│   │   └── ...
│   ├── lib/
│   │   ├── cn.ts                  utilidad de clases (clsx + tailwind)
│   │   ├── formatting.ts          formatos de moneda, horarios, etc.
│   │   ├── validation.ts          funciones de validación reutilizables
│   │   ├── seo.ts                 generación de metadatos
│   │   ├── storage.ts             URLs de Storage, compresión de imágenes
│   │   ├── compression.ts         compresión WebP en navegador
│   │   └── constants.ts           colores, espaciados, límites
│   ├── styles/
│   │   ├── globals.css            variables CSS, reset, utilidades
│   │   └── tailwind.config.ts     configuración de Tailwind con tokens
│   ├── presets/
│   │   ├── spa.ts                 contenido de ejemplo neutral del preset
│   │   └── index.ts
│   └── types/
│       └── index.ts               tipos TypeScript generados y customizados
│
├── custom/                        personalización por cliente (vacío en la plantilla)
│   ├── app/                       rutas adicionales, sobrescrituras
│   ├── components/                componentes propios del cliente
│   ├── blocks/                    bloques nuevos específicos (si existen)
│   ├── lib/                       utilidades del cliente
│   ├── styles/                    estilos adicionales (nunca sobrescribir globals.css)
│   └── public/                    assets propios del cliente (logo, etc.)
│
├── supabase/
│   ├── migrations/
│   │   ├── 000_initial.sql        tablas, RLS, GRANT
│   │   ├── 001_seed.sql           contenido de ejemplo
│   │   └── ...
│   └── seed.ts                    script de seed (Node.js)
│
├── public/
│   ├── favicon.ico
│   ├── og-image-default.png       imagen Open Graph por defecto
│   └── ...
│
├── .env.example                   variables de entorno (no incluir en Git)
├── .env.local                     (local, no en Git)
├── package.json
├── tsconfig.json                  TypeScript estricto
├── tailwind.config.ts
├── postcss.config.js
├── next.config.js                 (básico: imágenes optimizadas)
├── .gitignore
├── README.md                      instrucciones para clonar y arrancar
└── scripts/
    ├── seed.js                    npm run seed
    └── generate-types.js          npm run generate-types (supabase gen types)
```

Reglas clave:
- **`core/` nunca cambia entre clientes.** Cuando se clona para un nuevo cliente, `custom/` queda vacío.
- **`custom/` es un overlay:** los componentes y tipos se importan de `core/` y se extienden en `custom/` solo si es necesario. Ninguna duplicación.
- **Sin alias complicados:** los imports siempre son relativos o desde `@/` (ver `tsconfig.json`).
- **`data/` es la capa de acceso:** todos los queries y mutations pasan por aquí, nunca llamadas directas a Supabase en los componentes.

### Sistema de registro de bloques (`defineBlock`)

La función `defineBlock` une el esquema, el componente público y el formulario del panel en un solo lugar.

```ts
// core/blocks/defineBlock.ts
import { z } from 'zod';
import { ReactNode } from 'react';

export interface Block<S extends z.ZodTypeAny> {
  type: string;
  schema: S;
  Component: React.ComponentType<{ data: z.infer<S>; settings: SiteSettings }>;
  Form: React.ComponentType<{ 
    initialData: z.infer<S>; 
    onChange: (data: z.infer<S>) => void;
    errors?: Record<string, string>;
  }>;
  defaults: z.infer<S>;
  version: number;  // para migrar contenido si el esquema cambia
}

export function defineBlock<S extends z.ZodTypeAny>(
  type: string,
  schema: S,
  Component: Block<S>['Component'],
  Form: Block<S>['Form'],
  defaults: z.infer<S>,
  version: number = 1,
): Block<S> {
  return { type, schema, Component, Form, defaults, version };
}

// Uso en core/blocks/hero/index.ts
export const HeroBlock = defineBlock(
  'hero',
  HeroSchema,
  HeroComponent,
  HeroForm,
  HERO_DEFAULTS,
  1,
);
```

Ventajas:
- El esquema es la fuente única de verdad sobre qué datos necesita el bloque.
- El formulario se genera automáticamente desde el esquema (ver `DynamicForm.tsx`), sin código repetido.
- Al añadir un bloque nuevo, solo escribes el esquema, el componente y el formulario; el registro es automático.

### Registro global de bloques

```ts
// core/blocks/registry.ts
import { HeroBlock } from './hero';
import { ServicesBlock } from './services';
// ... más bloques

export const BLOCK_REGISTRY: Record<string, Block<any>> = {
  hero: HeroBlock,
  services: ServicesBlock,
  gallery: GalleryBlock,
  // ... etc
};

export function getBlockDefinition(type: string): Block<any> | null {
  return BLOCK_REGISTRY[type] || null;
}
```

### Tres niveles de cambio

| Nivel | Qué cambia | Quién | Dónde |
|---|---|---|---|
| 1. Contenido | Textos, precios, fotos | El dueño | Panel |
| 2. Composición | Orden, activar/desactivar bloques | El dueño (fase B) | Panel |
| 3. Estructura | Diseño interno de un bloque, bloques nuevos | El desarrollador | `core/` o `custom/` |

### Modelo de datos (inicial)

- `profiles`: `id`, `email`, `role` (empieza con `admin`, admite varias filas)
- `site_settings`: marca, logo, tema (tokens), contacto, redes, horarios, SEO global
- `blocks`: `id`, `page`, `type`, `data` (jsonb), `version`, `order`, `enabled`
- `media`: registro de imágenes subidas

`order` y `enabled` existen desde la fase 0 aunque el panel de la fase A no los use; así la fase B es solo interfaz.

### Bloque nuevo: Reels / Redes

- Tarjetas con: plataforma (Instagram o TikTok), enlace al reel, título y miniatura propia (imagen subida).
- **Sin embeds**: los scripts de Instagram y TikTok son pesados y frenan la página. Miniatura + enlace es más ligero.
- Los perfiles de Instagram y TikTok también se declaran en los datos estructurados (`sameAs`) para reforzar la relación entre la web y las redes.
- Expectativa realista: los enlaces desde redes suelen ser `nofollow`; el beneficio es sobre todo tráfico cruzado y coherencia de marca, no ranking directo.

### Páginas del sitio público

Cada página tiene su propia ruta, su título y descripción editables, y su lista de bloques (campo `page` de la tabla `blocks`).

| Ruta | Página | Bloques por defecto |
|---|---|---|
| `/` | Inicio | Hero, resumen de Servicios, Testimonios, Reservar por WhatsApp |
| `/servicios` | Servicios | Servicios (lista completa por categoría), Reservar por WhatsApp |
| `/galeria` | Galería y Reels | Galería, Reels / Redes |
| `/nosotros` | Nosotros | Equipo, Preguntas frecuentes |
| `/contacto` | Contacto | Contacto, Ubicación y horarios |

Navegación común: encabezado con enlaces a las páginas y botón de WhatsApp; pie con contacto, horarios y redes.

### Dirección visual de la plantilla base (opción A: minimalista y sereno)

- Mucho espacio en blanco, secciones aireadas, fotos grandes.
- Títulos en tipografía serif elegante; texto en sans-serif limpia y legible.
- Colores suaves con un color de acento; detalles finos (líneas delgadas, bordes sutiles, esquinas redondeadas moderadas).
- Diseño **mobile-first**.
- Toda la apariencia sale de tokens editables (colores, tipografías, radios, espaciados); ningún color ni fuente escritos directamente en los componentes.
- La plantilla base usa una paleta **neutra cálida de ejemplo** con acento terracota; los valores concretos están en "Tokens de diseño de la plantilla base", justo debajo.
- En la personalización de N&M se aplican solo por tokens el verde y el dorado del logo, y se puede añadir un detalle ornamental (hoja o loto como separador) sin cambiar la estructura de los bloques.

### Tokens de diseño de la plantilla base

Se definen como variables CSS en `:root`, se exponen a Tailwind (`theme.extend` apuntando a `var(--...)`) y se guardan en `site_settings.theme` (JSON) para poder editarlos desde el panel. Solo tema claro en la v1.

**Colores**

| Token | Valor | Uso |
|---|---|---|
| `--color-bg` | `#FAF7F2` | Fondo general (crema) |
| `--color-surface` | `#FFFFFF` | Tarjetas y formularios |
| `--color-surface-alt` | `#F3EDE4` | Secciones alternas (arena) |
| `--color-text` | `#2B2622` | Texto principal |
| `--color-text-muted` | `#6B625A` | Texto secundario |
| `--color-border` | `#E5DCD0` | Bordes y líneas finas |
| `--color-primary` | `#B0603F` | Acento y botones (terracota suave) |
| `--color-primary-hover` | `#93502F` | Estado hover del acento |
| `--color-primary-soft` | `#F1DDD2` | Fondos suaves del acento |
| `--color-on-primary` | `#FFFFFF` | Texto sobre el acento |

Regla de accesibilidad: el texto sobre cualquier color debe cumplir contraste mínimo 4.5:1 (WCAG AA). Comprobar con una herramienta de contraste cada vez que se cambien colores desde el panel o al personalizar un negocio; si no se cumple, mostrar una advertencia en el panel.

**Tipografías**

| Token | Valor por defecto | Uso |
|---|---|---|
| `--font-heading` | Cormorant Garamond (serif), pesos 500 y 600 | Títulos |
| `--font-body` | Inter (sans-serif), pesos 400, 500 y 600 | Texto general |

- Cargar con `next/font/google` (se descargan y se sirven desde el propio sitio).
- Las fuentes se declaran en tiempo de compilación, así que **las tipografías elegibles desde el panel se limitan a una lista curada** de 4 a 6 opciones de títulos y 3 a 4 de texto, declaradas de antemano en el código. Definir la lista exacta al implementar la Fase 2.
- Fuentes de respaldo: serif del sistema para títulos, sans-serif del sistema para texto.

**Forma, espaciado y tamaños**

| Token | Valor |
|---|---|
| `--radius-sm` | `6px` (campos y etiquetas) |
| `--radius-md` | `12px` (botones y tarjetas) |
| `--radius-lg` | `20px` (imágenes destacadas y contenedores) |
| `--container-max` | `1120px` |
| `--section-padding-y` | `56px` en móvil, `88px` en escritorio |
| Escala de espaciado | Múltiplos de 4 px (escala estándar de Tailwind) |
| Tamaño de texto base | `16px`, interlineado `1.65` |
| Título principal (h1) | `clamp(2.25rem, 5vw, 3.5rem)` |
| Sombras | Muy sutiles (por ejemplo `0 1px 2px rgba(43, 38, 34, 0.06)`); preferir bordes finos |

**Reglas de uso**
- Ningún componente puede escribir directamente un color, fuente ni radio: siempre a través de los tokens.
- Estructura de `theme` en base de datos: `{ colors: {...}, fonts: { heading, body }, radius: {...} }` con validación zod y valores por defecto iguales a las tablas de arriba.

### Identificadores de elementos dentro de bloques

Todos los campos `id` de los arreglos dentro de un bloque (servicios, testimonios, miembros del equipo, imágenes de galería, reels, preguntas) se generan con `crypto.randomUUID()` (disponible de forma nativa en el navegador y en Node.js 22+), sin añadir ninguna librería para esto.

### Tipos compartidos entre bloques

Definidos una sola vez (por ejemplo en `core/blocks/shared.ts`) y reutilizados por todos los bloques que necesiten una imagen.

```ts
export const MediaRef = z.object({
  path: z.string(),          // ruta dentro del bucket de Supabase Storage (ver "Convenciones de Storage")
  alt: z.string().max(140),  // texto alternativo, obligatorio (SEO y accesibilidad)
});
```

### Especificación de bloques

Cada bloque se define con su esquema zod. Los esquemas de abajo son el contrato: no cambiar nombres de campos sin subir el `version` del bloque y escribir una migración de contenido. Los bloques restantes se irán añadiendo a esta sección.

#### Bloque `services` (Servicios)

Decisión: precio y duración son **opcionales por servicio**, y un interruptor global del bloque muestra u oculta los precios.

> **Corrección de diseño:** el bloque `services` aparece en dos páginas (Inicio en modo resumen, `/servicios` en modo completo). Si cada instancia del bloque guardara su propia copia de `categories`, el dueño tendría que editar el mismo servicio dos veces y las dos versiones podrían desincronizarse. Por eso el catálogo de servicios es **un solo dato compartido** (`site_settings.services_catalog`), y cada instancia del bloque `services` solo guarda **cómo mostrarlo** en esa página.

```ts
const ServiceItem = z.object({
  id: z.string(),                                  // crypto.randomUUID()
  name: z.string().min(1).max(80),
  description: z.string().max(400).optional(),
  price: z.number().nonnegative().optional(),      // en la moneda de site_settings.currency
  duration_minutes: z.number().int().positive().optional(),
  image: MediaRef.optional(),
  enabled: z.boolean().default(true),
});

const ServiceCategory = z.object({
  id: z.string(),
  name: z.string().min(1).max(60),
  description: z.string().max(240).optional(),
  items: z.array(ServiceItem).default([]),
});

// site_settings.services_catalog: catálogo único, editado en /admin/servicios
export const ServicesCatalog = z.object({
  categories: z.array(ServiceCategory).default([]),
});

// Configuración por instancia del bloque (una en Inicio, otra en /servicios)
export const ServicesBlock = z.object({
  title: z.string().max(80).default("Nuestros servicios"),
  subtitle: z.string().max(200).optional(),
  mode: z.enum(["summary", "full"]).default("full"),
  summary_limit: z.number().int().min(1).max(8).default(4),   // servicios por categoría en modo resumen
  show_prices: z.boolean().default(true),
  show_durations: z.boolean().default(true),
  price_hidden_label: z.string().max(60).default("Consultar por WhatsApp"),
  show_booking_button: z.boolean().default(true),             // botón "Reservar" en cada servicio
});
```

Reglas de comportamiento:
- **Fuente única:** el componente del bloque `services` siempre lee `site_settings.services_catalog`; nunca guarda su propia lista de categorías. El panel edita el catálogo en una sola pantalla (`/admin/servicios`), no dentro de cada bloque.
- **Moneda:** se define en `site_settings.currency` (por defecto `USD`, la moneda oficial de Panamá) y se formatea con `Intl.NumberFormat` en español.
- **Precios:** si `show_prices` es `false`, o si un servicio no tiene `price`, se muestra `price_hidden_label` en lugar del precio.
- **Duración:** se muestra solo si `show_durations` es `true` y el servicio tiene `duration_minutes`.
- **Modo `summary`** (usado en Inicio): muestra las categorías del catálogo con hasta `summary_limit` servicios cada una y un enlace "Ver todos los servicios" hacia `/servicios`. **Modo `full`** (usado en `/servicios`): muestra todo el catálogo.
- **Botón Reservar:** abre WhatsApp con un mensaje prellenado que incluye el nombre del servicio (por ejemplo: "Hola, quisiera reservar: {nombre del servicio}"). El número y la plantilla del mensaje vienen de `site_settings.contact`.
- **Orden:** el de los arreglos del catálogo tal como se guardan (en la fase A se ordenan al editar; el reordenamiento con arrastrar y soltar llega en la fase B).
- **Servicios con `enabled: false`** no se muestran en el sitio público, en ninguna de las dos páginas.
- **Panel:** `/admin/servicios` tiene el formulario con grupos repetibles (categorías, y dentro de cada una, servicios); cada instancia del bloque `services` (en Inicio y en `/servicios`) solo edita su título, subtítulo y las opciones de visualización.

#### Configuración de contacto (`site_settings.contact`)

Datos compartidos por varios bloques, el encabezado, el pie y los datos estructurados (SEO). Los valores de ejemplo son ficticios.

```ts
export const ContactSettings = z.object({
  whatsapp: z.string().regex(/^\d{8,15}$/),        // solo dígitos con código de país, sin "+" (ej.: "50760000000")
  phone_display: z.string().max(30).optional(),     // cómo se muestra al público (ej.: "6000-0000")
  phone: z.string().regex(/^\+?\d{7,15}$/).optional(),   // para el enlace tel: (ej.: "+50760000000")
  email: z.string().email().optional(),
  address: z.string().max(200).optional(),
  maps_url: z.string().url().optional(),            // enlace a Google Maps para el botón "Cómo llegar"
  maps_embed_url: z.string().url().optional(),      // URL de "Insertar un mapa" de Google Maps (iframe)
  instagram_url: z.string().url().optional(),
  tiktok_url: z.string().url().optional(),
  facebook_url: z.string().url().optional(),
  booking_message_generic: z.string().max(300)
    .default("Hola, quisiera reservar una cita. ¿Me pueden ayudar?"),
  booking_message_service: z.string().max(300)
    .default("Hola, quisiera reservar: {servicio}. ¿Tienen disponibilidad?"),
});
```

Reglas:
- **Enlace de WhatsApp:** `https://wa.me/{whatsapp}?text={mensaje codificado con encodeURIComponent}`; se abre en pestaña nueva con `rel="noopener noreferrer"`.
- **Mensaje por servicio:** en `booking_message_service` se reemplaza `{servicio}` por el nombre del servicio. Sin servicio elegido se usa `booking_message_generic`.
- El encabezado incluye un botón de WhatsApp usando el mensaje genérico.
- Las URL de redes alimentan el bloque Reels / Redes, el pie y el campo `sameAs` de los datos estructurados.

#### Bloque `booking_cta` (Reservar por WhatsApp)

Decisión de la v1: **botones con mensaje prellenado**, sin formulario y sin backend. El formulario con fecha y hora, y la bandeja de solicitudes, quedan para el módulo futuro de reservas con calendario.

```ts
export const BookingCtaBlock = z.object({
  title: z.string().max(80).default("Reserva tu cita"),
  text: z.string().max(240).optional(),
  button_label: z.string().max(40).default("Reservar por WhatsApp"),
  message_override: z.string().max(300).optional(),   // si está vacío usa contact.booking_message_generic
});
```

Reglas:
- Muestra un título, un texto opcional y un botón que abre WhatsApp con el mensaje genérico (o `message_override` si existe).
- Si `contact.whatsapp` no está configurado, el bloque no se muestra en el sitio público y el panel avisa que falta ese dato.
- Además de este bloque, cada servicio del bloque `services` tiene su propio botón (ver reglas de `services`).

#### Bloque `testimonials` (Testimonios)

Decisión: testimonios **escritos a mano en el panel**, con imagen opcional (foto del cliente o captura de una reseña). El bloque **existe en la plantilla**, pero **N&M Salón Spa no lo usa por ahora**: en su copia el bloque queda desactivado (`enabled: false`).

```ts
const TestimonialItem = z.object({
  id: z.string(),
  quote: z.string().min(1).max(500),
  author_name: z.string().min(1).max(60),      // nombre o inicial (ej.: "María G.")
  service: z.string().max(80).optional(),      // servicio al que se refiere
  rating: z.number().int().min(1).max(5).optional(),
  image: MediaRef.optional(),                  // foto del cliente o captura; requiere alt
  enabled: z.boolean().default(true),
});

export const TestimonialsBlock = z.object({
  title: z.string().max(80).default("Lo que dicen nuestros clientes"),
  subtitle: z.string().max(200).optional(),
  show_ratings: z.boolean().default(true),
  items: z.array(TestimonialItem).default([]),
});
```

Reglas:
- Si no hay testimonios con `enabled: true`, el bloque **no se muestra** en el sitio público (nada de secciones vacías) y el panel lo indica.
- El formulario del panel muestra un recordatorio: publicar testimonios solo con permiso del cliente.
- **SEO:** no generar datos estructurados `Review` ni `AggregateRating` a partir de estos testimonios; Google no suele mostrar estrellas para reseñas que el propio negocio publica sobre sí mismo.
- Los testimonios de ejemplo del preset "Spa" son ficticios y están claramente marcados como ejemplo.

#### Bloque `gallery` (Galería)

Decisión: **cuadrícula uniforme con visor ampliado** (al tocar una foto se abre grande). La proporción del recorte es configurable.

```ts
const GalleryImage = z.object({
  id: z.string(),
  image: MediaRef,                                   // el texto alternativo (alt) es obligatorio
  caption: z.string().max(120).optional(),           // pie de foto opcional
  enabled: z.boolean().default(true),
});

export const GalleryBlock = z.object({
  title: z.string().max(80).default("Galería"),
  subtitle: z.string().max(200).optional(),
  aspect_ratio: z.enum(["1:1", "4:5", "3:2"]).default("4:5"),
  columns_desktop: z.union([z.literal(2), z.literal(3), z.literal(4)]).default(3),
  images: z.array(GalleryImage).max(60).default([]),
});
```

Reglas:
- **Cuadrícula:** 2 columnas en móvil y `columns_desktop` en escritorio. Todas las fotos con el mismo recorte (`aspect_ratio`, `object-fit: cover`).
- **Visor ampliado:** al tocar una foto se abre en pantalla completa con botones anterior y siguiente, cierre con botón y con la tecla Esc, navegación con flechas del teclado, foco atrapado dentro del visor y atributos ARIA. Mostrar `caption` si existe.
- **Rendimiento:** usar `next/image` con tamaños responsivos, `loading="lazy"` salvo en las primeras imágenes visibles, y en el visor cargar la versión grande solo al abrir.
- **Accesibilidad y SEO:** `alt` obligatorio (validación en el panel; no se puede guardar una imagen sin él).
- **Vacío:** si no hay imágenes con `enabled: true`, el bloque no se muestra en el sitio público.
- **Panel:** subida múltiple con compresión en el navegador (WebP, máximo 1600 px de ancho), edición de `alt` y `caption` por imagen, y aviso al superar las 60 imágenes. El reordenamiento con arrastrar y soltar llega en la fase B.

#### Bloque `team` (Equipo)

Decisión: cada persona lleva **foto, nombre, cargo y una biografía corta opcional**.

```ts
const TeamMember = z.object({
  id: z.string(),
  name: z.string().min(1).max(60),
  role: z.string().min(1).max(80),
  bio: z.string().max(400).optional(),
  photo: MediaRef.optional(),          // si falta, se muestra un avatar con las iniciales
  enabled: z.boolean().default(true),
});

export const TeamBlock = z.object({
  title: z.string().max(80).default("Nuestro equipo"),
  subtitle: z.string().max(200).optional(),
  members: z.array(TeamMember).max(24).default([]),
});
```

Reglas:
- Tarjetas con foto recortada en proporción 4:5 y esquinas `--radius-lg`; 1 columna en móvil (o 2 si son pocas personas) y hasta 4 en escritorio.
- Sin foto: avatar con las iniciales sobre `--color-primary-soft`.
- Si no hay miembros con `enabled: true`, el bloque no se muestra.
- La foto, cuando existe, requiere `alt` (por ejemplo, el nombre y el cargo).

#### Bloque `faq` (Preguntas frecuentes)

Decisión: **acordeón simple** (cada pregunta se despliega al tocarla).

```ts
const FaqItem = z.object({
  id: z.string(),
  question: z.string().min(1).max(160),
  answer: z.string().min(1).max(1000),   // texto plano; los saltos de línea se respetan
  enabled: z.boolean().default(true),
});

export const FaqBlock = z.object({
  title: z.string().max(80).default("Preguntas frecuentes"),
  subtitle: z.string().max(200).optional(),
  items: z.array(FaqItem).max(30).default([]),
});
```

Reglas:
- Todas las preguntas cerradas al cargar; se pueden abrir varias a la vez.
- Accesibilidad: cada pregunta es un `<button>` con `aria-expanded` y `aria-controls`, operable con teclado.
- Las respuestas deben estar en el HTML aunque estén cerradas (no cargarlas después), para que los buscadores las lean.
- **SEO:** no generar datos estructurados `FAQPage`; Google restringió esos resultados enriquecidos a sitios oficiales de gobierno y salud.
- Si no hay preguntas con `enabled: true`, el bloque no se muestra.

#### Bloque `hero` (Hero, portada de Inicio)

Decisión: **texto e imagen lado a lado**; en móvil, la imagen arriba y el texto debajo.

```ts
export const HeroBlock = z.object({
  eyebrow: z.string().max(60).optional(),             // texto pequeño sobre el título
  title: z.string().min(1).max(100).default("Tu momento de calma y bienestar"),
  subtitle: z.string().max(240).optional(),
  image: MediaRef.optional(),
  image_position: z.enum(["right", "left"]).default("right"),
  primary_cta_label: z.string().max(40).default("Reservar por WhatsApp"),   // usa contact.booking_message_generic
  secondary_cta: z.object({
    label: z.string().max(40),
    href: z.string().max(200),                         // ruta interna (ej.: "/servicios") o URL
  }).optional(),
});
```

Reglas:
- El `title` del Hero es el único `<h1>` de la página de Inicio.
- La imagen usa `next/image` con `priority` (es el elemento principal de carga) y tamaños responsivos; `alt` obligatorio si hay imagen.
- Sin imagen: el texto se centra sobre `--color-surface-alt`.
- El botón principal abre WhatsApp con el mensaje genérico (ver `booking_cta`). El secundario es opcional; por defecto en el preset "Spa": "Ver servicios" hacia `/servicios`.
- **Encabezado de las demás páginas:** las páginas que no son Inicio no llevan Hero; muestran un encabezado simple generado con el título de la página como `<h1>` (campo `title` de la página).

#### Horarios (`site_settings.hours` y `site_settings.timezone`)

Los horarios se guardan en los ajustes del sitio porque los usan varios lugares: el bloque de ubicación, el pie de página y los datos estructurados (SEO).

```ts
const HoursRange = z.object({
  open: z.string().regex(/^\d{2}:\d{2}$/),     // "09:00" (24 h)
  close: z.string().regex(/^\d{2}:\d{2}$/),    // "18:00"
});

const DayHours = z.object({
  day: z.enum(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]),
  closed: z.boolean().default(false),
  ranges: z.array(HoursRange).max(2).default([]),   // hasta 2 tramos (permite cierre al mediodía)
});

export const HoursSettings = z.array(DayHours).length(7);
// site_settings.timezone: string IANA, por defecto "America/Panama"
```

Reglas:
- Se guardan en 24 h y se muestran en formato local en español (por ejemplo "9:00 a. m. – 6:00 p. m.").
- Al mostrar, se agrupan los días consecutivos con el mismo horario ("Lunes a viernes") y los días con `closed: true` aparecen como "Cerrado".
- Se convierten a `openingHoursSpecification` en los datos estructurados JSON-LD.
- No se muestra indicador de "Abierto ahora" en la v1.

#### Bloque `location_hours` (Ubicación y horarios)

Decisión: **mapa de Google Maps incrustado (iframe con carga diferida) más el botón "Cómo llegar"**.

```ts
export const LocationHoursBlock = z.object({
  title: z.string().max(80).default("Visítanos"),
  subtitle: z.string().max(200).optional(),
  show_map: z.boolean().default(true),
  directions_label: z.string().max(40).default("Cómo llegar"),
  hours_note: z.string().max(200).optional(),         // ej.: "Atención con cita previa"
});
```

Reglas:
- Los datos vienen de `site_settings.contact` (`address`, `maps_url`, `maps_embed_url`) y de `site_settings.hours`.
- El iframe usa `loading="lazy"`, un atributo `title` descriptivo y `referrerpolicy="no-referrer-when-downgrade"`. Solo se renderiza si `show_map` es `true` y existe `maps_embed_url`.
- El botón "Cómo llegar" abre `maps_url` en pestaña nueva; si `maps_url` no existe, no se muestra.
- Si no hay `address`, ni `maps_url`, ni `maps_embed_url`, solo se muestran los horarios.
- Validar en el panel que `maps_embed_url` sea de Google Maps (dominio `google.com`, ruta `/maps/embed`).
- Los datos de dirección alimentan el JSON-LD (`address`).

#### Bloque `contact` (Contacto)

Decisión: **datos y botones, sin formulario**. El formulario (con envío por correo o con bandeja de mensajes en el panel) queda para el módulo futuro de reservas.

```ts
export const ContactBlock = z.object({
  title: z.string().max(80).default("Contáctanos"),
  subtitle: z.string().max(200).optional(),
  show_whatsapp: z.boolean().default(true),
  show_phone: z.boolean().default(true),
  show_email: z.boolean().default(true),
  show_address: z.boolean().default(true),
  show_social: z.boolean().default(true),
});
```

Reglas:
- Todos los datos salen de `site_settings.contact`; este bloque solo decide qué se muestra.
- WhatsApp: botón principal con el mensaje genérico (ver `booking_cta`). Teléfono: enlace `tel:` construido con `contact.phone`, mostrando `phone_display`. Correo: enlace `mailto:`. Dirección: texto, sin mapa (el mapa está en `location_hours`). Redes: iconos con enlaces a `instagram_url`, `tiktok_url` y `facebook_url`.
- Cada dato solo aparece si existe en `contact` y su `show_*` es `true`.
- Los enlaces a redes se abren en pestaña nueva con `rel="noopener noreferrer"` y llevan `aria-label` ("Instagram", "TikTok"...).
- Si no queda ningún dato para mostrar, el bloque no se muestra.

#### Bloque `reels` (Reels / Redes)

Decisión: **tarjetas con miniatura subida a mano y enlace al reel**, sin embeds ni scripts de terceros.

```ts
const ReelItem = z.object({
  id: z.string(),
  platform: z.enum(["instagram", "tiktok"]),
  url: z.string().url(),                   // el dominio debe coincidir con la plataforma
  title: z.string().max(100).optional(),
  thumbnail: MediaRef,                     // miniatura subida por el negocio; alt obligatorio
  enabled: z.boolean().default(true),
});

export const ReelsBlock = z.object({
  title: z.string().max(80).default("Síguenos en redes"),
  subtitle: z.string().max(200).optional(),
  show_profile_links: z.boolean().default(true),   // botones a los perfiles (contact.instagram_url y tiktok_url)
  items: z.array(ReelItem).max(24).default([]),
});
```

Reglas:
- **Validación de enlaces:** para `instagram`, el dominio debe terminar en `instagram.com`; para `tiktok`, en `tiktok.com` (incluidos `vm.tiktok.com` y `vt.tiktok.com`). Si no coincide, el panel no deja guardar.
- **Tarjetas:** miniatura vertical (proporción 9:16, recorte `cover`), ícono de la plataforma (SVG propio, sin librerías externas) y título opcional. Cuadrícula de 2 columnas en móvil y 4 en escritorio.
- **Enlaces:** se abren en pestaña nueva con `rel="noopener noreferrer"` y `aria-label` del tipo "Ver reel en Instagram: {título}".
- **Sin scripts de terceros:** no se incrustan reproductores; solo miniatura y enlace.
- Si `show_profile_links` es `true`, se muestran botones "Instagram" y "TikTok" solo para los perfiles configurados en `site_settings.contact`.
- Si no hay reels con `enabled: true` ni perfiles para mostrar, el bloque no se muestra.
- Por defecto vive en la página `/galeria`, debajo de la galería.

### Esquema maestro: `site_settings`

Une todo lo que no pertenece a un bloque concreto. Se guarda como una sola fila (o varias columnas `jsonb`, según se defina en la migración) en la tabla `site_settings`.

```ts
export const SiteSettings = z.object({
  brand: z.object({
    name: z.string().min(1).max(80),
    tagline: z.string().max(160).optional(),
    logo: MediaRef.optional(),
    favicon: MediaRef.optional(),          // si falta, se usa un ícono genérico de la plantilla
  }),
  currency: z.enum(["USD"]).default("USD"),   // única moneda soportada en la v1
  timezone: z.string().default("America/Panama"),
  theme: SiteTheme,            // ver "Tokens de diseño de la plantilla base"
  contact: ContactSettings,    // ver "Configuración de contacto"
  hours: HoursSettings,        // ver "Horarios"
  services_catalog: ServicesCatalog,   // ver bloque `services`
  seo_defaults: z.object({
    business_type: z.string().default("DaySpa"),   // tipo schema.org; configurable si se reutiliza para otro rubro
    default_og_image: MediaRef.optional(),           // usada si una página no define la suya
  }),
});
```

### Tabla `pages` (metadatos de cada página)

Cada una de las cinco páginas de la sección 3 tiene una fila aquí, con su SEO propio. El listado de bloques de la página sigue viviendo en la tabla `blocks` (campo `page`, que referencia `pages.slug`).

```ts
export const PageSettings = z.object({
  slug: z.enum(["inicio", "servicios", "galeria", "nosotros", "contacto"]),
  title: z.string().min(1).max(80),                 // usado como <h1> en páginas sin Hero (todas menos Inicio)
  meta_title: z.string().max(60).optional(),         // si falta, se arma como "{title} · {brand.name}"
  meta_description: z.string().max(160).optional(),
  og_image: MediaRef.optional(),                     // si falta, usa seo_defaults.default_og_image
});
```

Reglas:
- `pages.slug = "inicio"` corresponde a la ruta `/`, y su `title` no se usa como `<h1>` (el `<h1>` de Inicio lo pone el bloque `hero`, ver esa sección).
- El panel de `/admin/seo` edita estos cinco registros; el de `/admin/paginas/[slug]` edita los bloques de cada página.
- El tipo `DaySpa` en `seo_defaults.business_type` es específico del preset "Spa"; al reutilizar la plantilla para otro rubro, se cambia por el tipo de `schema.org` correspondiente (por ejemplo `HairSalon`, `Restaurant`).

### Convenciones de Supabase Storage

- Un solo bucket **público** de lectura: `media`. La escritura solo la hace el panel autenticado (política de Storage: lectura pública, escritura solo para `role = 'admin'`).
- Estructura de carpetas dentro del bucket, por tipo de contenido: `media/hero/`, `media/services/`, `media/gallery/`, `media/team/`, `media/testimonials/`, `media/reels/`, `media/brand/` (logo y favicon).
- Nombre de archivo: `{crypto.randomUUID()}.webp` (siempre WebP, tras la compresión en el navegador).
- `MediaRef.path` guarda la ruta relativa dentro del bucket (por ejemplo `gallery/3fa2...c1.webp`); la URL pública se construye con el cliente de Supabase (`supabase.storage.from('media').getPublicUrl(path)`), nunca se guarda la URL completa.

### Variables de entorno (`.env.example`)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
# Solo para ejecutar el seed; nunca dejarla activa en producción
ALLOW_SEED_RESET=false
```

---

## 3. Páginas y rutas del sitio público

El sitio consta de **5 páginas multipágina**, accesibles desde un menú de navegación principal:

| Ruta | Nombre | Bloques incluidos | Propósito |
|---|---|---|---|
| `/` (Inicio) | Inicio | Hero, Servicios (modo resumen), Equipo, Testimonios (opcional), Reels, CTA WhatsApp | Presentación y gancho |
| `/servicios` | Servicios | Servicios (modo completo, todas las categorías y ítems) | Catálogo detallado |
| `/galeria` | Galería | Galería, Reels | Portafolio visual |
| `/nosotros` | Nosotros | Equipo, Historia/Bio (sin bloque dedicado; parte de Hero si es necesario), Ubicación | Conocer el negocio |
| `/contacto` | Contacto | Ubicación (con mapa), Contacto (datos y botones) | Información y localización |

**Notas:**
- El menú de navegación aparece en `Header.tsx` (componente compartido).
- El pie de página (`Footer.tsx`) tiene links a redes, contacto y legal.
- El diseño es **responsive first-mobile**, testeado en ancho mínimo ~375px.
- No hay página de administración aquí; el panel es una rama separada en `/admin`.

---

## 4. Bloques de contenido (especificación)

### Navegación (opción A: menú por secciones)

Estructura fija de la fase 2 (Panel A: solo contenido); la fase 3 añade el reordenamiento dentro de "Páginas y bloques".

```
/admin
  /admin/login                    (público, redirige si ya hay sesión)
  /admin                          Inicio: resumen y accesos directos
  /admin/paginas                  Lista de páginas (Inicio, Servicios, Galería y Reels, Nosotros, Contacto)
  /admin/paginas/[slug]           Bloques de esa página, cada uno con su formulario
  /admin/negocio                  site_settings.contact + site_settings.hours
  /admin/apariencia               site_settings.theme (tokens: colores, tipografías, radios)
  /admin/imagenes                 Explorador simple de todo lo subido a Supabase Storage
  /admin/seo                      SEO por página + JSON-LD de negocio (sección "SEO técnico")
```

Reglas:
- Menú lateral en escritorio; en móvil, menú inferior o superior desplegable (ver "Diseño móvil primero" más abajo).
- `/admin/paginas/[slug]` es la pantalla principal: lista los bloques de la página en su `order`, cada uno como una tarjeta plegable con su formulario dentro (generado desde el esquema zod del bloque). En la fase 2 el orden no se edita ahí; en la fase 3 se agrega arrastrar y soltar, más un interruptor `enabled` por bloque.
- Guardado por bloque (botón "Guardar" dentro de cada tarjeta), no un solo botón para toda la página, para que un error de validación no bloquee guardar los demás bloques.
- Cada guardado exitoso dispara la revalidación de la página pública correspondiente (`revalidateTag` o `revalidatePath`).

### Diseño móvil primero (opción A)

- Formularios en una sola columna, con campos de ancho completo y botones grandes (mínimo 44×44 px de área táctil).
- Listas repetibles (servicios, testimonios, equipo, reels, preguntas frecuentes): cada elemento es una tarjeta plegada que muestra un resumen (por ejemplo, nombre y precio) y se expande al tocarla para editar; botón "Añadir" fijo al final de la lista.
- Subida de imágenes: botón que abre la cámara o la galería del teléfono (`<input type="file" accept="image/*">`), con vista previa y compresión antes de subir.
- Barra de navegación inferior en móvil con los accesos más usados (Páginas, Negocio, Imágenes); el resto dentro de un menú "Más".
- En escritorio, el mismo panel se reorganiza en menú lateral fijo y formularios en dos columnas donde el espacio lo permita, sin duplicar lógica: son los mismos componentes con clases responsivas de Tailwind.
- Todo formulario valida en el propio campo (no solo al enviar) y muestra el error en español, cerca del campo.

### Autenticación (opción A: correo y contraseña)

- Supabase Auth con correo y contraseña; incluir el flujo de "olvidé mi contraseña" (correo de restablecimiento) desde la v1.
- `/admin/login`: formulario de correo y contraseña, enlace "olvidé mi contraseña" y mensajes de error en español ("Correo o contraseña incorrectos").
- Sesión validada en el servidor con `@supabase/ssr` en cada ruta de `/admin` (middleware o layout protegido); si no hay sesión válida, redirige a `/admin/login`.
- El usuario administrador de cada instalación se crea a mano al hacer el seed (no hay registro público).
- Cierre de sesión visible en el panel (por ejemplo, en el menú "Más" en móvil).
- Enlace mágico y otros roles quedan fuera de la v1 (ver sección "Pendiente para más adelante").

### Avisos de guardado (opción B: toast + indicador fijo)

- Cada tarjeta de bloque o de sección de ajustes muestra un indicador de estado junto a su botón "Guardar": `Sin cambios` → `Cambios sin guardar` → `Guardando...` → `Guardado hace un momento`. El indicador se relaciona con el tiempo transcurrido (por ejemplo, "Guardado hace 2 min") y se actualiza mientras la pantalla sigue abierta.
- Al guardar, además aparece un toast breve ("Guardado" o "No se pudo guardar: revisa los campos marcados"), en la esquina superior en escritorio y en la parte inferior en móvil, con auto-cierre a los pocos segundos.
- Errores de validación: los campos con error se marcan en rojo con el mensaje debajo, y el toast de error no oculta esos mensajes.
- Errores de red o del servidor: el toast lo indica en español ("No se pudo guardar. Revisa tu conexión e inténtalo de nuevo") y el indicador de la tarjeta vuelve a "Cambios sin guardar" para no dar una falsa sensación de éxito.

### Seed del preset "Spa" (opción B: limpia antes de cargar)

- Comando único: `npm run seed`.
- Antes de insertar el contenido de ejemplo, borra el contenido existente de `blocks`, `site_settings` y `media` de ese proyecto (no toca `profiles`, salvo el paso de crear el administrador si no existe).
- **Confirmación de seguridad:** el comando exige la variable de entorno `ALLOW_SEED_RESET=true` en el `.env` para ejecutarse; si no está presente, se detiene con un mensaje explicando que hay que añadirla a propósito. Así se evita borrar por accidente el contenido real de un cliente en producción.
- El seed es **transaccional** cuando el driver lo permite (todo o nada), para no dejar datos a medias si falla a mitad de camino.
- Al terminar, imprime en consola un resumen (páginas, bloques y usuario administrador creados) y recuerda quitar `ALLOW_SEED_RESET` del entorno de producción después de usarla.

---

## 5. Fases de desarrollo y criterios de aceptación

El trabajo se divide en **dos etapas separadas por un hito**:

- **Etapa 1: Plantilla genérica completa (fases 0 a 4).** Se construye y verifica la plantilla entera, sin ningún dato de un negocio real.
- **Hito: congelar la plantilla.** Se marca como versión estable y se separa (ver más abajo).
- **Etapa 2: Personalización de N&M Salón Spa (fase 5).** Se trabaja en una **copia** de la plantilla; la plantilla original no se toca.

Motivo: así la plantilla queda limpia y lista para reutilizar en el siguiente cliente, y lo específico de N&M no se mezcla con lo genérico.

### ETAPA 1: Plantilla genérica completa

### Fase 0: Base

- Repositorio plantilla con `core/` y `custom/`.
- Next.js, TypeScript, Tailwind y tokens de diseño.
- Proyecto de Supabase de desarrollo; entorno local con `supabase start`.
- Migraciones iniciales: tablas, **RLS y permisos (`GRANT`)** (ver sección 6).
- `defineBlock`, registro de bloques y esquemas zod.
- Generación de tipos con `supabase gen types`.
- Despliegue inicial en `.vercel.app`.

**Criterios de aceptación de la Fase 0:**
- [✓] El repositorio clona, instala dependencias sin errores y corre con `npm run dev`.
- [✓] `supabase start` levanta un proyecto local con las migraciones aplicadas.
- [✓] `supabase gen types > src/types/supabase.ts` genera tipos sin errores.
- [✓] El sitio público carga en `http://localhost:3000` (página vacía es aceptable, solo estructura).
- [✓] El panel redirige `/admin` a `/admin/login` sin sesión.
- [✓] `npm run seed` funciona con `ALLOW_SEED_RESET=true` y ejecuta sin errores.
- [✓] Variables de entorno en `.env.local` sin exponer la clave secreta en el navegador.

### Fase 1: Sitio público

- Bloques: Hero, Servicios, Galería, Ubicación y horarios, Contacto, Testimonios, Equipo, Preguntas frecuentes, Reservar por WhatsApp (mensaje prellenado con el servicio elegido) y Reels / Redes.
- Las cinco páginas de la sección 3 (`/`, `/servicios`, `/galeria`, `/nosotros`, `/contacto`), con encabezado, pie y navegación comunes.
- Contenido leído desde la base de datos; diseño responsive y pensado primero para móvil, siguiendo la dirección visual base (opción A).
- SEO técnico (sección 5).
- Actualización del sitio público cuando el dueño edita: revalidación por etiquetas (`revalidateTag`) o por ruta.

**Criterios de aceptación de la Fase 1:**
- [✓] Las cinco páginas cargan y muestran los bloques con el contenido del seed del preset "Spa".
- [✓] Cada bloque se renderiza correctamente en móvil (teléfono, ancho ~375px) y en escritorio (~1280px).
- [✓] Los botones de WhatsApp abren el enlace `https://wa.me/...` con el mensaje prellenado correcto.
- [✓] Las imágenes se cargan desde Supabase Storage y se muestran optimizadas con `next/image`.
- [✓] El visor de galería se abre al tocar, navega con flechas y se cierra con Esc.
- [✓] Los horarios se agrupan correctamente ("Lunes a viernes: 9:00 a. m. – 6:00 p. m.").
- [✓] El mapa incrustado de Google Maps carga con `loading="lazy"`.
- [✓] El sitio tiene `<title>`, `<meta name="description">`, Open Graph y `sitemap.xml`.
- [✓] El JSON-LD de negocio local incluye nombre, teléfono, dirección, horarios y `sameAs` con redes.
- [✓] Los enlaces internos funcionan (navegación entre páginas).
- [✓] El sitio pasa un test de Lighthouse en móvil con puntuación ≥ 85 (Performance, Accessibility, Best Practices, SEO).

### Fase 2: Panel A (editar contenido)

- Login con Supabase Auth; un solo administrador.
- Formularios generados desde el esquema zod de cada bloque.
- Edición de tema (tokens), datos del negocio, redes y SEO por página.
- Subida de imágenes a Supabase Storage con compresión en el navegador (WebP, máximo 1600 px de ancho).
- Vista previa antes de publicar (opcional si el tiempo lo permite).

**Criterios de aceptación de la Fase 2:**
- [✓] `/admin/login` carga y permite iniciar sesión con correo y contraseña.
- [✓] Tras iniciar sesión, `/admin` carga con el dashboard.
- [✓] El formulario "Olvidé mi contraseña" envía un correo de restablecimiento (testeado en Supabase console).
- [✓] `/admin/paginas` lista las cinco páginas; al tocar una, `/admin/paginas/[slug]` muestra sus bloques.
- [✓] Cada bloque abre una tarjeta con su formulario generado desde zod.
- [✓] Los campos de formulario validan en línea y muestran errores en español.
- [✓] El botón "Guardar" guarda los datos y muestra un toast "Guardado".
- [✓] La compresión de imágenes en el navegador convierte a WebP y limita a 1600 px sin perder calidad visible.
- [✓] Las imágenes se suben a Supabase Storage en la carpeta correcta (por ejemplo `gallery/...`).
- [✓] Al guardar un bloque, el sitio público se revalida y muestra el cambio al recargar.
- [✓] `/admin/negocio` edita contacto y horarios; los cambios reflejan en el sitio (encabezado, pie, mapa).
- [✓] `/admin/apariencia` edita los tokens de diseño; los cambios afectan al sitio público (colores, tipografías).
- [✓] `/admin/imagenes` muestra todas las imágenes subidas en un explorador simple.
- [✓] `/admin/seo` edita el título y descripción de cada página, más la imagen Open Graph.
- [✓] Cerrar sesión en el panel redirige a `/admin/login`.
- [✓] Refrescar `/admin` sin sesión válida redirige a `/admin/login`.

### Fase 3: Panel B (composición)

- Reordenar bloques (arrastrar y soltar) y activarlos o desactivarlos.

**Criterios de aceptación de la Fase 3:**
- [✓] En `/admin/paginas/[slug]`, cada bloque tiene un interruptor `enabled` (radio o toggle).
- [✓] Al desactivar un bloque, desaparece del sitio público al recargar.
- [✓] Los bloques pueden reordenarse arrastrando las tarjetas en `/admin/paginas/[slug]`.
- [✓] El nuevo orden se persiste en la base de datos y refleja en el sitio público.
- [✓] El reordenamiento funciona en móvil (toque y arrastre) y en escritorio.

### Fase 4: Preset y proceso de clonado

- Preset "Spa" en `core/` y script de arranque (seed) que lo carga en un negocio nuevo, con **contenido de ejemplo neutro** (sin datos de N&M ni de ningún negocio real).
- Guía corta para crear un negocio: clonar el repositorio, crear el proyecto de Supabase del cliente, configurar variables de entorno, `supabase db push`, seed, conectar dominio.
- Lista de verificación de precauciones (sección 6) aplicada a cada instalación nueva.

**Criterios de aceptación de la Fase 4:**
- [✓] El preset "Spa" contiene contenido de ejemplo neutral (negocio llamado "Tu Negocio", servicios ficticios, fotos de ejemplo).
- [✓] `npm run seed` carga el preset en un proyecto de Supabase limpio sin errores.
- [✓] La documentación en `README.md` guía paso a paso cómo clonar, instalar y arrancar una nueva instalación.
- [✓] Se verifica la lista de la sección 6.9 en una instalación de prueba (proyecto limpio de Supabase, nuevo).
- [✓] No quedan referencias a N&M ni a ningún negocio real en `core/`, ni en las migraciones ni en el seed.

### HITO: Congelar y separar la plantilla

Solo se pasa a la Etapa 2 cuando la plantilla cumple **todos** estos criterios:

- Las fases 0 a 4 están completas y probadas de punta a punta con el preset "Spa" y su contenido de ejemplo.
- No queda ninguna referencia a N&M ni a otro negocio real en el código, la base de datos o los textos.
- La lista de verificación de la sección 6.9 pasa completa en un proyecto de Supabase limpio.
- Instalación desde cero documentada y verificada (clonar, variables de entorno, migraciones, seed, primer inicio de sesión).

Al cumplirlos:

1. Etiquetar la versión en Git (por ejemplo `template-v1.0`).
2. Dejar el repositorio original como **repositorio plantilla** (por ejemplo, marcado como "template repository" en GitHub) y no personalizarlo directamente.
3. Crear un repositorio nuevo a partir de la plantilla para N&M. Ese es el que se personaliza.

### ETAPA 2: Personalización del negocio (en una copia)

### Fase 5: Personalización de N&M Salón Spa

Reglas de esta etapa:
- Se trabaja **solo en la copia de N&M**. La plantilla original no se modifica.
- Lo específico del negocio va en `custom/` y en su base de datos, nunca en `core/`.
- Si durante esta etapa aparece un fallo o una mejora que sea **genérica**, se corrige primero en la plantilla, se etiqueta una versión nueva y se trae manualmente a la copia.

Tareas:
- Logo, paleta verde y dorado y tipografías.
- Servicios del flyer, WhatsApp, Instagram, TikTok y textos.
- Dominio propio comprado por el cliente y lanzamiento.

**Datos que faltan del cliente:**
- Confirmar el perfil correcto de Instagram (`@nicolleymaria` o `@nicolleymari`; el flyer muestra la segunda) y el de TikTok, si existe.
- Dirección, horarios, precios, fotos y datos del equipo. Los testimonios no se incluyen por ahora: en la copia de N&M el bloque `testimonials` queda desactivado.
- Lista completa de servicios (el flyer incluye también cabello, manicure y pedicure, micropigmentación, cejas y pestañas, además de los masajes y faciales).

---

## 8. Migraciones SQL (template)

Cada migración va en un archivo `supabase/migrations/NNN_descripcion.sql`, versionado en Git. El Supabase CLI ejecuta todas en orden al hacer `supabase db push`.

### Migración 000: Tablas e inicialización

```sql
-- Tabla de perfiles (usuarios autenticados)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'viewer',  -- 'admin' o 'viewer' en la v1
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabla de páginas (metadatos)
CREATE TABLE pages (
  slug text PRIMARY KEY,               -- "inicio", "servicios", "galeria", "nosotros", "contacto"
  title text NOT NULL,
  meta_title text,
  meta_description text,
  og_image jsonb,                      -- MediaRef: { path, alt }
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabla de bloques (contenido)
CREATE TABLE blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page text NOT NULL REFERENCES pages(slug) ON DELETE CASCADE,
  type text NOT NULL,                  -- "hero", "services", "gallery", etc.
  data jsonb NOT NULL,                 -- contenido del bloque, validado por zod
  version integer NOT NULL DEFAULT 1,  -- para migraciones de datos
  "order" integer NOT NULL DEFAULT 0,  -- posición en la página
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabla de configuración del sitio (una sola fila)
CREATE TABLE site_settings (
  id integer PRIMARY KEY DEFAULT 1,    -- una sola fila
  brand jsonb NOT NULL DEFAULT '{"name": "Nombre del Negocio"}',
  currency text NOT NULL DEFAULT 'USD',
  timezone text NOT NULL DEFAULT 'America/Panama',
  theme jsonb NOT NULL,                -- tokens: colors, fonts, radius
  contact jsonb NOT NULL,              -- whatsapp, phone, email, address, etc.
  hours jsonb NOT NULL,                -- array de DayHours (lunes a domingo)
  services_catalog jsonb NOT NULL DEFAULT '{"categories": []}',
  seo_defaults jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabla de media (registro de archivos)
CREATE TABLE media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL UNIQUE,           -- ruta en Supabase Storage (ej: "gallery/abc123.webp")
  filename text,
  content_type text,
  size_bytes integer,
  uploaded_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Índices
CREATE INDEX idx_blocks_page ON blocks(page);
CREATE INDEX idx_blocks_order ON blocks(page, "order");
CREATE INDEX idx_media_uploaded_by ON media(uploaded_by);

-- RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública (sitio público)
CREATE POLICY "pages_select_public" ON pages FOR SELECT USING (true);
CREATE POLICY "blocks_select_public" ON blocks
  FOR SELECT USING (enabled = true);
CREATE POLICY "site_settings_select_public" ON site_settings FOR SELECT USING (true);
CREATE POLICY "media_select_public" ON media FOR SELECT USING (true);

-- Políticas de escritura (solo admin autenticado)
CREATE POLICY "pages_update_admin" ON pages FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

CREATE POLICY "blocks_insert_admin" ON blocks FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

CREATE POLICY "blocks_update_admin" ON blocks FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

CREATE POLICY "site_settings_update_admin" ON site_settings FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

CREATE POLICY "media_insert_admin" ON media FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- GRANT explícitos para la Data API (requerido desde mayo 2026)
GRANT SELECT ON profiles TO authenticated;
GRANT SELECT ON pages TO anon, authenticated;
GRANT SELECT ON blocks TO anon, authenticated;
GRANT SELECT ON site_settings TO anon, authenticated;
GRANT SELECT ON media TO anon, authenticated;
GRANT INSERT, UPDATE ON blocks TO authenticated;
GRANT INSERT, UPDATE ON site_settings TO authenticated;
GRANT INSERT ON media TO authenticated;

-- Valores iniciales
INSERT INTO site_settings (theme) VALUES (
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
  }'
);

-- Páginas iniciales
INSERT INTO pages (slug, title) VALUES
  ('inicio', 'Inicio'),
  ('servicios', 'Servicios'),
  ('galeria', 'Galería y Reels'),
  ('nosotros', 'Nosotros'),
  ('contacto', 'Contacto');
```

**Notas:**
- Cada cliente **ejecuta esta migración** al hacer `supabase db push`. No hay contenido específico aquí.
- La tabla `site_settings` tiene un `id` fijo (1) para asegurar que siempre hay una sola fila.
- Los valores en `theme` son los que aparecen en la tabla "Tokens de diseño de la plantilla base" (sección 3).
- Las políticas RLS protegen: el público solo ve `enabled = true`; solo los admin pueden editar.

### Migración 001: Seed del preset "Spa"

Se ejecuta con el comando `npm run seed`, no como una migración SQL directa. El script `supabase/seed.ts` inserta el contenido de ejemplo neutro, disparado por la variable de entorno `ALLOW_SEED_RESET=true`.

---

## 9. Capa de acceso a datos (`core/data/`)

Todas las operaciones con la base de datos pasan por esta capa, nunca directamente desde los componentes. Esto permite cambiar el origen de datos después (por ejemplo, de Supabase a otra base de datos) sin tocar la lógica de componentes.

### Estructura recomendada

```
core/data/
├── supabase.ts          cliente Supabase configurado
├── queries/
│   ├── pages.ts         SELECT de páginas
│   ├── blocks.ts        SELECT de bloques
│   ├── site-settings.ts SELECT de configuración
│   ├── media.ts         SELECT de imágenes
│   └── auth.ts          información del usuario autenticado
└── mutations/
    ├── save-block.ts    UPDATE de un bloque
    ├── update-site-settings.ts
    ├── upload-media.ts  INSERT en media + Storage
    └── ...
```

### Ejemplo: `core/data/queries/blocks.ts`

```ts
import { supabase } from './supabase';
import { Database } from '@/types/supabase';

type BlockRow = Database['public']['Tables']['blocks']['Row'];

export async function getBlocksByPage(slug: string): Promise<BlockRow[]> {
  const { data, error } = await supabase
    .from('blocks')
    .select('*')
    .eq('page', slug)
    .eq('enabled', true)
    .order('order', { ascending: true });

  if (error) {
    console.error('Error fetching blocks:', error);
    throw new Error(`Failed to fetch blocks for page ${slug}`);
  }

  return data || [];
}

export async function getBlockById(id: string): Promise<BlockRow | null> {
  const { data, error } = await supabase
    .from('blocks')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') {  // PGRST116 = no rows
    console.error('Error fetching block:', error);
    throw new Error(`Failed to fetch block ${id}`);
  }

  return data || null;
}
```

Reglas:
- **Sin lógica de negocio:** la capa `data/` solo traducir Supabase a tipos TypeScript. Los queries validan con zod en la mutación, no aquí.
- **Errores explícitos:** siempre chequear `error` y lanzar excepciones tipadas.
- **Tipos automáticos:** importar `Database` del archivo generado por `supabase gen types`.

### Ejemplo: `core/data/mutations/save-block.ts`

```ts
import { supabase } from './supabase';
import { BLOCK_REGISTRY } from '@/blocks/registry';
import { Database } from '@/types/supabase';

type BlockRow = Database['public']['Tables']['blocks']['Row'];

export async function saveBlock(id: string, data: any): Promise<BlockRow> {
  const block = BLOCK_REGISTRY[data.type];
  if (!block) {
    throw new Error(`Unknown block type: ${data.type}`);
  }

  // Validar datos contra el esquema del bloque
  const validatedData = block.schema.parse(data);

  const { data: result, error } = await supabase
    .from('blocks')
    .update({ data: validatedData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error saving block:', error);
    throw new Error(`Failed to save block ${id}`);
  }

  return result;
}
```

---

## 10. Ambigüedades por resolver antes de que Deepseek empiece

Estas preguntas se responden mejor con decisiones rápidas. Deepseek las implementará una vez decididas:

### Formularios dinámicos

**¿Hasta qué punto generar los formularios desde zod?**

Opciones:
- **A (Recomendado):** Generar `<input>`, `<textarea>`, `<select>` básicos desde el esquema. Casos especiales (ImageUpload, ListOfItems) tienen componentes propios.
- **B:** Escribir cada formulario a mano (más control, más código).

**Decision propuesta:** Opción A. Los beneficios (sin código repetido) superan los riesgos (campos con comportamiento especial).

### Compresión de imágenes

**¿Dónde comprimir? ¿Cliente, servidor o ambos?**

Opciones:
- **A:** Cliente antes de subir (navegador); servidor: validar formato y tamaño.
- **B:** Servidor (cloudinary, imgix, o un endpoint Next.js).

**Decision propuesta:** Opción A. Más rápido, sin backend extra. La función `compress()` en `core/lib/compression.ts` usa la API `Canvas` del navegador.

### Versionado de bloques

**¿Cómo detectar cambios de esquema y migrar datos antiguos?**

Opciones:
- **A:** Campo `version` en cada bloque + migrations en una tabla `block_migrations` (más lógica).
- **B:** Versión en la tabla `blocks` (más simple, menos escalable si hay muchos bloques con esquemas diferentes).

**Decision propuesta:** Opción B para la v1. Si en la v2 hay más de 3 cambios de esquema, pasar a la A. Escribir un documento de "Cómo migrar un bloque después de cambiar su esquema".

### Indicador de "Abierto ahora"

**¿Añadir a los horarios?**

Opciones:
- **A:** Sí, con un icono en el sitio público.
- **B:** No en la v1 (requiere mantener la hora actualizada en el cliente).

**Decision propuesta:** Opción B para la v1. Incluir en el sprint de "Pendiente para más adelante" si es solicitado.

### URL pública de Storage

**¿Cómo construir?**

Opciones:
- **A:** En el cliente (conoce el `NEXT_PUBLIC_SUPABASE_URL` y el bucket name).
- **B:** En el servidor (más seguro, menos repetición en componentes).

**Decision propuesta:** Opción A (helper en `core/lib/storage.ts`). Supabase Storage es público de lectura, así que no hay secreto que proteger.

### Paginación en la galería

**¿Cargar todas las imágenes o paginar?**

Opciones:
- **A:** Cargar todas (lazy load individual).
- **B:** Paginar (cargar X a la vez).

**Decision propuesta:** Opción A para la v1 (máx 60 imágenes según el esquema). Si un cliente excede ese límite, implementar la B como feature.

### Búsqueda en el panel

**¿Búsqueda de imágenes, servicios, etc.?**

Opciones:
- **A:** No; listar todo.
- **B:** Buscar por nombre.

**Decision propuesta:** Opción A para la v1. Las listas sin búsqueda son pequeñas (máx 60 imágenes, máx 24 personas, etc.).

### Email transaccional

**¿Usar Supabase Auth builtin o SendGrid / Resend?**

Opciones:
- **A:** Supabase Auth (correo de restablecimiento, menos config).
- **B:** SendGrid con templates propias.

**Decision propuesta:** Opción A. Supabase Auth incluye "olvidé mi contraseña" sin código extra.

---

### Decisiones tomadas (todas resueltas)

1. **Generación de formularios:** Opción A — generar desde zod + componentes propios para casos especiales.
2. **Compresión de imágenes:** Opción A — cliente (navegador WebP) + servidor valida.
3. **Versionado de bloques:** Opción A — campo `version` simple para v1.
4. **Indicador "Abierto ahora":** Opción B — **no en v1**, guardar para después.
5. **URLs de Storage:** Opción A — construir en cliente con helper.
6. **Paginación en galería:** Opción A — cargar todas con lazy load individual.
7. **Búsqueda en panel:** Opción A — **no en v1**, listas sin búsqueda.
8. **Email transaccional:** Opción A — Supabase Auth builtin.

---

## 11. Entregables de Deepseek V4.1 Flash

Al terminar **todas las fases (0 a 4)**, el repositorio Git debe tener:

### Archivos y carpetas esperados

```
✓ core/app/                   todas las páginas públicas y rutas del panel
✓ core/blocks/                todos los 10 bloques (hero, services, etc.)
✓ core/components/            Header, Footer, BlockEditor, formularios, etc.
✓ core/data/                  queries y mutations (acceso a Supabase)
✓ core/hooks/                 useBlocks, useSiteSettings, useAuth, useFormState, etc.
✓ core/lib/                   cn, formatting, validation, seo, storage, compression
✓ core/styles/                globals.css con variables CSS y reset
✓ core/presets/               spa.ts con contenido de ejemplo neutro
✓ core/types/                 tipos TypeScript (generados + customizados)
✓ supabase/migrations/        000_initial.sql y 001_seed.sql
✓ supabase/seed.ts            script de seed (Node.js)
✓ public/                     favicon, og-image-default.png
✓ custom/                     carpeta vacía (lista para clientes)
✓ .env.example                variables de entorno
✓ package.json                dependencias (Next.js, TypeScript, Tailwind, zod, supabase-js)
✓ tsconfig.json               strict mode, compilerOptions completos
✓ tailwind.config.ts          tokens de diseño base (colores, fonts, radius)
✓ next.config.js              optimizaciones básicas
✓ README.md                   guía paso a paso: clonar, instalar, arrancar
✓ scripts/seed.js             npm run seed
✓ .gitignore                  .env.local, node_modules, .vercel, etc.
```

### Documentación esperada

```
✓ README.md
  - Qué es la plantilla
  - Stack: Next.js 14, TypeScript, Tailwind, Supabase, Vercel
  - Requisitos: Node.js 22+, npm, cuenta de Supabase, Vercel (opcional)
  - Cómo clonar y arrancar en local
  - Cómo crear un negocio nuevo (paso a paso)
  - Cómo desplegar en Vercel
  - Cómo personalizar (modificar custom/, tema, agregar bloques)
  - Links a documentación externa (Supabase, Next.js, etc.)

✓ docs/ARCHITECTURE.md (opcional pero recomendado)
  - Visión general: 10 bloques, 5 páginas, un panel
  - Capa data/, defineBlock, registro global
  - Cómo agregar un bloque nuevo
  - Convenciones de carpetas

✓ docs/DEPLOYMENT.md (opcional)
  - Checklist antes de ir a producción
  - Precauciones de Supabase (sección 6)
  - Variables de entorno en Vercel
  - Dominio propio

✓ docs/SCHEMA.md (opcional)
  - Esquema completo de site_settings, pages, blocks
  - Tipos zod de cada bloque
  - Ejemplos de datos
```

### Código esperado (métrica)

- **~200–250 líneas** de componentes por bloque (Component + Form).
- **~500 líneas** de helpers y utilidades en `core/lib/`.
- **~400 líneas** de queries y mutations en `core/data/`.
- **~300 líneas** de estilos globales + tailwind.config.ts.
- **~150 líneas** de migraciones SQL.
- **~100 líneas** de seed.ts.
- **Total aproximado: 3000–3500 líneas de código** (sin comentarios, con espacios).

### Testing mínimo esperado

No es un requisito, pero sería ideal:
- Componentes públicos con Storybook (opcional).
- Una página de prueba E2E en Cypress o Playwright (opcional).
- Prueba manual de las 5 páginas en móvil y escritorio.

### Configuración de Git esperada

```
✓ Rama main con todo funcional (fases 0–4 completas)
✓ Tags:
  - v1.0.0-template: marca la plantilla lista para clonar
  - v0.1, v0.2, ... (tags por fase si se desea)
✓ .gitignore adecuado
✓ Histórico de commits claro (un commit = una característica o fix)
```

### Checklist final antes de entregar a Dayron

- [ ] `npm run dev` corre sin errores.
- [ ] Todas las páginas públicas cargan y muestran contenido del seed.
- [ ] El panel de admin funciona: login, formularios, guardado, toast de guardado.
- [ ] Las imágenes se comprimen en el navegador y se suben a Storage.
- [ ] Revalidación funciona (cambios en el panel reflejan en el sitio tras recargar).
- [ ] `npm run seed` borra y recarga el preset sin errores.
- [ ] Variables de entorno están correctas en `.env.local` (no exponen claves secretas al público).
- [ ] TypeScript sin errores (`npm run type-check` si lo hay).
- [ ] El sitio pasa Lighthouse en móvil con score ≥ 85.
- [ ] README es claro y sin errores de tipografía.
- [ ] El repositorio está marcado como plantilla en GitHub (si es pública).

---

## 12. Próximos pasos después de Deepseek (Fase 5: Personalización para N&M)

Una vez que Deepseek termine la plantilla:

1. **Clonar el repositorio** para un nuevo proyecto `spa-nm-saloon` (o similar).
2. **Crear proyecto de Supabase** del cliente.
3. **Configurar variables de entorno** en `.env.local` y en Vercel.
4. **Personalizar en `custom/`:**
   - Logo y favicon en `custom/public/`.
   - Estilos adicionales si es necesario (sin tocar `core/`).
   - Componentes propios si algún bloque necesita un layout diferente.
5. **Llenar datos de N&M:**
   - Nombre, tagline, logo, favicon.
   - Horarios, teléfono, WhatsApp, dirección.
   - Servicios y precios.
   - Fotos del equipo, local, servicios.
   - Redes sociales.
6. **Generar seed del cliente** con los datos reales.
7. **Desplegar en Vercel** con dominio propio.

**Datos de N&M necesarios para Fase 5:**
- Instagram: @nicolleymaria
- WhatsApp: (a confirmar)
- Dirección: (a confirmar)
- Horarios: (a confirmar)
- Servicios: (lista completa con categorías, precios y duraciones)
- Fotos: equipo (2 personas), local (5–10), servicios (3–5)
- Logo y paleta final: (verde y dorado, según rebranding)
- Redes sociales finales

---

## Anexo A: Precauciones clave de Supabase (a fecha 23 sep 2026)

Revisar antes de crear un proyecto nuevo:

1. **Claves nuevas:**
   - Usar `sb_publishable_` y `sb_secret_` (las viejas se deprecan a fin de 2026).
   - No usar `NEXT_PUBLIC_ANON_KEY`, `SUPABASE_ANON_KEY` ni `SUPABASE_SERVICE_ROLE_KEY`.

2. **RLS y GRANT:**
   - Activar Row Level Security en todas las tablas.
   - Incluir `GRANT` explícitos en las migraciones para Data API (requerido desde mayo 2026).

3. **Node.js y TypeScript:**
   - Node.js 22+ (requerido por Supabase CLI 1.220+).
   - TypeScript 5+ (requerido desde 31 ene 2027).

4. **Errores comunes:**
   - 401 Unauthorized al renovar token: aplicar update del proyecto desde Supabase dashboard.
   - Data API devuelve 403: revisar permisos RLS y GRANT.

5. **Status.supabase.com:**
   - Verificar incidentes antes de investigar errores locales.

6. **Backup y restore:**
   - Hacer backup regularmente (en plan Pro, incluye).
   - Documentar el proceso de restore para caso de emergencia.

7. **Cuota de Storage:**
   - Plan Free: 1 GB.
   - Monitor `supabase.storage.from('media').list('')` para no exceder.

---

## Anexo B: Convenciones de código

Aplicadas en `core/` y esperadas en `custom/`:

- **Nombrado de archivos:** `camelCase` para componentes y funciones (`HeroBlock.tsx`, `useBlocks.ts`); `kebab-case` para rutas (`/admin/site-settings`).
- **Imports:** siempre desde `@/` o relativos. Nunca `../../../`.
- **Tipos:** exportar tipos al inicio del archivo, luego la implementación.
- **Componentes:** usar `React.FC` o el patrón de function components. Props como interfaz.
- **Estilos:** Tailwind CSS. Variables CSS para tokens (nunca hardcodear colores).
- **Comentarios:** JSDoc en funciones públicas, comentarios inline solo si es lógica compleja.
- **Error handling:** siempre `try/catch` en mutations; lanzar excepciones tipadas.
- **Validación:** siempre con zod antes de guardar en la BD.

---

## Anexo C: Cómo agregar un bloque nuevo después de Fase 4

**Ejemplo: agregar un bloque de "Testimonios de video" en la Fase 5 o después.**

1. **Crear el esquema** en `core/blocks/video-testimonials/schema.ts`:
   ```ts
   export const VideoTestimonialsSchema = z.object({
     title: z.string().max(80),
     videos: z.array(z.object({
       id: z.string(),
       url: z.string().url(),
       person_name: z.string(),
       // ...
     })),
   });
   ```

2. **Crear el componente** en `core/blocks/video-testimonials/VideoTestimonialsBlock.tsx`.

3. **Crear el formulario** en `core/blocks/video-testimonials/VideoTestimonialsForm.tsx` (usar `DynamicForm` si es posible).

4. **Registrar el bloque** en `core/blocks/video-testimonials/index.ts`:
   ```ts
   export const VideoTestimonialsBlock = defineBlock(
     'video-testimonials',
     VideoTestimonialsSchema,
     VideoTestimonialsComponent,
     VideoTestimonialsForm,
     VIDEO_TESTIMONIALS_DEFAULTS,
   );
   ```

5. **Añadir al registro global** en `core/blocks/registry.ts`:
   ```ts
   import { VideoTestimonialsBlock } from './video-testimonials';
   export const BLOCK_REGISTRY = {
     // ... bloques existentes
     'video-testimonials': VideoTestimonialsBlock,
   };
   ```

6. **Migración SQL** (si es necesario):
   - Si el bloque necesita una tabla nueva, crear migración `00X_add_video_testimonials_table.sql`.

7. **Documentar** en `docs/ARCHITECTURE.md` o en un `README.md` dentro de `core/blocks/video-testimonials/`.

**El resto de la plantilla no toca; todo en `core/` o `custom/`.**

---

- **Title y description** editables desde el panel (títulos de unos 60 caracteres, descripciones de unos 155).
- **Open Graph**: imagen y título para previsualizaciones en WhatsApp e Instagram.
- **`sitemap.xml`** y **`robots.txt`** (excluyendo `/admin`).
- **Datos estructurados JSON-LD** de negocio local (tipo `DaySpa`): nombre, teléfono, dirección, horarios y `sameAs` con las redes.
- **Básicos de página**: un solo `<h1>`, texto `alt` en imágenes, carga rápida en móvil.
- Fuera del sitio: recomendar al cliente tener su perfil de Google Business (mapas y reseñas).

---

## 6. Precauciones de Supabase (revisadas el 20 de septiembre de 2026)

Estas verificaciones se repiten en cada instalación nueva.

### 6.1 Claves de API
- Usar las claves nuevas **`sb_publishable_...`** (cliente) y **`sb_secret_...`** (servidor). Las claves `anon` y `service_role` están en proceso de deprecación a finales de 2026.
- La clave secreta se usa **solo en el servidor**, nunca en variables `NEXT_PUBLIC_` ni en código que llegue al navegador.
- En proyectos antiguos puede hacer falta crear las claves nuevas desde Settings > API Keys; las antiguas siguen funcionando hasta que se desactiven.
- Si el cliente rota o desactiva claves, actualizar las variables de entorno en Vercel.

### 6.2 Exposición de tablas a la Data API
- Las tablas nuevas del esquema `public` **ya no se exponen automáticamente** a la Data API. Estaba previsto como opción activable, por defecto en proyectos nuevos desde el 30 de mayo de 2026 y obligatorio en todos los proyectos desde el **30 de octubre de 2026**.
- Cada migración que cree una tabla debe incluir los `GRANT` explícitos necesarios para los roles correspondientes.
- Probar con un proyecto limpio que el sitio público lee y el panel escribe.

### 6.3 Seguridad de datos (RLS)
- Activar **RLS en todas las tablas**.
- Política de lectura pública solo para contenido publicable (por ejemplo, bloques con `enabled = true`).
- Política de escritura solo para usuarios autenticados con `role = 'admin'`.
- Recordar que la clave secreta **ignora RLS**: usarla únicamente en código de servidor con sus propias comprobaciones.

### 6.4 Versiones y compatibilidad
- Node.js **22 o superior** (Node 20 dejó de tener soporte en las librerías cliente el 30 de junio de 2026).
- TypeScript **5.0 o superior** antes del 31 de enero de 2027.
- Anclar la versión exacta de `@supabase/supabase-js` y actualizar con calma, leyendo el changelog en `supabase.com/changelog`.
- Reservar un momento periódico para revisar deprecaciones antes de clonar la plantilla en un cliente nuevo.

### 6.5 Estado de la plataforma
- Al iniciar el proyecto, revisar `status.supabase.com`. Había un incidente abierto de **errores 401 por rechazo de JWT**, que afecta sobre todo a proyectos nuevos al renovar sesión; la solución oficial es actualizar el proyecto desde el dashboard cuando aparezca la opción.
- Tras crear el proyecto de cada cliente: comprobar si hay actualización disponible y probar login y renovación de sesión antes de entregar.
- Si aparecen 401 intermitentes, primero revisar la página de estado y reiniciar o actualizar el proyecto desde Settings > General, antes de depurar el código.

### 6.6 Uso correcto de la librería
- Revisar siempre `error` y el estado de cada respuesta; no asumir éxito. Las solicitudes de conteo con `head: true` pueden devolver errores con mensaje vacío, así que no basar lógica crítica en ese mensaje.
- Validar la sesión **en el servidor** (con `@supabase/ssr` y comprobación del usuario) y no confiar solo en `getSession()` del cliente: se han reportado casos intermitentes en navegadores móviles donde devuelve `null`.
- Aislar todas las llamadas a base de datos en una capa propia (por ejemplo `core/data/`), para poder cambiar de enfoque después sin tocar componentes.
- Validar con zod los datos que salen y entran de `jsonb`.

### 6.7 Migraciones y tipos
- Todo cambio de estructura va como archivo SQL en `supabase/migrations`, versionado en el repositorio.
- Un cliente nuevo ejecuta `supabase db push` y queda con el esquema completo.
- Regenerar tipos con `supabase gen types` tras cada migración.
- Al cambiar el esquema de un bloque, subir su campo `version` y escribir una migración de contenido.

### 6.8 Plan y límites de cada cliente
- Verificar los límites vigentes del plan gratuito (almacenamiento, ancho de banda y política de pausa por inactividad) antes de decidir el plan de cada cliente; no asumir que se mantienen.
- Storage: el plan gratuito ofrece poco espacio, por eso la subida comprime las imágenes antes de enviarlas.
- Acordar con el cliente que es él quien contrata y paga su proyecto, y dejar por escrito quién tiene acceso administrativo al proyecto de Supabase y al de Vercel.

### 6.9 Lista de verificación por instalación nueva
1. Crear proyecto de Supabase del cliente y revisar si hay actualización pendiente.
2. Crear claves `sb_publishable_` y `sb_secret_`; configurarlas en Vercel.
3. Ejecutar `supabase db push` y comprobar RLS y permisos.
4. Ejecutar el seed del preset.
5. Crear el usuario administrador del dueño.
6. Probar login, renovación de sesión, edición y subida de imágenes.
7. Comprobar Node 22+, TypeScript 5+ y versiones ancladas.
8. Revisar `status.supabase.com` antes de la entrega.

---

## 7. Pendiente para más adelante (fuera de la v1)

- Reservas con calendario y disponibilidad.
- Roles de editor y acceso de soporte para el desarrollador.
- Multi-idioma.
- Variantes de diseño por bloque.
- Constructor completo de bloques (añadir, duplicar y eliminar libremente).
- Extraer `core/` a un paquete versionado cuando haya 3 o más clientes.
- SEO avanzado (blog, páginas por servicio).

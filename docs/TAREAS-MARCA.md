# Tareas de la guía de marca — Fase 5 (N&M)

> Archivo de progreso para trabajar por etapas, incluso entre sesiones compactadas.
> La fuente de verdad visual es `docs/Guía de marca — N&M Salón Spa.html`.
> Última actualización: **30 de septiembre de 2026**.

## Etapas

| # | Etapa | Estado |
| --- | --- | --- |
| 1 | Paleta de la guía aplicada por tokens + Jost | ✅ Hecha (30/09, commit `c4b457d`) |
| 2 | Modo oscuro (por defecto sigue al sistema, con interruptor) | ✅ Hecha (30/09) |
| 3 | Escala tipográfica de la guía | ✅ Hecha (30/09) |
| 4 | Logos de la guía (encabezado, pie, favicon) | ✅ Hecha (30/09) |
| 5 | Organización, tamaños y aire de las secciones | ✅ Hecha (30/09) |
| 6 | Panel de administración con la organización de Odoo | ⬜ Pendiente |

---

## Etapa 1 — Paleta + Jost ✅

Aplicada **por tokens** (sin tocar componentes). Valores en `site_settings.theme` del proyecto
`lpdxxdexneztgydrvixs`:

- Claro: fondo `#FBF9F4`, tarjetas `#FFFFFF`, alternas `#F6F1E7`, texto `#113024`,
  secundario `#5B6B62`, bordes `#E3DDCF`, acento `#1F7A4D` (hover `#19623E`, suave `#E7F1EA`),
  texto sobre el acento `#FBF9F4`.
- Títulos en Cormorant Garamond, texto en Jost.
- El **dorado bruñido `#A8802F` no entra en los tokens**: en la guía es para ornamentos y no
  pasa 4.5:1 sobre fondos claros.

## Etapa 2 — Modo oscuro ✅

Decisiones tomadas:

- **Tres reglas CSS** emitidas por `themeCss()`: `:root` (claro), `@media
  (prefers-color-scheme: dark)` con `:root:not([data-theme="light"])` (sistema), y
  `:root[data-theme="dark"]` (elección manual). El atributo `data-theme` manda sobre el sistema.
- **Preferencia en `localStorage` con clave `site-theme`**; un script del layout raíz la aplica
  **antes del primer pintado** (sin parpadeo).
- **Interruptor de 3 estados** en el encabezado (sistema → oscuro → claro): desde "sistema",
  el primer clic pasa al contrario de lo que se ve; así nunca hay un clic que no cambie nada.
  Los iconos se enseñan por CSS según `data-theme`, sin estado en React.
- **Los degradados se apagan en modo oscuro** (son de la paleta clara; reutilizarlos sería
  texto crema sobre degradado crema). Para N&M hoy no aplica: están apagados.
- Paleta oscura de N&M (validada con contraste real): fondo `#113024`, tarjetas `#17392B`,
  alternas `#0D261B`, texto `#F6F1E7`, secundario `#A9BCA9`, bordes `#2A4A3A`, acento
  `#D9B45F` (hover `#E4C87E`, suave `#1E3A2C`), texto sobre el acento `#113024`.
  Pares: texto/fondo 12.7:1 · texto/tarjeta 11.3:1 · acento/fondo 7.2:1.
- La plantilla (no N&M) lleva una **paleta oscura neutra** como valor por defecto del esquema
  y de la migración `000`: fondo `#211E1B`, tarjetas `#2A2622`, texto `#F0EBE4`, acento
  `#D08A63`, etc.

Verificado el 30/09 en el navegador: claro por defecto, oscuro al pulsar (iconos y
`aria-label` cambian), ciclo completo hasta volver a «sistema» sin residuos, y sistema en
oscuro sin elección guardada. `npm run verify` en verde (21/21 páginas).

Una comprobación queda a ojos del dueño: abrir `/admin/apariencia` y confirmar que el grupo
«Modo oscuro» aparece con los diez colores precargados (el mecanismo es el mismo de los
degradados, que ya se pinta así).

## Etapa 3 — Escala tipográfica ✅

Aplicada el 30/09 en `core/styles/globals.css`: cuerpo **15/24**, título de página **40/44**
(con `clamp` de 32→40 para que en móvil respire) y título de sección **26/30**. La nota
**12/18** es `.block-label`, la etiqueta en mayúsculas que encabeza cada dato en los bloques.
Medido en el navegador (escritorio y móvil): 15/24, 40/44, 26/30 y 12/18 exactos.

Ajuste de jerarquía que salió de la revisión: el nombre de categoría en Servicios bajó de
24 a 20 px (`text-xl`), porque quedaba casi igual que el título de sección.

## Etapa 4 — Logos ✅

Hecha el 30/09. La guía trae los logos como símbolos SVG; el bucket de la plantilla no acepta
SVG (solo webp/jpeg/png, por seguridad), así que se rasterizaron a PNG de alta resolución y
se subieron a `media/brand/`:

- `logo-monograma-claro.png` (807×336): encabezado y pie en modo claro.
- `logo-monograma-oscuro.png` (807×336): modo oscuro, en crema y oro claro como pide la guía.
- `favicon-simbolo.png` (512×512): el sello reducido, como icono del navegador.

En el código: componente nuevo `BrandLogo` (encabezado y pie) que cambia de variante con el
modo —mismo mecanismo que los iconos del interruptor, sin JavaScript—, y campo nuevo
`logo_dark` en `BrandSettings` (aparece solo en Administración → Negocio). La ruta `/favicon`
ya servía el archivo subido desde el panel. El nombre del negocio quedó como «N&M Salón Spa».

Si algún día hay que regenerar los PNG: extraer los `<symbol>` de la guía y sustituir
`var(--g)`, `var(--o)`, `var(--t)`… por los colores de la paleta correspondiente.

## Etapa 5 — Organización, tamaños y aire ✅

Pasada de revisión el 30/09 por las cinco páginas (escritorio y móvil, claro y oscuro): la
estructura ya era sólida (contenedor de 1120 px, alternancia de fondos por posición, rejillas
adaptativas —la galería pasa a 2 columnas en móvil—), así que los ajustes fueron de respiración:

- **Ritmo entre secciones:** `--section-padding-y` sube de 56/88 a **64/96 px**
  (móvil/escritorio).
- **Anclas:** `scroll-padding-top: 96px` para que las secciones enlazadas no aterricen bajo
  la cabecera fija.

Notas de la revisión (decisiones del dueño, no se tocaron):

- El bloque de testimonios de Inicio sigue activo. *(La duplicación del título «Servicios»
  quedó resuelta sola al quitar la banda de las interiores.)*

### Ajustes de la revisión del dueño (30/09)

- **Hero con el logo principal**: la imagen del hero pasa a ser el sello principal de la
  guía, subido a `hero/sello-nm.png` sobre un medallón marfil — sobre el fondo claro no se
  ve el disco y en oscuro sostiene el sello. En escritorio la imagen se ajusta al **alto del
  texto** (fuera de flujo + `object-contain`): las dos columnas quedan a la par. El eyebrow
  del hero ya dice «N&M Salón Spa».
- **Fuera la banda de título** de las páginas interiores: `PageHeading` se eliminó; el `<h1>`
  queda oculto (`sr-only`) para lectores de pantalla y buscadores, y la página la encabeza su
  primer bloque.
- **Titulares en esmeralda**: los `h2` del sitio público van en el color de acento, como la
  muestra 26/30 de la guía (en oscuro, oro claro). Solo el sitio público; el panel conserva su
  propio estilo.

## Etapa 6 — Panel estilo Odoo ⬜

Organización tipo Odoo: barra superior, menú lateral, "panel de control" con búsqueda y
acciones, migas de pan. Es la etapa más grande; va al final.

---

## Cómo continuar una sesión

1. Leer este archivo y `docs/PROGRESS.md` (sección Fase 5).
2. Comprobar `git log --oneline -5` y `git status`.
3. Seguir por la primera etapa en ⬜ / 🚧.
4. Al cerrar: marcar ✅ aquí, actualizar `PROGRESS.md` y commitear.

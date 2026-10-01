# Tareas de la guía de marca — Fase 5 (N&M)

> Archivo de progreso para trabajar por etapas, incluso entre sesiones compactadas.
> La fuente de verdad visual es `docs/Guía de marca — N&M Salón Spa.html`.
> Última actualización: **30 de septiembre de 2026**.

## Etapas

| # | Etapa | Estado |
| --- | --- | --- |
| 1 | Paleta de la guía aplicada por tokens + Jost | ✅ Hecha (30/09, commit `c4b457d`) |
| 2 | Modo oscuro (por defecto sigue al sistema, con interruptor) | ✅ Hecha (30/09) |
| 3 | Escala tipográfica de la guía | ⬜ Pendiente |
| 4 | Logos de la guía (encabezado, pie, favicon) | ⬜ Pendiente |
| 5 | Organización, tamaños y aire de las secciones | ⬜ Pendiente |
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

## Etapa 3 — Escala tipográfica ⬜

De la guía: títulos de página 40/44, títulos de sección 26/30, cuerpo 15/24, notas 12/18.
Ajustar en `core/styles/globals.css` con criterio conservador (clamp donde ayude) y revisar
que nada quede ni minúsculo ni apretado.

## Etapa 4 — Logos ⬜

La guía trae el juego completo en SVG: principal (horizontal), vertical, símbolo con flor de
loto, símbolo sin flor, monograma, y variantes sobre fondo salvia. Por decidir: qué variante
va en encabezado (probablemente horizontal o símbolo + nombre), qué va en el pie y cuál de
favicon. Subir al bucket y enlazar desde `brand.logo` / `brand.favicon` (el encabezado aún
pinta el nombre como texto: hay que enseñar el logo cuando exista).

## Etapa 5 — Secciones ⬜

Revisar el sitio en móvil y escritorio: aire entre secciones, tamaños, ritmo visual. Ajustar
`--section-padding-y` y componentes, no rehacer bloques.

## Etapa 6 — Panel estilo Odoo ⬜

Organización tipo Odoo: barra superior, menú lateral, "panel de control" con búsqueda y
acciones, migas de pan. Es la etapa más grande; va al final.

---

## Cómo continuar una sesión

1. Leer este archivo y `docs/PROGRESS.md` (sección Fase 5).
2. Comprobar `git log --oneline -5` y `git status`.
3. Seguir por la primera etapa en ⬜ / 🚧.
4. Al cerrar: marcar ✅ aquí, actualizar `PROGRESS.md` y commitear.

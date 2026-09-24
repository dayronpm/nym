# `custom/` — personalización por negocio

Esta carpeta está **vacía a propósito** en la plantilla.

## Qué va aquí

Todo lo que sea específico de un cliente y no se pueda resolver desde el panel
de administración:

| Carpeta | Para qué |
| --- | --- |
| `custom/app/` | Rutas adicionales o sobrescrituras de páginas de `core/` |
| `custom/components/` | Componentes propios de este negocio |
| `custom/blocks/` | Bloques nuevos que solo usa este negocio |
| `custom/lib/` | Utilidades específicas del negocio |
| `custom/styles/` | Estilos adicionales (**nunca** reescribir `globals.css`) |
| `custom/public/` | Assets propios: logo, favicon, imágenes fijas |

## Reglas

1. **`core/` nunca se personaliza.** Si algo de este negocio hay que cambiarlo
   dentro de `core/`, eso significa que la plantilla tiene una carencia: se
   corrige primero en el repositorio plantilla, se etiqueta una versión nueva y
   se trae a esta copia.
2. **Antes de duplicar, extiende.** Los componentes y tipos se importan de
   `core/` con `@/...` y se envuelven o extienden aquí; no se copian.
3. **Contenido en la base de datos, no en código.** Textos, precios, fotos y
   colores se editan desde el panel. Esta carpeta es para lo que el panel no
   cubre.
4. **Alias disponible:** `@custom/...` apunta a esta carpeta.

## Colores y tipografías

No se definen aquí. El tema vive en los tokens de diseño y se edita desde
`/admin/apariencia`, que escribe en `site_settings.theme`. Si un negocio
necesita una tipografía que no está en la lista curada, ese cambio es genérico y
va en `core/`.

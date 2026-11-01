---
name: correo-marketing-html
description: Diseña, maqueta y comprueba correos HTML de marketing profesionales para cualquier marca (lanzamientos, novedades, ofertas con cupón, newsletters) que se ven bien en Gmail, Outlook, Apple Mail y el móvil — fondo blanco, sobrios y planos, sin glows ni bordes de color. La marca (colores, nombre, web, tipografía) sale de marca.json. Úsala cuando pidan un correo, una campaña de email, una newsletter, «el HTML del correo», rediseñar un correo o revisar por qué un correo se ve mal. Incluye plantillas probadas y un comprobador que renderiza en escritorio, móvil, sin imágenes y modo oscuro.
---

# Correos HTML de marketing

Antes de nada, lee la skill **`direccion-de-arte`** (marca → `marca.json`, brief, copy). Esta skill es la imprenta.

## Qué hay aquí
- `plantillas/producto.html` · lanzamiento de un producto o función: imagen de cabecera, titular, 2 párrafos, botón,
  ventajas numeradas, tira de cifras, pie con baja.
- `plantillas/anuncio.html` · novedad contada con texto (tipo newsletter): marca en texto, fecha, titular, imagen
  opcional con pie, lista corta, botón oscuro secundario.
- `plantillas/oferta.html` · cupón: código en caja plana, fecha de fin, botón, condiciones.
- `plantillas/hero-ejemplo.png`, `imagen-ejemplo.png` · imágenes de la marca de ejemplo (Pliego, ficticia) para
  previsualizar: el producto en contexto (la app sobre un degradado, con el modal y la fila que cuentan la función).
  Las tuyas se hacen con la skill **`producto-en-contexto`** (pieza `cabecera-correo`, 600x300 exportada a 2x =
  1200x600; en el correo, `width="560" height="280"`). Es lo que más sube el nivel de un correo: la imagen enseña el
  producto haciendo la novedad y el titular va en HTML debajo.
- `scripts/aplicar-marca.mjs` · rellena los marcadores `%%colores.tinta%%`, `%%nombre%%`, `%%web%%`… con tu
  `marca.json` (en correo no hay variables CSS: la marca va escrita en cada estilo en línea).
- `scripts/comprobar-correo.mjs` · comprobaciones estáticas + render real en 4 vistas.
- `references/reglas-clientes.md` · qué soporta cada cliente de correo y por qué las plantillas están hechas así.
- `references/entregabilidad.md` · peso, texto/imagen, baja, cabeceras, prueba de envío.

## Flujo
1. **Brief y textos** (skill `direccion-de-arte`): asunto (≤ 50 caracteres, sin mayúsculas ni exclamaciones),
   preencabezado (≤ 110), titular, 40-90 palabras de cuerpo, botón, ventajas y cifras **comprobadas en la fuente**.
2. **Aplica la marca** a la plantilla elegida (nunca edites la de la skill):
   ```bash
   node <skill>/scripts/aplicar-marca.mjs <skill>/plantillas/producto.html ./marca.json -o ./correo.html
   ```
3. **Edita solo lo marcado con `EDITAR`** en `correo.html`: textos, enlaces, imágenes (con su `width`/`height` reales
   y un `alt` que diga lo esencial). Para quitar un bloque, borra sus filas `<tr>` enteras. Para añadir otra ventaja,
   duplica una fila. No cambies la estructura de tablas ni los estilos salvo que sepas por qué (`reglas-clientes.md`).
4. **Imágenes**: PNG/JPG exportadas al doble (1200 px para 600). Para previsualizar pueden ser locales; para enviar,
   **URL https pública** (CDN, web de la marca).
5. **Comprueba** (obligatorio):
   ```bash
   cd <skill>/scripts && npm install            # solo la primera vez
   node <skill>/scripts/comprobar-correo.mjs ./correo.html --marketing --borrador   # con imágenes aún locales
   node <skill>/scripts/comprobar-correo.mjs ./correo.html --marketing              # el bueno, antes de enviar
   ```
   Arregla todos los ✗ (también «Marca sin aplicar» si quedó algún `%%…%%`). Los avisos de `{{etiquetas}}` y
   List-Unsubscribe son recordatorios para el envío.
6. **Mira las 4 vistas** que deja en `revision-<nombre>/` (abre cada PNG):
   - `escritorio.png`: jerarquía, alineación al eje de 40 px, aire, el botón como único color.
   - `movil.png`: nada desborda, el botón ocupa el ancho, las cifras se apilan, el titular no se parte mal.
   - `sin-imagenes.png`: ¿se entiende el correo y se ve el botón con las imágenes bloqueadas?
   - `oscuro.png`: ¿algo desaparece o queda feo al invertir (logos transparentes, imágenes)?
   Pasa la lista de `direccion-de-arte/references/revision-visual.md`. Corrige y repite.
7. **Prueba real** antes de enviar a nadie: una prueba a una bandeja de verdad (Gmail como mínimo; Outlook si se
   puede) y confirmar en el servidor o el proveedor de envío que la aceptó, no solo que el script dijo «enviado».
8. **Entrega**: el HTML final, las 4 vistas y qué se probó y qué no.

## Reglas de estilo de estas plantillas (no las rompas)
- Fondo **blanco** fuera y dentro. Bloques de apoyo en `bloque` plano sin borde.
- **Sin** sombras, brillos, degradados, bordes de color, bordes discontinuos, emojis ni exclamaciones en el HTML. La
  profundidad (degradado suave, capas con borde fino) vive solo dentro de la imagen de cabecera, nunca en el correo.
- El **botón es el único elemento de color** (`acento` con texto `sobre-acento`; el secundario, `tinta` con blanco).
  El acento como texto solo en `acento-texto` (números de las ventajas).
- Etiqueta (kicker) en gris, mayúsculas espaciadas; titular 29-30 px, 800, interletra −0,02 em; `&nbsp;` en las dos
  últimas palabras para que no se parta mal en el móvil.
- Separadores: línea de 1 px `linea`. Ventajas numeradas en vez de iconos (no dependen de imágenes).
- Ancho 600, márgenes 40 (24 en móvil). Tablas + estilos en línea + `font-family` en cada celda.
- Pie con quién escribe, enlaces útiles, por qué lo recibe y **Darme de baja** (obligatorio en comerciales).

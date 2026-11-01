---
name: producto-en-contexto
description: Imágenes de producto «en contexto» con nivel de agencia (el estilo de las imágenes de Proton, Linear o Raycast) para cualquier marca — la interfaz de la app en una ventana real y detallada (barra lateral, buscador, lista, iconos de línea) sobre un fondo degradado suave, con 1-2 capas flotantes (modal, fila destacada, aviso) con borde fino degradado, sombras suaves y el resto atenuado — en cabecera de correo, hero 16:9, post 1:1 y 4:5, banner de X, miniatura y story, exportadas a PNG 2x con Chrome y revisadas. Úsala cuando pidan imágenes de producto, «enseñar la app», capturas bonitas, mockups de la interfaz, la cabecera de un correo de lanzamiento, «como las de Proton», o subir de nivel unas piezas que se ven planas o amateur.
---

# Producto en contexto

Antes, lee **`direccion-de-arte`** (marca → `marca.json`, copy y revisión). Esta skill es el **estilo** y sus
componentes; el exportador es el de la skill hermana **`piezas-graficas`**.

## Qué es
Una pieza que **enseña el producto haciendo una cosa**: la app de verdad (no una ilustración), recortada a sangre
sobre un degradado suave, y encima 1-2 capas flotantes que cuentan **una función** (el modal que la activa, la fila
que cambia, el aviso que llega). Lo demás se atenúa para que el ojo vaya a la capa. Sin texto de marketing encima
cuando la pieza va dentro de algo que ya lo lleva (correo, web); con un titular corto cuando va sola (redes,
banner, miniatura, story). Reglas medidas en `references/estilo.md`: **léelas antes de componer**.

## Cuándo no
Es el **look 1** del selector (`direccion-de-arte/references/looks.md`). Si la pieza no enseña una app haciendo
algo, hay otro mejor: oferta o referidos con cifras en una marca oscura de fintech → `oscuro-glow`; personas o
equipo de gaming y lifestyle → `editorial-recorte`; producto físico con mascota → `producto-3d-mascota`; catálogo de
hardware o gaming → `tech-grid`.

## Qué hay aquí
- `plantillas/producto-en-contexto.html` · 7 formatos de una campaña: `cabecera-correo` (600x300 → PNG
  1200x600), `hero` (1600x900), `redes-1x1` (1080x1080), `redes-4x5` (1080x1350), `banner-x` (1500x500),
  `miniatura` (1280x720) y `story` (1080x1920). Ejemplo: Pliego, marca ficticia.
- `plantillas/producto.css` · los componentes, todos en `em` (cambias el `font-size` y escalan enteros) y solo con
  `var(--…)`: `.escena` (degradado; `.malla`, `.clara`, `.noche`), `.ventana` (oscura o `.clara`) con
  `.ui-lateral`, `.ui-buscador`, `.ui-cab`, `.ui-pestanas`, `.ui-lista`/`.ui-fila`, `.ui-avatar`, `.ui-chip`,
  `.ui-boton`, `.ui-accion`; `.flotante` (borde degradado + sombra) con `.destacada`, `.modal` (`.ui-campo`,
  `.ui-opcion`, `.ui-interruptor`, `.cursor`), `.toast`; y `.atenuado`. Catálogo con ejemplos en
  `references/componentes.md`.
- `plantillas/producto.js` · 40 iconos de línea (`<svg class="i"><use href="#i-buscar"/></svg>`) y el recolocador:
  una capa con `data-sobre=".ui-fila.oculta"` se centra sola encima de su fila.
- `producto.css` y `producto.js` son los mismos en `piezas-graficas` y `carrusel-instagram`: si cambias uno,
  copia los otros.
- `referencia/golden.jpg` + `golden.md` · la pieza de referencia del look, qué imitar y la lista puntuable del bucle
  de pulido. Antes de empezar, pide (o saca de su web) **capturas o la estructura de su app** (secciones del menú,
  qué lista enseña, nombres reales de sus funciones): la interfaz tiene que parecer la suya.

## Flujo
1. **Marca y brief** (`direccion-de-arte`): `marca.json` y **una función** que contar (no tres). Escribe qué hace
   el usuario y qué ve al acabar: eso son las dos capas (p. ej. «activa los recordatorios» → modal; «le pagan» →
   fila «Pagada» o aviso). Si la marca no trae `escena-1/2/3`, el fondo se deriva de su acento.
2. **Datos del producto**: nombres, cifras y estados verosímiles y coherentes entre capas (la fila destacada es la
   misma que la oculta de la lista). Si hay app real, copia sus textos, su orden de menú y sus iconos; si hay
   capturas, úsalas solo para calcar la interfaz, no pegadas.
3. **Copia la carpeta `plantillas/`** al trabajo (HTML + `producto.css` + `producto.js`) y deja solo los formatos
   que hagan falta. Cambia los textos de la interfaz por los del producto.
4. **Compón** (ver `references/estilo.md`): ventana al ~11 % del ancho y ~14 % del alto, sangrando por la derecha
   y por abajo (`--sangra-d` / `--sangra-a` para que su texto no se corte); modal arriba a la derecha sangrando;
   fila destacada saliendo ~2 em por la izquierda de la ventana, encima de su fila (`data-sobre`), sin dejar
   textos medio tapados; contexto con `.atenuado`. `--radio-escena` ≈ 1,7 % del ancho del lienzo.
5. **Exporta a 2x y revisa** (obligatorio):
   ```bash
   cd <skill>/../piezas-graficas/scripts && npm install      # solo la primera vez
   node <skill>/../piezas-graficas/scripts/exportar.mjs ./producto-en-contexto.html --marca ./marca.json --escala 2
   ```
   Cada pieza lleva `data-estilo="producto"`: el exportador acepta las sombras suaves de las capas, pero avisa de
   brillos, de desenfoques y de texto libre que toque una capa; las capas pueden solaparse entre ellas.
6. **Bucle de pulido (obligatorio, 2 vueltas como mínimo)** — `piezas-graficas/references/pulido.md`:
   ```bash
   node <skill>/../piezas-graficas/scripts/comparar.mjs out/<html>/hero.png --look producto-en-contexto --vuelta 1
   ```
   Abre `revision/vuelta-1.png` (tu pieza junto a la golden y un detalle de la interfaz al 100 %), puntúa cada punto
   de `referencia/golden.md` de 1 a 10 en `revision/vuelta-1.md`, corrige lo que esté por debajo de 8 (ventana medio
   vacía, lateral pobre, texto medio tapado por una capa, datos incoherentes) y repite.
7. **Entrega**: PNG 2x. Para subir a una red que limite el peso (miniatura de YouTube < 2 MB), exporta esa pieza
   con `--escala 1 --solo miniatura`. La cabecera de correo sale a 1200x600: es la imagen de la plantilla
   `producto` de `correo-marketing-html` (súbela a una URL https).

## Reglas que no se negocian
- **Una función por pieza** y **dos capas flotantes como mucho**. Si hay dos, una cuenta la acción y otra el
  resultado.
- **Sin texto de marketing dentro de las capas**: la interfaz habla como la app («Activar», «Pagada»).
- **Profundidad con contención**: borde de ~1 px degradado (claro arriba, color de la escena abajo), una sombra
  oscura larga y suave, capa algo más oscura que lo que tapa. Nada de glow, neón, `text-shadow`, sombras de color
  ni desenfocar el contexto.
- **Nada medio tapado**: si una capa tapa una fila o un elemento de la lateral, que lo tape entero (fila con
  `.oculta`) o que no lo toque.
- **Titulares** (cuando los hay) en peso medio (600) con interletra −0,04 em: nunca 800-900 sobre esta estética.

---
name: tech-grid
description: Piezas de campaña «tech-grid» con nivel de agencia para cualquier marca — fondo negro-azulado con una cuadrícula fina y un degradado a azul abajo, productos recortados que se salen de marcos de borde fino con relleno degradado, marcos unidos por pistas de circuito con nodos cuadrados, un arco fino alrededor del logo y el titular, y el titular en grotesca ancha y en mayúsculas — en hero 16:9, post 1:1 y 4:5, banner de X y story, exportadas a PNG 2x con Chrome y revisadas. Úsala cuando pidan ofertas o campañas de catálogo de gaming, periféricos, hardware o electrónica, rebajas de temporada (Black Friday, vuelta al cole, semana de ofertas), presentaciones de una gama de productos o piezas para un evento tech.
---

# Tech-grid

Antes, lee **`direccion-de-arte`** (marca → `marca.json`, copy y revisión). Esta skill es el **look** y sus
componentes; el exportador es el de la skill hermana **`piezas-graficas`**.

## Qué es
Una pieza de **catálogo con energía de lanzamiento**: varios productos de verdad (recortados, sin fondo) dentro de
marcos rectangulares finos, rompiendo el borde del marco; los marcos, unidos por pistas de circuito que solo giran
en ángulo recto; y un bloque logo + titular abrazado por un arco fino. Todo sobre un fondo casi negro con una
cuadrícula sutil que se vuelve azul abajo. Se parece a una placa base vista desde arriba: orden, precisión y producto.
Plano: ni glow, ni sombras de color, ni desenfoques. Reglas medidas en `references/estilo.md`: **léelas antes de
componer**.

## Cuándo usarlo y cuándo no
- **Sí**: campañas de catálogo (2-4 productos), ofertas de temporada, presentaciones de gama, eventos y ferias tech,
  lanzamientos de hardware o periféricos. Marcas con acento frío o eléctrico (azul, cian, violeta, verde).
- **No**, y qué usar en su lugar:
  - Personas o equipos como protagonistas, con más aire → **`editorial-recorte`**.
  - Un producto con mascota o personaje → **`producto-3d-mascota`**.
  - Fintech u ofertas que se cuentan con una cifra grande → **`oscuro-glow`**.
  - Enseñar una app o una función de la interfaz → **`producto-en-contexto`**.
  - Un único producto sin nada más que contar: aquí sobran los marcos; mejor `producto-3d-mascota` o una pieza plana.

## Qué hay aquí
- `plantillas/tech-grid.html` · 5 formatos de una campaña: `hero` (1600x900), `redes-1x1` (1080x1080),
  `redes-4x5` (1080x1350), `banner-x` (1500x500) y `story` (1080x1920). Ejemplo: Pulso, marca ficticia de
  periféricos gaming, con la campaña «Semana Pulso».
- `plantillas/tech-grid.css` · los componentes, solo con `var(--…)`: `.tg` (la pieza: fondo y degradado),
  `.tg-rejilla` (cuadrícula SVG), `.tg-pistas` (`.pista`, `.nodo`; `.t2` = segundo trazo), `.marco` (`.t2`),
  `.recorte`, `.corte` (persona cortada por el borde de abajo del marco), `.contacto` (sombra de contacto),
  `.tg-arco` y el bloque de texto (`.tg-firma`, `.tg-titular`, `.tg-apoyo`, `.tg-fechas`, `.tg-web`).
- `plantillas/marca-ejemplo.json` · la marca Pulso (con `acento-2` y `tipografia.display`).
- `plantillas/recortes/` · renders 3D propios sin marca (teclado, ratón y cascos blancos) y una persona generada con
  IA (no es real), en WebP con alfa, recortados y a la medida que se usa a 2x (≤ 500 KB cada uno). Son **del
  ejemplo**: para otra marca, sus productos (las escenas de esos tres renders están en
  `producto-3d-mascota/scripts/escenas/` y admiten los colores de la marca).
- `referencia/golden.jpg` + `golden.md` · la pieza de referencia del look, qué imitar y la lista puntuable.

## Antes de empezar
Mira la golden del look (`referencia/golden.jpg`, anotada en `referencia/golden.md`): 4 marcos, productos con
detalle que rompen el marco, pistas con nodos y el titular ancho con su arco. Pide al usuario (o saca de su web) las
**fotos de 2-4 productos** (mejor sobre fondo liso), si quiere una **persona** y si tiene **clave de Higgsfield** y
cuánto puede gastar. Si no contesta, decide con lo que haya y dilo en la entrega.

## Flujo
1. **Marca y brief** (`direccion-de-arte`): `marca.json` con `acento` (trazo 1 y titular) y, si la marca lo tiene,
   `acento-2` (trazo 2, el contrapunto: lima con azul). Sin `acento-2`, se deriva del acento. Para el titular, una
   grotesca con eje de anchura en `tipografia.display` (Archivo, Bricolage Grotesque, Familjen Grotesk, Unbounded…):
   la plantilla pide `font-stretch: 125%`; si la fuente no es ancha, sale normal y cabe igual.
2. **Copy**: titular de **2 líneas cortas** (≤ 7 letras por línea: «SEMANA / PULSO», «REBAJAS / DE INVIERNO» no
   cabe); apoyo de una idea con la cifra resaltada en `<b>` («Hasta −40 % en periféricos»); fechas; web. Sin CTA
   tipo botón: la web hace de cierre.
3. **Material: 3-4 recortes** (2 como mínimo) de SUS productos y, si hace falta, una persona, por este orden
   (`piezas-graficas/references/sujetos.md`):
   - **Fotos del usuario** → `recortar.mjs` → `preparar-recorte.mjs` (quita el halo: el exportador avisa si queda)
     → `armonizar.mjs --look tech-grid` (mismo blanco y recorte azul en todos) → `ver-recorte.mjs`.
   - **Librería 3D** pintada con su marca si son teclados, ratones o cascos:
     `producto-3d-mascota/scripts/render-3d.mjs …/escenas/raton.html raton.png --param cuerpo=… --param rgb1=…`.
   - **IA** (con clave y permiso): un prompt por producto con el mismo bloque de luz, fondo gris liso; luego como
     una foto. Persona con `soul` (prompts en `imagen-ia/references/prompts.md`).
   - Nunca los recortes de ejemplo de la plantilla (cascos, ratón, teclado y la jugadora de Pulso) como si fueran
     de la marca; si no queda otra, entrégalos marcados como PROVISIONALES y dilo.
   - **Con solo 2 fotos**: el 3.er marco es una persona usando el producto (IA, con permiso) u otro producto de la
     marca (librería 3D o IA). Nunca un detalle ampliado de la misma foto ni una foto con su fondo.
   - Producto **sin logos de otras marcas** ni letras inventadas a la vista; personas **que no sean reales** (o con
     permiso), cortadas por encima de cualquier logo de la ropa.
4. **Compón** (ver `references/estilo.md`): copia `plantillas/` al trabajo y deja los formatos que hagan falta.
   Coloca primero los marcos, luego los recortes (que rompan 1-2 lados), luego las pistas (de borde a borde, con su
   nodo en cada unión) y por último el bloque logo + titular con su arco. Las coordenadas de pistas y nodos están en
   px de la pieza (el SVG tiene `viewBox` = tamaño de la pieza).
5. **Exporta a 2x y revisa** (obligatorio):
   ```bash
   cd <skill>/../piezas-graficas/scripts && npm install      # solo la primera vez
   node <skill>/../piezas-graficas/scripts/exportar.mjs ./tech-grid.html --marca ./marca.json --escala 2
   ```
   Cada pieza lleva `data-estilo="tech-grid"` (plano). La decoración lleva `data-fondo` y no cuenta en choques; cada
   `<img data-recorte>` se mide píxel a píxel: ningún texto puede pisar su parte opaca.
6. **Bucle de pulido (obligatorio, 2 vueltas como mínimo)** — `piezas-graficas/references/pulido.md`:
   ```bash
   node <skill>/../piezas-graficas/scripts/comparar.mjs out/<html>/hero.png --look tech-grid --vuelta 1
   ```
   Abre `revision/vuelta-1.png`, puntúa cada punto de `referencia/golden.md` de 1 a 10 en `revision/vuelta-1.md`,
   corrige lo que esté por debajo de 8 (productos pequeños, marcos de menos, halo, luz distinta entre productos) y
   repite. Se entrega con todo ≥ 8 y sin fallos graves.
7. **Prueba otra marca** con `--marca`: cambian color, fuentes, nombre y logo sin romperse.

## Reglas que no se negocian
- **Plano**: ni glow, ni `text-shadow`, ni sombras de color, ni desenfoques. La única sombra es la de contacto,
  oscura, dentro del marco y hecha con `radial-gradient`.
- **Pistas solo en ángulo recto** y siempre de un marco a otro marco o al borde del lienzo, con un **nodo** en cada
  unión con un marco. Nunca una línea suelta ni en diagonal.
- **El producto rompe el marco** por 1-2 lados (nunca por los cuatro), sin tapar el nodo ni la pista.
- **Dos colores de trazo como mucho** (acento y acento-2). El titular, en el acento; el acento-2 solo en trazos,
  nodos, la cifra del apoyo y el cuadradito de la web.
- **Mayúsculas solo en el titular** (excepción medida de este look): 2 líneas, interlineado 0,9. El resto, en
  minúsculas normales.
- **El texto no toca ningún producto ni cruza el arco** y respeta las zonas seguras de cada formato.

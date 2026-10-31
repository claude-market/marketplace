---
name: producto-3d-mascota
description: Piezas «producto 3D con mascota» con nivel de agencia (el estilo de los banners de las tiendas de videojuegos) para cualquier marca — un producto 3D realista y la mascota o personaje 3D de la marca, solapados, sobre un degradado azul-violeta profundo con partículas y bokeh tenues, sombras de contacto, luz de color coherente y el logo centrado arriba — en hero 16:9 redondeado, post 1:1 y 4:5, banner de X y story, exportadas a PNG 2x con Chrome y revisadas. Úsala cuando haya un producto físico o de gaming y una mascota o personaje de marca: tiendas, lanzamientos de hardware, colaboraciones, banners de tienda y de app, campañas infantiles o juveniles, o cuando pidan «el producto en 3D con la mascota» o «un banner como los de las tiendas de juegos».
---

# Producto 3D con mascota

Antes, lee **`direccion-de-arte`** (marca → `marca.json`, copy y revisión). Esta skill es el **estilo** y sus
componentes; el exportador es el de la skill hermana **`piezas-graficas`**.

## Qué es
Un escaparate: **un producto 3D realista y la mascota de la marca, juntos y solapados** (la mascota delante de
parte del producto, mirándolo), sobre un degradado profundo azul → violeta → índigo con partículas y bokeh
tenues. Lo que lo hace creíble es la luz: los dos sujetos llevan **luz de recorte del color del fondo** y una
**sombra de contacto** que los asienta. El texto se contiene: logo centrado arriba y, si la pieza va sola, un
titular corto y una CTA en el aire, nunca encima de los sujetos. Reglas medidas en `references/estilo.md`:
**léelas antes de componer**.

## Cuándo usarlo y cuándo no
- **Sí**: producto físico o de gaming (consola, torre, periférico, mando, tarjeta regalo con su caja) **y** una
  mascota o personaje de la marca; tiendas, lanzamientos de hardware, colaboraciones (la mascota de una marca con
  el producto de otra), banners de tienda y de app, campañas infantiles o juveniles.
- **No**, y qué usar en su lugar:
  - Enseñar una **app** o una interfaz → **`producto-en-contexto`**.
  - Fintech, ofertas o precios en oscuro con brillo → **`oscuro-glow`**.
  - Gaming o esports **sin mascota** (jugadores, equipos, juegos) → **`editorial-recorte`** o **`tech-grid`**.
  - Sin material 3D decente (ni render ni IA con recorte limpio) → mejor otro look que un 3D pobre.

## Qué hay aquí
- `plantillas/producto-3d-mascota.html` · 5 formatos de una campaña: `hero` (1600x900, redondeado), `redes-1x1`
  (1080x1080), `redes-4x5` (1080x1350), `banner-x` (1500x500) y `story` (1080x1920). Ejemplo: Cometa, tienda de
  gaming ficticia, con Chispa (su mascota) y una torre gaming blanca sin marca.
- `plantillas/producto-3d-mascota.css` · los componentes, solo con `var(--…)`: `.lienzo-3d` (`.redondeado`),
  `.luz-3d` (`.halo`, `.suelo`), `.particulas` (SVG con cruces y cuadraditos), `.bokeh`, `.sujeto` (`.producto`,
  `.mascota`) con su `.contacto` y el `img[data-recorte]`, `.marca-3d`, `.chip-3d`, `.titular-3d`, `.apoyo-3d` y
  `.cta-3d`. Tokens del look (derivados del acento; se fijan desde `marca.json` → `colores`): `cielo-1`,
  `cielo-2`, `cielo-3`, `luz-3d`, `particula`, `sombra-3d` y `pagina`.
- `plantillas/marca-ejemplo.json` · la marca del ejemplo (Cometa), para ver la plantilla tal cual.
- `plantillas/recortes/` · `producto-torre.webp` y `mascota-chispa.webp`: renders 3D propios (three.js) con alfa,
  ≤ 500 KB, renderizados con la luz de la marca de ejemplo.
- `referencia/golden.jpg` + `golden.md` · la pieza de referencia del look y qué imitar de ella, con la lista
  puntuable del bucle de pulido.
- `scripts/escenas/teclado.html`, `raton.html`, `cascos.html` (+ `estudio-producto.js`) · **librería de productos 3D**
  sin marca, con los colores de la tuya por parámetro (`cuerpo`, `acento`, `rgb1`, `rgb2`, `recorte`, `giro`): valen
  aquí y en `tech-grid`. `mascota.html` admite `cuerpo` y `panza` (mascota genérica de vinilo).
- `scripts/render-3d.mjs` + `scripts/escenas/` · el **render propio**, sin IA: `mascota.html` (Chispa) y
  `producto.html` (la torre) en three.js, a PNG con fondo transparente con Chrome sin cabeza. La luz de recorte
  se cambia por la de tu marca con `--param azul=3d8bff --param violeta=8b6bff` (en la torre también tiñe el RGB
  del interior; el encuadre, con `--param giro=0.86 --param elev=0.03`); los colores de la mascota están arriba en
  `mascota.html` (su vinilo lleva el fresnel de recorte con esos mismos dos colores). La torre trae un interior de
  escaparate (AIO, ventiladores de 11 aspas con aro RGB, gráfica horizontal, cables trenzados): el detalle que
  hace falta está medido en `references/estilo.md`. Con el modelo real del producto (GLB/GLTF), cópialo junto a
  las escenas y cárgalo con `GLTFLoader` en una copia de `producto.html`. La primera vez, `npm install` en
  `scripts/`. Renderiza a 1800 x 1800 (≥ 2x de lo que se verá), **un render cada vez** (WebGL por software: la
  torre tarda ≈ 40 s y la mascota ≈ 15 s):
  ```bash
  node <skill>/scripts/render-3d.mjs <skill>/scripts/escenas/mascota.html mascota.png --ancho 1800 --alto 1800 --param violeta=8b6bff
  ```
  Después recorta lo transparente sobrante y pásalo a WebP (≤ 500 KB), mide la huella (fila opaca más baja por
  columna) para `.contacto` y mira los bordes a 200 % sobre oscuro y sobre el violeta. Para fotos o renders con
  fondo: `imagen-ia/scripts/recortar.mjs`.

## Antes de empezar
Mira la golden del look (`referencia/golden.jpg`, anotada en `referencia/golden.md`): es el nivel que hay que
alcanzar. Pide al usuario (o saca de su web) lo que no esté: el **producto** (fotos, modelo 3D o al menos qué es,
colores y materiales), la **mascota** (imágenes o descripción: especie, colores, rasgos) y si tiene **clave de
Higgsfield** y cuánto puede gastar. Si no contesta, decide con lo que haya y dilo en la entrega.

## Flujo
1. **Marca y brief** (`direccion-de-arte`): `marca.json`, **un** producto y **una** mascota. Copy con contención:
   titular de 2-5 palabras por línea, 2 líneas como mucho, y una CTA de 1-2 palabras.
2. **Copy**: titular (oferta, lanzamiento o colaboración), chip opcional («Semana gamer») y CTA. El hero y el
   banner de X pueden ir solo con logo y titular.
3. **Material: el producto y la mascota del usuario**, por este orden (`piezas-graficas/references/sujetos.md`):
   - **Fotos o modelo 3D del usuario** → `recortar.mjs` → `preparar-recorte.mjs` → `armonizar.mjs --look
     producto-3d-mascota` (rim azul y violeta, blancos) → `ver-recorte.mjs`.
   - **Producto de la librería 3D** (teclado, ratón, cascos, torre) pintado con su marca:
     `render-3d.mjs escenas/teclado.html … --param cuerpo=… --param acento=… --param recorte=…`. La mascota genérica
     (`escenas/mascota.html --param cuerpo=… --param panza=…`) solo si la marca no tiene mascota propia.
   - **IA** (con clave y permiso): la mascota con `z-image` y el producto con `z-image` o `soul`, por separado, fondo
     gris liso y la misma luz (prompts en `imagen-ia/references/prompts.md`); después recortar → preparar →
     armonizar. Revisa la anatomía de la mascota (patas, brazos, manos) y descarta las raras.
   - Nunca la torre y Chispa de ejemplo como si fueran de la marca, ni figuras hechas con formas básicas. **No
     modeles a mano** en three.js un producto o una mascota que no están en la librería (sale de juguete): si hay
     clave de IA, genera; si no, pide fotos o usa la librería y la mascota genérica, y dilo.
   - Mide la huella de cada recorte (`preparar-recorte.mjs` la imprime) y ajusta `.contacto` (`--cx`, `--cy`,
     `--cw`, `--ch`).
4. **Compón**: copia la carpeta `plantillas/` al trabajo (HTML + CSS + `recortes/`), cambia los recortes y los
   textos, y coloca la pareja según el formato: producto 1,2-1,3 veces más alto que la mascota, la mascota delante
   tapando el 20-35 % del ancho del producto y con la base 20-40 px más baja.
5. **Exporta a 2x y revisa** (obligatorio):
   ```bash
   cd <skill>/../piezas-graficas/scripts && npm install      # solo la primera vez
   node <skill>/../piezas-graficas/scripts/exportar.mjs ./producto-3d-mascota.html --marca ./marca.json --escala 2
   ```
   Cada pieza lleva `data-estilo="producto-3d-mascota"`: el exportador acepta las sombras oscuras, avisa de
   brillos, `text-shadow` y filtros fuera de `data-fondo`, comprueba que los recortes traen transparencia y da
   **error si un texto pisa la parte opaca** de un recorte.
6. **Bucle de pulido (obligatorio, 2 vueltas como mínimo)** — `piezas-graficas/references/pulido.md`:
   ```bash
   node <skill>/../piezas-graficas/scripts/comparar.mjs out/<html>/hero.png --look producto-3d-mascota --vuelta 1
   ```
   Abre `revision/vuelta-1.png` (tu pieza junto a la golden y un detalle de cada una al 100 %), puntúa cada punto de
   la lista de `referencia/golden.md` de 1 a 10 en `revision/vuelta-1.md`, corrige lo que esté por debajo de 8 y
   repite. Se entrega con todo ≥ 8 y sin fallos graves (sujetos de juguete o de ejemplo, halos, texto encima).
7. **Entrega**: PNG 2x. El hero redondeado lleva las esquinas del color de la página (`--pagina`); si la web
   redondea con CSS, exporta sin `.redondeado`.

## Reglas que no se negocian
- **Dos sujetos, solapados**: un producto y una mascota, la mascota delante y mirando al producto. Ni tres sujetos
  ni la pareja separada en dos islas.
- **El texto nunca pisa un sujeto** (el exportador lo mide píxel a píxel) y va en el aire: logo arriba, titular y
  CTA entre el logo y la pareja o al lado de ella.
- **La luz de color va en los renders (recorte) y en el fondo (radial-gradient)**: nada de `box-shadow` de color,
  `text-shadow` ni halos en el texto o los botones.
- **Sombras de contacto oscuras** (elipses con radial-gradient, sin `filter`) bajo cada sujeto que apoye.
- **Partículas y bokeh tenues** (opacidad ≤ 0,35) en capas `data-fondo` con `aria-hidden="true"`.
- **El texto siempre en HTML**, nunca dentro de los renders; sin marcas reales ni personajes con derechos (la
  mascota es de la marca o original).
- Los renders **no cambian de color con la marca**: se renderizan con su luz. Marca nueva, render nuevo.

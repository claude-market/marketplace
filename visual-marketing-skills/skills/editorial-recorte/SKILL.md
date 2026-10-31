---
name: editorial-recorte
description: Campañas editoriales con personas o producto recortados, con nivel de agencia (el estilo de las presentaciones de equipos de esports y marcas de periféricos) para cualquier marca — fondo casi negro con un degradado sutil hacia una esquina, un collage de 3 recortes con jerarquía clara de tamaños (uno dominante y dos medianos delante, solapados) que se funden con el negro por abajo, líneas finas de construcción (arco gigante, marco del que se sale un sujeto, cruces de registro) y el texto, pequeño, en el aire — en hero 16:9, post 1:1 y 4:5, banner de X y story, exportadas a PNG 2x con Chrome y revisadas. Úsala cuando pidan piezas de gaming, esports, equipos o clubes, lifestyle, moda o deporte, presentaciones de fichajes, jugadores o embajadores, o campañas con personas o producto recortado («como las de los equipos de esports», «collage de jugadores», «presentación del equipo»).
---

# Editorial recorte

Antes, lee **`direccion-de-arte`** (marca → `marca.json`, copy y revisión). Esta skill es el **estilo** y sus
componentes; el exportador es el de la skill hermana **`piezas-graficas`**.

## Qué es
Una pieza de campaña que **presenta a gente** (un equipo, un fichaje, unos embajadores) o un producto en manos de
alguien: 3 recortes en collage con una jerarquía que se lee en un segundo, sobre un negro con una esquina de luz,
unidos por líneas finas de construcción y con mucho aire. El texto es mínimo (firma, titular corto, una línea y la
llamada) y nunca va encima de las fotos. Plano: sin sombras, brillos ni desenfoques. Reglas medidas en
`references/estilo.md`: **léelas antes de componer**.

## Cuándo usarlo y cuándo no
- **Sí**: presentar un equipo o un jugador, un fichaje, embajadores, una colección de moda o deporte, una campaña
  con personas usando el producto (cascos, ratón, zapatillas), cabeceras de temporada.
- **No**, y usa en su lugar:
  - ofertas de catálogo gaming (precios, descuentos, varios productos) → **`tech-grid`**;
  - producto físico con mascota o personaje → **`producto-3d-mascota`**;
  - fintech u ofertas en oscuro con un número protagonista → **`oscuro-glow`**;
  - enseñar una app o una función → **`producto-en-contexto`**.
- Sin fotos buenas de personas (o de producto en mano), este look no funciona: consíguelas antes (del usuario o
  generadas con IA con su permiso; ver «Material»). **Nunca siluetas ni figuras dibujadas**: el exportador da error.

## Antes de empezar
Mira la golden del look (`referencia/golden.jpg`, anotada en `referencia/golden.md`): tres personas fotográficas con
jerarquía, recortes limpios y mucho aire. Pide al usuario las **fotos de las personas** (con permiso para usarlas),
el **producto** que deben llevar y, si no hay fotos, si tiene **clave de Higgsfield** y cuánto puede gastar (generar
3 personas cuesta ≈ 0,02-0,05 $). Si no contesta, decide con lo que haya y dilo en la entrega.

## Qué hay aquí
- `plantillas/editorial-recorte.html` · 5 formatos de una campaña: `hero` (1600x900), `redes-1x1` (1080x1080),
  `redes-4x5` (1080x1350), `banner-x` (1500x500) y `story` (1080x1920). Ejemplo: Pulso, marca ficticia de
  periféricos gaming y club de esports (personas generadas con IA).
- `plantillas/editorial-recorte.css` · los componentes, solo con `var(--…)`: `.editorial` (el lienzo), `.construccion`
  (SVG `data-fondo` con `.arco`, `.trazo`, `.marco-linea`, `.cruz`, `.cruz.detalle`), `.sujeto` (`img[data-recorte]`
  con fundido inferior), `.encuadre` (el marco que deja salir la cabeza por arriba) y el texto: `.firma`,
  `.antetitulo`, `.titular`, `.apoyo`, `.llamada` (con `.raya` y `.url`), `.detalle`.
- Tokens del look (se derivan de la marca; se pueden sobrescribir en `marca.json` → `colores`): `ed-fondo`,
  `ed-luz`, `ed-trazo`, `ed-trazo-arco`, `ed-texto`, `ed-apoyo`, `ed-detalle` (= `acento-2` si la marca lo trae, si no
  `acento`). El titular usa `--fuente-display` (de `tipografia.display`) o, si no hay, `--fuente`.
- `plantillas/marca-ejemplo.json` · la marca del ejemplo (Pulso).
- `plantillas/recortes/` · los tres recortes del ejemplo (WebP con alfa, logos inventados tapados, sin halo). Son de
  la marca de ejemplo: para otra marca, sus personas.
- `referencia/golden.jpg` + `golden.md` · la pieza de referencia del look, qué imitar y la lista puntuable.
- `scripts/preparar-recortes.mjs` · tapa logos, quita el halo, recorta y guarda WebP con alfa (ver el paso 3).

## Flujo
1. **Marca** (`direccion-de-arte`): `marca.json`. Si la marca tiene un segundo acento (`acento-2`), ese es el
   detalle; si no, el acento.
2. **Copy**: firma, un titular de 2-4 palabras (el lema vale), una línea de apoyo (≤ 60 caracteres por línea) y la
   llamada o la web. Nada de listas ni de precios: eso es otro look.
3. **Material: los recortes** (`piezas-graficas/references/sujetos.md`). Fotos del usuario con el fondo quitado
   (`imagen-ia/scripts/recortar.mjs`) o, sin fotos y con su permiso, **generadas con IA** sobre **fondo plano gris**:
   ```bash
   node <imagen-ia>/scripts/generar.mjs "<prompt de persona de imagen-ia/references/prompts.md>" jugador-1.png --modelo soul --formato 3:4 --cantidad 4 --si
   ```
   (`soul`, 4 variantes por persona ≈ 0,02 $; revisa manos, orejas y letras inventadas y quédate con la mejor). Nunca
   personas reales sin permiso ni fotos de otras marcas, ni los recortes de ejemplo de la plantilla como si fueran
   sus jugadores. Pide o genera 4-5 para elegir 3: una de perfil o tres cuartos (el dominante), una de frente con el
   producto en la mano y otra de tres cuartos.
   Prepáralas con `scripts/preparar-recortes.mjs` (una vez: `npm install` en `../piezas-graficas/scripts`):
   tapa los logos y textos inventados (relleno desde el borde o clonando la tela de al lado), estrecha y oscurece el
   borde semitransparente (adiós al halo gris), borra mechones con resto de fondo, corta por el contorno la oreja
   «fantasma» y los restos pegados a la piel (`contorno`), limpia mechones sueltos y motas (`limpiar`), hornea un
   fundido lateral si la ropa llega cortada al borde, recorta y guarda WebP ≤ 500 KB. **Mira cada parche, el pelo y
   las orejas al 400 % sobre negro.**
4. **Compón** (ver `references/estilo.md`): copia `plantillas/` al trabajo y deja los formatos que hagan falta.
   Dominante arriba al centro del collage, medianos delante a 0,5-0,6 veces su cabeza, solapes de cuerpo y nunca de
   cara, el arco abrazando el collage por el lado del texto, el sujeto del marco rompiendo el lado de arriba,
   3-4 cruces en el aire y una con el acento. Ajusta `left`/`top`/`width` de cada `<img data-recorte>`, el marco
   (`.encuadre` y su `rect.marco-linea`, con las mismas medidas) y el arco a tus recortes.
5. **Exporta a 2x y revisa** (obligatorio):
   ```bash
   node <skill>/../piezas-graficas/scripts/exportar.mjs ./editorial-recorte.html --marca ./marca.json --escala 2
   ```
   Cada pieza lleva `data-estilo="editorial-recorte"`: el exportador avisa de sombras y filtros fuera de las capas
   `data-fondo`, comprueba que cada recorte trae transparencia y da **error si un texto pisa la parte opaca de un
   recorte** (píxel a píxel, descontando el fundido).
6. **Bucle de pulido (obligatorio, 2 vueltas como mínimo)** — `piezas-graficas/references/pulido.md`:
   ```bash
   node <skill>/../piezas-graficas/scripts/comparar.mjs out/<html>/hero.png --look editorial-recorte --vuelta 1
   node <skill>/../piezas-graficas/scripts/ver-recorte.mjs revision/recortes.png recortes/*.webp --fondo "#0b0d12"
   ```
   Abre las dos imágenes, puntúa cada punto de `referencia/golden.md` de 1 a 10 en `revision/vuelta-1.md`, corrige
   lo que esté por debajo de 8 (pelo y orejas al 300 %, jerarquía, aire) y repite. Se entrega con todo ≥ 8.
7. **Entrega**: PNG 2x. El banner de X y la story ya respetan sus zonas tapadas.

## Reglas que no se negocian
- **Nunca texto encima de un recorte**, ni de su parte fundida. Tampoco `data-sobre-recorte` en este look.
- **Jerarquía clara**: un dominante y dos medianos (cuatro sujetos como mucho). Ninguna cara tapada.
- **Plano**: sin sombras, brillos, glow, contornos ni desenfoques. Solo el degradado del fondo y el fundido inferior.
- **Líneas finas**: 1,5 px a 1x, claras al 55-65 %, por detrás de los sujetos; un arco, un marco y 3-4 cruces.
- **Recortes limpios**: sin halo, sin logos ni textos inventados a la vista, sin cortes duros contra el borde.
- **El acento, una vez**. Titular en peso 600 con interletra −0,038 em; nunca 800-900.

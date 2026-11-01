# Prompts para imágenes de marketing sobrias

## Plantilla
```
[SUJETO concreto], [COMPOSICIÓN: dónde está el sujeto y dónde queda el espacio libre para el texto],
[LUZ], [PALETA], [ESTILO / CÁMARA], [ACABADO].
Negative / avoid: text, letters, watermark, logo, neon, glow, lens flare, oversaturated, plastic 3D, HDR.
```

## Bloques de estilo (cópialos tal cual)
**Cálido editorial (claro)** · cambia la paleta por la de tu `marca.json`
`soft natural daylight, warm neutral palette of cream, sand and charcoal with a single [brand accent] accent, matte
materials, editorial photography, 50mm lens, shallow depth of field, clean seamless backdrop, generous negative space`

**Oscuro sobrio (oscuro)**
`low-key lighting, deep charcoal background (your noche color), subtle rim light, muted tones, single [brand accent] accent,
matte surfaces, minimal, premium product photography, no glow, no neon`

## Ejemplos
**Fondo para portada de carrusel (4:5), hueco arriba para el titular**
`A tidy desk with a closed laptop, a notebook and a coffee cup, placed in the lower third of the frame, empty
cream wall filling the upper two thirds for text, ` + bloque cálido editorial

**Miniatura (16:9), objeto a la derecha, izquierda limpia**
`A single matte product object standing upright on the right side of the frame, plain dark background on
the left half, ` + bloque oscuro sobrio

**Story (9:16), textura sutil de fondo**
`Very subtle paper texture in warm cream, almost flat, even lighting, no objects, ` + `minimal, matte`

**Ambiente de juego sin copyright**
`A cozy evening room with a monitor glowing softly showing an unrecognizable fantasy landscape, seen from behind a
chair, right third of the frame, left two thirds dark and calm for text, ` + bloque oscuro sobrio

## Sujetos para los looks (se recortan después)
Siempre: **fondo gris claro liso, sujeto entero con margen, sin texto ni logos, la misma luz en toda la serie**.
Bloque de luz de la serie (cópialo igual en todos los prompts de una pieza):
`soft studio key light from the top left, cool blue rim light from behind on the right, gentle fill, plain flat light
grey seamless studio background, sharp focus, high detail, no text, no logo, no watermark`

**Persona para `editorial-recorte`** (`soul`, `--formato 3:4`, `--cantidad 4` y eliges): 
`Editorial studio portrait of a [edad] year old [descripción: pelo, rasgos] esports player wearing a plain black
technical jersey without any logo, [acción: wearing white over-ear gaming headphones with a boom microphone / holding a
white gaming mouse], [pose: three-quarter profile looking left / facing camera], head and shoulders with margin above
the head, natural skin texture, ` + bloque de luz. Una persona por imagen; de perfil o tres cuartos para el
dominante, de frente con el producto para un mediano.

**Producto para `tech-grid`** (`soul`, `--formato 4:3`): 
`E-commerce product photograph of a [producto con forma, materiales y colores de la marca], no logos, no text, blank
keycaps, three-quarter view from above, whole product in frame with generous margin, ` + bloque de luz. Para que
parezca de la misma sesión, cambia solo el producto entre prompts.

**Mascota para `producto-3d-mascota`** (`z-image`, `--formato 1:1`): 
`High-end 3D character render of [la mascota: especie, colores de la marca, rasgos], glossy soft vinyl toy material,
large glossy eyes with two highlights, full body standing in three-quarter view [looking left towards a product /
waving], isolated on a plain flat light grey seamless studio background, soft studio key light from top right, blue rim
light from back left, violet rim light from back right, soft contact shadow, no text, no logo`. Revisa la anatomía
(número de patas y brazos, manos) antes de usarla.

**Producto 3D para `producto-3d-mascota`** (`z-image`): igual que el de tech-grid pero «high-end 3D product render»
con la misma luz azul/violeta de la mascota.

## Qué modelo (Higgsfield, precios aproximados de 10-2026)
- `soul` (≈ 0,004-0,006 $): fotografía realista, personas, ambientes. Por defecto.
- `z-image` (≈ 0,015 $): objetos, paisajes, ilustración, hasta 2K.
- `recraft` (≈ 0,035 $): iconos e ilustración plana vectorial (útil para iconos de ventajas, en PNG 80 px).
- `qwen` (≈ 0,04 $): editar una foto existente (cambiar fondo, quitar objetos).
- `ideogram` (≈ 0,03 $): solo si la imagen DEBE llevar letras (carteles dentro de la escena). Para titulares, HTML.

## Revisión de la imagen (antes de componer)
Abre la imagen y mira con zoom: manos, dedos, caras, letras fantasma, logos inventados, teclados imposibles,
pantallas con interfaz deformada, horizontes torcidos, bordes con patrones repetidos. Si hay pantallas, mejor que
la IA las deje oscuras o borrosas y pongas tú la captura real encima.

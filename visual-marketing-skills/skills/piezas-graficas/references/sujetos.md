# Sujetos: de dónde sale el producto, la persona o la mascota

En los looks con recortes (`tech-grid`, `producto-3d-mascota`, `editorial-recorte`) **el sujeto es la pieza**: con un
sujeto pobre no hay composición que la salve. Decide la vía en este orden y dila en el brief.

## 1. El usuario aporta fotos (lo mejor: es SU producto)
```bash
node <imagen-ia>/scripts/recortar.mjs foto.jpg sujeto.png              # quita el fondo (modelo local)
node <piezas-graficas>/scripts/preparar-recorte.mjs sujeto.png sujeto.webp --max 1800   # halo, recorte, WebP, huella
node <piezas-graficas>/scripts/armonizar.mjs sujeto.webp sujeto-luz.png --look <look>   # luz del look (rim + blancos)
node <piezas-graficas>/scripts/preparar-recorte.mjs sujeto-luz.png sujeto.webp --borde 0  # optimiza el final
node <piezas-graficas>/scripts/ver-recorte.mjs revision/recortes.png sujeto.webp --fondo <color del look>
```
- Fotos sobre fondo liso y con margen recortan mejor; si el recorte come pelo o asas: `recortar.mjs --modelo large`.
- **Varias fotos de sesiones distintas**: armonízalas todas con el mismo `--look` (mismo blanco y misma luz).
- **Letras o logos inventados** en la foto (pasa con fotos de IA): tápalos (`editorial-recorte/scripts/preparar-recortes.mjs`)
  o encuadra para que no salgan. Marcas de terceros: esa foto no vale.

## 2. No hay fotos, pero el producto está en la librería 3D (sin IA, gratis)
`producto-3d-mascota/scripts/escenas/`: `teclado.html`, `raton.html`, `cascos.html`, `producto.html` (torre de PC) y
`mascota.html` (mascota genérica de vinilo). Píntalos con los colores de la marca:
```bash
node <producto-3d-mascota>/scripts/render-3d.mjs <escenas>/teclado.html teclado.png --ancho 1800 --alto 1400 \
  --param cuerpo=1c1f26 --param acento=ff6a13 --param rgb1=ff6a13 --param rgb2=ffb36b --param recorte=3d9bff
node <producto-3d-mascota>/scripts/render-3d.mjs <escenas>/mascota.html mascota.png --ancho 1800 --alto 1800 \
  --param cuerpo=ff7a2a --param panza=ffd9b8 --param azul=4d6cff --param violeta=a95cff
```
Parámetros: `cuerpo` (color del producto; e3e6ea blanco, 1c1f26 negro mate), `acento` (una pieza en el color de la
marca), `rgb1`/`rgb2` (luz RGB), `recorte` (luz de recorte = color del fondo del look), `giro` (radianes). Después,
`preparar-recorte.mjs` y `ver-recorte.mjs`. Di al usuario que es un producto **genérico con sus colores**, no su
modelo exacto.

## 3. No hay fotos ni librería: generar con IA (Higgsfield, de pago)
Solo con `HIGGSFIELD_API_KEY` en el entorno (la del usuario). Cada imagen cuesta céntimos (`soul` ≈ 0,006 $ a 1080p,
`z-image` ≈ 0,015 $), pero **es su dinero**:
- **Pide permiso antes** con el coste total estimado («4 imágenes ≈ 0,04 $»). Si el usuario ya ha fijado un tope
  (`IMAGEN_IA_TOPE_USD`) o te ha dicho «gasta lo que haga falta hasta X», puedes generar sin volver a preguntar
  mientras no pases de ahí. Si no está y no hay tope, no generes: usa la vía 2 o pide fotos.
- `generar.mjs` estima gratis, no pasa del tope, lanza **2 trabajos a la vez como mucho** y apunta el gasto:
  ```bash
  node <imagen-ia>/scripts/generar.mjs "<prompt en inglés>" persona-1.png --modelo soul --formato 3:4          # solo estima
  node <imagen-ia>/scripts/generar.mjs "<prompt en inglés>" persona-1.png --modelo soul --formato 3:4 --si     # lanza
  ```
- **Qué modelo**: personas y fotos de producto → `soul` (`--cantidad 4` para elegir); mascota o producto con
  acabado 3D → `z-image`. Prompts y bloques de estilo en `imagen-ia/references/prompts.md` (sección «Sujetos para los
  looks»): fondo gris liso, sujeto entero con margen, la misma luz en todos, sin texto ni logos.
- Después, igual que una foto (vía 1): recortar → preparar → armonizar → ver. **Revisa cada imagen** (manos, caras,
  orejas, letras inventadas, anatomía de la mascota) y descarta las malas.

## Lo que no se hace nunca
- **Modelar a mano en three.js** (con primitivas, SDF o «marching cubes») un producto o una mascota que no están en
  la librería: sale de juguete y cuesta media hora. Si el producto no está en la librería, la vía es la **IA** (3) o
  las fotos del usuario (1); el render propio es para el **modelo real** del producto (GLB/GLTF del fabricante) o
  para la librería.
- **Dibujar siluetas, figuras planas o productos con cajas** para sustituir a una persona o a un producto: se ve de
  plantilla y hunde la pieza. Si no hay fotos, ni IA, ni librería que valga, **para y pide el material** (o entrega
  con los recortes de ejemplo de la plantilla marcados como PROVISIONAL, diciéndolo claramente).
- Usar los recortes de ejemplo de la plantilla (la torre y Chispa de Cometa, los periféricos y la jugadora de Pulso,
  los jugadores del editorial) como si fueran de la marca del usuario.
- Personas reales sin permiso, famosos, marcas o personajes con derechos.

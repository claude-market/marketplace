# Estilo «editorial recorte» · reglas medidas

Sale de medir campañas editoriales de equipos de esports y marcas de periféricos (presentaciones de jugadores,
fichajes, embajadores): personas recortadas en collage sobre negro, líneas finas de construcción y muy poco texto.
Los valores son para los lienzos de la plantilla (1080-1600 px de ancho); escala con el lienzo.

## Fondo
- **Casi negro** de la marca (`--ed-fondo` = `--noche`) y **un solo degradado radial** hacia una esquina más clara
  (`--ed-luz` = 78 % `--noche` + 22 % `--claro-suave`): `radial-gradient(130% 110% at 100% 100%, luz 0 %, mezcla 34 %,
  transparente 72 %)`. La esquina clara va donde no hay texto (abajo a la derecha en la plantilla).
- La esquina clara no pasa de un gris oscuro (luminosidad ≤ 20 %): es luz de estudio, no un foco. Sin ruido, sin
  texturas, sin manchas de color.

## Jerarquía del collage (3 sujetos; 4 como mucho)
- **Un dominante** arriba y al centro del collage: su cabeza (pelo a barbilla) mide **~50 % del alto** en el hero y
  el banner, **~38 %** en el 1:1, **~35 %** en el 4:5 y **~28 %** en la story.
- **Dos medianos** delante, a los lados y más abajo: su cabeza mide **0,5-0,6 veces la del dominante**. Uno de ellos
  va dentro del marco.
- Variedad de pose: perfil, frente y tres cuartos. Que no miren todos al mismo sitio; el dominante, de perfil o tres
  cuartos, mira hacia el texto o hacia el centro.
- El producto (ratón, casco) se ve entero y por encima del fundido.

## Solapes
- Los medianos tapan **el cuerpo** del dominante (hombro, pecho), **nunca su cara**: entre una cara y otro sujeto,
  ≥ 40 px de aire (a 1x en 1080).
- Orden de capas: construcción → dominante → sujeto del marco → mediano delantero.
- **Un bloque, no tres islas**: en el hero el grupo ocupa **≤ 60 % del ancho** (497-1462 px en 1600) y cada mediano
  solapa **≥ 25 % de su ancho** con el dominante (por el cuerpo). Si entre dos sujetos queda un hueco de fondo más
  ancho que una cabeza, acércalos.
- Ningún sujeto toca el borde del lienzo con un corte duro: o se funde por abajo o queda dentro del marco. Si la foto
  viene cortada por un lado (ropa a sangre), hornea un fundido lateral en el alfa del recorte (≈ 20 % del ancho).

## Fundido inferior
- Máscara vertical con curva suave (1 − smoothstep; la plantilla pone 4 paradas): empieza al **57-64 %** del alto
  del recorte y llega a **0 al 89-97 %**. Un fundido lineal deja un escalón visible donde acaba: no lo uses.
- El fundido acaba **antes del borde del lienzo** y **≥ 24 px por encima del texto** que haya debajo.
- Sujeto del marco: fundido del 58-62 % al 82-92 %, para que llegue a negro en el lado de abajo del marco.

## Líneas de construcción (SVG con `data-fondo` y `aria-hidden`)
- Trazo de **1,5 px a 1x** (`vector-effect: non-scaling-stroke`), del claro de la marca al **62 %**; el arco al
  **56 %** y fundiéndose a 0 desde la mitad de su alto (degradado `arco-…`). El acento, solo en una cruz (2 px).
- **Arco**: semicírculo que abraza el collage por el lado del texto. Radio **~47 % del alto** en el hero
  (425 px en 900), **~44 %** en el banner, **~34 % del ancho** en el 1:1, **~39 %** en el 4:5 y **~45 %** en la
  story. Su diámetro vertical se ve solo por encima de la cabeza del dominante (25-115 px).
- **Marco**: rectángulo de 1,5 px, de ancho **≈ 1,3-1,4 veces la cabeza** del sujeto que encuadra. El sujeto llena
  el ancho del marco (sin huecos a los lados), se recorta por los lados y por abajo y **su cabeza rompe el lado de
  arriba** (sale un 25-30 % de la cabeza).
- **Cruces de registro**: 24 px (brazos de 12) a 1x, **3-4 por pieza**, en el aire, a ≥ 40 px de cualquier sujeto o
  texto y sin formar rejilla. Una, la del acento.
- Las líneas pasan **por detrás** de los sujetos; ninguna cruza una cara ni un texto.

## Aire
- **≥ 40 % del lienzo** sin sujetos ni texto. El collage ocupa ~55-60 % del ancho en el hero y ~70-80 % en 1:1, 4:5
  y story.
- Márgenes: 64 px (96 en el hero y el banner para el texto; 72 abajo en el 4:5), 72 en la story.

## Tipografía
- Titular en `--fuente-display` (si la marca no la trae, `--fuente`), **peso 600**, interletra **−0,038 em**,
  interlineado **0,98**. Nunca 800-900 ni mayúsculas: la fuerza la ponen las fotos.
- Tamaños (titular · apoyo · llamada · antetítulo), pensados para leerse a tamaño de móvil:
  hero **68 · 19 · 17 · 14**; 1:1 **58 · 18 · 17 · 14**; 4:5 **104 · 30 · 28 · 20**; banner **50 · — · 16 · —**;
  story **124 · 36 · 32 · 22**. En 4:5 y story el texto es lo que se lee en el móvil: no bajes de esos tamaños.
- Un titular de 2-4 palabras. Si con otra marca ocupa dos líneas, el bloque crece hacia arriba (va anclado abajo):
  comprueba que sigue a ≥ 24 px del fundido y, si no, sube el collage o acorta el titular.
- Antetítulo en `--mono`, 500, mayúsculas, interletra **0,16 em**, en `--ed-apoyo`.
- Apoyo: peso 420, interlineado 1,42, `--ed-apoyo`, una línea (dos como mucho en el hero; ≤ 60 caracteres).
- Llamada: peso 560 + raya de 2,2 em del mismo trazo que la construcción + la web en `--mono`.

## Dónde va el texto
- **Nunca encima de un recorte** (tampoco de su parte fundida): el exportador lo mira píxel a píxel.
- Poca presencia: firma (logo + nombre), titular, una línea de apoyo y la llamada o la web. Nada más.
- El acento, **en un solo detalle**: una cruz, un punto o una palabra. Si la llamada lleva el acento, la cruz no.

## Composición por formato
- **Hero 1600x900**: collage en el centro-derecha (x 460-1500) dentro del arco; texto en una columna a la izquierda
  (x 96-540): firma arriba, bloque en el centro y llamada abajo.
- **1:1 1080x1080**: collage centrado arriba (hasta y ≈ 840); firma y antetítulo arriba en las esquinas; titular,
  apoyo y web abajo, debajo del fundido.
- **4:5 1080x1350**: firma y antetítulo arriba en las esquinas; collage grande en y 140-960; titular, apoyo y
  llamada abajo, en un bloque anclado a 72 px del borde.
- **Banner de X 1500x500**: la foto de perfil tapa abajo a la izquierda (~400x200) y el móvil recorta ~60 px
  arriba y abajo. Collage a la derecha (x 820-1500) con el dominante a ≥ 60 px del borde de arriba; texto a la
  izquierda entre y = 84 y 290.
- **Story 1080x1920**: 250 px arriba y 340 abajo sin texto. El collage puede entrar en la franja de arriba (solo es
  imagen: cabeza del dominante en y ≥ 170) y se funde antes de y ≈ 1100; todo el texto (firma, antetítulo, titular,
  apoyo, llamada) en un bloque anclado a 340 px del borde de abajo.

## Recortes
- WebP con alfa (`canvas.toDataURL('image/webp', .9)`), ≤ 500 KB, recortados al contenido, al tamaño máximo que se
  use a 2x (sin ampliar: ancho intrínseco ≥ 2 veces el ancho en la pieza).
- **Sin halo**: estrecha el alfa del borde (0,3 → 0,95) y oscurece lo semitransparente; borra los mechones con resto
  de fondo gris. Míralo con zoom sobre negro.
- **Orejas, pendientes y mechones sueltos** son donde el quitafondos deja restos: una oreja «fantasma»
  semitransparente, motas claras o grises y pelos sueltos con el gris del estudio. Regla: mirado al 400 % sobre el
  fondo del look, **ningún píxel con alfa < 0,85 a más de 2 px del contorno** ni ningún resto frío o gris (B ≥ R)
  pegado a la piel o al pelo. Si los hay, en `preparar-recortes.mjs`: `contorno` (de fuera hacia dentro hasta el
  primer píxel de piel o pelo, contorno suavizado con mediana de 13 filas y pluma de 1,5 px) y `limpiar` (apertura de
  2 px e islas < 400 px fuera) en esa zona; el color del borde sale del interior (radio 4 px). Mejor perder la oreja
  con un contorno limpio que dejar una oreja fantasma: a tamaño de pieza nadie echa de menos la oreja, el halo sí se ve.
- Un `borrar` grande sobre la oreja deja el borde a dientes: después de `borrar`, pasa siempre `contorno` o `limpiar`.
- **Sin logos ni textos inventados** (cascos, ratones, camisetas): tápalos rellenando desde el borde (o clonando la
  tela de al lado) y mira el resultado con zoom. Si no queda limpio, que quede fuera con el fundido o el marco.

## Qué evitar (lo que delata una plantilla barata)
- Sombras, brillos, glow, contornos blancos alrededor de las personas, desenfoques de fondo, neón.
- Todos los sujetos del mismo tamaño o en fila; caras tapadas; cortes duros contra el borde.
- Líneas gruesas, de color o en rejilla; más de un arco; cruces amontonadas.
- Texto grande o en mayúsculas pesadas, texto encima de las fotos, el acento repetido.
- Halos grises en el pelo, logos inventados a la vista, fondos de estudio sin quitar.

## Lista de revisión de este estilo (además de la general)
- [ ] La jerarquía se lee en 1 segundo: un dominante y dos medianos claramente más pequeños.
- [ ] Ninguna cara tapada; los solapes son de cuerpos y parecen a propósito.
- [ ] Bordes limpios a 2x (zoom al pelo): sin halo gris ni escalones; logos tapados de verdad.
- [ ] Los sujetos se funden con el negro sin escalón y antes del texto.
- [ ] Las líneas son finas, pasan por detrás y no compiten con las caras; el sujeto del marco rompe el lado de arriba.
- [ ] El texto está en el aire, respeta las zonas seguras del formato y el acento sale una sola vez.

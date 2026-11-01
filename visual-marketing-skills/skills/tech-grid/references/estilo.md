# Estilo «tech-grid» · reglas medidas

Sale de medir campañas de catálogo de periféricos y hardware (las de «semana de ofertas» de las grandes marcas de
gaming): fondo casi negro con cuadrícula, productos en marcos finos unidos como en una placa base y un titular ancho
en mayúsculas. Los valores son para un lienzo de 1080-1600 px; escala con el lienzo.

## Fondo
- **Negro-azulado** (`--noche`) liso hasta el **42 %** de la altura; desde ahí, degradado vertical hasta
  `--tg-fondo-azul` abajo (acento al 46 % sobre la noche), con una parada intermedia al 74 %.
- El azul de abajo **nunca es el acento puro**: competiría con el titular. Sin manchas radiales, sin ruido, sin viñeta.
- `background-color: var(--noche)` en la propia pieza (por si el degradado no carga).

## Cuadrícula
- Líneas de **1 px** del color `--tg-rejilla` (acento al 45 % con `--claro`) al **11 % de opacidad** (8-12 %).
- **Celdas cuadradas**: ≈ 8 % del ancho en apaisado (128 px en 1600, 125 en 1500) y 10 % en cuadrado y vertical
  (108 px en 1080). Un `<pattern>` SVG con `vector-effect: non-scaling-stroke`; la línea en el medio píxel (`.5`).
- La cuadrícula no se alinea a la fuerza con los marcos: es textura, no maqueta. Se tiene que ver a 1 m y desaparecer
  a 3 m.

## Marcos
- Rectángulos **sin radio**, borde de **2 px** (`--trazo`; 2,5 px en la story) del acento o del acento-2 (`.t2`).
  Alterna colores entre marcos vecinos: en 4 marcos, 2 y 2.
- Relleno degradado vertical: `--tg-marco-arriba` (noche + 7 % de acento) → `--tg-marco-abajo` (noche + 62 % de
  acento). Oscuro arriba, azul abajo: el producto blanco se recorta solo.
- Tamaños: el marco más grande ≈ 30-40 % del ancho del lienzo; el más pequeño ≈ 15 %. Proporciones distintas
  (uno vertical, uno apaisado, uno casi cuadrado): nunca cuatro iguales.
- **El producto rompe el marco** por 1-2 lados, entre el **15 y el 35 %** del lado del marco (cascos 78 px por
  arriba en un marco de 240; ratón 52 px por arriba y 48 por la izquierda en uno de 250x330). Si rompe 2 lados, que
  sea por **una esquina** y con la **punta** del producto (la nariz del ratón, la diadema, el extremo del teclado);
  el resto, dentro y con aire (≥ 10 px hasta los otros bordes).
- **Persona**: cortada por el **borde de abajo** del marco (`.corte`: el contenedor llega al borde interior y
  recorta los lados); la cabeza sale 60-80 px por arriba. Corta por encima de logos o escudos de la ropa.
- Sombra de contacto opcional (`.contacto`): elipse `radial-gradient` de la noche al 70 % → transparente, debajo
  del producto y dentro del marco. Nada de `box-shadow` ni `filter`.

## Productos (recortes)
- **Detalle mínimo**: a tamaño real, cada producto enseña **≥ 4 detalles** que se leen: juntas o ranuras oscuras de
  1-1,5 px con su bisel, mandos con su forma (rueda con banda estriada, botones con su junta y su canto, teclas con
  leyenda tenue y escalón), una textura (rombos en relieve, moleteado, polipiel con costura) y la luz RGB. Un
  producto liso «de pastilla» delata la plantilla.
- **La misma sesión de fotos**: los mismos blanco (≈ `#e3e6ea`), luz y cámara para todos. Llave cálida **arriba a
  la izquierda** del encuadre, recorte azul (el del fondo) **detrás a la derecha** y un relleno frío suave; la luz se
  fija respecto a la cámara, no al objeto, para que coincida aunque cada producto gire distinto. Entorno bajo: los
  costados tienen que caer a gris medio, no quedarse blancos.
- **Ángulo**: tres cuartos desde arriba. El ratón, con la punta arriba a la izquierda (20-30° sobre la vertical) y
  enseñando el costado del pulgar; el teclado, en diagonal descendente hacia la derecha.
- **RGB**: azul → violeta, difusa (luz dentro de plástico lechoso), solo en el producto y en **≤ 15 %** de su
  superficie visible: tira lateral del ratón, luz entre teclas, aro fino en los cascos. Nunca un brillo fuera del
  producto.
- **Sombra de contacto** (`.contacto`): elipse del **70-75 %** del ancho visible del producto y alto ≈ 22 % de ese
  ancho, pegada a su base y desplazada abajo a la derecha (contraria a la llave).
- **Sin halo**: render con fondo transparente (nada que quitar) y borde limpio a 200 % sobre el azul del marco.

## Pistas de circuito
- Mismo grosor que el borde de los marcos (`--trazo`), del color del marco del que salen.
- **Solo horizontales y verticales**, con **0-2 giros** en ángulo recto y esquina viva (`miter`), sin curvas ni
  diagonales.
- Cada pista **sale del borde de un marco** y **acaba en otro marco o fuera del lienzo**. Nunca en el vacío.
- 4-6 pistas en el hero, 4-5 en el resto. Al menos una une dos marcos y al menos una sale del lienzo.
- A **≥ 20 px** de cualquier producto y de cualquier texto; nunca pasan por detrás del bloque del titular.

## Nodos
- Cuadrado de **14 px** en 1600 y en la story, **12 px** en 1080 y 1500 (≈ 0,9 % del ancho), del color de su pista,
  con una **cruz** del color del fondo (grosor 0,9 × trazo) que lo parte en cuatro ventanitas.
- **Centrado exactamente sobre el borde del marco** donde llega la pista: el centro del nodo en la línea del borde y
  en el eje de la pista. Un nodo en cada unión pista-marco; ninguno suelto.
- Van en una capa encima de los marcos y de los recortes: un producto nunca tapa un nodo.

## Arco
- Circunferencia del acento, del mismo grosor que las pistas, en **dos tramos opuestos de 98°**: arriba a la derecha
  (de −120° a −22°) y abajo a la izquierda (de 60° a 158°). En la plantilla, dos `path` en un `viewBox` de 100.
- **Diámetro ≈ 1,2-1,35 veces** la línea más larga del titular; centrado en el bloque logo + titular. Puede rozar
  el borde del lienzo (en la story ocupa casi todo el ancho), nunca cortarse.
- Los tramos **acaban antes de llegar al texto**: ≥ 30 px entre el final de un tramo y la esquina del titular. El
  arco nunca cruza letras.

## Tipografía
- **Titular**: grotesca ancha (`--fuente-display`, `font-stretch: 125%`), peso **760**, **MAYÚSCULAS**, **2 líneas**
  de ≤ 7 letras, interlineado **0,9**, interletra **−0,012 em**, en el acento. Es la excepción medida a la regla
  general de no usar mayúsculas: solo aquí.
- Tamaños del titular: **72 px** en el hero, **88** en 1:1, **116** en 4:5, **56** en el banner y **160** en la story
  (en vertical, la línea larga ocupa el 60-95 % del ancho útil: a tamaño de móvil tiene que leerse sin zoom). Si la
  fuente de la marca no tiene eje de anchura, se queda normal y cabe igual.
- **Firma** (logo + nombre) encima: 0,42-0,45 veces el titular, peso 650, anchura 112 %, en `--claro`; el logo, en
  el acento.
- **Apoyo**: 0,3-0,45 veces el titular (≥ 40 px en la story; web ≥ 32 px), peso 600, anchura 110 %, en `--claro`; la cifra en `<b>` con el acento-2.
  **Fechas** en `--claro-suave` (450). **Web** en mono 500, con un cuadradito del acento-2 delante (eco del nodo).
- Cifras con su unidad separada por un espacio fino o duro: «−40 %», nunca «-40%».

## Composición por formato
- **Hero (1600x900)**: 4 marcos en los dos tercios de la izquierda, a dos alturas y desplazados (asimétricos), unidos
  por pistas; bloque logo + titular con su arco en el tercio derecho, a media altura; apoyo debajo del arco.
- **1:1 (1080x1080) y 4:5 (1080x1350)**: titular grande con su arco arriba; el apoyo, alineado a la derecha con el
  titular, en el cuarto de abajo a la derecha del círculo (el que el arco deja libre); 2-3 marcos en la parte de abajo,
  el más grande a la izquierda.
- **Banner de X (1500x500)**: la foto de perfil tapa ~400x200 abajo a la izquierda y el móvil recorta ~60 px arriba
  y abajo. Titular con arco a la izquierda **por encima** de la foto, apoyo en el centro, marcos a la derecha. Nada
  de texto en esas zonas (el arco y las pistas sí pueden entrar).
- **Story (1080x1920)**: 250 px arriba y 340 abajo sin texto. Titular a 160 px con un arco grande (casi todo el
  ancho) en la mitad de arriba, apoyo abajo a la derecha dentro del círculo y 3 marcos en la mitad de abajo (pueden
  entrar en la zona de abajo: no llevan texto).
- Márgenes: 64 px (60 en el banner, 72 en la story) para todo el texto.

## Qué evitar (lo que delata una plantilla barata)
- Glow, neón, `text-shadow`, sombras de color, desenfoques, bordes con brillo.
- Pistas en diagonal, con curvas, que acaban en el vacío o que pasan por detrás de un producto.
- Productos flotando sin marco o metidos enteros dentro del marco (sin romperlo); productos que se tocan entre sí.
- Productos de juguete: formas lisas sin juntas, sin mandos ni textura; cada producto con su luz o su blanco.
- Cuatro marcos iguales en fila; marcos con esquinas redondeadas; más de dos colores de trazo.
- Titular en más de 2 líneas, en minúsculas o en una fuente estrecha forzada; mayúsculas en el resto del texto.
- Recortes con halo claro alrededor del pelo o con logos de otras marcas.

## Lista de revisión de este estilo (además de la general)
- [ ] La cuadrícula se ve, pero no compite; el fondo pasa de negro a azul abajo sin bandas.
- [ ] Cada producto rompe su marco por 1-2 lados, con intención; ninguno toca otro producto ni un texto.
- [ ] Cada producto enseña sus detalles a tamaño real (juntas, mandos, textura, RGB) y todos comparten luz, blanco y
      sombra de contacto.
- [ ] Todas las pistas son ortogonales y unen marco con marco o marco con el borde; un nodo en cada unión, centrado
      en el borde.
- [ ] El arco abraza el bloque logo + titular sin cruzar ninguna letra.
- [ ] Titular en 2 líneas, ancho y en mayúsculas, sin viudas; el resto del texto en caja normal.
- [ ] Zonas seguras del formato libres de texto (banner: foto de perfil y recorte del móvil; story: 250/340 px).
- [ ] Con otra marca cambian color, fuentes, nombre y logo, y nada se rompe.

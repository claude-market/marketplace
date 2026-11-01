# Estilo «producto en contexto» · reglas medidas

Sale de medir con Chrome y píxel a píxel las imágenes de producto de las grandes apps de productividad y
privacidad (correos y webs de Proton, Linear, Stripe, Vercel). Los valores son para un lienzo de ~1080-1600 px;
escala con el lienzo.

## Capas y profundidad
- **Tres planos**: fondo degradado → ventana de la app recortada → 1-2 capas flotantes. Nunca más de dos capas.
- La capa flotante se separa **por luminosidad**, no por brillo: en oscuro, **algo más oscura** que lo que tapa
  (`--noche` sobre `--noche-2`); en claro, blanca sobre papel.
- La capa destacada va **~1,1-1,2 veces más grande** que la interfaz (como si estuviera más cerca).

## Radios
- **El mismo radio en ventana, modal y fila destacada**: ≈ 1,7 % del ancho del lienzo (`--radio-escena`: 10 px
  en 600, 18-20 px en 1080, 26 px en 1600).
- Botones y campos ≈ 8 px (`.5em`); chips y pastillas, redondos (999 px).

## Sombras
- **Una sola sombra grande, oscura y suave** + un anillo de 1 px: `0 1.4em 2.8em -.5em` al 45-50 % de un tono
  oscuro del fondo (`--sombra`), más una corta `0 .12em .3em` al 20 %. En claro, opacidades .08-.12.
- Nunca sombras de color vivo ni claras (eso es un brillo: el exportador lo avisa).

## Bordes
- **~1 px** (en em: `max(1px, .075em)`), degradado **vertical**: claro y cálido arriba (`--escena-3` aclarado) →
  color de la escena abajo (`--escena-1`). Es lo que «ilumina» la capa sin glow.
- La ventana base, sin borde claro: un 8 % de blanco como mucho.
- Ni bordes de más de 1,5 px ni bordes laterales de color.

## Fondos
- **Degradado lineal a 200°** de 4 paradas: acento saturado arriba a la derecha → mezcla → tono medio → tono claro,
  cálido y poco saturado abajo a la izquierda (violeta → melocotón en la referencia). Liso, sin ruido ni texturas.
- `.malla`: lo mismo con dos manchas radiales grandes (más movimiento). `.clara`: papel con tintes al 40-55 %.
  `.noche`: oscuro con una bruma del acento al 15-30 % (grande y sin borde: no es un brillo).
- Si la marca no trae `escena-1/2/3`, se derivan de su acento. Si el acento es muy chillón, define
  `escena-1` un punto más oscuro en `marca.json`.

## Atenuar el contexto
- **Se atenúa, no se desenfoca**: lo que no es la función baja al ~50 % (`.atenuado` en la lista o la zona
  principal), y los botones de fondo van teñidos al ~10 % con el texto a media luz (`.ui-accion`).
- La lateral puede quedar a plena luz (orienta), pero nunca compitiendo con la capa.
- **La ventana no se queda vacía**: el contexto atenuado sigue hasta el borde del lienzo (en el hero, ≥ 2 filas por
  debajo de la capa destacada, con su importe y su estado a la derecha). Un hueco liso dentro de la ventana de más
  del 15 % del lienzo delata la maqueta; la referencia llena hasta abajo.

## Tipografía
- Interfaz a ~1,5 % del ancho del lienzo (16 px en 1072; 20-21 px en 1080; 9,5-10 px en una cabecera de 600).
  Título del modal ≈ 1,2 veces y en 650.
- Titulares de la pieza (si los hay): **peso medio (600)**, interletra −0,04 em, interlineado ~1. Nunca 800-900.
- Cifras tabulares; importes con su unidad separada (`1.250,00 €`).

## Iconos
- De línea, 20-24 px en 1080 (1,2 em), trazo 1,6, puntas redondas, del mismo gris que el texto secundario. Solo el
  icono activo o el del título del modal lleva el acento. Los de `producto.js` ya cumplen esto.

## Composición
- Ventana al **~11 % del ancho y ~14 % del alto**, sangrando por la derecha y por abajo. El producto ocupa ~80 %
  del lienzo; el aire queda en una esquina (o arriba, para el titular).
- Modal arriba a la derecha, sangrando por la derecha, con su borde inferior **entre dos filas** (no corta texto).
- Fila destacada saliendo **~2 em por la izquierda** de la ventana, encima de su fila (`data-sobre`), y con la
  lateral vacía a esa altura.
- Con titular: titular arriba a la izquierda en el aire del degradado, el producto debajo; nada de texto encima de
  la ventana.

## Qué evitar (lo que delata una plantilla barata)
- Glow, neón, `text-shadow`, sombras de color, bordes gruesos o laterales, cristal esmerilado.
- Degradados dentro de la interfaz (las superficies de la app son sólidas).
- Más de dos capas, textos medio tapados, capas que no se corresponden con nada de la ventana.
- Desenfocar el contexto o bajar tanto su opacidad que parezca un error.
- Datos incoherentes entre capas (la fila destacada dice 1.250 € y la lista 1.200 €).

## Lista de revisión de este estilo (además de la general)
- [ ] La función se entiende en 1 segundo mirando solo las capas.
- [ ] Ninguna capa tapa a medias un texto de la ventana; el modal acaba entre filas.
- [ ] Mismo radio en ventana y capas; borde de ~1 px que no brilla; sombra oscura y suave.
- [ ] El contexto está atenuado pero se reconoce como la app.
- [ ] El degradado no tiene bandas visibles ni compite con el producto.
- [ ] El texto libre no toca ninguna capa y respeta las zonas seguras del formato.

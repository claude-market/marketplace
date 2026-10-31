# Estilo «oscuro-glow» · reglas medidas

Sale de medir píxel a píxel piezas de campaña de apps de trading y fintech (ofertas, referidos, cifras de
lanzamiento) y de rehacerlas en HTML con Chrome. Los valores son para lienzos de 1080-1600 px; escala con el lienzo.
Los porcentajes de luz y posición son del lienzo.

## Capas y profundidad
- **Cuatro planos**: fondo degradado + luz → velas (data-fondo) → portátil del producto (data-fondo) → tarjetas y
  texto. Nada más.
- Las tarjetas se separan **por luminosidad y por el borde**: relleno algo más oscuro que lo que tapan (`--tarjeta`,
  L ≈ 0,14-0,19) y un borde fino que se ilumina arriba. El halo solo las «despega».
- El portátil queda **detrás y debajo** de las tarjetas: las tarjetas le tapan la mitad de arriba de la pantalla;
  asoman su parte baja, la base y la pantalla en el hueco entre tarjetas.

## Radios
- **Tarjetas: ≈ 1,5-2 % del ancho del lienzo** (`--og-radio`): 28 px en 1600, 22 px en el 1:1 y el banner,
  24 px en el 4:5 y la story (tarjetas más grandes).
- El mismo radio en las dos tarjetas. CTA en píldora (999 px). Pantalla del portátil ≈ 2,5 % de su ancho.

## Bordes
- **1,5 px** (`--og-borde`), degradado **vertical**: `--glow-claro` arriba → `--glow` al 75 % a media altura →
  `--glow-claro` al 70 % abajo. Es la línea luminosa de la tarjeta; nunca más de 2 px ni bordes laterales de color.
- Ni la CTA ni el titular llevan borde.

## Resplandor (cuánto y dónde)
- **Halo de las tarjetas**: `box-shadow: 0 0 var(--halo) calc(var(--halo) * -.12)` de `--glow` al **50 %** de alfa
  (tope 0,6). Desenfoque (`--halo`) entre el **3,5 y el 5,5 % del lado corto** (tope 8 %): 40 px en 1600x900,
  38-40 px en 1080, 26 px en el banner de 500 de alto, 44 px en la story.
- **3 elementos con halo como mucho** por pieza; lo normal, las 2 tarjetas. La CTA es plana.
- **Nada de `text-shadow`** ni de halos sobre texto.
- **La luz grande es parte del fondo**: `radial-gradient` de `--glow` al 64 % en el centro → 28 % al 40 % del radio
  → transparente al 72 %, de **40-80 % x 30-80 %** del lienzo, centrada **detrás de las tarjetas y el portátil**
  (hero: 73 % / 62 %). Una segunda luz, fría y baja, entra por el borde izquierdo (`--fondo-3` al 70 %).
- **Desenfoque solo en capas `data-fondo`**: velas 2-3 px, portátil 4-6 px. Lo que se lee, nítido siempre.

## Sombras
- Una sola sombra oscura bajo cada tarjeta: `0 1.6em 2.8em -.8em` de un azul casi negro al 75 %. Nunca clara ni de
  color (la luz ya la pone el halo).

## Fondo
- **Degradado lineal a 128°**: `--fondo-1` (L 0,13, casi negro) de 0 a 20 % → `--fondo-2` (L 0,23) al 56 % →
  `--fondo-3` (L 0,40, azul vivo) al 100 %. Oscuro arriba a la izquierda, vivo abajo a la derecha.
- `background-color: var(--fondo-2)` en la `<section>`: es el color con el que el exportador mide el contraste.
- **Velas**: SVG con semilla fija, opacidad **15-26 %** (tope 30 %), como un gráfico de verdad: paso de **15 px**
  (`data-paso`), cuerpo al 56 % del paso, mecha de 1,6 px, **volumen** abajo (≤ 13 % del alto de la capa, al 45 %),
  rejilla horizontal (6 líneas, al 35 %) y vertical cada 8 velas (al 16 %), **dos medias** (rápida de 7 velas,
  continua; lenta de 21, discontinua 6/5), **eje de precios** en pastillas sin texto al 76 % del ancho y la línea
  del último precio con su pastilla más clara. Máscara que las funde por los lados. Una franja arriba (detrás del
  titular, la más tenue), otra abajo y, en el hero, una tercera estrecha en el borde derecho (x ≥ 85 %, al 26 %):
  es la que da la densidad de la referencia.
- **Portátil**: maqueta SVG del panel sin texto, opacidad 90 %, desenfocado 4-6 px: barra con 5 pestañas (una
  activa en píldora del glow), lateral, gráfico de área con su rejilla y el punto del último precio, lista de
  mercados y **fila de 6 indicadores** (icono cuadrado del glow al 70 %, dos líneas tenues, cifra y minigráfico).
  La pantalla lleva su **brillo** (radial del glow al 34 % arriba) y una **barbilla** oscura de 18/610 de alto. La
  base es **aluminio**: degradado horizontal claro-suave → claro (reflejos al 22 % y al 78 %) → claro-suave en el
  centro, filo claro arriba, muesca oscura centrada (14 % del ancho) y una sombra elíptica debajo. Lo que asoma
  bajo las tarjetas (indicadores y base) es lo que más se ve: nunca bloques blancos lisos (≤ 42 % de claro).
  Ancho ≈ 39 % del lienzo en el hero, 54 % en el 1:1, 61 % en el 4:5 y 74 % en la story; la pantalla empieza bajo
  el borde de arriba de las tarjetas y la base acaba antes del texto que viene debajo.
- Liso: sin ruido, texturas, rayos ni destellos.

## Tipografía
- **Titular**: `--fuente-display` (si no, `--fuente`), **700, MAYÚSCULAS**, interletra **−0,04 em**, interlineado
  **0,94**. Degradado plateado vertical **por línea** (`background-size: 100% 1lh`): `--metal-1` hasta el 34 % →
  `--metal-2` al 88 %. Corte en 2 líneas equilibradas («OPERA SIN / COMISIONES»).
- Tamaños del titular: **hero 92 px** (la línea larga ≈ 34 % del ancho), **1:1 112 px** (≈ 60 %), **4:5 128 px**
  (≈ 70 %), **banner 62 px** (≈ 25 %), **story 150 px** (≈ 83 %, con margen lateral de 80 px).
- **Subtítulo**: 300, −0,025 em, interlineado 1,15, a **0,3-0,4 veces el titular**, pegado debajo (12-16 px).
- **Apoyo**: dos líneas, la primera en 400 y la segunda en **700**, −0,02 em, interlineado 1,2, a 0,27-0,33 veces
  el titular.
- **Cifras**: `--fuente-display`, 700, −0,05 em, **proporcionales** (no tabulares: el «1» tabular abre huecos), a
  **4,4 em** de la tarjeta (97 px en el hero); con `--cifra`, 4,8 em en el 1:1 (106 px) y 5 em en el 4:5 (150 px)
  y en la story (170 px). La cifra no pasa del 80 % del ancho interior de la tarjeta. La unidad (`%`, `+`) al 56 %
  y en `--glow-claro`; el `+` sube al centro óptico (`.og-unidad.antes`).
- **Pie de tarjeta**: 400, −0,02 em, interlineado 1,16, a 1,3 em (≈ 29 px en el hero); con `--pie`, 31 px en el
  1:1, 32 px en el 4:5 y 38 px en la story. 2 líneas de ≤ 4 palabras; nunca menos de 28 px en 1080 de ancho.
- **CTA**: 400, píldora `--claro` con texto `--noche`, relleno 0,5 em x 2,1 em, a ≈ 0,26-0,28 veces el titular
  (34 px en el 4:5, 42 px en la story).
- **Web**: 700, −0,03 em, debajo de la CTA a 20 px; «En marca.com».
- Cifras de las tarjetas proporcionales; las demás, tabulares. Letra mínima: la del exportador (2 % del lado
  corto; 18 px en el banner, 28 px en la story).

## Composición por formato
- **Hero 1600x900**: logo centrado arriba (y = 72). Columna de texto **centrada en su eje** a x ≈ 28 %: titular,
  subtítulo, apoyo, CTA y web (y ≈ 240-750). Tarjetas a la derecha: **290x262**, hueco 54 px, x 53-93 %,
  y 30-59 % (más altas que el centro de la columna). Portátil centrado bajo ellas, base en y ≈ 76 %.
- **1:1 1080x1080**: logo arriba centrado (y = 92), titular centrado (y = 150), subtítulo, tarjetas lado a lado
  **344x286** con hueco 52 px (y = 468), portátil detrás asomando la base, CTA y web abajo (y = 846-960). Sin
  apoyo: no cabe con aire.
- **4:5 1080x1350**: como el 1:1 pero llenando el alto: logo (y = 92), titular a 128 px (y = 146), subtítulo,
  tarjetas **432x350** a todo el ancho útil con hueco 40 px (y = 530), portátil detrás, apoyo de dos líneas
  (y = 976), CTA y web (hasta y ≈ 1215).
- **Banner de X 1500x500**: el móvil recorta ~60 px arriba y abajo y la foto de perfil tapa abajo a la izquierda
  (≈ 400x200). Todo el texto entre y = 64 e y = 436 y nada de texto en x < 400 por debajo de y = 300: columna
  centrada en x = 580 (logo encima, en el mismo eje), tarjetas **226x214** a la derecha (x 930-1412).
- **Story 1080x1920**: 250 px arriba y 340 abajo libres de texto, y todo lo demás lleno. Logo (y = 286), titular
  a 150 px (y = 346), subtítulo, tarjetas lado a lado **424x384** a todo el ancho útil (y = 780), portátil de
  800 px detrás, apoyo, CTA de 42 px y web (hasta y ≈ 1570).
- En todos: margen de seguridad del formato (64-80 px) y ≥ 24 px de aire entre bloques (tarjetas, CTA).

## Qué evitar (lo que lo convierte en neón barato)
- Halos de más de 0,6 de alfa o de más del 8 % del lado corto, halos en la CTA o en el texto, `text-shadow`.
- Más de 3 elementos con halo, más de dos tarjetas, tarjetas con párrafos o con iconos de colores.
- Desenfocar algo que se lee; texto legible dentro del portátil o del gráfico; texto dentro de imágenes.
- Velas por encima del 30 % de opacidad (compiten con el titular) o con colores de verde y rojo saturados.
- Titular en pesos finos o en 800-900, con interletra positiva o de color plano saturado; titulares de más de
  3-4 palabras.
- Degradados de arcoíris, destellos de lente, partículas, rejillas en perspectiva (eso es otro look).
- Prometer rentabilidad («gana un 20 %») o cifras que la marca no puede demostrar.

## Lista de revisión de este look (además de la general)
- [ ] En 1 segundo se lee titular → tarjetas → CTA, en ese orden.
- [ ] El halo se nota en el borde de las tarjetas, pero no «brilla»: sin aura que se coma el fondo.
- [ ] La luz grande cae detrás de las tarjetas y el portátil; arriba a la izquierda queda casi negro.
- [ ] Velas y portátil se reconocen como gráfico y como portátil, pero no se lee nada en ellos.
- [ ] El titular plateado tiene el mismo brillo en las dos líneas y su tono más oscuro da ≥ 4,5:1.
- [ ] Mismo radio en las dos tarjetas; cifras centradas y del mismo tamaño en las dos.
- [ ] Nada de texto en las zonas que tapan las redes (perfil del banner, barras de la story).
- [ ] En la `hoja.png` (móvil) se leen las cifras, el pie de las tarjetas y la CTA; los verticales llenan el
      lienzo sin huecos muertos.
- [ ] Con otra marca cambian luz, fondo, fuente, nombre y logo sin romper nada.

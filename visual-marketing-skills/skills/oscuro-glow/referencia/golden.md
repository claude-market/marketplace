# Golden · oscuro glow

`golden.jpg` es el hero de la demo (Vértice, app de inversión ficticia) pulido al lado de su referencia de estilo
(las campañas de exchanges y apps de trading en azul noche). Compárala en cada vuelta:
`piezas-graficas/scripts/comparar.mjs --look oscuro-glow`.

## Qué imitar (medido en la golden)
1. **Tres bloques que se leen en 1 s**: titular plateado en MAYÚSCULAS (2 líneas, bold 700, −0,04 em, ~9 % del alto
   por línea) → dos tarjetas con una cifra enorme cada una → CTA en píldora clara y la web debajo.
2. **Profundidad sin neón**: una luz grande (radial) detrás de las tarjetas; un portátil con su panel y un gráfico de
   velas con volumen, medias y eje, desenfocados (blur) y tenues, que llenan el fondo sin leerse.
3. **Tarjetas**: casi negras, radio ~16 % de su lado, borde de 1-1,5 px claro arriba que se apaga abajo y un halo
   contenido (alfa ≤ 0,6, desenfoque ≤ 8 % del lado corto). La cifra a ~45 % del alto de la tarjeta, la unidad (%, +)
   más pequeña y en el acento claro; el pie en 2 líneas de ≤ 4 palabras.
4. **Columna de texto centrada a la izquierda** (x 10-46 %): subtítulo en peso 300, apoyo de 2 líneas con la segunda
   en negrita, CTA de 2-3 palabras.
5. **Logo centrado arriba**, pequeño, en blanco.

## Qué separa una pieza amateur de esta
- Glow por todas partes (texto con resplandor, CTA brillante, más de 3 halos) o neón saturado.
- Fondo plano sin nada detrás, o un gráfico nítido que compite con las cifras.
- Tres o más tarjetas, tarjetas con frases en vez de cifras, cifras sin unidad separada.
- Titular en minúsculas o en peso 900; el plateado sin contraste con el fondo.
- Restos del ejemplo (Vértice, «Opera sin comisiones», sus cifras).

## Lista de comprobación
- [ ] Jerarquía: titular → tarjetas → CTA en 1 s; las cifras se leen a tamaño de móvil (1-10).
- [ ] Profundidad: luz grande detrás, velas y portátil desenfocados que llenan sin competir (1-10).
- [ ] Tarjetas: dos, con cifra grande, unidad en acento y pie corto; halo contenido (1-10).
- [ ] Tipografía: titular plateado en mayúsculas, 2 líneas; subtítulo 300; fuente de la marca cargada (1-10).
- [ ] Credibilidad: las cifras son las del brief y el panel del portátil parece de su producto (1-10).
- [ ] Color: azul noche derivado de la marca, el acento solo en unidades y detalles (1-10).
- [ ] Sin errores: exportador limpio (halos medidos), nada del ejemplo, sin text-shadow (1-10).

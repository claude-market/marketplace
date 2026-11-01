# Golden · producto en contexto

`golden.jpg` es el hero de la demo (Pliego, facturación ficticia) pulido al lado de su referencia de estilo (las
imágenes de producto de las apps de privacidad y productividad: la app real sobre un degradado, con 1-2 capas).
Compárala en cada vuelta: `piezas-graficas/scripts/comparar.mjs --look producto-en-contexto`.

## Qué imitar (medido en la golden)
1. **La app de verdad, no una ilustración**: ventana oscura a sangre por la derecha y por abajo, con lateral (logo,
   6 secciones con iconos de línea, una activa con contador), buscador con atajo, título de sección, pestañas y una
   lista de 6-7 filas con avatar de iniciales, nombre, referencia y fecha, importe y estado.
2. **Una función contada con 2 capas**: el modal que la activa (arriba a la derecha, sangrando; campos reales,
   interruptor, botón primario en el acento) y el resultado (la fila destacada que sale ~2 em por la izquierda de la
   ventana, encima de su fila oculta).
3. **Profundidad contenida**: capas con borde de ~1 px degradado (claro arriba) y sombra oscura larga y suave; el
   contexto atenuado (no desenfocado) hasta el borde: ningún hueco vacío en la ventana.
4. **Datos verosímiles y coherentes** entre capas (mismos nombres, cifras con su formato, estados).
5. **Degradado de fondo suave** derivado del acento; nada de texto de marketing dentro de la interfaz.

## Qué separa una pieza amateur de esta
- Ventana vacía o con 3 filas y mucho hueco; lateral sin iconos; textos de relleno («Lorem», «Elemento 1»).
- Capas que tapan a medias un texto; tres o más capas; capas sin borde ni sombra (planas) o con glow.
- Capturas pegadas borrosas, iconos de colores, emojis.
- Datos incoherentes (la fila destacada no está en la lista, cifras sin formato).
- Restos del ejemplo (Pliego, Estudio Marea, «Recordatorios automáticos» si la función es otra).

## Lista de comprobación
- [ ] Jerarquía: el foco (modal y fila destacada) se ve en 1 s; el resto acompaña atenuado (1-10).
- [ ] Credibilidad de la interfaz: parece SU app (secciones, datos y textos de su producto) y está llena (1-10).
- [ ] Función: una sola, contada con acción + resultado, datos coherentes entre capas (1-10).
- [ ] Profundidad: borde de 1 px degradado y sombra oscura suave; nada medio tapado (1-10).
- [ ] Tipografía y color: fuente de la marca cargada, acento solo en lo activo y el botón primario (1-10).
- [ ] Composición: ventana a ~11 % del ancho y ~14 % del alto, sangrando; modal y fila sangrando con intención (1-10).
- [ ] Sin errores: exportador limpio, nada del ejemplo, sin glow ni desenfoque (1-10).

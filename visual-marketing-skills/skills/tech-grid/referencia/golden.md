# Golden · tech-grid

`golden.jpg` es el hero de la demo (Pulso, periféricos ficticios; cascos, ratón y teclado renderizados en 3D y una
persona generada con IA) pulido al lado de su referencia de estilo (las campañas de ofertas de las grandes marcas de
periféricos). Compárala en cada vuelta: `piezas-graficas/scripts/comparar.mjs --look tech-grid`.

## Qué imitar (medido en la golden)
1. **4 marcos de tamaños y proporciones distintas** en los dos tercios de la izquierda, a dos alturas, con relleno
   degradado (casi negro arriba → azul abajo) y borde de 2 px en dos colores alternos (acento y acento-2).
2. **Los productos rompen su marco** por 1-2 lados con la punta (la diadema de los cascos, la nariz del ratón, el
   extremo del teclado): 15-35 % del lado; el resto dentro, con aire. La persona, cortada por el borde de abajo.
3. **Productos de verdad**: a tamaño real se leen juntas, botones, rueda estriada, textura de agarre, leyendas
   tenues de las teclas y una luz RGB difusa (≤ 15 % de la superficie). Todos con el mismo blanco y la misma luz.
4. **Pistas de circuito** ortogonales (0-2 giros, esquina viva), del color del marco del que salen, de marco a marco
   o al borde, con un nodo cuadrado partido en 4 en cada unión, centrado en el borde.
5. **Bloque de texto a la derecha**: firma (logo + nombre), titular ancho en MAYÚSCULAS en el acento (2 líneas de
   ≤ 7 letras, interlineado 0,9), arco fino en dos tramos que abraza el bloque sin tocar letras, apoyo con la cifra en
   acento-2, fechas en gris y la web en mono con un cuadradito.
6. **Fondo**: negro-azulado liso hasta el 42 % y degradado a azul abajo; cuadrícula de 1 px al ~11 %.

## Qué separa una pieza amateur de esta
- Productos dibujados con formas planas o «pastillas» sin detalle; productos de fotos distintas con luces distintas.
- Fotos del usuario con su fondo gris o con halo blanco alrededor; productos metidos enteros en el marco.
- Pistas en diagonal, que acaban en el vacío o cruzan un producto; nodos sueltos; marcos iguales en fila.
- Titular en 3 líneas, en minúsculas o estrecho; el arco cortando letras.
- Los recortes de ejemplo de la plantilla (cascos, ratón, teclado y la jugadora de Pulso) en la pieza de otra marca.
- Marcos rellenos con una ampliación o un detalle de la misma foto, o con la foto con su fondo: cada marco lleva un
  sujeto recortado. Con solo 2 productos, el 3.º marco es una persona usándolos (IA) u otro producto de la marca.

## Lista de comprobación
- [ ] Jerarquía: titular → apoyo → web en 2 s; los productos se ven antes que la decoración (1-10).
- [ ] Credibilidad de los productos: son los de la marca (o genéricos sin marca si no hay) y enseñan ≥ 4 detalles a tamaño real (1-10).
- [ ] Luz coherente: mismo blanco, misma llave arriba a la izquierda y recorte azul detrás a la derecha en todos (1-10).
- [ ] Recortes limpios: sin fondo, sin halo, sin letras inventadas a la vista (ver-recorte.mjs) (1-10).
- [ ] Marcos y pistas: proporciones distintas, roturas con intención, pistas ortogonales con nodo en cada unión (1-10).
- [ ] Tipografía: grotesca ancha en mayúsculas, 2 líneas, arco sin cruzar letras; fuente de la marca cargada (1-10).
- [ ] Profundidad: sombras de contacto dentro del marco; el producto se recorta sobre el azul (1-10).
- [ ] Sin errores: exportador limpio, nada del ejemplo, zonas seguras libres (1-10).

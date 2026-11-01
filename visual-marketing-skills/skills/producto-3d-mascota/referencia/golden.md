# Golden · producto 3D + mascota

`golden.jpg` es el hero de la demo (Cometa, tienda de gaming ficticia; torre y mascota renderizadas en 3D) pulido al
lado de su referencia de estilo (los banners de las tiendas de videojuegos). Es el listón: tu pieza se pone a su lado
con `piezas-graficas/scripts/comparar.mjs --look producto-3d-mascota` en cada vuelta del bucle.

## Qué imitar (medido en la golden)
1. **La pareja manda**: producto y mascota ocupan ~80 % del alto y la mitad derecha (x 47-95 %); la mascota delante,
   tapando ~30 % del ancho del producto, con la base ~30 px más baja y mirando al producto o a cámara saludando.
2. **Producto creíble por dentro**: se leen ≥ 6 detalles a tamaño real (ventiladores con aspas y aro, radiador con
   aletas, gráfica oscura, memorias, cables trenzados, rejilla). Hay oscuros que dan contraste; nada es un bloque liso.
3. **Mascota con acabado de juguete de vinilo**: volumen, brillo especular suave, ojos con iris y dos brillos,
   mejillas, manos con dedos. Ni plastilina ni ilustración plana.
4. **Misma luz en los dos**: llave suave arriba a la derecha y recortes de color (azul a la izquierda, violeta a la
   derecha) en el canto de ambos; el blanco del producto recoge el violeta del fondo.
5. **Sombras de contacto** oscuras bajo cada sujeto: no flotan.
6. **Fondo**: degradado azul (arriba a la izquierda) → violeta → índigo, con 4-6 cruces, cuadraditos y bokeh casi
   invisibles. Redondeado del hero ≈ 3,4 % del ancho.
7. **Texto contenido**: logo centrado arriba; chip, titular de 2 líneas (peso ~780, −0,038 em) y CTA en píldora
   clara a la izquierda, en el aire, a ≥ 40 px de los sujetos.

## Qué separa una pieza amateur de esta
- Producto «de juguete» (cajas lisas, sin juntas ni piezas), mascota hecha con esferas sin rasgos.
- Sujetos sin la luz de color del fondo, o cada uno con su luz; halo blanco del recorte.
- La pareja pequeña y perdida en el centro, o separada en dos islas.
- Partículas que se ven más que el titular; glow o text-shadow en el HTML.
- Restos de la plantilla de ejemplo (Cometa, Chispa, la torre de ejemplo cuando el producto es otro).

## Lista de comprobación
- [ ] Jerarquía: la pareja domina; titular → CTA se leen en 2 s; nada compite (1-10).
- [ ] Credibilidad del producto: es SU producto (no el de ejemplo) y a tamaño real enseña ≥ 6 detalles (1-10).
- [ ] Mascota: acabado de vinilo, ojos con brillos, manos; mira al producto o saluda (1-10).
- [ ] Luz coherente: los dos sujetos tienen recortes azul/violeta y el mismo estudio; sombras de contacto (1-10).
- [ ] Recortes limpios: sin halo ni restos a 200 % (ver-recorte.mjs) (1-10).
- [ ] Composición: pareja ~80 % del alto, solape del 20-35 %, base de la mascota más baja (1-10).
- [ ] Tipografía y marca: fuente y colores del marca.json, titular 2 líneas sin viuda, logo arriba (1-10).
- [ ] Sin errores: exportador sin errores, nada del ejemplo, sin texto encima de un sujeto (1-10).

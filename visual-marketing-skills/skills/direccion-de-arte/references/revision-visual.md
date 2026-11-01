# Revisión visual obligatoria

**No se entrega ninguna pieza que no hayas renderizado con un navegador real y mirado tú.** El código «parece
bien» no vale: fuentes que no cargan, textos que saltan de línea, imágenes rotas y contrastes pobres solo se ven en
el PNG.

## Bucle
1. **Renderiza** con el script de la skill del formato (`exportar.mjs --marca marca.json` para piezas y carruseles,
   `aplicar-marca.mjs` + `comprobar-correo.mjs` para correos). Errores = se arreglan siempre. Avisos = se arreglan o
   se justifican. El exportador detecta texto cortado o fuera, textos que se pisan, texto que choca con una tarjeta,
   viudas, contraste, letra mínima, fuentes que no cargan e imágenes rotas o ampliadas; aun así, **mira**.
2. **Abre los PNG** (herramienta Read sobre la imagen). Míralos dos veces:
   - **A tamaño real**: detalles, cortes, alineaciones, erratas.
   - **A tamaño de móvil** (`hoja.png`, `movil.png`): ¿se lee el titular? ¿se entiende la idea en 2 segundos?
3. **Pasa la lista** de abajo. Apunta cada fallo.
4. **Corrige y vuelve a renderizar.** Repite hasta que la lista salga limpia. **Mínimo dos vueltas**: la primera
   versión casi nunca es la buena. En los looks de campaña, cada vuelta compara la pieza con la golden del look
   (`piezas-graficas/scripts/comparar.mjs --look <look>`) y puntúa su lista de 1 a 10: se entrega con todo ≥ 8 y sin
   fallos graves (`piezas-graficas/references/pulido.md`).
5. **Entrega** los PNG (o el HTML) junto con lo que has comprobado y lo que no (p. ej. «no probado en Outlook real»).

## Lista
**Mensaje**
- [ ] Una sola idea; el titular se entiende sin leer nada más.
- [ ] Cifras y datos comprobados en la fuente viva hoy. Nada inventado.
- [ ] Una acción clara (botón o URL) y sin objeciones abiertas.
- [ ] Sin erratas, con tildes, sin jerga para el público equivocado.

**Jerarquía y composición**
- [ ] Titular claramente dominante; nada compite con él.
- [ ] Todo alineado al mismo eje y con los mismos márgenes; nada dentro de la zona segura.
- [ ] Aire suficiente: ninguna pieza toca otra; el bloque principal no está apretado.
- [ ] Sin viudas en titulares; sin palabras partidas raras.

**Estilo**
- [ ] Un solo look, el que dice el selector (`references/looks.md`), y su lista de revisión pasada (está al final de
      `references/estilo.md` de su skill). Sin look, plano: sin brillos, sombras difusas, degradados, bordes ni
      barras laterales de color, ni emojis. Cada look solo levanta sus excepciones medidas:
      · `producto-en-contexto`: degradado suave, capas con borde de ~1 px degradado y sombra oscura suave (nada medio
        tapado por una capa, el borde no brilla, el contexto atenuado sin desenfocar);
      · `oscuro-glow`: halo contenido (alfa ≤ 0,6, desenfoque ≤ 8 % del lado corto, 3 elementos como mucho), nada de
        text-shadow, desenfoque solo en el fondo, titular plateado legible;
      · `producto-3d-mascota`: luz de color en los renders y el fondo, sombras de contacto oscuras, partículas sutiles;
      · `editorial-recorte` y `tech-grid`: planos; líneas, marcos y pistas finas; recortes limpios sin halo de fondo.
      En todos: ningún texto encima de un recorte o de la foto (el exportador lo mide píxel a píxel).
- [ ] Un acento, < 10 % de la superficie, con contraste suficiente.
- [ ] La tipografía y los colores son los del `marca.json` (no los del ejemplo) y la fuente cargó de verdad.
- [ ] Capturas nítidas (no ampliadas), recortadas a lo que importa, con fondo que casa con el lienzo y sin texto
      quemado que contradiga la pieza (cifras viejas, titulares duplicados).

**Formato**
- [ ] Tamaño exacto del canal; peso razonable (PNG < 8 MB en redes; correo < 102 KB de HTML).
- [ ] En serie (carrusel/campaña): cabecera y pie en la misma posición, contador correcto, ritmo claro/oscuro con intención.
- [ ] En correo: vistas de escritorio, móvil, sin imágenes y oscuro revisadas; baja visible; preencabezado.

## Cómo describir lo que ves (para corregir bien)
Sé concreto: «el titular de la 04 hace salto en "tus / condiciones" y queda "condiciones." sola: acortar o
`&nbsp;`», no «mejorar el titular».

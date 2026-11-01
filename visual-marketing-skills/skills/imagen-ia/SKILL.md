---
name: imagen-ia
description: Genera con IA las imágenes de apoyo de una pieza de marketing (fondos, escenas, fotos de ambiente, texturas, objetos de producto) con estética sobria y profesional, sin el «look IA», controlando el gasto y revisando el resultado antes de usarlo. Trae su propio generador para la API de Higgsfield (generar.mjs: estimación gratis, tope de gasto, 2 trabajos a la vez) y el quitafondos local; vale con cualquier otro generador. Úsala cuando una portada, banner, miniatura, story o carrusel necesite una imagen que no existe, y para conseguir las personas, productos o mascotas de los looks con recortes cuando el usuario no tiene fotos.
---

# Imágenes con IA para piezas de marketing

La IA pone **la imagen**; el texto, la marca y la composición se hacen en HTML con `piezas-graficas` o
`carrusel-instagram`. Una imagen de IA nunca lleva el titular dentro.

## Antes de generar: ¿hace falta?
1. ¿Hay una **captura real** del producto que cuente lo mismo? Úsala: es más creíble.
2. ¿Basta con **tipografía sobre fondo plano**? En el estilo sobrio, muchas veces sí.
3. Si hace falta ambiente (una escena, un objeto, una textura sutil), genera.

## Flujo
1. **Decide el papel de la imagen** en la pieza: fondo a sangre, media página, objeto recortado. Y **dónde irá el
   texto**: esa zona tiene que quedar limpia (cielo, pared, desenfoque, espacio negativo).
2. **Formato igual al de la pieza** (o mayor): 4:5 para carrusel, 9:16 para story, 16:9 para miniatura/OG.
3. **Prompt en inglés** con la plantilla de `references/prompts.md`: sujeto + composición (con el hueco para el
   texto) + luz + paleta de la marca (los colores de `marca.json` en palabras: «warm off-white, charcoal, a single
   coral accent») + estilo + lo que NO quieres.
4. **Empieza barato**: 2-4 variantes con el modelo económico (`soul` o `z-image`). Genera con el script de esta
   skill, que estima gratis, respeta el tope de gasto, lanza 2 trabajos a la vez como mucho y apunta lo gastado:
   ```bash
   node <skill>/scripts/generar.mjs "<prompt en inglés>" fondo.png --modelo soul --formato 4:5          # solo estima
   node <skill>/scripts/generar.mjs "<prompt en inglés>" fondo.png --modelo soul --formato 4:5 --si     # lanza
   ```
   Necesita `HIGGSFIELD_API_KEY` (la clave del usuario, «id:secreto» de open.higgsfield.ai). **Pide permiso al
   usuario con el coste antes de gastar**, salvo que haya fijado un tope (`IMAGEN_IA_TOPE_USD`) o te haya dado un
   presupuesto: dentro de él puedes generar sin volver a preguntar. Si en vez del script tienes herramientas de
   Higgsfield (`higgsfield_imagen`/`higgsfield_estado`), úsalas igual: el gasto lo controlan ellas.
5. **Revisa cada imagen** abriéndola (herramienta Read) y con zoom en las zonas críticas:
   - manos, caras, texto fantasma, logos inventados, objetos deformes, bordes repetidos;
   - que el hueco para el texto exista y sea tranquilo;
   - que la paleta case con la marca (sin neón, sin saturación de «póster de IA»);
   - resolución suficiente para el tamaño final (si no, regenera más grande; no amplíes).
   Si falla, **cambia el prompt** (no repitas el mismo) y vuelve a lanzar una vez. Si sigue mal, cambia de enfoque.
6. **Componla** en la plantilla de la pieza como `<img>` de fondo (`object-fit: cover`) y pon el texto en HTML. Si
   el texto queda sobre la foto, asegura legibilidad con un **bloque plano** detrás o escogiendo una zona oscura/clara
   uniforme; nada de sombras ni brillos. El exportador marcará «texto sobre imagen»: compruébalo a ojo.
7. **Exporta y revisa** con el exportador de la skill de la pieza (revisión visual obligatoria).

## Recortes para los looks (sujetos y productos sin fondo)
Los looks `editorial-recorte`, `tech-grid` y `producto-3d-mascota` componen **recortes**: personas, productos o una
mascota sin fondo, como `<img data-recorte>`. El flujo completo (fotos del usuario → librería 3D → IA, y lo que no se
hace nunca) está en **`piezas-graficas/references/sujetos.md`**; los prompts, en `references/prompts.md` («Sujetos
para los looks»).
1. **Genera sobre fondo liso**: «isolated on a plain flat light grey seamless studio background, soft even
   lighting, whole subject in frame with margin». Nada de fondos con degradados fuertes ni sombras duras. Para 3D:
   «clean 3D render, … rim light in [color de la marca]» para que la luz case con el fondo del look.
2. **Quita el fondo** en local: `node scripts/recortar.mjs foto.png recorte.png` (la primera vez, `npm install` en
   `scripts/`). Si come pelo, auriculares o ropa negra, repite con `--modelo large`. Luego
   `piezas-graficas/scripts/preparar-recorte.mjs` (halo, recorte, WebP y huella) y `armonizar.mjs` (la luz del look).
3. **Míralo sobre un fondo oscuro** (no sobre blanco, que esconde los halos): bordes limpios, sin restos grises,
   sin huecos dentro del sujeto. Mira al 400 % las **orejas, pendientes y mechones sueltos**: es donde el modelo deja
   una oreja «fantasma» semitransparente y motas claras. Se quitan con `contorno` y `limpiar` de
   `editorial-recorte/scripts/preparar-recortes.mjs` (reglas en `editorial-recorte/references/estilo.md` → Recortes).
4. **Logos y letras inventados** (la IA los pone en cascos, camisetas y teclados): tápalos rellenando con el color
   de alrededor, o encuadra para que no salgan. Marcas reales (un logo deportivo conocido): esa imagen no vale.
5. **Optimiza**: recorta lo transparente sobrante y escala al tamaño máximo que se use a 2x; WebP con alfa o PNG,
   ≤ 500 KB por recorte.
6. Sin saldo o sin IA: un **render 3D propio** del modelo del producto (three.js o Blender, fondo transparente, luz
   de recorte del color de la marca) sirve igual; ver `producto-3d-mascota`.

## Look sobrio (lo que pedir y lo que evitar)
- Pide: luz natural suave, materiales mate, profundidad de campo, paletas cálidas neutras con un acento,
  composición con espacio negativo, fotografía editorial, «product photography on seamless backdrop».
- Evita: neón, glow, partículas, lens flare, HDR, cyberpunk, 3D brillante de plástico, personas mirando a cámara
  con sonrisa de stock, texto en la imagen, logos de terceros, personajes con copyright, famosos.

## Coherencia en una serie
- Fija estilo y paleta en un **bloque de estilo** que repites palabra por palabra en todos los prompts.
- Usa la misma semilla (`parametros.seed`) para variantes del mismo estilo.
- Para un personaje recurrente: imagen ancla y referencia (ver la skill `higgsfield` si está instalada).

## Ficheros
- Copia las imágenes que uses a la carpeta de la pieza y referencia la copia: los enlaces de los generadores caducan
  (los de Higgsfield, a los 7 días).
- `references/prompts.md` · plantilla de prompt, bloques de estilo, ejemplos por tipo de pieza y prompts de sujetos.
- `scripts/generar.mjs` · genera con la API de Higgsfield con el gasto controlado (estimación gratis, tope, 2 a la
  vez, registro en `~/.imagen-ia/gasto.jsonl`).
- `scripts/recortar.mjs` · quita el fondo de una foto o un render (modelo local, sin servicios externos).

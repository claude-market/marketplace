---
name: carrusel-instagram
description: Crea carruseles de Instagram (y LinkedIn) profesionales a 1080x1350 para cualquier marca, con tipografía cuidada, jerarquía clara, maquetas de producto dibujadas en HTML, ritmo entre diapositivas y exportación a PNG con un Chrome real, más una hoja de contacto y la vista de la rejilla del perfil para revisarlos. Úsala cuando pidan un carrusel, «un post de varias imágenes», diapositivas para Instagram o LinkedIn, una guía o un listado en formato post, o rehacer un carrusel que se ve amateur.
---

# Carruseles de Instagram (1080x1350)

Antes, lee **`direccion-de-arte`** (brief de marca → `marca.json`, copy, revisión). Aquí está cómo se fabrica.

## Qué hay aquí
- `plantillas/carrusel.html` · sistema de 7 diapositivas: **portada con producto en contexto** (la app sobre el
  degradado de la marca, sangrando, con la fila que cuenta la promesa destacada encima), **punto con producto en
  claro** (modal sobre la app atenuada), **punto con producto en oscuro** (ajustes de la función), **lista**,
  **cifra**, **tabla** y **cierre** sobre el color de marca. Temas claro, `.oscuro`, `.color` y `.escena`
  (`.escena.clara`, `.escena.malla`); cabecera y pie fijos con contador y barra de progreso. Ejemplo: Pliego, marca
  ficticia. Sin colores ni fuentes sueltos: todo son variables que pone `marca.json`.
- `plantillas/producto.css` + `producto.js` · los componentes de la skill `producto-en-contexto` (ventana de app,
  capas flotantes con borde degradado, chips, avisos, iconos de línea). Cópialos junto al HTML. Reglas del estilo en
  `piezas-graficas/skills/producto-en-contexto/references/estilo.md`; son el mismo fichero que allí.
- `scripts/exportar.mjs` · aplica la marca (`--marca`), exporta cada `[data-pieza]` a PNG exacto y revisa: tamaño,
  texto fuera o cortado, **textos que se pisan**, **texto que choca con una tarjeta**, **viudas en titulares**, margen
  de seguridad, letra mínima, contraste real, sombras/brillos, imágenes rotas o ampliadas y fuentes que no cargan.
  Con `--carrusel` añade `hoja.png` (toda la secuencia a tamaño de móvil) y la rejilla 3:4 del perfil.
- `references/estructura-y-ritmo.md` · cómo construir la historia de un carrusel y su ritmo.

**Otros looks.** Si la campaña va con otro look del selector (`direccion-de-arte/references/looks.md`: oscuro-glow,
editorial-recorte, producto-3d-mascota o tech-grid), la portada y el cierre salen de la pieza `redes-4x5` de la
plantilla de ese look (en `piezas-graficas`): cópiala aquí con su CSS y sus recortes, ponle la cabecera y el pie
del carrusel y mantén `data-estilo` del look. Este exportador es el mismo y aplica su criterio.

## Flujo
1. **Marca**: ten el `marca.json` de la marca en la carpeta del trabajo (skill `direccion-de-arte`). Sin él, el
   carrusel sale con la marca de ejemplo: no lo entregues así.
2. **Guion antes que diseño** (`references/estructura-y-ritmo.md`): 5-10 diapositivas, una idea por diapositiva,
   titulares de ≤ 8 palabras escritos en una lista. Portada = gancho; última = una acción. Datos comprobados.
3. **Copia la plantilla** a la carpeta del trabajo, con sus componentes:
   `cp <skill>/plantillas/carrusel.html <skill>/plantillas/producto.css <skill>/plantillas/producto.js ./`.
4. **Monta las diapositivas** duplicando el tipo que toque y cambiando el texto y los datos de las maquetas
   (`.factura`, `.facturas`, `.tiempo`, `.tabla`): son genéricas, cámbiales el contenido por el del producto (un pedido,
   una reserva, un panel, un mensaje). Mantén `data-pieza` numerado (`01-portada`, `02-…`), el contador `0X / 0N` y la
   barra `style="--paso:X/N"`. Nombre, web y logo van en elementos con `data-marca` y se rellenan solos.
5. **Exporta y revisa** (obligatorio):
   ```bash
   cd <skill>/scripts && npm install          # solo la primera vez (usa el Chrome o Edge del sistema)
   node <skill>/scripts/exportar.mjs ./carrusel.html --marca ./marca.json --carrusel
   ```
   Arregla todos los errores y avisos (o justifica el aviso, p. ej. «texto sobre foto, comprobado a ojo»).
6. **Mira** `out/<nombre>/hoja.png` (ritmo, coherencia, legibilidad a tamaño de móvil, la portada en la rejilla
   3:4) y **cada PNG a tamaño real** (cortes, viudas, alineaciones, erratas). Pasa la lista de
   `direccion-de-arte/references/revision-visual.md`. Corrige y repite.
7. **Entrega** los PNG en orden y el texto del pie de la publicación (≤ 125 caracteres antes del «más», 3-5 hashtags
   concretos al final, con el tono de la marca).

## Reglas que hacen que un carrusel parezca de agencia
- **Mismo esqueleto en todas**: cabecera (logo + nombre, sección) arriba, pie (contador + barra) abajo, mismo margen
  (88 px). Es lo que hace que deslizar se sienta como un documento.
- **Portada**: titular grande (112-132 px) con el corte de línea elegido a mano, una línea de apoyo, «Desliza →» y el
  producto haciendo algo (maqueta o captura) que **sangre** por un borde. Nada de logotipos enormes ni «HILO 🧵».
- **Una idea por diapositiva**; si el titular necesita «y», son dos diapositivas.
- **Ritmo**: alterna una cargada (lista, tabla, maqueta) con una ligera (cifra, frase). Fondo oscuro para portada y
  cifra; el color de marca, como mucho en una (el cierre).
- **Texto grande**: titulares 80-84 px, apoyo 38 px, nada por debajo de 22 px. Se lee en un móvil a 1/3 de tamaño.
- **Pruebas visuales** (tarjetas, tablas, líneas de tiempo) dibujadas en HTML con los tokens: nítidas y coherentes.
  Las maquetas que sangran llevan padding extra en el lado que se corta, para que su texto no quede fuera.
- **Producto en contexto** en 2-3 diapositivas (portada y los puntos fuertes): la app de verdad en `.ventana` sobre
  `.escena`, una o dos capas `.flotante` que cuentan la idea de esa diapositiva y el resto `.atenuado`. Diapositiva
  con `data-estilo="producto"`; titular en peso 600; nada de texto medio tapado por una capa (`data-sobre` coloca
  la fila destacada encima de la suya). La ventana termina encima del pie (el contador no puede tocarla).
- **Exporta a 2x** (`--escala 2`) para que la interfaz pequeña salga nítida.
- **Capturas reales**: sin texto quemado que duplique o contradiga el de la diapositiva (recórtalas); nunca ampliadas.
- **Rejilla del perfil**: Instagram enseña la portada recortada a 3:4 (pierde ~34 px por lado). Nada importante
  pegado a los laterales; comprueba la vista `perfil` de la hoja.
- **Cierre**: una acción (botón dibujado + web o «enlace en la bio») y, si cabe, «Guárdalo».

## Problemas conocidos
- «La fuente de la marca no cargó» → `tipografia.google_fonts` mal escrito o sin red. La pieza no vale con la de sistema.
- Imagen rota → URL relativa a una carpeta que no existe o sin conexión; usa rutas relativas al HTML o https.
- `—` o comillas raras → guarda el HTML en UTF-8.
- Aviso de viuda → corta el titular a mano con `<br>` o une las dos últimas palabras con `&nbsp;`.

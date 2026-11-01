---
name: direccion-de-arte
description: Dirección de arte para piezas de marketing de cualquier marca con nivel de agencia (Proton, Linear, Stripe) y estética sobria. Úsala SIEMPRE antes de diseñar o revisar cualquier pieza visual (correo HTML, carrusel de Instagram, portada, banner, miniatura, OG, story, anuncio o vídeo) y cuando pidan «que quede más profesional», «menos IA», «más limpio», un estilo o look concreto, una guía de estilo, la marca de un cliente o proyecto, tipografía, rejillas, paleta, jerarquía o textos de una pieza. Empieza pidiendo o leyendo el brief de marca y lo convierte en un marca.json que usan todas las plantillas, elige el look con el selector (producto en contexto, oscuro glow, editorial recorte, producto 3D con mascota, tech grid o plano) y termina con la revisión visual obligatoria.
---

# Dirección de arte · la base de todas las piezas

Esta skill decide **cómo tiene que verse y leerse** una pieza, para la marca que sea. Las skills de formato
(`correo-marketing-html`, `carrusel-instagram`, `piezas-graficas`, `imagen-ia`, `reel-de-marketing`) deciden **cómo
se fabrica**. Léela primero; luego abre la del formato.

Ninguna marca va metida en las plantillas: la marca es un **parámetro**, un `marca.json` (nombre, colores, tipografía,
logo, web, tono). Las plantillas traen de ejemplo una marca ficticia, **Pliego** (facturación para autónomos), para
que se vean solas; con tu `marca.json` se convierten en las de tu marca sin tocar su HTML.

## El listón
Nivel agencia: **sobrio, plano, con aire y con contenido real**. Una pieza buena se reconoce porque:
- tiene **una sola idea** y se entiende en 2 segundos;
- la jerarquía es obvia: **titular → apoyo → acción**, y nada compite con el titular;
- usa **una familia tipográfica** (dos como mucho: una de texto y una mono para datos);
- el color es **neutro + un acento** que ocupa menos del 10 % de la superficie;
- todo cae en una **rejilla**: mismos márgenes, mismas distancias, alineado a la izquierda;
- enseña **el producto de verdad** (capturas reales, o maquetas de interfaz dibujadas en HTML con los tokens), no
  decoración.

**Prohibido** (es lo que delata a una IA o a una plantilla barata): brillos y resplandores (glow, neón, `text-shadow`),
sombras difusas grandes, degradados de colores, **bordes o barras laterales de color**, emojis, mayúsculas en todo el
titular, exclamaciones, iconos 3D brillantes, fondos con texturas, más de un acento, texto centrado en bloques largos,
efectos «cristal», palabras de relleno («increíble», «revolucionario», «descubre», «potencia»), stock genérico de
gente señalando.

**Las excepciones medidas: los looks.** Para las imágenes de campaña hay cinco looks, cada uno una skill de
`piezas-graficas` con sus reglas medidas, y cada uno levanta **solo** algunas prohibiciones, con números:

| Look | Skill | Cuándo | Lo que permite |
|---|---|---|---|
| Producto en contexto | `producto-en-contexto` | SaaS, apps: enseñar una función | degradado suave, capas con borde de 1 px degradado y sombra oscura suave |
| Oscuro glow | `oscuro-glow` | lanzamiento u oferta de fintech, trading, SaaS en oscuro | resplandor contenido en 2-3 elementos, fondo desenfocado, titular en mayúsculas plateado |
| Editorial recorte | `editorial-recorte` | gaming, esports, lifestyle con personas | collage de recortes y líneas finas de construcción (plano) |
| Producto 3D + mascota | `producto-3d-mascota` | producto físico o gaming con mascota | renders 3D con luz de color, partículas y bokeh sutiles, sombras de contacto |
| Tech grid | `tech-grid` | catálogo u ofertas de gaming, hardware | cuadrícula, marcos de borde fino, pistas de circuito, dos acentos, titular ancho en mayúsculas |

El selector completo (por marca y por objetivo, y qué permite cada look) está en **`references/looks.md`**: léelo
antes de diseñar una imagen de campaña. Fuera de los looks (correo HTML, piezas solo de texto), el estilo sigue
siendo plano. Ningún look permite texto encima de la foto o del sujeto, sombras de color en el texto ni mezclar
looks en una pieza.

## Qué pedirle al usuario antes de empezar
Una sola tanda de preguntas, corta, con lo que falte (lo que ya esté en su mensaje, su web o un `marca.json` no se
pregunta):
1. **Marca**: nombre, web, colores (hex si los tiene), tipografía y **logo** (SVG o PNG con fondo transparente).
2. **Qué pieza**: formato y canal (hero web, post, story, banner…), objetivo, la idea o la oferta y **las cifras
   reales** si las hay.
3. **El sujeto**, según el look: **capturas o estructura de su app** (producto en contexto); **fotos de sus
   productos** (tech-grid, producto 3D); **fotos de las personas** con permiso (editorial); **su mascota** (imágenes o
   descripción). Las fotos son lo que más sube el nivel: pídelas siempre.
4. **IA**: si no hay fotos, ¿tiene clave de Higgsfield y cuánto puede gastar? (las imágenes cuestan céntimos, pero
   es su dinero: sin su permiso, no se genera).
Si el usuario no está o dice «decide tú», sigue con lo que haya (su web, la librería 3D, textos razonables) y apunta en
la entrega qué has supuesto y qué material lo mejoraría.

## Flujo (no te saltes pasos)
0. **Brief de marca → `marca.json`** (`references/marca.md`). Si ya hay un `marca.json` en la carpeta del trabajo,
   léelo y compruébalo. Si no, consíguelo en este orden: el manual o la guía de la marca que te den; su web (saca
   `font-family`, colores de botones y fondos, radios y logo del CSS y del HTML); y lo que falte, **pregúntalo**
   (nombre, web, colores, tipografía, logo, tono). Parte de `plantillas/marca.json` y compruébalo:
   ```bash
   node <skill>/scripts/comprobar-marca.mjs marca.json
   ```
   Mide el contraste de cada pareja que usan las plantillas (texto sobre papel, acento sobre oscuro, texto del
   botón…). Errores = se corrige la paleta (normalmente oscureciendo `acento-texto`) antes de diseñar.
1. **Brief de la pieza** (`references/brief.md`): objetivo, público, una idea, una acción, formato y canal, y los
   **datos verificados**. Las cifras se comprueban en la fuente viva (web, panel, base de datos) y se fechan, nunca
   en un material viejo: los heros y correos antiguos suelen arrastrar cifras caducadas.
   **Elige el look** con `references/looks.md` (marca + objetivo → uno de los cinco looks o plano) y dilo en el
   brief: «look oscuro-glow porque es una oferta con cifra de una marca financiera en oscuro». Si el usuario trae una
   referencia («como esta imagen»), busca el look que la cubre; si ninguno, el más cercano y explica la diferencia.
2. **Copy primero** (`references/copy.md`): titular, apoyo y botón escritos y recortados ANTES de maquetar. Si el
   texto no funciona en un .txt, el diseño no lo salva.
3. **Sistema** (`references/tipografia.md`, `references/rejilla-y-espacio.md`, `references/color.md`): escala
   tipográfica, márgenes, rejilla y paleta como tokens (variables CSS que salen del `marca.json`). Nada de valores
   sueltos.
4. **Maqueta** con la skill del formato, partiendo de su plantilla y pasando `--marca marca.json` al exportador.
5. **Revisión visual obligatoria** (`references/revision-visual.md`): renderiza con Chrome de verdad, **abre el PNG y
   míralo**, pasa la lista, corrige y vuelve a renderizar. No se entrega nada que no hayas visto renderizado. En los
   looks, el **bucle de pulido** (`piezas-graficas/references/pulido.md`): tu pieza al lado de la golden del look
   con `comparar.mjs`, puntuación de 1 a 10 de su lista, 2 vueltas como mínimo y todo ≥ 8 para entregar.

## Reglas rápidas que más mejoran una pieza
- **Escala con contraste**: el titular al menos 2,5 veces el cuerpo. Titulares de 3-8 palabras.
- **Interletra negativa en titulares** (−0,03 a −0,045 em) y positiva en etiquetas en mayúsculas (+0,08 a +0,14 em).
- **Interlineado**: titulares 0,95-1,05; texto 1,35-1,65.
- **Cortes de línea a mano** en titulares: `<br>` donde respira la frase y `&nbsp;` entre número y unidad o en las dos
  últimas palabras. Ni viudas ni «no / en 45».
- **Ancho de línea**: 45-75 caracteres en texto corrido (correo), 20-35 en redes.
- **Márgenes generosos**: 8 % del lado corto como mínimo en redes (88 px en 1080), 40 px en correo.
- **Números**: cifras reales, con su unidad separada por espacio duro (`20&nbsp;GB`), tabulares en tablas.
- **Una acción**: un botón. Si hay dos, el segundo es un enlace de texto.
- **Acento con contraste**: un acento claro (amarillo, ámbar, coral, verde agua) no se usa como texto sobre claro;
  va de relleno (botón, etiqueta) o como texto sobre oscuro. Para texto sobre claro, `acento-texto`.
- **Maquetas de producto** cuando no hay capturas buenas: tarjetas planas con la tipografía y los colores de la
  marca (factura, pedido, panel, mensaje), con datos verosímiles. Más nítidas y coherentes que una captura borrosa.
  Para el salto de nivel, **la app entera en contexto** (ventana con lateral, buscador y lista + 1-2 capas que
  cuentan una función): componentes listos en `producto-en-contexto`.
- **Capturas reales**: recortadas a lo que importa, con radio coherente y una línea fina neutra; el fondo de la
  captura tiene que casar con el lienzo.
- **Coherencia entre formatos**: una campaña = mismo `marca.json`, mismo titular, misma maqueta en todos los tamaños.

## Ficheros
- `plantillas/marca.json` · la marca de ejemplo (Pliego, ficticia): cópiala y rellénala con la tuya
- `scripts/comprobar-marca.mjs` · campos obligatorios, formato de colores y contraste de cada pareja (sin dependencias)
- `references/marca.md` · cómo sacar la marca (preguntas, de una web, de un manual), qué es cada campo y cómo derivar
  la paleta cuando solo te dan un color
- `references/looks.md` · **el selector de look**: los cinco looks y el plano, cuándo usar cada uno según la marca
  y el objetivo, y qué excepciones medidas permite cada uno
- `references/brief.md` · plantilla de brief y preguntas que hay que contestar antes de diseñar
- `references/copy.md` · titulares, botones, tono, palabras prohibidas
- `references/tipografia.md` · escalas, emparejamientos, ajustes finos, fuentes seguras en correo
- `references/rejilla-y-espacio.md` · márgenes, rejillas por formato, ritmo vertical, zonas seguras
- `references/color.md` · paletas sobrias, contraste, acento, modo oscuro
- `references/revision-visual.md` · la lista de la revisión obligatoria (común a todas las skills)

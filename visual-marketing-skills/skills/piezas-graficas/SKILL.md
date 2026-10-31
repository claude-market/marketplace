---
name: piezas-graficas
description: Diseña y exporta piezas gráficas estáticas de marketing para cualquier marca con nivel de agencia — portadas, banners (X, LinkedIn, Discord, YouTube), miniaturas de YouTube, imágenes OG para enlaces, stories, cabeceras (heros) para correos, anuncios y portadas de tienda — como HTML renderizado con Chrome a PNG exacto, con la marca sacada de marca.json, el texto nítido y una revisión automática y visual. Úsala cuando pidan una portada, un banner, una miniatura, una imagen para compartir un enlace, una story, la imagen de cabecera de un correo o «la misma campaña en todos los formatos».
---

# Piezas gráficas (portadas, banners, miniaturas, OG, stories, heros)

Antes, lee **`direccion-de-arte`** (marca → `marca.json`, copy, revisión). Para fondos o escenas con IA,
**`imagen-ia`**. Si la pieza enseña la app o el producto digital (lo más habitual en un lanzamiento), usa la skill
hermana **`producto-en-contexto`**: la interfaz real en una ventana sobre un degradado suave, con capas flotantes,
al nivel de las imágenes de producto de las grandes apps. Sus componentes (`producto.css`, `producto.js`) también
sirven aquí: enlázalos y pon `data-estilo="producto"` en la pieza.

## Looks (skills hermanas de este plugin)
Para una imagen de campaña con nivel de agencia, elige primero el look con el selector de
`direccion-de-arte/references/looks.md` y abre su skill: cada una trae su guía medida, plantillas en 5 formatos
(hero 16:9, 1:1, 4:5, banner de X y story) y su criterio en el exportador.

| Look | Skill | Para |
|---|---|---|
| Producto en contexto | `producto-en-contexto` | enseñar una app (SaaS) haciendo una cosa |
| Oscuro glow | `oscuro-glow` | ofertas y lanzamientos de fintech, trading o SaaS en oscuro, con cifras |
| Editorial recorte | `editorial-recorte` | gaming, esports y lifestyle con personas recortadas |
| Producto 3D + mascota | `producto-3d-mascota` | producto físico o gaming con mascota |
| Tech grid | `tech-grid` | catálogo y ofertas de gaming, periféricos y hardware |

Esta skill (`piezas-graficas`) es la base plana y el exportador común de todos.

## Principio
**El texto se compone en HTML, nunca dentro de la imagen generada.** La pieza es un `<section>` con su tamaño
exacto; debajo va el material (maqueta de producto en HTML, captura real, foto o fondo de IA) y encima el texto con
la tipografía de la marca. Así sale nítido, sin faltas, corregible en segundos y coherente en todos los formatos.

## Qué herramienta para qué
| Necesitas | Usa |
|---|---|
| Pieza con texto, interfaz, cifras (casi todas) | **HTML + `exportar.mjs`** (esta skill). Es lo más nítido y controlable |
| Una foto o escena que no existe | **`imagen-ia`** (Higgsfield u otro) para la imagen, y esta skill para componer encima |
| La misma pieza animada (reel, anuncio en vídeo) | **`reel-de-marketing`** con motion-graphics (Remotion). Un fotograma fijo de Remotion (`npx remotion still`) solo compensa si la pieza ya existe como composición de vídeo; si no, HTML |

## Qué hay aquí
- `plantillas/piezas.html` · una campaña en 5 formatos: `hero-correo` (1200x680, para 600 a 2x), `og` (1200x630),
  `miniatura` (1280x720), `banner-x` (1500x500) y `story` (1080x1920). Maquetas de producto (`.factura`, `.filas`)
  medidas en `em`: cambias el `font-size` del contenedor y escalan enteras. Incluye el **recortador**
  `.recorte[data-crop="x,y,ancho,alto"]` para sacar exactamente una parte de una captura real. Ejemplo: Pliego,
  marca ficticia.
- `references/formatos.md` · tamaños, zonas seguras y qué funciona en cada canal.
- `scripts/exportar.mjs` · el mismo exportador que los carruseles: aplica `--marca`, exporta y revisa (texto
  cortado, textos que se pisan, texto que choca con una tarjeta, viudas, margen, letra mínima, contraste, fuentes y,
  en los looks, recortes planos o con halo, sujetos pequeños y restos de la plantilla de ejemplo).
- `scripts/comparar.mjs` · el bucle de pulido: tu pieza junto a la golden del look (`<look>/referencia/golden.jpg`),
  con un detalle de cada una al 100 % y la lista puntuable. `references/pulido.md` explica el bucle (obligatorio, 2
  vueltas como mínimo, todo ≥ 8).
- **Herramientas de sujetos** (`references/sujetos.md`: fotos → librería 3D → IA):
  `scripts/preparar-recorte.mjs` (quita el halo, recorta, WebP ≤ 500 KB y mide la huella para la sombra),
  `scripts/armonizar.mjs` (blancos y luz de recorte del look para que fotos de sesiones distintas casen) y
  `scripts/ver-recorte.mjs` (hoja de revisión: sobre negro, sobre el color del look y el borde al 300 %). El
  quitafondos y el generador de IA están en `imagen-ia/scripts/`; la librería 3D, en `producto-3d-mascota/scripts/`.

## Flujo
1. **Marca y brief** (skill `direccion-de-arte`): `marca.json` en la carpeta del trabajo; un titular que sirva para
   todos los formatos, una versión corta para la miniatura (2-4 palabras) y los datos comprobados.
2. **Material**: lo más creíble es el producto. O capturas reales a buena resolución (al menos 2x de lo que se verá;
   navegador sin cabeza a 1600-1920 px, con datos de ejemplo y sin datos personales), o una **maqueta** en HTML con
   los tokens (tarjeta de pedido, factura, panel, mensaje). Fondos de ambiente: skill `imagen-ia`.
3. **Copia la plantilla** a la carpeta del trabajo y borra los formatos que no hagan falta. Para uno nuevo, duplica
   una `<section>` y pon `data-pieza`, `data-ancho`, `data-alto`, `data-margen` (zona segura) y `data-min-letra`.
   Marca las maquetas con `data-maqueta` (su texto puede ser más pequeño, pero nunca cortado).
4. **Maquetas que sangran** (salen por un borde): suma el sangrado al padding de ese lado
   (`padding-right: calc(1.65em + 80px)`) para que el contenido quede dentro del lienzo.
5. **Recortes de capturas**: mide el rectángulo en la captura original (en píxeles) y ponlo en `data-crop`. Si la
   caja es más grande que el rectángulo, la imagen se amplía y el exportador avisa. Comprueba que el fondo de la
   captura casa con el lienzo y que no arrastra texto quemado que contradiga la pieza.
6. **Exporta y revisa** (obligatorio):
   ```bash
   cd <skill>/scripts && npm install           # solo la primera vez
   node <skill>/scripts/exportar.mjs ./piezas.html --marca ./marca.json
   node <skill>/scripts/exportar.mjs ./piezas.html --marca ./marca.json --solo og      # una sola
   ```
7. **Mira** `out/<nombre>/hoja.png` (coherencia de la campaña) y cada PNG a tamaño real. Además, juzga cada pieza
   **al tamaño al que se verá**: la miniatura a 320 px de ancho, el OG a 500 px, la story en un móvil. Pasa la lista
   de `direccion-de-arte/references/revision-visual.md`. Corrige y repite (2 vueltas como mínimo). En los looks,
   el bucle de pulido con `comparar.mjs` y la golden (`references/pulido.md`) es obligatorio.
8. **Entrega** los PNG (y súbelos donde toque: el hero del correo a una URL pública https).

## Reglas por tipo
- **Miniatura**: 2-4 palabras enormes, contraste máximo, un solo elemento de apoyo. Nada en la esquina inferior
  derecha (duración).
- **OG**: marca + titular corto + web. Se ve a ~500 px: nada de texto pequeño fuera de la maqueta.
- **Banner**: el texto fuera de la zona de la foto de perfil; la maqueta puede sangrar por la derecha.
- **Story**: 250 px arriba y 340 abajo son de Instagram; titular grande; una acción.
- **Hero de correo**: 1200 px de ancho, texto ≥ 26 px (se verá a la mitad), fondo plano que case con el correo
  (blanco o papel), nada esencial que solo esté en la imagen (repítelo en el HTML del correo).

## Exportar otras cosas
`exportar.mjs` vale para cualquier HTML: `--selector` elige qué exportar, `--escala 2` para retina, `--estricto`
para fallar también con avisos. Piezas existentes de otros proyectos se exportan igual marcando sus contenedores con
`data-pieza`. Con `data-estilo="producto"` en una pieza acepta las sombras suaves de las capas (y avisa de brillos),
deja que las maquetas se solapen entre ellas y no mide el contraste del texto dentro de `.atenuado`. Antes de
revisar llama a `window.recolocar()` (de `producto.js`) para que las capas con `data-sobre` caigan en su fila con la
fuente definitiva. Es el mismo fichero que el de `carrusel-instagram`: si lo cambias, copia el otro.

Criterio por look (`data-estilo` en la pieza): sin atributo, plano; `producto` y `producto-3d-mascota`, sombras
oscuras sí y brillos no; `oscuro-glow`, halos claros o de color con alfa ≤ 0,6 y desenfoque ≤ 8 % del lado corto en
3 elementos como mucho, sin `text-shadow`; `editorial-recorte` y `tech-grid`, planos. En todos:
- `data-fondo` en las capas decorativas (rejilla, gráfico o dashboard desenfocado, bokeh, partículas, líneas): dentro
  vale `filter: blur()`, su texto no se revisa y no cuentan como bloques en los choques.
- `<img data-recorte>` en sujetos y productos recortados: error si no traen transparencia o si un texto pisa su parte
  opaca (medido píxel a píxel; descuenta un fundido con `mask-image: linear-gradient(...)` vertical).
  `data-sobre-recorte` en un texto lo permite a propósito (una etiqueta de precio pegada al producto).
- Un titular con `background-clip: text` se mide con el tono más oscuro de su degradado.
- La marca puede traer `tipografia.display` (titulares de los looks): llega como `--fuente-display` y el exportador
  falla si no carga.

# La marca como parámetro: `marca.json`

Todas las plantillas del marketplace leen la marca de un único fichero. Con él, el carrusel, las piezas y los correos
salen en los colores, la tipografía y con el logo de la marca sin tocar su HTML. Va en la carpeta del trabajo (los
exportadores lo cogen solo si está junto al HTML) o se pasa con `--marca ruta/marca.json`.

## 1. Conseguir los datos (en este orden)
1. **Lo que te den**: manual de marca, guía de estilo, Figma, kit de prensa. Manda sobre todo lo demás.
2. **Su web** (si existe): abre la home con un navegador sin cabeza o con `curl` y saca del CSS y del HTML:
   - tipografía: `font-family` del `body` y de los `h1` (y si viene de Google Fonts, el `<link>` exacto);
   - colores: fondo de página, color del texto, fondo y texto del botón principal, color de los enlaces;
   - radio de los botones y tarjetas (`border-radius`);
   - logo: el `<svg>` en línea de la cabecera o el fichero del `<img>` (mejor SVG); el favicon como último recurso.
   Comprueba lo que saques mirando una captura: un color de un banner puntual no es el de la marca.
3. **Pregunta lo que falte** (en una sola tanda, corto):
   - ¿Nombre exacto y cómo se escribe (mayúsculas, espacios)? ¿Web y correo de contacto?
   - ¿Color principal (hex)? ¿Prefieres fondo claro, oscuro o los dos?
   - ¿Tipografía? Si no hay, propón una de la lista de abajo.
   - ¿Logo en SVG? Si no hay, el nombre en texto es mejor que un logo pixelado.
   - ¿Tono: tú o usted, serio o cercano, emojis sí o no?
4. **Nunca inventes** el logo ni el color de una marca real. Si no hay datos y no puedes preguntar, usa una marca
   neutra (la de ejemplo con otro nombre) y dilo al entregar.

## 2. Los campos
```jsonc
{
  "nombre": "Pliego",                 // tal cual se escribe; se pinta donde haya data-marca="nombre"
  "ficticia": true,                   // solo en marcas de ejemplo
  "sector": "…",                      // para orientar el copy y las imágenes
  "lema": "Facturas claras, cobros a tiempo.",
  "web": "https://pliego.app",        // con https: enlaces de correo y botones
  "web_texto": "pliego.app",          // como se escribe en una pieza (data-marca="web_texto")
  "correo_contacto": "hola@pliego.app",
  "tono": "Cercano y directo, de tú…",
  "logo": {
    "svg": "<svg viewBox=…>…</svg>",  // con fill="currentColor": así sirve en claro, oscuro y sobre el acento
    "png_claro": "", "png_oscuro": "" // URLs https para correo si se quiere logo en imagen (si no, va en texto)
  },
  "colores": {
    "papel": "#f3f1ec",        // fondo claro de las piezas
    "superficie": "#ffffff",   // tarjetas y maquetas sobre el papel
    "bloque": "#f5f3ef",       // fondos de bloque en correo (cifras, cupón) y etiquetas neutras
    "tinta": "#121418",        // titulares, botón oscuro
    "texto": "#2b2f35",        // párrafos
    "suave": "#5f656e",        // apoyo, etiquetas (≥ 4,5:1 sobre papel)
    "apagado": "#80868e",      // pies y notas
    "linea": "#dcd8d0",        // separadores y bordes de 1-2 px
    "noche": "#111317",        // fondo oscuro (nunca #000)
    "noche-2": "#1b1e24", "noche-linea": "#2c3038",
    "claro": "#f3f1ec",        // texto sobre oscuro (no #fff puro en bloques largos)
    "claro-suave": "#a1a6ad",  // apoyo sobre oscuro
    "acento": "#ff5b2e",       // EL color de la marca: botón, cifra, palabra clave sobre oscuro, fondo de cierre
    "acento-texto": "#b8330c", // el acento oscurecido para texto sobre claro (≥ 4,5:1)
    "sobre-acento": "#121418"  // texto encima del acento (botón, fondo de color)
  },
  "tipografia": {
    "fuente": "Geist",          // nombre exacto de la familia
    "mono": "Geist Mono",       // opcional: datos, etiquetas, URLs
    "google_fonts": "family=Geist:wght@400..800&family=Geist+Mono:wght@400..600",
    "correo": "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif"
  },
  "forma": { "radio": "20px" }  // radio de tarjetas y botones en redes (el correo usa 10-12 px)
}
```
En plantillas HTML los colores llegan como variables CSS con el mismo nombre (`--acento`, `--papel`…); en correos,
como marcadores `%%colores.acento%%` que rellena `aplicar-marca.mjs` (los clientes de correo no entienden variables).

### Campos opcionales que usan los looks
Ninguno es obligatorio: si faltan, cada look los deriva del acento y de los neutros.
```jsonc
{
  "tipografia": {
    "display": "Poppins"        // titulares de los looks (geométrica compacta en oscuro-glow, grotesca ancha en
                                // tech-grid) → --fuente-display. Si falta, la «fuente». Inclúyela en google_fonts
  },
  "colores": {
    "acento-2": "#d4ff3a",      // segundo acento: trazos y marcos de tech-grid, detalles de editorial-recorte
    "escena-1": "#…",           // producto-en-contexto: degradado de fondo (escena-1/2/3, sobre-escena, ok…)
    "glow": "#…"                // y los tokens propios de cada look, con el mismo nombre que en su estilo.md
  }
}
```
Cada clave de `colores` llega a las plantillas como `--clave`, así que cualquier token de un look se puede fijar
desde aquí si el derivado no convence. Qué look usar con cada marca: `references/looks.md`.

## 3. Si solo te dan un color
Con un único color de marca se deriva el resto (y luego se pasa `comprobar-marca.mjs`):
- **acento** = el color tal cual.
- **acento-texto** = el mismo tono, más oscuro, hasta ≥ 4,5:1 sobre el papel (baja la luminosidad en HSL de 5 en 5).
- **sobre-acento** = tinta si el acento es claro o medio (amarillo, coral, verde, naranja); blanco si es oscuro
  (azul marino, burdeos). Quédate con el que dé ≥ 4,5:1.
- **Neutros**: cálidos (papel crema, tinta marrón muy oscura) si el acento es cálido; fríos (blanco, gris azulado) si
  es frío. No mezcles.
- **noche** = casi negro con un punto del tono de los neutros (#111317, #17150f), nunca #000.

## 4. Tipografía si no hay
Una sans con muchos pesos, de Google Fonts para que cargue en el render: **Geist**, **Inter Tight**, **Manrope**,
**Plus Jakarta Sans**, **IBM Plex Sans**, **DM Sans**. Mono: Geist Mono, JetBrains Mono, IBM Plex Mono. Para una
marca editorial o de lujo puede tener sentido una serif de titulares (Fraunces, Newsreader) con la sans para el resto,
pero solo si encaja con la marca.

## 5. Comprobar
```bash
node <skill direccion-de-arte>/scripts/comprobar-marca.mjs marca.json
```
Sale con error si falta un campo, un color no es hex o una pareja de texto no llega al contraste. Los exportadores
además fallan si la fuente de la marca no carga.

# Reglas de los clientes de correo (por qué las plantillas son así)

El correo no es la web. Estas reglas salen de lo que de verdad hacen Gmail, Outlook y Apple Mail, y de fallos reales
en campañas enviadas.

| Regla | Por qué |
|---|---|
| Maquetar con `<table role="presentation">` | Outlook de escritorio usa el motor de Word: ignora `flex`, `grid`, `float`, `position`, márgenes de tablas y casi todo `max-width` |
| Estilos **en línea**; el `<style>` solo con `@media` para móvil | Gmail con cuentas no Google y varios webmails quitan el `<style>`. Si se pierde, el correo tiene que seguir viéndose bien |
| `font-family` en **cada** celda de texto | No se hereda de forma fiable; sin ella Outlook pone Times New Roman |
| Imágenes PNG/JPG/GIF con URL **https absoluta** | Outlook no pinta WebP ni SVG; las rutas relativas no existen en un correo (un logo `.webp` llega roto en Outlook) |
| `width`/`height` en atributo **y** `style="width:100%;max-width:…;height:auto"` | Outlook usa el atributo; el resto, el estilo para encoger en móvil |
| `display:block` en imágenes | Sin él Gmail deja una raya de 3-4 px debajo |
| `alt` con contenido en imágenes que dicen algo; `alt=""` en decorativas (iconos) | Con imágenes bloqueadas es lo único que se ve; estiliza el alt (fuente, tamaño, color) |
| Botón con **VML** (`<v:roundrect>`) dentro de `<!--[if mso]>` + `<a>` para el resto | Outlook no entiende `padding` ni `border-radius` en un `<a>`: sin VML sale un enlace suelto |
| Tabla «fantasma» de 600 px en `<!--[if mso]>` | Outlook ignora `max-width`: sin ella el correo ocupa toda la ventana |
| Nada de `background-image` para lo importante | Outlook no la pinta (se puede con VML, pero no merece la pena en un estilo plano) |
| Sin `box-shadow`, `text-shadow`, degradados, `filter` | No se pintan igual en todas partes y además van contra el estilo sobrio |
| Colores y fuente con marcadores `%%colores.tinta%%` que rellena `aplicar-marca.mjs` | Los clientes de correo no entienden variables CSS: la marca tiene que ir escrita en cada estilo en línea |
| `<meta name="color-scheme" content="light">` y fondo blanco explícito | Reduce la inversión de colores; Gmail app y Outlook.com invierten igualmente: revisa `oscuro.png` |
| Preencabezado oculto con relleno `&#847;&zwnj;&nbsp;` | Si no, la bandeja enseña «Hola Ana,» o el alt del logo |
| Espacios duros (`20&nbsp;GB`) y direcciones dentro de `<span style="white-space:nowrap">` | Evita cortes feos en móvil; iOS además convierte fechas y teléfonos en enlaces (lo frena `format-detection`) |
| HTML < 102 KB | Gmail corta a partir de 102 KB («Mensaje recortado») y se pierde el pie con la baja |
| Separadores con una celda de 1 px de alto y `font-size:0;line-height:0` | `<hr>` y bordes se pintan distinto en cada cliente |
| Columnas que se apilan con clases en `@media` (`m-apila`) | Donde no llegue la media query, dos o tres columnas estrechas se siguen leyendo |

## Cómo probar más allá del comprobador
- El comprobador renderiza con Chrome: es fiel a Apple Mail y Gmail web, **no** a Outlook de escritorio.
- Para Outlook: enviar una prueba a una cuenta Outlook/Hotmail, o un servicio tipo Litmus / Email on Acid si hay.
- Gmail en el móvil: abrir la prueba en el teléfono (o pedir captura) para ver el modo oscuro real.

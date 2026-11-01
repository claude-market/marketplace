# Entregabilidad: que llegue a la bandeja

El diseño no sirve de nada si el correo acaba en spam. Lo que depende del HTML y del envío:

## En el HTML (lo revisa el comprobador)
- Texto real suficiente (≥ 50 palabras); nunca un correo que sea solo una imagen.
- Peso < 102 KB; pocas imágenes y ligeras (JPG 70-80 % para fotos, PNG para iconos y capturas de interfaz).
- Enlaces https a dominios propios; nada de acortadores.
- Enlace de **baja visible** en el pie (LSSI en España; lo valoran Gmail y Yahoo).
- Sin palabras gancho de spam en el asunto: «GRATIS!!!», «oferta exclusiva», «urgente», símbolos de dinero repetidos.
- Asunto ≤ 50 caracteres, sin mayúsculas sostenidas ni emojis; preencabezado que complete al asunto, no que lo repita.

## En el envío (lo hace el motor de envío)
- **SPF, DKIM y DMARC** alineados con el dominio del remitente.
- Cabeceras `List-Unsubscribe` (mailto y https) y `List-Unsubscribe-Post: List-Unsubscribe=One-Click`
  (obligatorias para envíos masivos a Gmail y Yahoo desde 2024).
- Remitente reconocible («Marca <hola@…>»), con `From` bien formado: un `From` mal cargado desde un `.env` (comillas,
  espacios) produce rechazos 550 «not RFC 5322 compliant».
- Solo a quien dio su **consentimiento** (mejor si el filtro está en la propia consulta de destinatarios).
- Por tandas, no todo de golpe; reanudable sin duplicar.
- Versión de **texto plano** junto al HTML.

## Antes de enviar a la lista
1. Prueba a una bandeja real y ábrela en escritorio y móvil.
2. Comprueba que el servidor la aceptó (registro del MTA / panel), no solo que el script dijo «enviado».
3. Revisa que `{{nombre}}` y `{{url_baja}}` se rellenan (la prueba debe enseñar valores de prueba, no las llaves).
4. Pulsa todos los enlaces de la prueba.

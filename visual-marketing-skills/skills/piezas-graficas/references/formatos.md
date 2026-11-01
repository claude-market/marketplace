# Formatos

| Pieza | Tamaño (px) | Relación | Zona segura / notas | Se ve a |
|---|---|---|---|---|
| Post Instagram vertical | 1080x1350 | 4:5 | Perfil recorta a 3:4 (≈ 34 px por lado) | 390 px de ancho |
| Post cuadrado | 1080x1080 | 1:1 | — | 390 px |
| Story / Reel (portada) | 1080x1920 | 9:16 | 250 arriba, 340 abajo; Reels: 120 a la derecha | móvil completo |
| Miniatura YouTube | 1280x720 | 16:9 | Duración abajo a la derecha (≈ 200x80). < 2 MB | 168-360 px |
| Banner YouTube | 2560x1440 | 16:9 | Lo visible en todos: 1546x423 centrado | variable |
| OG / tarjeta de enlace | 1200x630 | 1,91:1 | Algunas apps recortan a cuadrado centrado | 400-550 px |
| Banner X (Twitter) | 1500x500 | 3:1 | Foto de perfil abajo a la izquierda; móvil recorta ~60 px arriba y abajo | 600-1500 px |
| Post X / LinkedIn | 1200x675 | 16:9 | — | 500 px |
| Banner Discord (servidor) | 960x540 | 16:9 | Franja superior tapada por el nombre | 240 px de ancho en la lista |
| Invitación Discord (fondo) | 1920x1080 | 16:9 | — | — |
| Embed de anuncio Discord | 1200x630 recomendado | — | Se ve a ~400 px | 400 px |
| Hero de correo | 1200xN (N 600-800) | — | Se pinta a 600: texto ≥ 26 px | 600 / 375 px |
| Portada BuiltByBit | 1600x900 | 16:9 | Portada del recurso; banner 1600x400 | 400-800 px |
| Anuncio Meta (feed) | 1080x1350 | 4:5 | Poco texto en la imagen; el titular va en el anuncio | 390 px |

## Peso y formato de salida
- PNG para piezas con texto e interfaz (nítido). JPG 80-85 % para fotos grandes o si la plataforma pide < 1-2 MB.
- Exporta a 1x para redes (el tamaño es el que piden). Para correo y web, 2x del tamaño de pantalla.
- Convierte a JPG si hace falta con ffmpeg: `ffmpeg -i pieza.png -q:v 3 pieza.jpg`.

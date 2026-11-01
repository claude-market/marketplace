# Tipografía

## Elección
- **Una familia** sans geométrica o grotesca con muchos pesos (400-800): Plus Jakarta Sans, Inter, Manrope,
  Geist, IBM Plex Sans. Opcional: **una mono** para datos, URLs, etiquetas y contadores (JetBrains Mono, IBM Plex Mono).
- Nunca dos sans distintas. Nunca serif decorativa «para dar elegancia» en una marca tecnológica sin motivo.
- La fuente se carga de verdad (Google Fonts con `display=block`) y se espera a `document.fonts.ready` antes de
  exportar. El exportador avisa si una fuente falla; si sale la de sistema, la pieza no vale.
- **Correo**: no hay fuentes web fiables. Pila de sistema:
  `-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif`, en **cada** celda.

## Escalas (múltiplo 1,333 · «cuarta justa»)
| Uso | Redes 1080 px | Correo 600 px | Web/OG 1200 px |
|---|---|---|---|
| Titular portada / display | 104-132 | — | 84-96 |
| Titular | 72-84 | 28-30 | 64-72 |
| Entradilla / apoyo | 38-44 | 16-17 | 30-32 |
| Texto | 30-36 | 15-16 | 26-28 |
| Etiqueta / nota | 22-26 | 12-13 | 22-24 |

Mínimos legibles: 22 px en un lienzo de 1080 (≈ 8 px en el móvil), 12 px en correo, 26 px en un hero de correo
exportado a 2x (se ve a 13 px). El exportador avisa por debajo del mínimo.

## Ajustes finos (lo que separa lo profesional)
- Interletra: titulares −0,02 a −0,04 em (más negativa cuanto más grande); texto 0 a −0,01 em; etiquetas en
  mayúsculas +0,08 a +0,14 em.
- Interlineado: display 0,9-1,0; titulares 1,0-1,1; texto 1,35-1,65.
- Pesos: titular 800, subtítulos 700, texto 500 (400 se ve débil en pantallas de móvil con fondo oscuro).
- Cifras en tablas y contadores con `font-variant-numeric: tabular-nums` o en mono.
- Evita viudas: un titular no acaba con una palabra sola en la última línea. Usa `<br>` o `&nbsp;` entre las dos últimas.
- Acento en el titular: el color se pone a la **segunda mitad** de la frase (`Tu nube, <em>tu control.</em>`), nunca a
  palabras sueltas salteadas.
- No subrayes, no pongas cursiva sintética, no uses contornos (`-webkit-text-stroke`).

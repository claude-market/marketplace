# Selector de look

Cinco looks con nivel de agencia, más el **plano** de base. Cada uno es una skill del plugin `piezas-graficas` con
su guía medida (`references/estilo.md`), sus plantillas en 5 formatos (hero 16:9, 1:1, 4:5, banner de X y story) y
su criterio en el exportador (`data-estilo`). Todos leen la marca de `marca.json`: el look pone la estructura, la
marca pone el color, la tipografía, el nombre y el logo.

**Un look por campaña** (todos los formatos con el mismo) y **un look por pieza** (nada de mezclar halo con
cuadrícula o mascota con collage editorial).

## La tabla

| Look | Skill | Para qué marca y objetivo | Fondo | Profundidad | Titular | Material |
|---|---|---|---|---|---|---|
| 1 · Producto en contexto | `producto-en-contexto` | SaaS, apps, productividad, privacidad, fintech de producto: **enseñar una función** | degradado suave del acento (o claro o noche) | 1-2 capas flotantes, borde de 1 px degradado, sombra oscura suave | sans 600, −0,04 em, en minúsculas | la interfaz en HTML |
| 2 · Oscuro glow | `oscuro-glow` | **lanzamiento u oferta** de fintech, trading, cripto o SaaS en oscuro; referidos; cifras de campaña | azul marino degradado + gráfico de datos desenfocado | halo contenido en 2 tarjetas + luz de fondo | geométrica compacta en MAYÚSCULAS plateadas | maqueta del producto desenfocada (HTML) |
| 3 · Editorial recorte | `editorial-recorte` | **gaming, esports, equipos, lifestyle**, moda o deporte con personas o producto con actitud | negro con degradado sutil a gris | plano: collage con jerarquía y líneas finas de construcción | discreto, siempre en el aire | recortes de personas o producto |
| 4 · Producto 3D + mascota | `producto-3d-mascota` | **producto físico o gaming con mascota** o personaje; tiendas, colaboraciones, público joven | azul-violeta profundo con partículas y bokeh | luz de color en los renders y sombras de contacto | logo arriba + titular corto | render 3D del producto + mascota |
| 5 · Tech grid | `tech-grid` | **catálogo u ofertas de gaming**, periféricos, hardware, electrónica; eventos tech | negro-azul con cuadrícula fina y degradado azul abajo | plano: marcos de borde fino unidos por pistas de circuito | grotesca ancha en MAYÚSCULAS, en el acento | recortes de producto (y alguna persona) |
| Plano | `piezas-graficas`, `correo-marketing-html`, `carrusel-instagram` | correos HTML, piezas solo de texto, marcas muy sobrias | papel o noche lisos | ninguna | sans, una familia | maquetas planas |

## Cómo elegir (en este orden)
1. **¿Es un correo HTML o una pieza solo de texto?** → plano (el correo puede llevar una cabecera de producto en
   contexto como imagen).
2. **¿El protagonista es una app o un software y quieres enseñar qué hace?** → `producto-en-contexto`.
3. **¿Es una oferta, un referido, un lanzamiento con cifras o una cuenta atrás, y la marca es financiera, tech o
   vive en oscuro?** → `oscuro-glow`.
4. **¿Hay mascota o personaje de marca, o un objeto físico que lucir como un render?** → `producto-3d-mascota`.
5. **¿Gaming, esports o lifestyle con personas (equipo, fichajes, embajadores, comunidad)?** → `editorial-recorte`.
6. **¿Varios productos físicos a la vez (catálogo, rebajas de temporada, gama nueva)?** → `tech-grid`.
7. **¿Dudas entre dos?** Decide por la marca:
   - neutros cálidos, tono tranquilo → `producto-en-contexto` o plano;
   - oscura con un acento eléctrico (azul, cian, verde) → `oscuro-glow` (si hay cifras) o `tech-grid` (si hay
     productos);
   - juvenil, colorida, con personaje → `producto-3d-mascota`;
   - premium, editorial, de moda o deporte → `editorial-recorte`.
   Si la marca no encaja en el look (una marca crema y pastel en `tech-grid`), **cambia de look** antes que forzarla.

## Por objetivo
| Objetivo | Primera opción | Alternativa |
|---|---|---|
| Lanzar una función de una app | producto-en-contexto | oscuro-glow (si la app es oscura y hay cifra) |
| Oferta o descuento con cifra | oscuro-glow | tech-grid (si son productos físicos) |
| Programa de referidos o recompensas | oscuro-glow | producto-3d-mascota (marca juvenil) |
| Presentar un equipo, fichaje o embajador | editorial-recorte | — |
| Rebajas de catálogo, gama nueva de hardware | tech-grid | producto-3d-mascota (un producto estrella) |
| Producto estrella con personaje, colaboración | producto-3d-mascota | editorial-recorte (sin personaje) |
| Correo de campaña | plano + cabecera de producto en contexto | cabecera exportada del look de la campaña |

## Lo que cada look permite (y la base plana no)
La base de `direccion-de-arte` es plana. Cada look trae **sus excepciones medidas**, y solo esas:

| Excepción | Dónde vale | Medida |
|---|---|---|
| Degradado de fondo | todos los looks | liso, sin bandas; en el plano no |
| Sombra suave | producto-en-contexto, producto-3d-mascota | oscura, nunca de color ni clara |
| Resplandor (glow) | solo oscuro-glow | alfa ≤ 0,6, desenfoque ≤ 8 % del lado corto, 3 elementos como mucho, nunca en el texto |
| Desenfoque | capas `data-fondo` de oscuro-glow y producto-3d-mascota | nunca en texto ni en el sujeto |
| Mayúsculas en el titular | oscuro-glow y tech-grid | 2-4 palabras, interletra ajustada |
| Varios colores de acento | tech-grid (`acento` + `acento-2`) | el segundo solo en trazos y marcos |
| Texto encima de la imagen | ninguno | el texto va en el aire; el exportador lo comprueba |

## En el exportador
`exportar.mjs` (en `piezas-graficas` y `carrusel-instagram`) aplica el criterio del look por `data-estilo` en cada
pieza: `producto`, `oscuro-glow`, `editorial-recorte`, `producto-3d-mascota`, `tech-grid` (sin atributo, plano).
Además: `data-fondo` en las capas decorativas (rejillas, gráficos, bokeh, líneas: dentro vale el desenfoque y su
texto no se revisa) e `img data-recorte` en los recortes (tienen que traer transparencia y ningún texto puede pisar
su parte opaca).

## Tokens de marca que usan los looks
Todos salen de `marca.json` y, si faltan, se derivan del acento en el CSS del look:
- `tipografia.display` → `--fuente-display`: la de los titulares (geométrica compacta en oscuro-glow, grotesca
  ancha en tech-grid). Si falta, la `fuente`. Inclúyela en `google_fonts`.
- `colores.acento-2` → segundo acento (trazos lima de tech-grid, detalles de editorial-recorte).
- Los tokens propios de cada look (halo, fondos, metal del titular…) están en su `references/estilo.md`: se pueden
  fijar en `colores` con el mismo nombre si el derivado no convence.

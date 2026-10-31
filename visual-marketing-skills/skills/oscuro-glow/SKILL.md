---
name: oscuro-glow
description: Piezas de campaña «oscuro-glow» con nivel de agencia para cualquier marca — fondo azul noche degradado con una luz grande detrás del producto, un gráfico de velas y el portátil del producto muy tenues y desenfocados al fondo, dos tarjetas oscuras con borde luminoso fino y halo contenido (una cifra enorme en cada una), titular gigante en mayúsculas plateado, subtítulo ligero, CTA en píldora clara y la web — en hero 16:9, post 1:1 y 4:5, banner de X y story, exportadas a PNG 2x con Chrome y revisadas. Úsala cuando pidan lanzamientos u ofertas de fintech, trading, inversión o cripto, un SaaS que se vende en oscuro, programas de referidos, cifras de campaña («0 % de comisión», «+120 mercados», «3 meses gratis»), o piezas «tipo exchange / app de trading» con brillo pero sin neón.
---

# Oscuro glow

Antes, lee **`direccion-de-arte`** (marca → `marca.json`, copy y revisión). Esta skill es el **look** y sus
componentes; el exportador es el de la skill hermana **`piezas-graficas`**.

## Qué es
Una pieza de **oferta con cifras**: el titular dice la promesa en 2-3 palabras, dos tarjetas dan las dos cifras que
la prueban y una píldora clara lleva a la web. Todo sobre un azul noche que se aclara hacia el producto: detrás de
las tarjetas, una luz grande y el portátil del producto desenfocado; por el fondo, un gráfico de velas casi
invisible. La luz es la del look, **con contención**: dos halos (las tarjetas) y nada más. Reglas medidas en
`references/estilo.md`: **léelas antes de componer**.

## Cuándo usarlo y cuándo no
- **Sí**: lanzamientos y ofertas de fintech, trading, inversión, cripto, neobancos; SaaS técnicos que se venden en
  oscuro (datos, seguridad, infraestructura); referidos («invita y gana»); cifras de campaña y de hito («+120
  mercados», «1 millón de usuarios»). Funciona cuando hay **dos cifras** de verdad que contar.
- **No**:
  - Enseñar cómo funciona una app SaaS en claro o en suave → **`producto-en-contexto`** (la interfaz manda, sin
    halos).
  - Gaming y esports (personajes, recortes, energía) → **`editorial-recorte`** o **`tech-grid`**.
  - Producto físico con mascota o render 3D → **`producto-3d-mascota`**.
  - Correos HTML y piezas de solo texto → estilo **plano** (`correo-marketing-html`, `piezas-graficas`).
  - Marcas cálidas, de bienestar o de lujo discreto: el azul noche con brillo las enfría y las abarata.
  - Sin cifras que contar: dos tarjetas con frases no sostienen el look; usa otro.

## Qué hay aquí
- `plantillas/oscuro-glow.html` · 5 formatos de una campaña: `hero` (1600x900), `redes-1x1` (1080x1080),
  `redes-4x5` (1080x1350), `banner-x` (1500x500) y `story` (1080x1920). Ejemplo: Vértice, app de inversión
  ficticia. Al final, un script pequeño dibuja **en SVG** las velas y el portátil con una semilla fija
  (`data-semilla`): misma semilla, mismo dibujo; los colores salen de la marca.
- `plantillas/oscuro-glow.css` · los componentes, en `em` y solo con `var(--…)`: `.og-escena` (la `<section>`:
  degradado + luz), `.og-velas` y `.og-portatil` (fondo), `.og-marca`, `.og-columna`, `.og-titular` (plateado),
  `.og-sub`, `.og-apoyo`, `.og-tarjeta` con `.og-cifra` (`.og-unidad`, `.og-unidad.antes`) y `.og-pie` (`--cifra`
  y `--pie` para tarjetas grandes), `.og-cta`
  y `.og-url`. La cabecera lista los tokens del look y de dónde salen.
- `plantillas/marca-ejemplo.json` · la marca de ejemplo (Vértice) para probar el exportador con `--marca`.
- `referencia/golden.jpg` + `golden.md` · la pieza de referencia del look, qué imitar y la lista puntuable del bucle
  de pulido. Antes de empezar, pide (o saca de su web) las **dos cifras verdaderas** de la oferta y cómo es su panel.

## Flujo
1. **Marca** (`direccion-de-arte`): `marca.json`. El look deriva su luz del `acento` (`--glow`) y el azul noche de
   esa luz. Si el acento no es frío (naranja, rojo, verde lima), fija `glow`, `fondo-1/2/3` en `marca.json` →
   `colores` y comprueba que el resultado sigue pareciendo de la marca. `tipografia.display` (si la hay) va al
   titular y a las cifras.
2. **Copy** (`direccion-de-arte/references/copy.md`): titular de 2-3 palabras con verbo («Opera sin
   comisiones», «Invita y gana»), subtítulo de una línea (el beneficio), dos cifras **verdaderas y verificables**
   con su línea de apoyo (≤ 4 palabras por línea, 2 líneas), apoyo de dos líneas con la segunda en negrita, CTA de
   2-3 palabras y la web. Sin prometer rentabilidad ni ganancias en productos financieros.
3. **Material**: no hace falta ninguna imagen. Si hay app real, cambia el dibujo del portátil (barra, lateral,
   gráfico, lista, indicadores) por la estructura de su panel, **sin texto legible**. Cambia la semilla si quieres
   otro gráfico.
4. **Componer**: copia `plantillas/` al trabajo, deja los formatos que hagan falta y cambia los textos. Coloca con
   las medidas de `references/estilo.md` (luz con `--luz-x/y/w/h`, radio con `--og-radio`, halo con `--halo`).
5. **Exportar a 2x**:
   ```bash
   cd <skill>/../piezas-graficas/scripts && npm install      # solo la primera vez
   node <skill>/../piezas-graficas/scripts/exportar.mjs ./oscuro-glow.html --marca ./marca.json --escala 2
   ```
   Cada pieza lleva `data-estilo="oscuro-glow"`: el exportador acepta los halos de las tarjetas dentro de la
   medida (alfa ≤ 0,6, desenfoque ≤ 8 % del lado corto, 3 como mucho), avisa de `text-shadow` y de desenfoques
   fuera de `[data-fondo]`, y mide el titular plateado con el tono más oscuro de su degradado.
6. **Bucle de pulido (obligatorio, 2 vueltas como mínimo)** — `piezas-graficas/references/pulido.md`:
   ```bash
   node <skill>/../piezas-graficas/scripts/comparar.mjs out/<html>/hero.png --look oscuro-glow --vuelta 1
   ```
   Abre `revision/vuelta-1.png` (tu pieza junto a la golden y el detalle de las tarjetas al 100 %), puntúa cada punto
   de `referencia/golden.md` de 1 a 10 en `revision/vuelta-1.md`, corrige lo que esté por debajo de 8 (jerarquía
   titular → tarjetas → CTA en 1 segundo, halo que no parezca neón, panel del portátil que parezca de su producto) y
   repite. Prueba también con otra marca.

## Reglas que no se negocian
- **Dos tarjetas, una cifra en cada una.** Ni tres tarjetas ni tarjetas con párrafos.
- **Brillo medido**: halo solo en las tarjetas (3 elementos como mucho), alfa ≤ 0,6 y desenfoque ≤ 8 % del lado
  corto; la luz grande es un `radial-gradient` del fondo, nunca una sombra; **nada de `text-shadow`**, ni halo en la
  CTA ni en el titular.
- **El desenfoque solo en el fondo** (`data-fondo` + `aria-hidden`): velas y portátil. Lo que se lee, nítido.
- **El texto, siempre en HTML**; las capas de fondo no llevan texto legible.
- **Titular en mayúsculas, bold (700) y plateado**, interletra −0,04 em: es la excepción del look a la regla
  plana. Subtítulo en 300; nada de 800-900.
- **Cifras honestas**: sin promesas de rentabilidad ni letra pequeña escondida; si la oferta tiene condiciones, van
  en el apoyo o en la web, no fuera de la pieza.

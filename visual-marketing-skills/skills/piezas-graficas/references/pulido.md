# Bucle de pulido (obligatorio en todos los looks)

Una primera versión que «pasa el exportador» no es una pieza de nivel. Lo que separa una pieza amateur de las demos es
mirarla **al lado de la referencia** y rehacer lo que se nota. Este bucle no se salta: **mínimo 2 vueltas**, aunque la
primera parezca buena.

## Cada vuelta
1. **Exporta a 2x** con el exportador (`exportar.mjs … --marca marca.json --escala 2`). Errores = se arreglan antes
   de seguir. Avisos = se arreglan o se justifican por escrito.
2. **Compara con la golden del look**:
   ```bash
   node <piezas-graficas>/scripts/comparar.mjs out/<html>/hero.png --look <look> --vuelta N
   ```
   Abre `revision/vuelta-N.png` con Read: tu pieza junto a la golden, y debajo un detalle de cada una al 100 %. Si la
   pieza tiene recortes, abre también la hoja de `ver-recorte.mjs` (bordes al 300 %).
3. **Puntúa** cada punto de la lista de comprobación del look (la imprime `comparar.mjs`; está en
   `<look>/referencia/golden.md`) de 1 a 10 en `revision/vuelta-N.md`, con **el porqué** y **lo que vas a cambiar**.
   Sé duro: un 8 es «se podría publicar al lado de la golden sin que desentone».
4. **Corrige lo que puntúe < 8**, empezando por lo más grave (un sujeto falso o pobre pesa más que un margen).
5. Repite desde 1.

## Cuándo se entrega
- Han pasado **2 vueltas como mínimo** y en la última **todos los puntos ≥ 8** y ningún **fallo grave**.
- **Fallos graves** (cualquiera obliga a otra vuelta o a parar y pedir material):
  - el sujeto no es el del usuario ni creíble: siluetas, figuras dibujadas, productos «de pastilla» o de otra marca;
  - restos de la plantilla de ejemplo (nombres, textos, recortes de Pliego, Vértice, Pulso o Cometa);
  - texto ilegible, cortado o encima de un sujeto; fuente de la marca sin cargar;
  - recortes con halo, fondo sin quitar o letras/logos inventados a la vista;
  - huecos vacíos donde la golden tiene contenido (una ventana medio vacía, la mitad del lienzo sin nada).
- Si tras 4 vueltas algo sigue < 8 porque **falta material** (fotos de personas, el producto real), no lo
  disfraces: entrega lo mejor posible, di exactamente qué falta y qué subiría la nota.

## Qué decir al entregar
La ruta del PNG, la nota final de cada punto, cuántas vueltas has dado, qué has supuesto (textos, cifras, colores) y
qué material del usuario la mejoraría. Nada de «queda perfecto»: di lo que has comprobado.

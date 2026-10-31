#!/usr/bin/env node
/**
 * preparar-recorte.mjs — deja un recorte (PNG con alfa: foto sin fondo, render 3D o imagen de IA) listo para un
 * <img data-recorte>: quita el halo del borde, recorta lo transparente sobrante, lo escala al tamaño que se usa a 2x,
 * lo guarda en WebP con alfa ≤ 500 KB y mide su huella (dónde apoya) para la sombra de contacto.
 *
 * Uso:
 *   node preparar-recorte.mjs entrada.png salida.webp [--max 1800] [--margen 8] [--borde 1] [--sin-limpiar]
 *
 *   --max          lado mayor de la salida en px (≥ 2x del tamaño al que se verá en la pieza)
 *   --margen       px transparentes que se dejan alrededor (por defecto 8)
 *   --borde        px que se comen del borde semitransparente (0-3; por defecto 1). Quita la línea clara que
 *                  dejan los quitafondos sobre fondos grises o blancos
 *   --sin-limpiar  no toca el color del borde (por defecto, los píxeles semitransparentes toman el color del
 *                  interior más cercano: adiós al halo gris o blanco; y los casi transparentes, alfa < 28, se
 *                  borran: forman un «velo» de neblina gris sobre fondos oscuros)
 *
 * Imprime: tamaño, peso, la medida del halo (antes y después) y la huella: --cx --cy --cw --ch en % del recorte,
 * listas para la .contacto de los looks (producto-3d-mascota, tech-grid).
 */
import { readFile, writeFile } from 'node:fs/promises'

const args = process.argv.slice(2)
if (args.length < 2 || args.includes('-h') || args.includes('--help')) {
  console.log((await readFile(new URL(import.meta.url), 'utf8')).split('*/')[0]); process.exit(args.length < 2 ? 2 : 0)
}
const opt = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 && args[i + 1] ? Number(args[i + 1]) : d }
const [entrada, salida] = args
let chromium
try { ({ chromium } = await import('playwright-core')) } catch { console.error('Falta playwright-core: npm install en esta carpeta'); process.exit(2) }
const nav = await chromium.launch({ channel: 'chrome' }).catch(() => chromium.launch({ channel: 'msedge' })).catch(() => chromium.launch())
const p = await nav.newPage()
const ext = entrada.toLowerCase().split('.').pop()
const datos = `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,${(await readFile(entrada)).toString('base64')}`
const r = await p.evaluate(async ({ datos, max, margen, borde, limpiar }) => {
  const img = new Image(); img.src = datos; await img.decode()
  const W = img.width, H = img.height
  const c = document.createElement('canvas'); c.width = W; c.height = H
  const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0)
  const id = x.getImageData(0, 0, W, H), d = id.data
  const lum = i => 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]
  // Halo (la misma medida que el exportador): cada píxel semitransparente del borde frente al opaco más cercano
  // hacia dentro. Media de la diferencia y % del borde más claro; una luz de contorno real no cuenta como halo.
  const medirHalo = () => {
    let suma = 0, n = 0, claros = 0
    for (let y = 3; y < H - 3; y += 1) for (let i = 3; i < W - 3; i += 1) {
      const k = (y * W + i) * 4, a = d[k + 3]
      if (a < 40 || a > 200) continue
      let o = -1
      for (let r = 1; r <= 3 && o < 0; r++) for (const [dx, dy] of [[r, 0], [-r, 0], [0, r], [0, -r], [r, r], [-r, -r], [r, -r], [-r, r]]) {
        const t = ((y + dy) * W + i + dx) * 4; if (d[t + 3] > 250) { o = t; break }
      }
      if (o < 0) continue
      const dl = lum(k) - lum(o); suma += dl; n++; if (dl > 30) claros++
    }
    return n > 200 ? { media: suma / n, claros: claros / n } : { media: 0, claros: 0 }
  }
  const transparentes = (() => { let n = 0; for (let k = 3; k < d.length; k += 4) if (d[k] < 20) n++; return n / (W * H) })()
  const haloAntes = medirHalo()
  if (limpiar) {
    // 1) El borde semitransparente toma el color del interior opaco más cercano (búsqueda en espiral corta)
    const src = new Uint8ClampedArray(d)
    for (let y = 0; y < H; y++) for (let i = 0; i < W; i++) {
      const k = (y * W + i) * 4, a = src[k + 3]
      if (a === 0 || a >= 250) continue
      let mejor = -1
      for (let rad = 1; rad <= 6 && mejor < 0; rad++) {
        for (let dy = -rad; dy <= rad && mejor < 0; dy++) for (let dx = -rad; dx <= rad; dx++) {
          const yy = y + dy, xx = i + dx
          if (yy < 0 || xx < 0 || yy >= H || xx >= W) continue
          const q = (yy * W + xx) * 4
          if (src[q + 3] >= 250) { mejor = q; break }
        }
      }
      if (mejor >= 0) { d[k] = src[mejor]; d[k + 1] = src[mejor + 1]; d[k + 2] = src[mejor + 2] }
    }
    // 1b) Velo: píxeles casi transparentes (alfa < 28) que deja el quitafondos alrededor del pelo y la ropa;
    //     sueltos no se ven, pero juntos forman una neblina gris sobre fondos oscuros. Fuera.
    for (let k = 3; k < d.length; k += 4) if (d[k] > 0 && d[k] < 28) d[k] = 0
    // 2) Come «borde» px del alfa (erosión suave: el alfa toma el mínimo de su vecindad)
    for (let pasada = 0; pasada < borde; pasada++) {
      const a0 = new Uint8ClampedArray(W * H); for (let n = 0; n < W * H; n++) a0[n] = d[n * 4 + 3]
      for (let y = 1; y < H - 1; y++) for (let i = 1; i < W - 1; i++) {
        const n = y * W + i
        if (a0[n] === 0) continue
        const m = Math.min(a0[n - 1], a0[n + 1], a0[n - W], a0[n + W])
        d[n * 4 + 3] = Math.round((a0[n] + m) / 2)
      }
    }
    x.putImageData(id, 0, 0)
  }
  const haloDespues = medirHalo()
  // Caja de lo opaco + margen
  let x0 = W, y0 = H, x1 = 0, y1 = 0
  for (let y = 0; y < H; y++) for (let i = 0; i < W; i++) if (d[(y * W + i) * 4 + 3] > 8) { if (i < x0) x0 = i; if (i > x1) x1 = i; if (y < y0) y0 = y; if (y > y1) y1 = y }
  x0 = Math.max(0, x0 - margen); y0 = Math.max(0, y0 - margen); x1 = Math.min(W - 1, x1 + margen); y1 = Math.min(H - 1, y1 + margen)
  const w = x1 - x0 + 1, h = y1 - y0 + 1, k = Math.min(1, max / Math.max(w, h))
  const o = document.createElement('canvas'); o.width = Math.round(w * k); o.height = Math.round(h * k)
  const ox = o.getContext('2d', { willReadFrequently: true }); ox.imageSmoothingQuality = 'high'; ox.drawImage(c, x0, y0, w, h, 0, 0, o.width, o.height)
  // Huella: fila opaca más baja de cada columna; la base es lo que queda en el 6 % de abajo
  const od = ox.getImageData(0, 0, o.width, o.height).data, OW = o.width, OH = o.height
  const fondo = []
  for (let i = 0; i < OW; i++) { let yy = -1; for (let j = OH - 1; j >= 0; j--) if (od[(j * OW + i) * 4 + 3] > 128) { yy = j; break } fondo.push(yy) }
  const maxY = Math.max(...fondo)
  const base = fondo.map((yy, i) => [yy, i]).filter(([yy]) => yy >= 0 && yy >= maxY - OH * 0.06).map(([, i]) => i)
  const bx0 = Math.min(...base), bx1 = Math.max(...base)
  let calidad = 0.9, url
  for (;;) { url = o.toDataURL('image/webp', calidad); if (url.length * 0.75 <= 500 * 1024 || calidad < 0.56) break; calidad -= 0.05 }
  return {
    url, W, H, OW, OH, calidad: +calidad.toFixed(2), transparentes, haloAntes, haloDespues,
    huella: { cx: ((bx0 + bx1) / 2 / OW * 100).toFixed(1), cy: (maxY / OH * 100).toFixed(1), cw: ((bx1 - bx0) / OW * 100 * 1.08).toFixed(1) },
  }
}, { datos, max: opt('max', 1800), margen: opt('margen', 8), borde: Math.max(0, Math.min(3, opt('borde', 1))), limpiar: !args.includes('--sin-limpiar') })
await nav.close()
if (r.transparentes < 0.03) { console.error('✗ La imagen no trae transparencia: quita antes el fondo (imagen-ia/scripts/recortar.mjs).'); process.exit(1) }
const buf = Buffer.from(r.url.split(',')[1], 'base64')
await writeFile(salida, buf)
console.log(`Recorte → ${salida}  ${r.OW}x${r.OH} (de ${r.W}x${r.H}), ${Math.round(buf.length / 1024)} KB, WebP ${r.calidad}`)
const malo = h => h.media > 38 && h.claros > 0.55
const halo = h => `${Math.round(h.claros * 100)} % del borde más claro, media ${h.media.toFixed(0)}${malo(h) ? ' (HALO)' : ' (limpio)'}`
console.log(`Halo del borde: antes ${halo(r.haloAntes)}; después ${halo(r.haloDespues)}`)
if (malo(r.haloDespues)) console.log('  · Sigue habiendo halo: repite con --borde 2, o recorta de nuevo con recortar.mjs --modelo large.')
console.log(`Huella (sombra de contacto, en % del recorte): --cx: ${r.huella.cx}%; --cy: ${r.huella.cy}%; --cw: ${r.huella.cw}%; --ch: ≈ 8-10 % del alto (cámara a nivel) o 15-17 % (cámara alta)`)
console.log('Ahora míralo con ver-recorte.mjs (sobre oscuro y sobre el color del look, con zoom al borde).')

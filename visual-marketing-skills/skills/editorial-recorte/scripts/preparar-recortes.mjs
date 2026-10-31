#!/usr/bin/env node
/**
 * preparar-recortes.mjs — deja los recortes de personas o producto listos para el look «editorial recorte»:
 * tapa logos y textos inventados, quita el halo gris del borde, recorta, hornea fundidos laterales y guarda WebP
 * con alfa (calidad 0,9; ≤ 500 KB). Usa el Chrome del sistema con playwright-core (el de piezas-graficas/scripts:
 * una vez, `npm install` en esa carpeta).
 *
 * Uso:
 *   node preparar-recortes.mjs <trabajos.json> --origen <carpeta de los PNG> --destino <carpeta de salida>
 *
 * trabajos.json es una lista; cada entrada:
 *   { "src": "jugador.png", "salida": "jugador.webp",
 *     "recorte": [x0, y0, x1, y1],                 // en px del original (deja fuera lo que no se usa)
 *     "parches": [                                  // logos o textos que tapar (px del original)
 *        [cx, cy, rx, ry],                          // elipse: se rellena desde su borde (interpolación) + grano
 *        [cx, cy, rx, ry, null, 0, "rect"],         // rectángulo
 *        [cx, cy, rx, ry, 160, 6, "elipse", -230, 0] // solo los píxeles oscuros (< 160) dilatados 6 px,
 *                                                    // clonando la tela de 230 px a la izquierda (conserva la textura)
 *     ],
 *     "borrar": [[x0, y0, x1, y1, 0.9]],            // zonas donde lo semitransparente es resto de fondo: fuera
 *     "contorno": [[y0, y1, xs, xf]],               // oreja fantasma o restos pegados a la piel: en cada fila, desde
 *                                                    // xf (fuera) hacia xs (dentro), borra hasta el primer píxel de piel
 *                                                    // o pelo (alfa ≥ 0,85 y R > B); contorno suavizado y pluma de 1,5 px
 *     "limpiar": [[x0, y0, x1, y1]],                // mechones sueltos y motas: apertura de 2 px e islas < 400 px fuera
 *     "estrecha": [0.3, 0.95],                      // alfa del borde: < 0,3 → 0; > 0,95 → 1 (y se oscurece)
 *     "fundidoIzq": 0.2, "fundidoDer": 0,           // fundido lateral horneado (fracción del ancho)
 *     "escala": 1, "calidad": 0.9 }
 *
 * Además de cada WebP deja, en --vistas (por defecto la carpeta actual), parche-<salida>-<n>.png (antes | después,
 * a 2x) y negro-<salida>.jpg (el recorte sobre negro). MÍRALOS con zoom: el script no sustituye a tu ojo.
 */
import { createRequire } from 'node:module'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const args = process.argv.slice(2)
const opt = (n, def) => { const i = args.indexOf(`--${n}`); return i >= 0 && args[i + 1] ? args[i + 1] : def }
if (!args[0] || args[0].startsWith('--')) { console.log('Uso: node preparar-recortes.mjs <trabajos.json> --origen <dir> --destino <dir> [--vistas <dir>]'); process.exit(2) }
let chromium
try { ({ chromium } = await import('playwright-core')) } catch {
  const aqui = path.dirname(fileURLToPath(import.meta.url))
  try { ({ chromium } = createRequire(path.join(aqui, '../../piezas-graficas/scripts/package.json'))('playwright-core')) }
  catch { console.error('Falta playwright-core: ejecuta npm install en skills/piezas-graficas/scripts'); process.exit(2) }
}
const dir = path.resolve(opt('origen', '.')) + path.sep
const dest = path.resolve(opt('destino', 'recortes')) + path.sep
const vistas = path.resolve(opt('vistas', '.')) + path.sep
await mkdir(dest, { recursive: true }); await mkdir(vistas, { recursive: true })
const trabajos = JSON.parse(await readFile(args[0], 'utf8'))
const nav = await chromium.launch({ channel: 'chrome' })
const p = await nav.newPage()
for (const t of trabajos) {
  const b64 = (await readFile(dir + t.src)).toString('base64')
  const r = await p.evaluate(async ({ src, t }) => {
    const im = new Image(); im.src = src; await im.decode()
    const w = im.naturalWidth, h = im.naturalHeight
    const c = document.createElement('canvas'); c.width = w; c.height = h
    const x = c.getContext('2d'); x.drawImage(im, 0, 0)
    const id = x.getImageData(0, 0, w, h), d = id.data
        // 1) Parches: elipse (cx, cy, rx, ry). Relleno Shepard desde un anillo exterior + grano suave
    let semilla = 7; const rnd = () => (semilla = (semilla * 16807) % 2147483647) / 2147483647
    for (const [cx, cy, rx, ry, umbral, dil, forma, cdx, cdy] of t.parches) {
      const orig = new Uint8ClampedArray(d)
      const x0 = Math.max(0, Math.floor(cx - rx * 1.3)), y0 = Math.max(0, Math.floor(cy - ry * 1.3))
      const x1 = Math.min(w - 1, Math.ceil(cx + rx * 1.3)), y1 = Math.min(h - 1, Math.ceil(cy + ry * 1.3))
      const bw = x1 - x0 + 1, bh = y1 - y0 + 1
      const elip = forma === 'rect' ? (i, j) => Math.abs(i - cx) <= rx && Math.abs(j - cy) <= ry : (i, j) => ((i - cx) / rx) ** 2 + ((j - cy) / ry) ** 2 <= 1
      let m = new Uint8Array(bw * bh)
      for (let j = y0; j <= y1; j++) for (let i = x0; i <= x1; i++) {
        if (!elip(i, j)) continue
        const o = (j * w + i) * 4
        if (umbral == null) m[(j - y0) * bw + (i - x0)] = 1
        else if (.3 * d[o] + .59 * d[o + 1] + .11 * d[o + 2] < umbral) m[(j - y0) * bw + (i - x0)] = 1
      }
      const dilatar = (src, r) => { const out = new Uint8Array(src.length)
        for (let j = 0; j < bh; j++) for (let i = 0; i < bw; i++) { if (!src[j * bw + i]) continue
          for (let dj = -r; dj <= r; dj++) for (let di = -r; di <= r; di++) { if (di * di + dj * dj > r * r) continue
            const ii = i + di, jj = j + dj; if (ii >= 0 && jj >= 0 && ii < bw && jj < bh) out[jj * bw + ii] = 1 } }
        return out }
      if (umbral != null && dil) m = dilatar(m, dil)
      const borde = dilatar(m, 3)
      const anillo = []
      for (let k = 0; k < m.length; k++) if (borde[k] && !m[k]) { const i = x0 + k % bw, j = y0 + Math.floor(k / bw), o = (j * w + i) * 4; if (d[o + 3] > 240) { if (cdx != null) { const q = ((j + cdy) * w + (i + cdx)) * 4; anillo.push([i, j, d[o] - orig[q], d[o + 1] - orig[q + 1], d[o + 2] - orig[q + 2]]) } else anillo.push([i, j, d[o], d[o + 1], d[o + 2]]) } }
      for (let k = 0; k < m.length; k++) { if (!m[k]) continue
        const i = x0 + k % bw, j = y0 + Math.floor(k / bw)
        let sw = 0, sr = 0, sg = 0, sb = 0
        for (const [ai, aj, ar, ag, ab] of anillo) { const dd = (ai - i) ** 2 + (aj - j) ** 2 + 1; const wt = 1 / (dd * dd); sw += wt; sr += ar * wt; sg += ag * wt; sb += ab * wt }
        const o = (j * w + i) * 4, n = (rnd() - .5) * (t.grano ?? 5)
        if (cdx != null) { const q = ((j + cdy) * w + (i + cdx)) * 4; d[o] = orig[q] + sr / sw; d[o + 1] = orig[q + 1] + sg / sw; d[o + 2] = orig[q + 2] + sb / sw } else { d[o] = sr / sw + n; d[o + 1] = sg / sw + n; d[o + 2] = sb / sw + n } d[o + 3] = 255
      }
    }
    // 2) Halo: estrecha el alfa del borde y oscurece lo semitransparente (el fondo final es casi negro)
    // Zonas donde lo semitransparente es resto de fondo (mechones con halo): fuera
    for (const [bx0, by0, bx1, by1, lim] of (t.borrar ?? [])) for (let j = by0; j < by1; j++) for (let i = bx0; i < bx1; i++) { const o = (j * w + i) * 4; if (d[o + 3] < lim * 255) d[o + 3] = 0 }
    // Contorno (oreja fantasma, pendientes, restos pegados a la piel): en cada fila y0..y1 se avanza desde xf (fuera)
    // hacia xs (dentro del sujeto) hasta el primer píxel de piel o pelo (alfa ≥ 0,85 y R > B) y se borra lo que queda
    // fuera de él. Contorno suavizado (mediana de 13 filas) y pluma de 1,5 px.
    const zonasLimpias = []
    for (const [y0, y1, xs, xf] of (t.contorno ?? [])) {
      const paso = xf >= xs ? 1 : -1, cortes = []
      for (let j = y0; j <= y1; j++) { let i = xf   // de fuera hacia dentro: el primer píxel de piel o pelo es el borde
        for (; i !== xs; i -= paso) { const o = (j * w + i) * 4; if (d[o + 3] >= 217 && d[o] > d[o + 2]) break }
        cortes.push(i + paso) }
      const med = cortes.map((_, k) => { const v = cortes.slice(Math.max(0, k - 6), k + 7).sort((p, q) => p - q); return v[v.length >> 1] })
      for (let j = y0; j <= y1; j++) { const b = med[j - y0]
        for (let i = b - 2 * paso; i !== xf + paso; i += paso) { const o = (j * w + i) * 4, f = Math.min(1, Math.max(0, ((b - i) * paso + .5) / 1.5 + .5)); d[o + 3] *= f } }
      zonasLimpias.push([Math.min(xs, xf), y0, Math.max(xs, xf), y1])
    }
    // Limpiar (mechones sueltos y motas): alfa < 0,5 fuera, apertura de 2 px, islas < 400 px fuera y pluma de 1 px
    for (const [lx0, ly0, lx1, ly1] of (t.limpiar ?? [])) {
      const lw = lx1 - lx0 + 1, lh = ly1 - ly0 + 1, A = (i, j) => d[((j + ly0) * w + i + lx0) * 4 + 3]
      let m = new Uint8Array(lw * lh); for (let j = 0; j < lh; j++) for (let i = 0; i < lw; i++) m[j * lw + i] = A(i, j) >= 128 ? 1 : 0
      const morf = (src, ero) => { const out = new Uint8Array(lw * lh)
        for (let j = 0; j < lh; j++) for (let i = 0; i < lw; i++) { let v = ero ? 1 : 0
          for (let dj = -2; dj <= 2; dj++) for (let di = -2; di <= 2; di++) { if (di * di + dj * dj > 4) continue
            const ii = i + di, jj = j + dj, s = ii < 0 || jj < 0 || ii >= lw || jj >= lh ? (ero ? 1 : 0) : src[jj * lw + ii]
            if (ero && !s) v = 0; if (!ero && s) v = 1 }
          out[j * lw + i] = v }
        return out }
      m = morf(morf(m, true), false)
      const et = new Int32Array(lw * lh).fill(-1)
      for (let s0 = 0, n = 0; s0 < lw * lh; s0++) { if (!m[s0] || et[s0] >= 0) continue
        const pila = [s0], miembros = []; et[s0] = n
        while (pila.length) { const q = pila.pop(); miembros.push(q); const qj = (q / lw) | 0, qi = q % lw
          for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const ni = qi + di, nj = qj + dj; if (ni < 0 || nj < 0 || ni >= lw || nj >= lh) continue; const u = nj * lw + ni; if (m[u] && et[u] < 0) { et[u] = n; pila.push(u) } } }
        if (miembros.length < 400 && !miembros.some(q => { const qj = (q / lw) | 0, qi = q % lw; return !qi || !qj || qi === lw - 1 || qj === lh - 1 })) for (const q of miembros) m[q] = 0
        n++ }
      for (let j = 0; j < lh; j++) for (let i = 0; i < lw; i++) { let s = 0, c9 = 0
        for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) { const ii = i + di, jj = j + dj; s += ii < 0 || jj < 0 || ii >= lw || jj >= lh ? m[j * lw + i] : m[jj * lw + ii]; c9++ }
        const o = ((j + ly0) * w + i + lx0) * 4; d[o + 3] = Math.min(d[o + 3], 255 * s / c9) }
      zonasLimpias.push([lx0, ly0, lx1, ly1])
    }
    // En esas zonas, el color de lo semitransparente se toma del interior opaco cercano (radio 4 px): sin borde claro
    for (const [zx0, zy0, zx1, zy1] of zonasLimpias)
      for (let j = Math.max(0, zy0 - 4); j <= Math.min(h - 1, zy1 + 4); j++) for (let i = Math.max(0, zx0 - 4); i <= Math.min(w - 1, zx1 + 4); i++) {
        const o = (j * w + i) * 4; if (!d[o + 3] || d[o + 3] >= 250) continue
        let sr = 0, sg = 0, sb = 0, n = 0
        for (let dj = -4; dj <= 4; dj++) for (let di = -4; di <= 4; di++) { const ii = i + di, jj = j + dj; if (ii < 0 || jj < 0 || ii >= w || jj >= h) continue; const q = (jj * w + ii) * 4; if (d[q + 3] >= 250) { sr += d[q]; sg += d[q + 1]; sb += d[q + 2]; n++ } }
        if (n) { d[o] = sr / n; d[o + 1] = sg / n; d[o + 2] = sb / n }
      }
    const [a0, a1] = t.estrecha ?? [.3, .95]
    for (let o = 0; o < d.length; o += 4) {
      const a = d[o + 3] / 255
      if (a >= .995 || a === 0) continue
      let na = Math.min(1, Math.max(0, (a - a0) / (a1 - a0)))
      const k = .38 + .62 * na
      d[o] *= k; d[o + 1] *= k; d[o + 2] *= k; d[o + 3] = na * 255
    }
    x.putImageData(id, 0, 0)
    // 3) Recorte y escala
    const [cx0, cy0, cx1, cy1] = t.recorte
    const s = t.escala ?? 1
    const o = document.createElement('canvas'); o.width = Math.round((cx1 - cx0) * s); o.height = Math.round((cy1 - cy0) * s)
    const ox = o.getContext('2d'); ox.imageSmoothingQuality = 'high'
    ox.drawImage(c, cx0, cy0, cx1 - cx0, cy1 - cy0, 0, 0, o.width, o.height)
    // Fundido lateral horneado en el alfa (bordes de ropa cortados por el encuadre original)
    if (t.fundidoIzq || t.fundidoDer) {
      const od = ox.getImageData(0, 0, o.width, o.height), q = od.data
      const ss = v => v <= 0 ? 0 : v >= 1 ? 1 : v * v * (3 - 2 * v)
      for (let j = 0; j < o.height; j++) for (let i = 0; i < o.width; i++) {
        let k = 1
        if (t.fundidoIzq) k *= ss(i / (o.width * t.fundidoIzq))
        if (t.fundidoDer) k *= ss((o.width - 1 - i) / (o.width * t.fundidoDer))
        q[(j * o.width + i) * 4 + 3] *= k
      }
      ox.putImageData(od, 0, 0)
    }
    // Vistas de los parches (antes | después) a 2x
    const vistas = t.parches.map(([pcx, pcy, rx, ry]) => {
      const vw = rx * 3, vh = ry * 3
      const v = document.createElement('canvas'); v.width = vw * 4; v.height = vh * 2
      const vx = v.getContext('2d'); vx.fillStyle = '#000'; vx.fillRect(0, 0, v.width, v.height)
      vx.drawImage(im, pcx - vw / 2, pcy - vh / 2, vw, vh, 0, 0, vw * 2, vh * 2)
      vx.drawImage(c, pcx - vw / 2, pcy - vh / 2, vw, vh, vw * 2, 0, vw * 2, vh * 2)
      return v.toDataURL('image/png')
    })
    // Vista general sobre negro
    const g = document.createElement('canvas'); g.width = o.width; g.height = o.height
    const gx = g.getContext('2d'); gx.fillStyle = '#050608'; gx.fillRect(0, 0, g.width, g.height); gx.drawImage(o, 0, 0)
    return { webp: o.toDataURL('image/webp', t.calidad ?? .9), vistas, negro: g.toDataURL('image/jpeg', .85), w: o.width, h: o.height }
  }, { src: 'data:image/png;base64,' + b64, t })
  const buf = Buffer.from(r.webp.split(',')[1], 'base64')
  await writeFile(dest + t.salida, buf)
  await Promise.all(r.vistas.map((v, k) => writeFile(`${vistas}parche-${t.salida}-${k}.png`, Buffer.from(v.split(',')[1], 'base64'))))
  await writeFile(`${vistas}negro-${t.salida}.jpg`, Buffer.from(r.negro.split(',')[1], 'base64'))
  const kb = Math.round(buf.length / 1024)
  console.log(`${t.salida}  ${r.w}x${r.h}  ${kb} KB${kb > 500 ? '  ← pasa de 500 KB: baja "escala" o "calidad"' : ''}`)
}
await nav.close()

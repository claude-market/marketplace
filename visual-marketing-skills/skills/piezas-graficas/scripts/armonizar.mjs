#!/usr/bin/env node
/**
 * armonizar.mjs — integra un recorte (foto del usuario sin fondo, imagen de IA o render) en la luz del look:
 * neutraliza el balance de blancos, ajusta la exposición al blanco del look y le pinta una luz de recorte (rim) del
 * color del fondo por el lado que toca. Es lo que hace que dos fotos de sesiones distintas parezcan de la misma y que
 * el producto «pertenezca» al fondo azul o violeta en vez de parecer pegado.
 *
 * Uso:
 *   node armonizar.mjs recorte.png salida.png --look tech-grid|producto-3d-mascota|editorial-recorte|oscuro-glow
 *        [--rim #3d9bff] [--lado derecha|izquierda|ambos] [--fuerza 1] [--blanco #e3e6ea] [--sin-blancos]
 *
 *   --rim      color de la luz de recorte (por defecto, el del look: tech-grid azul del fondo; producto-3d-mascota
 *              azul a la izquierda y violeta a la derecha; editorial-recorte, un gris frío muy suave)
 *   --lado     de dónde viene el recorte (detrás a la derecha en tech-grid; ambos en producto-3d-mascota)
 *   --fuerza   0-2 (1 por defecto). Si la línea de color se ve pintada a 100 %, baja a 0,6
 *   --blanco   a qué blanco se llevan las luces altas del sujeto (tech-grid: #e3e6ea)
 *
 * La entrada tiene que traer transparencia (pásala antes por recortar.mjs y preparar-recorte.mjs). Mira el
 * resultado con ver-recorte.mjs: el canto del lado de la luz dibuja una línea de color de 2-6 px a 1x, sin halo.
 */
import { readFile, writeFile } from 'node:fs/promises'

const args = process.argv.slice(2)
if (args.length < 2 || args.includes('-h') || args.includes('--help')) {
  console.log((await readFile(new URL(import.meta.url), 'utf8')).split('*/')[0]); process.exit(args.length < 2 ? 2 : 0)
}
const opt = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 && args[i + 1] ? args[i + 1] : d }
const [entrada, salida] = args
const look = opt('look', 'tech-grid')
const PRESETS = {
  'tech-grid': { rim: ['#3d9bff'], lado: 'derecha', blanco: '#e3e6ea', fuerza: 1 },
  'producto-3d-mascota': { rim: ['#4d6cff', '#a95cff'], lado: 'ambos', blanco: '#f1eefb', fuerza: 1.1 },
  'editorial-recorte': { rim: ['#cfd6e6'], lado: 'izquierda', blanco: null, fuerza: 0.45 },
  'oscuro-glow': { rim: ['#5b8cff'], lado: 'ambos', blanco: null, fuerza: 0.7 },
}
const pre = PRESETS[look] ?? PRESETS['tech-grid']
const rims = opt('rim', null) ? opt('rim').split(',') : pre.rim
const lado = opt('lado', pre.lado)
const fuerza = Number(opt('fuerza', pre.fuerza))
const blanco = args.includes('--sin-blancos') ? null : opt('blanco', pre.blanco)
let chromium
try { ({ chromium } = await import('playwright-core')) } catch { console.error('Falta playwright-core: npm install en esta carpeta'); process.exit(2) }
const nav = await chromium.launch({ channel: 'chrome' }).catch(() => chromium.launch({ channel: 'msedge' })).catch(() => chromium.launch())
const p = await nav.newPage()
const ext = entrada.toLowerCase().split('.').pop()
const datos = `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,${(await readFile(entrada)).toString('base64')}`
const r = await p.evaluate(async ({ datos, rims, lado, fuerza, blanco }) => {
  const img = new Image(); img.src = datos; await img.decode()
  const W = img.width, H = img.height
  const c = document.createElement('canvas'); c.width = W; c.height = H
  const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0)
  const id = x.getImageData(0, 0, W, H), d = id.data
  let transp = 0; for (let k = 3; k < d.length; k += 4) if (d[k] < 20) transp++
  if (transp / (W * H) < 0.03) return { error: 'sin transparencia' }
  const hex = h => { const v = parseInt(h.replace('#', ''), 16); return [(v >> 16) & 255, (v >> 8) & 255, v & 255] }
  // 1) Blancos: las luces altas del sujeto (percentil 92 de luminancia) se llevan al blanco del look
  let info = ''
  if (blanco) {
    const lums = []
    for (let k = 0; k < d.length; k += 16) if (d[k + 3] > 240) lums.push([0.2126 * d[k] + 0.7152 * d[k + 1] + 0.0722 * d[k + 2], k])
    lums.sort((a, b) => a[0] - b[0])
    const mediana = lums.length ? lums[Math.floor(lums.length / 2)][0] : 0
    // Solo luces altas neutras (sin saturación): un aro RGB o un botón de color no son «blancos» que corregir
    const altas = lums.slice(Math.floor(lums.length * 0.8), Math.floor(lums.length * 0.98))
      .filter(([, k]) => Math.max(d[k], d[k + 1], d[k + 2]) - Math.min(d[k], d[k + 1], d[k + 2]) < 40)
    if (mediana < 90) info = 'blancos sin tocar (producto oscuro: no hay blancos que igualar)'
    else if (altas.length <= 50) info = 'blancos sin tocar (no hay luces altas neutras)'
    else {
      const m = [0, 0, 0]; for (const [, k] of altas) { m[0] += d[k]; m[1] += d[k + 1]; m[2] += d[k + 2] }
      m.forEach((v, i) => { m[i] = v / altas.length })
      const objetivo = hex(blanco)
      // 1a) Tinte: cada canal hacia el gris de su propia luminancia (quita el amarillo o el azul de la foto, ±10 %)
      const lm = (m[0] + m[1] + m[2]) / 3, lo = (objetivo[0] + objetivo[1] + objetivo[2]) / 3
      const tinte = m.map((v, i) => Math.max(0.9, Math.min(1.1, (lm * objetivo[i] / lo) / Math.max(1, v))))
      // 1b) Exposición solo en productos claros (sus luces altas ya pasan de 160): hacia el blanco del look, ±12 %.
      //     Un producto negro se queda negro.
      const expo = lm > 160 ? Math.max(0.88, Math.min(1.12, lo / lm)) : 1
      const g = tinte.map(v => v * expo)
      for (let k = 0; k < d.length; k += 4) if (d[k + 3] > 0) for (let i = 0; i < 3; i++) d[k + i] = Math.min(255, d[k + i] * g[i])
      info = `blancos ${m.map(v => Math.round(v)).join(',')} → ${objetivo.join(',')} (ganancia ${g.map(v => v.toFixed(2)).join('/')})`
    }
  }
  // 2) Rim: banda interior del borde (1 − alfa desenfocado), orientada por la normal del borde hacia la luz
  const A = new Float32Array(W * H); for (let n = 0; n < W * H; n++) A[n] = d[n * 4 + 3] / 255
  const rad = Math.max(2, Math.round(Math.max(W, H) * 0.006))
  const caja = (src, r) => {
    const t = new Float32Array(W * H), o = new Float32Array(W * H)
    for (let y = 0; y < H; y++) { let s = 0; for (let i = -r; i <= r; i++) s += src[y * W + Math.min(W - 1, Math.max(0, i))]
      for (let i = 0; i < W; i++) { t[y * W + i] = s / (2 * r + 1); s += src[y * W + Math.min(W - 1, i + r + 1)] - src[y * W + Math.max(0, i - r)] } }
    for (let i = 0; i < W; i++) { let s = 0; for (let y = -r; y <= r; y++) s += t[Math.min(H - 1, Math.max(0, y)) * W + i]
      for (let y = 0; y < H; y++) { o[y * W + i] = s / (2 * r + 1); s += t[Math.min(H - 1, y + r + 1) * W + i] - t[Math.max(0, y - r) * W + i] } }
    return o
  }
  let B = caja(A, rad); B = caja(B, rad); B = caja(B, rad)
  const luces = lado === 'ambos' ? [[-1, -0.25, hex(rims[0])], [1, -0.25, hex(rims[1] ?? rims[0])]]
    : [[lado === 'izquierda' ? -1 : 1, -0.25, hex(rims[0])]]
  let pintados = 0
  for (let y = 1; y < H - 1; y++) for (let i = 1; i < W - 1; i++) {
    const n = y * W + i
    if (A[n] < 0.5) continue
    const banda = Math.max(0, Math.min(1, (1 - B[n]) * 2.4))
    if (banda < 0.02) continue
    let gx = B[n + 1] - B[n - 1], gy = B[n + W] - B[n - W]
    const len = Math.hypot(gx, gy) || 1; gx = -gx / len; gy = -gy / len   // normal hacia fuera
    for (const [lx, ly, col] of luces) {
      const ll = Math.hypot(lx, ly), dot = Math.max(0, (gx * lx + gy * ly) / ll)
      const k = Math.min(1, banda ** 1.4 * dot ** 1.6 * 0.85 * fuerza)
      if (k <= 0.01) continue
      const q = n * 4
      for (let c2 = 0; c2 < 3; c2++) d[q + c2] = 255 - (255 - d[q + c2]) * (1 - col[c2] / 255 * k)   // trama (screen)
      pintados++
    }
  }
  x.putImageData(id, 0, 0)
  return { url: c.toDataURL('image/png'), W, H, info, pintados, rad }
}, { datos, rims, lado, fuerza, blanco })
await nav.close()
if (r.error) { console.error('✗ La imagen no trae transparencia: quita antes el fondo (imagen-ia/scripts/recortar.mjs).'); process.exit(1) }
await writeFile(salida, Buffer.from(r.url.split(',')[1], 'base64'))
console.log(`Armonizado (${look}) → ${salida} ${r.W}x${r.H}`)
if (r.info) console.log(`  · ${r.info}`)
console.log(`  · luz de recorte ${rims.join(' + ')} por ${lado}, banda de ${r.rad} px, ${r.pintados} px tocados (fuerza ${fuerza})`)
console.log('  Míralo con ver-recorte.mjs: el canto iluminado tiene que leerse como luz, no como un trazo pintado.')
